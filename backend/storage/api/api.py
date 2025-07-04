import logging

from backend.storage.models.models import Base
from backend.storage.database import SessionLocal, engine
from backend.storage.api.routers import users
from backend.storage.api.routers import test_orders_api
from backend.storage.api.routers import vehicles_api
from backend.storage.api.routers import engines_api
from backend.storage.api.routers import job_orders_api
from backend.storage.api.routers import auth
from backend.storage.api.routers import coast_down_api
from backend.storage.api.routers import rde_job_orders_api

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
app.include_router(test_orders_api.router)
app.include_router(vehicles_api.router)
app.include_router(engines_api.router)
app.include_router(job_orders_api.router)
app.include_router(auth.router)
app.include_router(coast_down_api.router)
app.include_router(rde_job_orders_api.router)