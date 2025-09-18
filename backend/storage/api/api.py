import logging

from backend.storage.models.models import Base
from backend.storage.database import SessionLocal, engine
from backend.storage.api.routers import users
from backend.storage.api.routers import test_orders_api
from backend.storage.api.routers import vehicles_api
from backend.storage.api.routers import engines_api
from backend.storage.api.routers import job_orders_api
from backend.storage.api.routers import auth
from backend.storage.api.routers import rde_job_orders_api
from backend.storage.api.routers import email
from backend.storage.api.routers import cft
from backend.storage.api.routers import manual_entry
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

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
    allow_origins=["https://dbmrs-vtc-test.m-devsecops.com", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["Content-Security-Policy"] = "frame-ancestors 'self';"
        return response
    
app.add_middleware(SecurityHeadersMiddleware)


app.include_router(users.router)
app.include_router(test_orders_api.router)
app.include_router(vehicles_api.router)
app.include_router(engines_api.router)
app.include_router(job_orders_api.router)
app.include_router(auth.router)
app.include_router(rde_job_orders_api.router)
app.include_router(email.router)
app.include_router(cft.router)
app.include_router(manual_entry.router)