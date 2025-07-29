import os
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

local = os.getenv("LOCAL")
if local == "True":
    URI = os.getenv("SQLALCHEMY_DATABASE_URI")
else:
    URI = os.getenv("STAGING_URI")

print(f"Using database URI: {URI}")    

if not URI:
    raise RuntimeError("Database URI is not set for the current environment.")

engine = create_engine(URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
Session = SessionLocal()