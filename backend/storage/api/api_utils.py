
from backend.storage.database import SessionLocal


def get_db():
    """Returns a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()