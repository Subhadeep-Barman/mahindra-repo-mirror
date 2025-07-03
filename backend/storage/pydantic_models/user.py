from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    id: str
    username: str
    email: EmailStr
    role: str
