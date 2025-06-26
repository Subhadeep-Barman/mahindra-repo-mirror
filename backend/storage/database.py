import os
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Determine environment
ENV = os.getenv("ENV", "local").lower()
SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://postgres:12345678@localhost:5432/VTC"
STAGING_DATABASE_URI = "postgresql://postgres:Root123@10.238.0.207:5432/dbmrs-vtc-test"

if ENV == "local":
    URI = os.getenv("SQLALCHEMY_DATABASE_URI", SQLALCHEMY_DATABASE_URI)
    logger.info(f"Using LOCAL database: {URI}")
else:
    URI = STAGING_DATABASE_URI
    logger.info(f"Using STAGING database: {URI}")

if not URI:
    raise RuntimeError("Database URI is not set for the current environment.")

engine = create_engine(URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Session = SessionLocal()