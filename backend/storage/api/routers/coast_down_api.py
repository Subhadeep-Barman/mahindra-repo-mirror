from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List
from datetime import datetime
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.storage.api.api_utils import get_db
from backend.storage.models.models import CoastDownData
from backend.storage.logging_config import vtc_logger

router = APIRouter()

class CoastDownDataSchema(BaseModel):
    """
    Pydantic schema for CoastDownData.
    """
    CoastDownData_id: str
    job_order_id: str = None
    coast_down_reference: str = None
    vehicle_reference_mass: float = None
    a_value: float = None
    b_value: float = None
    c_value: float = None
    f0_value: float = None
    f1_value: float = None
    f2_value: float = None
    id_of_creator: str = None
    created_on: datetime = None
    id_of_updater: str = None
    updated_on: datetime = None

def coastdown_to_dict(cd: CoastDownData):
    """
    Convert CoastDownData ORM object to dictionary.
    This function is used to serialize the ORM object for API responses.
    """
    vtc_logger.debug(f"Converting CoastDownData object to dict: {cd}")
    return {
        "CoastDownData_id": cd.CoastDownData_id,
        "job_order_id": cd.job_order_id,
        "coast_down_reference": cd.coast_down_reference,
        "vehicle_reference_mass": cd.vehicle_reference_mass,
        "a_value": cd.a_value,
        "b_value": cd.b_value,
        "c_value": cd.c_value,
        "f0_value": cd.f0_value,
        "f1_value": cd.f1_value,
        "f2_value": cd.f2_value,
        "id_of_creator": cd.id_of_creator,
        "created_on": cd.created_on,
        "id_of_updater": cd.id_of_updater,
        # "updated_on": cd.updated_on,
    }

@router.post("/coastdown", response_model=CoastDownDataSchema)
def create_coastdown_api(
    coastdown: CoastDownDataSchema = Body(...),
    db: Session = Depends(get_db)
):
    """
    Create a new CoastDownData entry.
    """
    vtc_logger.info("Received request to create CoastDownData.")
    try:
        coastdown_data = coastdown.dict(exclude_unset=True)
        vtc_logger.debug(f"CoastDownData payload: {coastdown_data}")
        new_cd = CoastDownData(**coastdown_data)
        db.add(new_cd)
        db.commit()
        db.refresh(new_cd)
        vtc_logger.info(f"Created CoastDownData with ID: {new_cd.CoastDownData_id}")
        return coastdown_to_dict(new_cd)
    except Exception as e:
        vtc_logger.error("Error creating CoastDownData.")
        vtc_logger.debug(f"Error details: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error while creating CoastDownData.")

@router.get("/coastdown", response_model=List[CoastDownDataSchema])
def read_coastdowns(db: Session = Depends(get_db)):
    """
    Retrieve all CoastDownData entries.
    """
    vtc_logger.info("Fetching all CoastDownData entries.")
    try:
        cds = db.query(CoastDownData).all()
        vtc_logger.debug(f"Fetched {len(cds)} CoastDownData entries.")
        return [coastdown_to_dict(cd) for cd in cds]
    except Exception as e:
        vtc_logger.error("Error fetching CoastDownData entries.")
        vtc_logger.debug(f"Error details: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error while fetching CoastDownData.")

@router.get("/coastdown/{CoastDownData_id}", response_model=CoastDownDataSchema)
def read_coastdown(CoastDownData_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a specific CoastDownData entry by ID.
    """
    vtc_logger.info(f"Fetching CoastDownData with ID: {CoastDownData_id}")
    try:
        cd = db.query(CoastDownData).filter(CoastDownData.CoastDownData_id == CoastDownData_id).first()
        if not cd:
            vtc_logger.error(f"CoastDownData with ID {CoastDownData_id} not found.")
            vtc_logger.debug(f"Error details: CoastDownData {CoastDownData_id} does not exist.")
            raise HTTPException(status_code=404, detail="CoastDownData not found")
        vtc_logger.debug(f"Found CoastDownData: {cd}")
        return coastdown_to_dict(cd)
    except HTTPException:
        raise
    except Exception as e:
        vtc_logger.error(f"Error fetching CoastDownData with ID: {CoastDownData_id}.")
        vtc_logger.debug(f"Error details: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error while fetching CoastDownData.")

@router.put("/coastdown/{CoastDownData_id}", response_model=CoastDownDataSchema)
def update_coastdown(
    CoastDownData_id: str,
    coastdown_update: CoastDownDataSchema = Body(...),
    db: Session = Depends(get_db)
):
    """
    Update an existing CoastDownData entry by ID.
    """
    vtc_logger.info(f"Updating CoastDownData with ID: {CoastDownData_id}")
    try:
        cd = db.query(CoastDownData).filter(CoastDownData.CoastDownData_id == CoastDownData_id).first()
        if not cd:
            vtc_logger.error(f"CoastDownData with ID {CoastDownData_id} not found for update.")
            vtc_logger.debug(f"Error details: CoastDownData {CoastDownData_id} does not exist for update.")
            raise HTTPException(status_code=404, detail="CoastDownData not found")
        update_data = coastdown_update.dict(exclude_unset=True)
        vtc_logger.debug(f"Update payload: {update_data}")
        update_data.pop("CoastDownData_id", None)
        for key, value in update_data.items():
            setattr(cd, key, value)
        cd.updated_on = datetime.utcnow()
        db.commit()
        db.refresh(cd)
        vtc_logger.info(f"Updated CoastDownData with ID: {CoastDownData_id}")
        return coastdown_to_dict(cd)
    except HTTPException:
        raise
    except Exception as e:
        vtc_logger.error(f"Error updating CoastDownData with ID: {CoastDownData_id}.")
        vtc_logger.debug(f"Error details: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error while updating CoastDownData.")

@router.delete("/coastdown/{CoastDownData_id}")
def delete_coastdown(CoastDownData_id: str, db: Session = Depends(get_db)):
    """
    Delete a CoastDownData entry by ID.
    """
    vtc_logger.info(f"Deleting CoastDownData with ID: {CoastDownData_id}")
    try:
        cd = db.query(CoastDownData).filter(CoastDownData.CoastDownData_id == CoastDownData_id).first()
        if not cd:
            vtc_logger.error(f"CoastDownData with ID {CoastDownData_id} not found for deletion.")
            vtc_logger.debug(f"Error details: CoastDownData {CoastDownData_id} does not exist for deletion.")
            raise HTTPException(status_code=404, detail="CoastDownData not found")
        db.delete(cd)
        db.commit()
        vtc_logger.info(f"Deleted CoastDownData with ID: {CoastDownData_id}")
        return {"detail": "CoastDownData deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        vtc_logger.error(f"Error deleting CoastDownData {CoastDownData_id}.")
        vtc_logger.debug(f"Error details for CoastDownData {CoastDownData_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error while deleting CoastDownData.")
