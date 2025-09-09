import logging
import os

from backend.constants import (
    BUCKET_NAME,
    CREDENTIALS_PATH,
    DESTINATION_FOLDER,
    LOG_FILE_PATH,
)
from google.cloud import storage
from backend.storage.logging_config import vtc_logger
from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api/logger")

# Configure logging
logging.basicConfig(
    filename=LOG_FILE_PATH,
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

class LogRequest(BaseModel):
    """
    Pydantic schema for log interaction requests.
    """
    interaction: str
    employee_id: str


@router.post("/log")
async def log_interaction(log_request: LogRequest):
    """
    Log an interaction with employee ID and interaction description.
    """
    vtc_logger.info("Received log interaction request.")
    try:
        interaction = log_request.interaction
        employee_id = log_request.employee_id
        logger.info(f"Employee {employee_id} - {interaction}")
        vtc_logger.debug(f"Logged interaction: Employee {employee_id} - {interaction}")
    except Exception as e:
        vtc_logger.error("Error logging interaction.")
        vtc_logger.debug("Error details:", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error logging interaction: please try again later"
        )
    else:
        vtc_logger.info("Log interaction processed successfully.")
        return {"message": "Log received"}


@router.get("/getlogs")
async def get_logs():
    """
    Retrieve the contents of the log file.
    """
    vtc_logger.info("Received request to fetch logs.")
    try:
        with open(LOG_FILE_PATH, "r") as file:
            log_content = file.read()
        vtc_logger.debug("Log file read successfully.")
    except Exception as e:
        vtc_logger.error("Error retrieving logs.")
        vtc_logger.debug("Error details:", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error retrieving logs: please try again later"
        )
    else:
        vtc_logger.info("Logs returned successfully.")
        return PlainTextResponse(content=log_content)
