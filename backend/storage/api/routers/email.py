from http.client import HTTPException
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from backend.storage.models.models import JobOrder
from sqlalchemy.orm import Session
from backend.storage.api.api_utils import get_db

router = APIRouter()


@router.post("/send")
async def send_email_endpoint(data: dict, db: Session = Depends(get_db)):
    """
    Endpoint to send an email.
    @param data: dict - The email data containing necessary details like recipient, subject, and body.
    @param db: Session - Database session dependency.
    @raises HTTPException: If email sending fails, returns a 500 status code with an error message.
    @return: None
    """
    try:
        send_email(db=db, data=data)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to send email: please try again later"
        )


@router.post("/cft_members/add")
async def add_cft_member(
    job_order_id: str, member: dict, db: Session = Depends(get_db)
):
    job_order = (
        db.query(JobOrder)
        .filter(JobOrder.job_order_id == job_order_id)
        .first()
    )
    if not job_order:
        raise HTTPException(status_code=404, detail="JobOrder not found")
    job_order.cft_members.append(member)
    db.commit()
    return job_order


@router.get("/cft_members/read")
async def read_cft_members(job_order_id: str, db: Session = Depends(get_db)):
    job_order = (
        db.query(JobOrder)
        .filter(JobOrder.job_order_id == job_order_id)
        .first()
    )
    if not job_order:
        raise HTTPException(status_code=404, detail="JobOrder not found")
    return job_order.cft_members


@router.put("/cft_members/update")
async def update_cft_member(
    job_order_id: str,
    member_index: int,
    updated_member: dict,
    db: Session = Depends(get_db),
):
    job_order = (
        db.query(JobOrder)
        .filter(JobOrder.job_order_id == job_order_id)
        .first()
    )
    if not job_order:
        raise HTTPException(status_code=404, detail="JobOrder not found")
    if member_index >= len(job_order.cft_members):
        raise HTTPException(status_code=404, detail="CFT member not found")
    job_order.cft_members[member_index] = updated_member
    db.commit()
    return job_order


@router.delete("/cft_members/delete")
async def delete_cft_member(
    job_order_id: str, member_index: int, db: Session = Depends(get_db)
):
    job_order = (
        db.query(JobOrder)
        .filter(JobOrder.job_order_id == job_order_id)
        .first()
    )
    if not job_order:
        raise HTTPException(status_code=404, detail="JobOrder not found")
    if member_index >= len(job_order.cft_members):
        raise HTTPException(status_code=404, detail="CFT member not found")
    job_order.cft_members.pop(member_index)
    db.commit()
    return job_order
