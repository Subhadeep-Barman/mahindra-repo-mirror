from backend.storage.models.models import User
from backend.storage.api.api_utils import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/cft")

#api to list down all the users who have the role of 'projectteam' form users table email's of all the users will be shown
@router.get("/projectteam_users")
def get_projectteam_users(db: Session = Depends(get_db)):
    """
    List all users with role 'ProjectTeam'.
    """
    users = db.query(User).filter(User.role == "ProjectTeam").all()
    if not users:
        raise HTTPException(status_code=404, detail="No ProjectTeam users found")
    return users