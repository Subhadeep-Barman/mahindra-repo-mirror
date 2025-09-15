from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional, Union, Dict
from pydantic import BaseModel
from backend.storage.api.api_utils import get_db
from backend.storage.models.models import RDEJobOrder, TestOrder

router = APIRouter()

class RDEJobOrderSchema(BaseModel):
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
    wbs_code: Optional[str] = None
    vehicle_gwv: Optional[str] = None
    vehicle_kerb_weight: Optional[str] = None
    vehicle_test_payload_criteria: Optional[str] = None
    requested_payload: Optional[str] = None
    idle_exhaust_mass_flow: Optional[str] = None
    job_order_status: Optional[str] = None
    id_of_creator: Optional[str] = None
    name_of_creator: Optional[str] = None
    created_on: Optional[datetime] = None
    id_of_updater: Optional[str] = None
    name_of_updater: Optional[str] = None
    updated_on: Optional[datetime] = None
    cft_members: Optional[List[Union[str, Dict]]] = None 

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

def rde_joborder_to_dict(rde_joborder: RDEJobOrder, db: Session = None):
    total_test_orders = 0
    completed_test_orders = 0

    if db:
        total_test_orders = db.query(TestOrder).filter(TestOrder.job_order_id == rde_joborder.job_order_id).count()
        completed_test_orders = db.query(TestOrder).filter(
            TestOrder.job_order_id == rde_joborder.job_order_id,
            TestOrder.status == "Completed"
        ).count()

    return {
        "job_order_id": rde_joborder.job_order_id,
        "project_code": rde_joborder.project_code,
        "vehicle_serial_number": rde_joborder.vehicle_serial_number,
        "vehicle_body_number": rde_joborder.vehicle_body_number,
        "engine_serial_number": rde_joborder.engine_serial_number,
        "CoastDownData_id": rde_joborder.CoastDownData_id,
        "type_of_engine": rde_joborder.type_of_engine,
        "department": rde_joborder.department,
        "domain": rde_joborder.domain,
        "test_status": str(total_test_orders), 
        "completed_test_count": str(completed_test_orders),
        "wbs_code": rde_joborder.wbs_code,
        "vehicle_gwv": rde_joborder.vehicle_gwv,
        "vehicle_kerb_weight": rde_joborder.vehicle_kerb_weight,
        "vehicle_test_payload_criteria": rde_joborder.vehicle_test_payload_criteria,
        "requested_payload": rde_joborder.requested_payload,
        "idle_exhaust_mass_flow": rde_joborder.idle_exhaust_mass_flow,
        "job_order_status": rde_joborder.job_order_status,
        "id_of_creator": rde_joborder.id_of_creator,
        "name_of_creator": rde_joborder.name_of_creator,
        "created_on": rde_joborder.created_on,
        "id_of_updater": rde_joborder.id_of_updater,
        "name_of_updater": rde_joborder.name_of_updater,
        "updated_on": rde_joborder.updated_on,
        "cft_members": normalize_cft_members(rde_joborder.cft_members)
    }

def generate_job_order_id(department: str, db: Session) -> str:
    """
    Generates a job order ID in the format:
    JO VTC-<year>-<count>/<vehicle_body_number>
    """
    current_year = datetime.utcnow().year % 100  
    count = db.query(RDEJobOrder).count() + 1 
    count_str = f"{count:04d}"  
    job_order_id = f"JO RDE-{current_year}-{count_str}"
    print(f"Generated job_order_id: {job_order_id}")  
    return job_order_id

def is_user_in_cft_members(cft_members, user_id):
    """
    Checks if the user_id is present in the cft_members list.
    Matches either 'id' or 'code' field in cft_members.
    """
    if not cft_members:
        return False
    for member in cft_members:
        if str(member.get("id", "")) == str(user_id) or str(member.get("code", "")) == str(user_id):
            return True
    return False

@router.post("/rde_joborders", response_model=RDEJobOrderSchema)
def create_rde_joborder(
    rde_joborder: RDEJobOrderSchema = Body(...),
    db: Session = Depends(get_db)
):
    rde_joborder_data = rde_joborder.dict(exclude_unset=True)
    if "cft_members" in rde_joborder_data:
        rde_joborder_data["cft_members"] = normalize_cft_members(rde_joborder_data["cft_members"])

    # Always generate job_order_id
    if not rde_joborder_data.get("vehicle_body_number"):
        print("Error: Vehicle body number is missing!")
        raise HTTPException(status_code=400, detail="Vehicle body number is required to generate job_order_id")
    rde_joborder_data["job_order_id"] = generate_job_order_id(rde_joborder_data["vehicle_body_number"], db)
    print(f"Generated job_order_id: {rde_joborder_data['job_order_id']}") 

    print("Proceeding to save the job order...")
    new_rde_joborder = RDEJobOrder(**rde_joborder_data)
    db.add(new_rde_joborder)
    db.commit()
    db.refresh(new_rde_joborder)
    print(f"Saved job order to database: {new_rde_joborder}")
    
    response_data = rde_joborder_to_dict(new_rde_joborder)
    response_data["job_order_id"] = new_rde_joborder.job_order_id
    print(f"Response data: {response_data}")
    return response_data

@router.get("/rde_joborders", response_model=List[RDEJobOrderSchema])
def read_rde_joborders(
    user_id: Optional[str] = None,
    role: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(RDEJobOrder)
    rde_joborders = query.all()
    # If role is TestEngineer or Admin, return job orders with at least one test order
    if role in ["TestEngineer", "Admin"]:
        return [
            rde_joborder_to_dict(r, db)
            for r in rde_joborders
            if db.query(TestOrder).filter(TestOrder.job_order_id == r.job_order_id).count() > 0
        ]
    if user_id:
        filtered = []
        for r in rde_joborders:
            if r.id_of_creator == user_id or is_user_in_cft_members(r.cft_members, user_id):
                filtered.append(r)
        return [rde_joborder_to_dict(r, db) for r in filtered]
    return [rde_joborder_to_dict(r, db) for r in rde_joborders]

@router.get("/rde_joborders-single/{job_order_id}", response_model=RDEJobOrderSchema)
def read_rde_joborder(job_order_id: str, db: Session = Depends(get_db)):
    rde_joborder = db.query(RDEJobOrder).filter(RDEJobOrder.job_order_id == job_order_id).first()
    if not rde_joborder:
        raise HTTPException(status_code=404, detail="RDEJobOrder not found")
    return rde_joborder_to_dict(rde_joborder, db)

@router.put("/rde_joborders/{job_order_id}", response_model=RDEJobOrderSchema)
def update_rde_joborder(
    job_order_id: str,
    rde_joborder_update: RDEJobOrderSchema = Body(...),
    db: Session = Depends(get_db)
):
    rde_joborder = db.query(RDEJobOrder).filter(RDEJobOrder.job_order_id == job_order_id).first()
    if not rde_joborder:
        raise HTTPException(status_code=404, detail="RDEJobOrder not found")
    update_data = rde_joborder_update.dict(exclude_unset=True)
    update_data.pop("job_order_id", None)
    if "cft_members" in update_data:
        update_data["cft_members"] = normalize_cft_members(update_data["cft_members"])
    for key, value in update_data.items():
        setattr(rde_joborder, key, value)
    rde_joborder.updated_on = datetime.utcnow()
    db.commit()
    db.refresh(rde_joborder)
    return rde_joborder_to_dict(rde_joborder)

@router.delete("/rde_joborders/{job_order_id}")
def delete_rde_joborder(job_order_id: str, db: Session = Depends(get_db)):
    rde_joborder = db.query(RDEJobOrder).filter(RDEJobOrder.job_order_id == job_order_id).first()
    if not rde_joborder:
        raise HTTPException(status_code=404, detail="RDEJobOrder not found")
    db.delete(rde_joborder)
    db.commit()
    return {"detail": "RDEJobOrder deleted successfully"}
