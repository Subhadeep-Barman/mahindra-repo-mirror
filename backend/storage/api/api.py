import logging

from backend.storage.models.models import Base
from backend.storage.database import SessionLocal, engine
from backend.storage.api.routers import users

# Configure logging to show DEBUG messages
logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s"
)
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

STORAGE = os.getenv("STORAGE")
# Create FastAPI instance
app = FastAPI()

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

app.include_router(users.router)