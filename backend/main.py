import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, database, auth
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

# Load .env automatically
load_dotenv()

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

# 3. Create DB tables automatically
models.Base.metadata.create_all(bind=database.engine)

# Print a confirmation when DB is connected
try:
    with database.engine.connect() as conn:
        print("Connected to the database successfully!")
except Exception as e:
    print("Failed to connect to the database:", e)

# 4. Schemas
class UserSchema(BaseModel):
    email: str
    password: str

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
    return {"message": "Login successful!", "user_id": user.id}

# 7. Run server dynamically
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)