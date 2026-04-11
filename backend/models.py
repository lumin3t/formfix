from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)


class WorkoutDayProgress(Base):
    __tablename__ = "workout_day_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    plan_id = Column(String(120), index=True, nullable=False)
    day_id = Column(String(120), index=True, nullable=False)
    day_name = Column(String(255), nullable=False)
    total_exercises = Column(Integer, default=0)
    completed_exercises = Column(Integer, default=0)
    status = Column(String(40), default="in_progress", index=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


class WorkoutExerciseProgress(Base):
    __tablename__ = "workout_exercise_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    plan_id = Column(String(120), index=True, nullable=False)
    day_id = Column(String(120), index=True, nullable=False)
    exercise_id = Column(String(120), index=True, nullable=False)
    exercise_name = Column(String(255), nullable=False)
    reps = Column(Integer, default=0)
    completed = Column(Boolean, default=False, index=True)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)
