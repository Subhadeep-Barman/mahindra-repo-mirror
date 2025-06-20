from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    id: str
    username: str
    email: EmailStr
    role: str
    team: str
    location: str
