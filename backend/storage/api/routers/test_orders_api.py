from fastapi import APIRouter, HTTPException
from pathlib import Path
import json

router = APIRouter()

@router.get("/test-types")
def get_test_types():
    base_path = Path(__file__).parent.parent.parent / "json_data"
    try:
        with open(base_path / "test_type.json") as f:
            test_types = json.load(f)
        return test_types
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/inertia-classes")
def get_inertia_classes():
    base_path = Path(__file__).parent.parent.parent / "json_data"
    try:
        with open(base_path / "inertia_class.json") as f:
            inertia_classes = json.load(f)
        return inertia_classes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/modes")
def get_modes():
    base_path = Path(__file__).parent.parent.parent / "json_data"
    try:
        with open(base_path / "mode.json") as f:
            modes = json.load(f)
        return modes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fuel-types")
def get_fuel_types():
    base_path = Path(__file__).parent.parent.parent / "json_data"
    try:
        with open(base_path / "fuel_type.json") as f:
            fuel_types = json.load(f)
        return fuel_types
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))