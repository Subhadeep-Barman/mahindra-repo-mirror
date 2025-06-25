from fastapi import APIRouter, HTTPException
from pathlib import Path
import json

router = APIRouter()

@router.get("/domains")
def get_domains():
    base_path = Path(__file__).parent.parent.parent / "json_Data"
    try:
        with open(base_path / "domain.json", encoding="utf-8") as f:
            domains = json.load(f)
        return domains
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/body_numbers")
def get_body_numbers(project_code: str):
    """
    Returns body numbers for the given project_code from body_number.json.
    """
    base_path = Path(__file__).parent.parent.parent / "json_Data"
    try:
        with open(base_path / "body_number.json", encoding="utf-8") as f:
            body_numbers = json.load(f)
        if project_code not in body_numbers:
            raise HTTPException(status_code=404, detail="Project code not found")
        return body_numbers[project_code]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
