from http.client import HTTPException
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, Body
from backend.storage.models.models import JobOrder
from sqlalchemy.orm import Session
from backend.storage.api.api_utils import get_db
import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import re

router = APIRouter()

JSON_DATA_PATH = os.path.join(
    os.path.dirname(__file__), "../../../json_data/mail_body.json"
)


def get_mail_template(caseid: str, data: dict) -> Dict[str, str]:
    """
    Load the mail template for the given caseid and fill in the data.
    """
    with open(JSON_DATA_PATH, "r", encoding="utf-8") as f:
        templates = json.load(f)
    # Find the case in the email_cases list
    email_cases = templates.get("email_cases", [])
    template = next((case for case in email_cases if case["id"] == caseid), None)
    if not template:
        raise HTTPException(status_code=400, detail="Invalid caseid")
    subject = template["body"]["subject"].format(**data)
    message = template["body"]["message"].format(**data)
    # Optionally, you can add redirect_link or button_style if needed
    return {"subject": subject, "body": message}


def send_email(to_email: str, subject: str, body: str):
    """
    Send an email using SMTP.
    """
    smtp_host = os.environ.get("SMTP_SERVER", "")
    smtp_port = int(os.environ.get("SMTP_PORT", 587))
    smtp_user = os.environ.get("SENDER_EMAIL", "")
    smtp_pass = os.environ.get("SENDER_PASSWORD", "")
    from_email = smtp_user

    if not smtp_host or not smtp_user or not smtp_pass:
        raise HTTPException(
            status_code=500,
            detail="SMTP_SERVER, SENDER_EMAIL, or SENDER_PASSWORD environment variable is not set. Please configure your SMTP settings."
        )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email

    # Attach HTML body
    msg.attach(MIMEText(body, "html"))

    # try:
    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(from_email, to_email, msg.as_string())
    # except Exception as e:
    #     raise HTTPException(
    #         status_code=500,
    #         detail=f"Email sending failed: {str(e)}. Check your SMTP configuration."
    #     )


@router.post("/send")
async def send_email_endpoint(
    caseid: str = Body(...),
    to_email: str = Body(...),
    data: dict = Body(...),
):
    """
    Endpoint to send an email based on caseid and data.
    """
    if not re.match(r"[^@]+@[^@]+\.[^@]+", to_email):
        raise HTTPException(status_code=400, detail="Invalid recipient email address.")

    mail_content = get_mail_template(caseid, data)
    send_email(
        to_email=to_email,
        subject=mail_content["subject"],
        body=mail_content["body"],
    )
    return {"detail": "Email sent successfully"}


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
    job_order.cft_members.pop(member_index)
    db.commit()
    return job_order
