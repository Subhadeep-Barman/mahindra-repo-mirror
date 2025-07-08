from fastapi import APIRouter, HTTPException, Depends, Body
from pathlib import Path
import json
from typing import List
from datetime import datetime
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.storage.api.api_utils import get_db
from backend.storage.models.models import JobOrder, TestOrder, Vehicle  # Add Vehicle import

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

@router.get("/vehicle_serial_numbers")
def get_vehicle_serial_numbers(db: Session = Depends(get_db)):
    """
    Returns all vehicle serial numbers from the Vehicle table.
    """
    results = db.query(Vehicle.vehicle_serial_number).all()
    # Return list of serial numbers, filtering out None values
    return [sn for (sn,) in results if sn is not None]

class JobOrderSchema(BaseModel):
    job_order_id: str
    project_code: str = None
    vehicle_serial_number: str = None
    vehicle_body_number: str = None
    engine_serial_number: str = None
    CoastDownData_id: str = None
    type_of_engine: str = None
    department: str = None
    domain: str = None
    test_status: str = None  # Total number of test orders as string
    completed_test_count: str = None  # Count of completed test orders as string
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

class TestOrderStatusUpdateSchema(BaseModel):
    test_order_id: str
    status: str
    remark: str = None

def joborder_to_dict(joborder: JobOrder, db: Session = None):
    # Calculate total test orders and completed test orders count
    total_test_orders = 0
    completed_test_orders = 0
    
    if db:
        # Get total count of test orders for this job order
        total_test_orders = db.query(TestOrder).filter(TestOrder.job_order_id == joborder.job_order_id).count()
        
        # Get count of completed test orders for this job order
        completed_test_orders = db.query(TestOrder).filter(
            TestOrder.job_order_id == joborder.job_order_id,
            TestOrder.status == "completed"
        ).count()

        # print(f"Total test orders for {joborder.job_order_id}: {total_test_orders}")
        # print(f"Completed test orders for {joborder.job_order_id}: {completed_test_orders}")
    
    return {
        "job_order_id": joborder.job_order_id,
        "project_code": joborder.project_code,
        "vehicle_serial_number": joborder.vehicle_serial_number,
        "vehicle_body_number": joborder.vehicle_body_number,
        "engine_serial_number": joborder.engine_serial_number,
        "CoastDownData_id": joborder.CoastDownData_id,
        "type_of_engine": joborder.type_of_engine,
        "department": joborder.department,
        "domain": joborder.domain,
        "test_status": str(total_test_orders),  # Total number of test orders
        "completed_test_count": str(completed_test_orders),  # Count of completed test orders
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
    return joborder_to_dict(new_joborder, db)

@router.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    """
    Get all unique departments from job orders
    """
    departments = db.query(JobOrder.department).distinct().filter(JobOrder.department.isnot(None)).all()
    return [dept[0] for dept in departments if dept[0]]

@router.get("/joborders", response_model=List[JobOrderSchema])
def read_joborders(department: str = None, db: Session = Depends(get_db)):
    if department:
        joborders = db.query(JobOrder).filter(JobOrder.department == department).all()
    else:
        joborders = db.query(JobOrder).all()
    return [joborder_to_dict(j, db) for j in joborders]

@router.get("/joborders/{job_order_id}", response_model=JobOrderSchema)
def read_joborder(job_order_id: str, db: Session = Depends(get_db)):
    joborder = db.query(JobOrder).filter(JobOrder.job_order_id == job_order_id).first()
    if not joborder:
        raise HTTPException(status_code=404, detail="JobOrder not found")
    return joborder_to_dict(joborder, db)

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
    return joborder_to_dict(joborder, db)

@router.delete("/joborders/{job_order_id}")
def delete_joborder(job_order_id: str, db: Session = Depends(get_db)):
    joborder = db.query(JobOrder).filter(JobOrder.job_order_id == job_order_id).first()
    if not joborder:
        raise HTTPException(status_code=404, detail="JobOrder not found")
    db.delete(joborder)
    db.commit()
    return {"detail": "JobOrder deleted successfully"}

@router.post("/testorders/status")
def update_testorder_status(
    payload: TestOrderStatusUpdateSchema = Body(...),
    db: Session = Depends(get_db)
):
    test_order = db.query(TestOrder).filter(TestOrder.test_order_id == payload.test_order_id).first()
    if not test_order:
        raise HTTPException(status_code=404, detail="TestOrder not found")
    # If status is "started", set to "under progress"
    if payload.status.lower() == "started":
        test_order.status = "under progress"
    else:
        test_order.status = payload.status
    if payload.remark is not None:
        test_order.remark = payload.remark
    test_order.updated_on = datetime.utcnow()
    db.commit()
    db.refresh(test_order)
    return {
        "test_order_id": test_order.test_order_id,
        "status": test_order.status,
        "remark": test_order.remark,
        "updated_on": test_order.updated_on
    }

@router.get("/joborders/{job_order_id}/testorders/count")
def get_testorder_count(job_order_id: str, db: Session = Depends(get_db)):
    count = db.query(TestOrder).filter(TestOrder.job_order_id == job_order_id).count()
    return count
