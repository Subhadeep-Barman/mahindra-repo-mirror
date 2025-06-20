import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()
# Only use SQLALCHEMY_DATABASE_URI from environment
SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://postgres:12345678@localhost:5432/VTC"
URI = os.getenv("SQLALCHEMY_DATABASE_URI", SQLALCHEMY_DATABASE_URI)
if not URI:
    raise RuntimeError("SQLALCHEMY_DATABASE_URI environment variable is not set.")

engine = create_engine(URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Session = SessionLocal()