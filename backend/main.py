import base64
import os
import sys
from pathlib import Path
from datetime import datetime

import cv2
import numpy as np
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, database, auth
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

# Load .env automatically
load_dotenv()

AI_TRAINER_ROOT = Path(__file__).resolve().parents[2]
if str(AI_TRAINER_ROOT) not in sys.path:
    sys.path.insert(0, str(AI_TRAINER_ROOT))

from core.rep_counter import RepCounter
from utils.config import EXERCISE_CONFIGS

# 1. Initialize the app
app = FastAPI()

# 2. CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # put your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Create DB tables (auth + progress tracking).
try:
    with database.engine.connect():
        print("Connected to SQL database successfully!")
    models.Base.metadata.create_all(bind=database.engine)
except Exception as e:
    print("Database setup failed:", e)

# 4. Schemas
class UserSchema(BaseModel):
    email: str
    password: str


class AnalyzeFrameSchema(BaseModel):
    image: str
    exercise: str = "bicep_curl"
    session_id: str = "default"
    reset: bool = False


class WorkoutExerciseUpdateSchema(BaseModel):
    user_id: int
    plan_id: str
    day_id: str
    day_name: str
    exercise_id: str
    exercise_name: str
    reps: int = 0
    completed: bool = False
    total_exercises: int = 0


pose_estimator = None
feature_extractor = None
posture_analyzer = None
session_counters: dict[str, RepCounter] = {}


EXERCISE_ALIASES = {
    "barbell biceps curl": "bicep_curl",
    "barbell curls": "bicep_curl",
    "barbell curl": "bicep_curl",
    "bicep curl": "bicep_curl",
    "biceps curl": "bicep_curl",
    "hammer curls": "hammer_curl",
    "hammer curl": "hammer_curl",
    "pull-ups": "pull_up",
    "pull ups": "pull_up",
    "pull up": "pull_up",
    "push-up": "push_up",
    "push-ups": "push_up",
    "push up": "push_up",
    "barbell squats": "barbell_squat",
    "barbell squat": "barbell_squat",
    "squats": "barbell_squat",
    "squat": "barbell_squat",
    "bench press": "barbell_bench_press",
    "barbell bench press": "barbell_bench_press",
    "overhead press": "overhead_press",
    "shoulder press": "overhead_press",
    "lat pulldowns": "lat_pulldown",
    "lat pulldown": "lat_pulldown",
    "lateral raises": "lateral_raise",
    "lateral raise": "lateral_raise",
    "deadlift": "deadlift",
    "romanian deadlift": "romanian_deadlift",
}


def normalize_exercise(exercise: str) -> str:
    cleaned = exercise.strip().lower().replace("_", " ").replace("-", " ")
    return EXERCISE_ALIASES.get(cleaned, exercise.strip())


def decode_frame(image_data: str):
    encoded = image_data.split(",", 1)[-1]
    image_bytes = base64.b64decode(encoded)
    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    frame = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image frame")
    return frame


def get_counter(session_id: str, exercise_config, reset: bool):
    counter = session_counters.get(session_id)
    if reset or counter is None or counter.exercise_config.name != exercise_config.name:
        counter = RepCounter(exercise_config)
        session_counters[session_id] = counter
    return counter


def get_ai_components():
    global pose_estimator, feature_extractor, posture_analyzer
    from core.feature_extractor import FeatureExtractor
    from core.pose_estimator import PoseEstimator
    from core.posture_rules import PostureAnalyzer

    if pose_estimator is None:
        pose_estimator = PoseEstimator()
    if feature_extractor is None:
        feature_extractor = FeatureExtractor()
    if posture_analyzer is None:
        posture_analyzer = PostureAnalyzer()
    return pose_estimator, feature_extractor, posture_analyzer

# 5. Register endpoint
@app.post("/register")
def register_user(user_data: UserSchema, db: Session = Depends(database.get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists!")
    new_user = models.User(
        email=user_data.email,
        hashed_password=auth.hash_password(user_data.password)
    )
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully!"}

# 6. Login endpoint
@app.post("/login")
def login_user(user_data: UserSchema, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if not user or not auth.verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"message": "Login successful!", "user_id": user.id, "email": user.email}


@app.post("/progress/exercise")
def upsert_exercise_progress(payload: WorkoutExerciseUpdateSchema, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    exercise_progress = (
        db.query(models.WorkoutExerciseProgress)
        .filter(
            models.WorkoutExerciseProgress.user_id == payload.user_id,
            models.WorkoutExerciseProgress.plan_id == payload.plan_id,
            models.WorkoutExerciseProgress.day_id == payload.day_id,
            models.WorkoutExerciseProgress.exercise_id == payload.exercise_id,
        )
        .first()
    )

    now = datetime.utcnow()
    if not exercise_progress:
        exercise_progress = models.WorkoutExerciseProgress(
            user_id=payload.user_id,
            plan_id=payload.plan_id,
            day_id=payload.day_id,
            exercise_id=payload.exercise_id,
            exercise_name=payload.exercise_name,
            reps=payload.reps,
            completed=payload.completed,
            completed_at=now if payload.completed else None,
            updated_at=now,
        )
        db.add(exercise_progress)
    else:
        exercise_progress.reps = max(exercise_progress.reps or 0, payload.reps)
        exercise_progress.exercise_name = payload.exercise_name
        if payload.completed and not exercise_progress.completed:
            exercise_progress.completed = True
            exercise_progress.completed_at = now
        exercise_progress.updated_at = now

    day_progress = (
        db.query(models.WorkoutDayProgress)
        .filter(
            models.WorkoutDayProgress.user_id == payload.user_id,
            models.WorkoutDayProgress.plan_id == payload.plan_id,
            models.WorkoutDayProgress.day_id == payload.day_id,
        )
        .first()
    )

    if not day_progress:
        day_progress = models.WorkoutDayProgress(
            user_id=payload.user_id,
            plan_id=payload.plan_id,
            day_id=payload.day_id,
            day_name=payload.day_name,
            total_exercises=payload.total_exercises or 0,
            completed_exercises=0,
            status="in_progress",
            started_at=now,
            updated_at=now,
        )
        db.add(day_progress)

    completed_count = (
        db.query(models.WorkoutExerciseProgress)
        .filter(
            models.WorkoutExerciseProgress.user_id == payload.user_id,
            models.WorkoutExerciseProgress.plan_id == payload.plan_id,
            models.WorkoutExerciseProgress.day_id == payload.day_id,
            models.WorkoutExerciseProgress.completed == True,
        )
        .count()
    )

    day_progress.day_name = payload.day_name
    day_progress.total_exercises = payload.total_exercises or day_progress.total_exercises
    day_progress.completed_exercises = completed_count
    day_progress.updated_at = now

    if day_progress.total_exercises > 0 and completed_count >= day_progress.total_exercises:
        day_progress.status = "completed"
        day_progress.completed_at = now
    else:
        day_progress.status = "in_progress"
        day_progress.completed_at = None

    db.commit()
    return {
        "message": "Progress updated",
        "day_status": day_progress.status,
        "completed_exercises": day_progress.completed_exercises,
        "total_exercises": day_progress.total_exercises,
    }


@app.get("/progress/summary/{user_id}")
def progress_summary(user_id: int, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    day_rows = (
        db.query(models.WorkoutDayProgress)
        .filter(models.WorkoutDayProgress.user_id == user_id)
        .order_by(models.WorkoutDayProgress.updated_at.desc())
        .all()
    )

    completed_days = [row for row in day_rows if row.status == "completed"]
    in_progress_rows = [row for row in day_rows if row.status != "completed"]
    pending_previous = in_progress_rows[0] if in_progress_rows else None

    workout_dates = set()
    for row in completed_days:
        if row.completed_at:
            workout_dates.add(row.completed_at.date().isoformat())

    return {
        "user_id": user_id,
        "days_worked_out": len(workout_dates),
        "completed_workout_days": len(completed_days),
        "total_days_in_records": len(day_rows),
        "current_position": {
            "plan_id": in_progress_rows[0].plan_id if in_progress_rows else None,
            "day_id": in_progress_rows[0].day_id if in_progress_rows else None,
            "day_name": in_progress_rows[0].day_name if in_progress_rows else None,
            "completed_exercises": in_progress_rows[0].completed_exercises if in_progress_rows else 0,
            "total_exercises": in_progress_rows[0].total_exercises if in_progress_rows else 0,
        },
        "pending_previous_workout": {
            "plan_id": pending_previous.plan_id if pending_previous else None,
            "day_id": pending_previous.day_id if pending_previous else None,
            "day_name": pending_previous.day_name if pending_previous else None,
            "completed_exercises": pending_previous.completed_exercises if pending_previous else 0,
            "total_exercises": pending_previous.total_exercises if pending_previous else 0,
        },
    }


@app.post("/ai/analyze-frame")
def analyze_frame(payload: AnalyzeFrameSchema):
    exercise_key = normalize_exercise(payload.exercise)
    if exercise_key not in EXERCISE_CONFIGS:
        exercise_key = "bicep_curl"

    exercise = EXERCISE_CONFIGS[exercise_key]
    counter = get_counter(payload.session_id, exercise, payload.reset)
    frame = decode_frame(payload.image)
    pose, extractor, analyzer = get_ai_components()
    landmarks, _ = pose.detect(frame)

    if not landmarks:
        return {
            "exercise": exercise.name,
            "display_name": exercise.display_name,
            "confidence": 0.0,
            "reps": counter.counter,
            "stage": counter.stage,
            "correction": "Move into frame so I can detect your full body.",
            "landmarks": [],
            "tracked_angle": 0.0,
            "ready": False,
        }

    angles = extractor.extract_angles(landmarks)
    reps, stage, tracked_angle = counter.update(angles)
    correction = analyzer.check_form(exercise, angles)

    return {
        "exercise": exercise.name,
        "display_name": exercise.display_name,
        "confidence": 1.0,
        "reps": reps,
        "stage": stage,
        "correction": correction,
        "landmarks": [{"x": lm[0], "y": lm[1], "z": lm[2], "visibility": lm[3]} for lm in landmarks],
        "tracked_angle": round(float(tracked_angle), 1),
        "ready": True,
    }

# 7. Run server dynamically
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
