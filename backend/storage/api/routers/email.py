from http.client import HTTPException
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, Body
from backend.storage.models.models import JobOrder, TestOrder, User # adjust import as per your models
from sqlalchemy.orm import Session
from backend.storage.api.api_utils import get_db
import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import re

from backend.storage.logging_config import vtc_logger

router = APIRouter()

EMAIL_TEMPLATE_PATH = os.path.join(
    os.path.dirname(__file__), "../../../json_data/mail_body.json"
)


def get_employee_email_by_role(db: Session, job_order_id: str, role: str) -> list:
    """
    Fetch email(s) for a given role and job_order_id.

    Args:
        db (Session): SQLAlchemy database session.
        job_order_id (str): The job order ID.
        role (str): The user role to filter.

    Returns:
        list: List of email addresses for the given role and job order.

    Raises:
        HTTPException: If job order is not found.
    """
    try:
        job_order = db.query(JobOrder).filter(JobOrder.job_order_id == job_order_id).first()
        if not job_order:
            vtc_logger.warning(f"JobOrder not found for job_order_id: {job_order_id}")
            return []
        user = db.query(User).filter(User.id == job_order.id_of_creator, User.role == role).first()
        if not user or not user.email:
            vtc_logger.info(f"No user found with role {role} for job_order_id: {job_order_id}")
            return []
        return [user.email]
    except Exception as e:
        vtc_logger.error(f"Error in get_employee_email_by_role: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


def get_role_for_caseid(caseid: str) -> str:
    """
    Get the role from mail_body.json for the given caseid.

    Args:
        caseid (str): The case ID to look up.

    Returns:
        str: The role associated with the caseid.

    Raises:
        HTTPException: If the caseid is invalid.
    """
    try:
        with open(EMAIL_TEMPLATE_PATH, "r", encoding="utf-8") as f:
            templates = json.load(f)
        email_cases = templates.get("email_cases", [])
        template = next((case for case in email_cases if case["id"] == caseid), None)
        if not template:
            vtc_logger.warning(f"Invalid caseid: {caseid}")
            raise HTTPException(status_code=400, detail="Invalid caseid")
        return template.get("receivers")
    except Exception as e:
        vtc_logger.error(f"Error in get_role_for_caseid: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


def get_all_emails_by_role(db: Session, role: str) -> list:
    """
    Fetch all emails for users with the given role.

    Args:
        db (Session): SQLAlchemy database session.
        role (str): The user role to filter.

    Returns:
        list: List of email addresses for the given role.
    """
    try:
        users = db.query(User).filter(User.role == role).all()
        emails = [user.email for user in users if user.email]
        vtc_logger.info(f"Found {len(emails)} emails for role {role}")
        return emails
    except Exception as e:
        vtc_logger.error(f"Error in get_all_emails_by_role: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


def load_email_template(caseid: str) -> tuple:
    """
    Load the email template for the given caseid.

    Args:
        caseid (str): The case ID to look up.

    Returns:
        tuple: (subject, message) from the template.

    Raises:
        HTTPException: If the caseid is invalid.
    """
    try:
        with open(EMAIL_TEMPLATE_PATH, "r", encoding="utf-8") as f:
            templates = json.load(f)
        email_cases = templates.get("email_cases", [])
        template = next((case for case in email_cases if case["id"] == caseid), None)
        if not template:
            vtc_logger.warning(f"Invalid caseid for template: {caseid}")
            raise HTTPException(status_code=400, detail="Invalid caseid")
        subject = template["body"]["subject"]
        message = template["body"]["message"]
        return subject, message
    except Exception as e:
        vtc_logger.error(f"Error in load_email_template: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


def send_email(to_emails: list, subject: str, body: str) -> None:
    """
    Send an email using SMTP.

    Args:
        to_emails (list): List of recipient email addresses.
        subject (str): Email subject.
        body (str): Email body (HTML).

    Raises:
        HTTPException: If SMTP configuration is missing or sending fails.
    """
    try:
        smtp_host = os.environ.get("SMTP_SERVER", "")
        smtp_port = int(os.environ.get("SMTP_PORT", 587))
        smtp_user = os.environ.get("SENDER_EMAIL", "")
        smtp_pass = os.environ.get("SENDER_PASSWORD", "")
        from_email = smtp_user

        if not smtp_host or not smtp_user or not smtp_pass:
            vtc_logger.error("SMTP configuration missing in environment variables.")
            raise HTTPException(
                status_code=500,
                detail="SMTP_SERVER, SENDER_EMAIL, or SENDER_PASSWORD environment variable is not set."
            )

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = from_email
        msg["To"] = ", ".join(to_emails)
        msg.attach(MIMEText(body, "html"))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(from_email, to_emails, msg.as_string())
        vtc_logger.info(f"Email sent to: {to_emails} with subject: {subject}")
    except Exception as e:
        vtc_logger.error(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email")


@router.post("/send")
async def send_email_endpoint(
    job_order_id: str = Body(...),
    caseid: str = Body(...),
    test_order_id: str = Body(None),
    db: Session = Depends(get_db),
):
    """
    Send an email to all users of the role specified in mail_body.json for the given caseid.

    Args:
        job_order_id (str): The job order ID.
        caseid (str): The case ID for the email template.
        test_order_id (str, optional): The test order ID.
        db (Session): SQLAlchemy database session.

    Returns:
        dict: Detail message about email sending status.
    """
    try:
        role = get_role_for_caseid(caseid)
        if not role:
            vtc_logger.warning(f"Role not found for caseid: {caseid}")
            raise HTTPException(status_code=400, detail="Role not found for caseid")
        to_emails = get_all_emails_by_role(db, role)
        vtc_logger.debug(f"To Emails: {to_emails}")  # Debugging line to check email addresses
        if not to_emails:
            vtc_logger.warning(f"No recipient found for the given role: {role}")
            raise HTTPException(status_code=404, detail="No recipient found for the given role")
        subject, body = load_email_template(caseid)
        # Replace placeholders with actual IDs
        subject = subject.replace("{{job_order_id}}", str(job_order_id))
        subject = subject.replace("{{test_order_id}}", str(test_order_id) if test_order_id else "")
        body = body.replace("{{job_order_id}}", str(job_order_id))
        body = body.replace("{{test_order_id}}", str(test_order_id) if test_order_id else "")
        send_email(to_emails, subject, body)
        return {"detail": f"Email sent to all users with role {role} successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        vtc_logger.error(f"Error in send_email_endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/cft_members/add")
async def add_cft_member(
    job_order_id: str, member: dict, db: Session = Depends(get_db)
):
    """
    Add a CFT member to a job order.

    Args:
        job_order_id (str): The job order ID.
        member (dict): The member data to add.
        db (Session): SQLAlchemy database session.

    Returns:
        JobOrder: The updated job order with the new member.

    Raises:
        HTTPException: If job order is not found.
    """
    try:
        job_order = (
            db.query(JobOrder)
            .filter(JobOrder.job_order_id == job_order_id)
            .first()
        )
        if not job_order:
            vtc_logger.warning(f"JobOrder not found for job_order_id: {job_order_id}")
            raise HTTPException(status_code=404, detail="JobOrder not found")
        job_order.cft_members.append(member)
        db.commit()
        vtc_logger.info(f"Added CFT member to job_order_id: {job_order_id}")
        return job_order
    except Exception as e:
        vtc_logger.error(f"Error in add_cft_member: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/cft_members/read")
async def read_cft_members(job_order_id: str, db: Session = Depends(get_db)):
    """
    Read all CFT members for a job order.

    Args:
        job_order_id (str): The job order ID.
        db (Session): SQLAlchemy database session.

    Returns:
        list: List of CFT members.

    Raises:
        HTTPException: If job order is not found.
    """
    try:
        job_order = (
            db.query(JobOrder)
            .filter(JobOrder.job_order_id == job_order_id)
            .first()
        )
        if not job_order:
            vtc_logger.warning(f"JobOrder not found for job_order_id: {job_order_id}")
            raise HTTPException(status_code=404, detail="JobOrder not found")
        vtc_logger.info(f"Read CFT members for job_order_id: {job_order_id}")
        return job_order.cft_members
    except Exception as e:
        vtc_logger.error(f"Error in read_cft_members: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/cft_members/update")
async def update_cft_member(
    job_order_id: str,
    member_index: int,
    updated_member: dict,
    db: Session = Depends(get_db),
):
    """
    Update a CFT member for a job order.

    Args:
        job_order_id (str): The job order ID.
        member_index (int): Index of the member to update.
        updated_member (dict): Updated member data.
        db (Session): SQLAlchemy database session.

    Returns:
        JobOrder: The updated job order.

    Raises:
        HTTPException: If job order or member is not found.
    """
    try:
        job_order = (
            db.query(JobOrder)
            .filter(JobOrder.job_order_id == job_order_id)
            .first()
        )
        if not job_order:
            vtc_logger.warning(f"JobOrder not found for job_order_id: {job_order_id}")
            raise HTTPException(status_code=404, detail="JobOrder not found")
        if member_index >= len(job_order.cft_members):
            vtc_logger.warning(f"CFT member not found at index {member_index} for job_order_id: {job_order_id}")
            raise HTTPException(status_code=404, detail="CFT member not found")
        job_order.cft_members[member_index] = updated_member
        db.commit()
        vtc_logger.info(f"Updated CFT member at index {member_index} for job_order_id: {job_order_id}")
        return job_order
    except Exception as e:
        vtc_logger.error(f"Error in update_cft_member: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/cft_members/delete")
async def delete_cft_member(
    job_order_id: str, member_index: int, db: Session = Depends(get_db)
):
    """
    Delete a CFT member from a job order.

    Args:
        job_order_id (str): The job order ID.
        member_index (int): Index of the member to delete.
        db (Session): SQLAlchemy database session.

    Returns:
        JobOrder: The updated job order.

    Raises:
        HTTPException: If job order or member is not found.
    """
    try:
        job_order = (
            db.query(JobOrder)
            .filter(JobOrder.job_order_id == job_order_id)
            .first()
        )
        if not job_order:
            vtc_logger.warning(f"JobOrder not found for job_order_id: {job_order_id}")
            raise HTTPException(status_code=404, detail="JobOrder not found")
        if member_index >= len(job_order.cft_members):
            vtc_logger.warning(f"CFT member not found at index {member_index} for job_order_id: {job_order_id}")
            raise HTTPException(status_code=404, detail="CFT member not found")
        job_order.cft_members.pop(member_index)
        db.commit()
        vtc_logger.info(f"Deleted CFT member at index {member_index} for job_order_id: {job_order_id}")
        return job_order
    except Exception as e:
        vtc_logger.error(f"Error in delete_cft_member: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
