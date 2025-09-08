from fastapi import APIRouter, HTTPException, Depends, Body
from pathlib import Path
import json
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.storage.api.api_utils import get_db
from backend.storage.models.models import JobOrder, TestOrder, User, Vehicle 

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
    return [sn for (sn,) in results if sn is not None]

class JobOrderSchema(BaseModel):
    job_order_id: Optional[str] = None
    project_code: Optional[str] = None
    vehicle_serial_number: Optional[str] = None
    vehicle_body_number: Optional[str] = None
    engine_serial_number: Optional[str] = None
    CoastDownData_id: Optional[str] = None
    type_of_engine: Optional[str] = None
    department: Optional[str] = None
    domain: Optional[str] = None
    test_status: Optional[str] = None  
    completed_test_count: Optional[str] = None  
    job_order_status: Optional[str] = None
    id_of_creator: Optional[str] = None
    name_of_creator: Optional[str] = None
    created_on: Optional[datetime] = None
    id_of_updater: Optional[str] = None
    name_of_updater: Optional[str] = None
    updated_on: Optional[datetime] = None
    cft_members: Optional[List[Dict[str, Any]]] = None  

    class Config:
        orm_mode = True

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
            TestOrder.status == "Completed" 
        ).count()

    
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
        "test_status": str(total_test_orders), 
        "completed_test_count": str(completed_test_orders),  
        "job_order_status": joborder.job_order_status,
        "id_of_creator": joborder.id_of_creator,
        "name_of_creator": joborder.name_of_creator,
        "created_on": joborder.created_on,
        "id_of_updater": joborder.id_of_updater,
        "name_of_updater": joborder.name_of_updater,
        "updated_on": joborder.updated_on,
        "cft_members": joborder.cft_members if joborder.cft_members else []
    }

def normalize_cft_members(cft_members):
    if not cft_members:
        return []
    normalized = []
    for m in cft_members:
        if isinstance(m, dict):
            normalized.append(m)
        elif isinstance(m, str):
            normalized.append({"name": m})
    return normalized

def generate_job_order_id(department: str, db: Session) -> str:
    """
    Generates a job order ID in the format:
    - For Chennai: JO VTC-<year>-<count>
    - For Nashik:  JO VTC_N-<year>-<count>
    - For others:  JO VTC-<year>-<count>
    The counter is separate for each department and ensures no duplicates.
    """
    current_year = datetime.utcnow().year % 100
    
    # Define prefix based on department
    if department == "VTC_JO Chennai":
        prefix = f"JO VTC-{current_year}-"
    elif department == "VTC_JO Nashik":
        prefix = f"JO VTC_N-{current_year}-"
    elif department == "PDCD_JO Chennai":
        prefix = f"JO PDCD-{current_year}-"
    else:
        prefix = f"JO VTC-{current_year}-"
    
    job_orders = db.query(JobOrder).filter(
        JobOrder.job_order_id.like(f"{prefix}%")
    ).all()
    
    max_number = 0
    for job in job_orders:
        try:
            number_part = job.job_order_id.split('-')[-1]
            number = int(number_part)
            if number > max_number:
                max_number = number
        except (ValueError, IndexError):
            continue
    
    # Next number is max + 1, or 1 if no jobs exist
    next_number = max_number + 1
    count_str = f"{next_number:04d}"
    
    return f"{prefix}{count_str}"

@router.post("/joborders", response_model=JobOrderSchema)
def create_joborder_api(
    joborder: JobOrderSchema = Body(...),
    db: Session = Depends(get_db)
):
    joborder_data = joborder.dict(exclude_unset=True)
    if "cft_members" in joborder_data:
        joborder_data["cft_members"] = normalize_cft_members(joborder_data["cft_members"])

    if not joborder_data.get("department"):
        print("Error: Department is missing!")  
        raise HTTPException(status_code=400, detail="Department is required to generate job_order_id")
    joborder_data["job_order_id"] = generate_job_order_id(joborder_data["department"], db)
    print(f"Generated job_order_id: {joborder_data['job_order_id']}")

    print("Proceeding to save the job order...")
    new_joborder = JobOrder(**joborder_data)
    db.add(new_joborder)
    db.commit()
    db.refresh(new_joborder)
    print(f"Saved job order to database: {new_joborder}")
    print(f"Response data: {new_joborder}")
    response_data = joborder_to_dict(new_joborder)
    response_data["job_order_id"] = new_joborder.job_order_id
    print(f"Response data: {response_data}")
    return response_data
    
@router.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    """
    Get all unique departments from job orders
    """
    departments = db.query(JobOrder.department).distinct().filter(JobOrder.department.isnot(None)).all()
    return [dept[0] for dept in departments if dept[0]]

def is_user_in_cft_members(cft_members, user_id):
    """
    Checks if the user_id is present in the cft_members list.
    Matches either 'id' or 'code' field in cft_members.
    """
    if not cft_members:
        return False
    for member in cft_members:
        # Accept both 'id' and 'code' as possible keys for user_id
        if str(member.get("id", "")) == str(user_id) or str(member.get("code", "")) == str(user_id):
            return True
    return False

@router.get("/joborders", response_model=List[JobOrderSchema])
def read_joborders(
    department: str = None,
    user_id: str = None,
    role: str = None,
    db: Session = Depends(get_db)
):
    """
    Returns job orders filtered by department and user_id (id_of_creator or cft_members).
    TestEngineer and Admin roles can see all job orders.
    """
    if not user_id and (not role or role not in ["TestEngineer", "Admin"]):
        raise HTTPException(status_code=400, detail="user_id is required")
    query = db.query(JobOrder)
    if department:
        query = query.filter(JobOrder.department == department)
    joborders = query.all()
    # If role is TestEngineer or Admin, return all job orders
    if role in ["TestEngineer", "Admin"]:
        return [joborder_to_dict(j, db) for j in joborders]
    # Otherwise, filter by creator or cft_members
    filtered_joborders = []
    for j in joborders:
        if j.id_of_creator == user_id:
            filtered_joborders.append(j)
            continue
        if is_user_in_cft_members(j.cft_members, user_id):
            filtered_joborders.append(j)
    return [joborder_to_dict(j, db) for j in filtered_joborders]

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
    # Ensure cft_members is a list of dicts or set to []
    if "cft_members" in update_data and update_data["cft_members"] is None:
        update_data["cft_members"] = []
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
