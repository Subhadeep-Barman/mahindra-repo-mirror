from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional, Union, Dict
from pydantic import BaseModel
from backend.storage.api.api_utils import get_db
from backend.storage.models.models import RDEJobOrder, TestOrder  # Import TestOrder model

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
    cft_members: Optional[List[Union[str, Dict]]] = None  # Accept both str and dict

def normalize_cft_members(cft_members):
    # Convert all items to dicts with at least a 'name' key
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
        "test_status": str(total_test_orders),  # Total number of test orders
        "completed_test_count": str(completed_test_orders),  # Count of completed test orders
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

@router.post("/rde_joborders", response_model=RDEJobOrderSchema)
def create_rde_joborder(
    rde_joborder: RDEJobOrderSchema = Body(...),
    db: Session = Depends(get_db)
):
    rde_joborder_data = rde_joborder.dict(exclude_unset=True)
    if "cft_members" in rde_joborder_data:
        rde_joborder_data["cft_members"] = normalize_cft_members(rde_joborder_data["cft_members"])
    new_rde_joborder = RDEJobOrder(**rde_joborder_data)
    db.add(new_rde_joborder)
    db.commit()
    db.refresh(new_rde_joborder)
    return rde_joborder_to_dict(new_rde_joborder)

@router.get("/rde_joborders", response_model=List[RDEJobOrderSchema])
def read_rde_joborders(db: Session = Depends(get_db)):
    rde_joborders = db.query(RDEJobOrder).all()
    return [rde_joborder_to_dict(r, db) for r in rde_joborders]

@router.get("/rde_joborders/{job_order_id}", response_model=RDEJobOrderSchema)
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
