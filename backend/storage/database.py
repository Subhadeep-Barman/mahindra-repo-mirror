import os
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
print("local db:", SQLALCHEMY_DATABASE_URI)
STAGING_DATABASE_URI = os.getenv("STAGING_DATABASE_URI")
print("staging db:", STAGING_DATABASE_URI)
PRODUCTION_DATABASE_URI = os.getenv("PRODUCTION_DATABASE_URI")
print("prod db:", PRODUCTION_DATABASE_URI)

local = os.getenv("LOCAL", "False")
prod = os.getenv("PROD", "False")
print(f"LOCAL environment variable: {local}")
if local == "True":
    URI = SQLALCHEMY_DATABASE_URI
elif prod == "True":
    URI = PRODUCTION_DATABASE_URI
else:
    URI = STAGING_DATABASE_URI

print(f"Using database URI: {URI}")
if not URI:
    raise RuntimeError("Database URI is not set for the current environment.")

engine = create_engine(URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Session = SessionLocal()