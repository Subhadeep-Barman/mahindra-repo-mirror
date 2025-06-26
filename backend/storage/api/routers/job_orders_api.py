from fastapi import APIRouter, HTTPException, Depends, Body
from pathlib import Path
import json
from typing import List
from datetime import datetime
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.storage.api.api_utils import get_db
from backend.storage.models.models import JobOrder

router = APIRouter()

@router.get("/domains")
def get_domains():
    base_path = Path(__file__).parent.parent.parent / "json_data"
    try:
        with open(base_path / "domain.json", encoding="utf-8") as f:
            domains = json.load(f)
        return domains
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/body_numbers")
def get_body_numbers():
    """
    Returns the complete body_number.json content.
    """
    base_path = Path(__file__).parent.parent.parent / "json_data"
    try:
        with open(base_path / "body_number.json", encoding="utf-8") as f:
            body_numbers = json.load(f)
        return body_numbers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class JobOrderSchema(BaseModel):
    job_order_id: str
    project_id: str = None
    vehicle_id: str = None
    vehicle_body_number: str = None
    engine_id: str = None
    CoastDownData_id: str = None
    type_of_engine: str = None
    department: str = None
    domain: str = None
    job_order_status: str = None
    remarks: str = None
    rejection_remarks: str = None
    mail_remarks: str = None
    id_of_creator: str = None
    name_of_creator: str = None
    created_on: datetime = None
    id_of_updater: str = None
    name_of_updater: str = None
    updated_on: datetime = None

def joborder_to_dict(joborder: JobOrder):
    return {
        "job_order_id": joborder.job_order_id,
        "project_id": joborder.project_id,
        "vehicle_id": joborder.vehicle_id,
        "vehicle_body_number": joborder.vehicle_body_number,
        "engine_id": joborder.engine_id,
        "CoastDownData_id": joborder.CoastDownData_id,
        "type_of_engine": joborder.type_of_engine,
        "department": joborder.department,
        "domain": joborder.domain,
        "job_order_status": joborder.job_order_status,
        "remarks": joborder.remarks,
        "rejection_remarks": joborder.rejection_remarks,
        "mail_remarks": joborder.mail_remarks,
        "id_of_creator": joborder.id_of_creator,
        "name_of_creator": joborder.name_of_creator,
        "created_on": joborder.created_on,
        "id_of_updater": joborder.id_of_updater,
        "name_of_updater": joborder.name_of_updater,
        "updated_on": joborder.updated_on,
    }

@router.post("/joborders", response_model=JobOrderSchema)
def create_joborder_api(
    joborder: JobOrderSchema = Body(...),
    db: Session = Depends(get_db)
):
    joborder_data = joborder.dict(exclude_unset=True)
    new_joborder = JobOrder(**joborder_data)
    db.add(new_joborder)
    db.commit()
    db.refresh(new_joborder)
    return joborder_to_dict(new_joborder)

@router.get("/joborders", response_model=List[JobOrderSchema])
def read_joborders(db: Session = Depends(get_db)):
    joborders = db.query(JobOrder).all()
    return [joborder_to_dict(j) for j in joborders]

@router.get("/joborders/{job_order_id}", response_model=JobOrderSchema)
def read_joborder(job_order_id: str, db: Session = Depends(get_db)):
    joborder = db.query(JobOrder).filter(JobOrder.job_order_id == job_order_id).first()
    if not joborder:
        raise HTTPException(status_code=404, detail="JobOrder not found")
    return joborder_to_dict(joborder)

@router.put("/joborders/{job_order_id}", response_model=JobOrderSchema)
def update_joborder(
    job_order_id: str,
    joborder_update: JobOrderSchema = Body(...),
    db: Session = Depends(get_db)
):
    joborder = db.query(JobOrder).filter(JobOrder.job_order_id == job_order_id).first()
    if not joborder:
        raise HTTPException(status_code=404, detail="JobOrder not found")
    update_data = joborder_update.dict(exclude_unset=True)
    update_data.pop("job_order_id", None)
    for key, value in update_data.items():
        setattr(joborder, key, value)
    joborder.updated_on = datetime.utcnow()
    db.commit()
    db.refresh(joborder)
    return joborder_to_dict(joborder)

@router.delete("/joborders/{job_order_id}")
def delete_joborder(job_order_id: str, db: Session = Depends(get_db)):
    joborder = db.query(JobOrder).filter(JobOrder.job_order_id == job_order_id).first()
    if not joborder:
        raise HTTPException(status_code=404, detail="JobOrder not found")
    db.delete(joborder)
    db.commit()
    return {"detail": "JobOrder deleted successfully"}
