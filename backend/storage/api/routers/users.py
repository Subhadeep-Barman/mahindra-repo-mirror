from backend.storage.pydantic_models.user import UserCreate
from backend.storage.api.api_utils import get_db
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException
from pydantic import EmailStr
from fastapi import APIRouter, Depends, HTTPException, status
from backend.storage.models.models import User

router = APIRouter(prefix="/api/users")


@router.post("/create_user")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.id == user.id).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    new_user = User(**user.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "user": user.dict()}


@router.get("/read_user")
def read_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/read_all_users")
def read_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    if not users:
        raise HTTPException(status_code=404, detail="No users found")
    return users


@router.put("/update_user")
def update_user(user_id: str, user_update: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in user_update.dict().items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return {"message": "User updated successfully", "user": user_update.dict()}


@router.delete("/delete_user")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
