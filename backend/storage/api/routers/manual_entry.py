from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import json
import os
from pathlib import Path

from backend.storage.api.api_utils import get_db
from backend.storage.logging_config import vtc_logger as logger

# Create router with prefix
router = APIRouter(prefix="/api/manual-entry")

# Base path for JSON files
JSON_BASE_PATH = Path(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))) / "json_data"

# Pydantic models for request validation
class StringValue(BaseModel):
    value: str

class ProjectCreate(BaseModel):
    project_code: str

class EngineTypeCreate(BaseModel):
    engine_family: str

class DomainCreate(BaseModel):
    domain: str

class TestTypeCreate(BaseModel):
    test_type_name: str

class InertiaClassCreate(BaseModel):
    inertia_class_name: str
    value: Optional[float] = None
    unit: Optional[str] = None

class ModeCreate(BaseModel):
    mode_name: str

class ShiftCreate(BaseModel):
    shift_name: str

class FuelTypeCreate(BaseModel):
    fuel_type_name: str

class VehicleModelCreate(BaseModel):
    model_name: str
    manufacturer: Optional[str] = None

def read_json_file(file_name: str) -> list:
    """Read data from JSON file"""
    try:
        file_path = JSON_BASE_PATH / file_name
        if not file_path.exists():
            # Create empty file if it doesn't exist
            with open(file_path, 'w') as f:
                json.dump([], f)
            return []
            
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error reading JSON file {file_name}: {e}")
        return []

def write_json_file(file_name: str, data: list) -> bool:
    """Write data to JSON file"""
    try:
        file_path = JSON_BASE_PATH / file_name
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error writing to JSON file {file_name}: {e}")
        return False


@router.post("/project", status_code=201)
def add_project(entry: ProjectCreate):
    """
    Add a new project to the JSON data.
    
    @param entry: Project details
    @return: The created project info
    """
    try:
        projects = read_json_file("project_code.json")
        if entry.project_code in projects:
            return {
                "message": "Project already exists"
            }
            
        # Add new project
        projects.append(entry.project_code)
        
        if write_json_file("project_code.json", projects):
            logger.info(f"Manual project added: {entry.project_code}")
            return {
                "message": "Project added successfully",
                "project_code": entry.project_code
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Error saving project data"
            )
    except Exception as e:
        logger.error(f"Error adding project: {e}")
        logger.debug(f"Error details: \n", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error adding project. Please try again later."
        )

@router.delete("/project")
def delete_project(entry: StringValue):
    """Delete a project entry."""
    try:
        projects = read_json_file("project_code.json")
        if entry.value not in projects:
            raise HTTPException(status_code=404, detail="Project not found")

        projects.remove(entry.value)
        
        # Save updated list
        if write_json_file("project_code.json", projects):
            logger.info(f"Project deleted: {entry.value}")
            return {"message": "Project deleted successfully"}
        else:
            raise HTTPException(
                status_code=500, 
                detail="Error saving project data"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting project: {e}")
        raise HTTPException(status_code=500, detail="Error deleting project")

@router.post("/engine-type", status_code=201)
def add_engine_type(entry: EngineTypeCreate):
    """
    Add a new engine type to the JSON data.
    
    @param entry: Engine type details
    @return: The created engine type info
    """
    try:
        # Get existing engine types
        engine_types = read_json_file("engine_family.json")
        
        # Check if engine type already exists
        if entry.engine_family in engine_types:
            return {
                "message": "Engine type already exists"
            }
            
        # Add new engine type
        engine_types.append(entry.engine_family)
        
        # Save updated list
        if write_json_file("engine_family.json", engine_types):
            logger.info(f"Manual engine type added: {entry.engine_family}")
            return {
                "message": "Engine type added successfully",
                "engine_family": entry.engine_family
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Error saving engine type data"
            )
    except Exception as e:
        logger.error(f"Error adding engine type: {e}")
        logger.debug(f"Error details: \n", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error adding engine type. Please try again later."
        )

@router.delete("/engine-type")
def delete_engine_type(entry: StringValue):
    """Delete an engine type entry."""
    try:
        # Get existing engine types
        engine_types = read_json_file("engine_family.json")

        # Check if engine type exists
        if entry.value not in engine_types:
            raise HTTPException(status_code=404, detail="Engine type not found")

        # Remove engine type
        engine_types.remove(entry.value)
        
        # Save updated list
        if write_json_file("engine_family.json", engine_types):
            logger.info(f"Engine type deleted: {entry.value}")
            return {"message": "Engine type deleted successfully"}
        else:
            raise HTTPException(
                status_code=500, 
                detail="Error saving engine type data"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting engine type: {e}")
        raise HTTPException(status_code=500, detail="Error deleting engine type")

@router.post("/domain", status_code=201)
def add_domain(entry: DomainCreate):
    """
    Add a new domain to the JSON data.
    
    @param entry: Domain details
    @return: The created domain info
    """
    try:
        # Get existing domains
        domains = read_json_file("domain.json")
        
        # Check if domain already exists
        if entry.domain in domains:
            return {
                "message": "Domain already exists"
            }
            
        # Add new domain
        domains.append(entry.domain)
        
        # Save updated list
        if write_json_file("domain.json", domains):
            logger.info(f"Manual domain added: {entry.domain}")
            return {
                "message": "Domain added successfully",
                "domain": entry.domain
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Error saving domain data"
            )
    except Exception as e:
        logger.error(f"Error adding domain: {e}")
        logger.debug(f"Error details: \n", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error adding domain. Please try again later."
        )

@router.delete("/domain")
def delete_domain(entry: StringValue):
    """Delete a domain entry."""
    try:
        # Get existing domains
        domains = read_json_file("domain.json")
        
        # Check if domain exists
        if entry.value not in domains:
            raise HTTPException(status_code=404, detail="Domain not found")

        # Remove domain
        domains.remove(entry.value)
        
        # Save updated list
        if write_json_file("domain.json", domains):
            logger.info(f"Domain deleted: {entry.value}")
            return {"message": "Domain deleted successfully"}
        else:
            raise HTTPException(
                status_code=500, 
                detail="Error saving domain data"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting domain: {e}")
        raise HTTPException(status_code=500, detail="Error deleting domain")

@router.post("/test-type", status_code=201)
def add_test_type(entry: TestTypeCreate):
    """
    Add a new test type to the JSON data.
    
    @param entry: Test type details
    @return: The created test type info
    """
    try:
        # Get existing test types
        test_types = read_json_file("test_type.json")
        
        # Check if test type already exists
        if entry.test_type_name in test_types:
            return {
                "message": "Test type already exists"
            }
            
        # Add new test type
        test_types.append(entry.test_type_name)
        
        # Save updated list
        if write_json_file("test_type.json", test_types):
            logger.info(f"Manual test type added: {entry.test_type_name}")
            return {
                "message": "Test type added successfully",
                "test_type_name": entry.test_type_name
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Error saving test type data"
            )
    except Exception as e:
        logger.error(f"Error adding test type: {e}")
        logger.debug(f"Error details: \n", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error adding test type. Please try again later."
        )

@router.delete("/test-type")
def delete_test_type(entry: StringValue):
    """Delete a test type entry."""
    try:
        # Get existing test types
        test_types = read_json_file("test_type.json")
        
        # Check if test type exists
        if entry.value not in test_types:
            raise HTTPException(status_code=404, detail="Test type not found")

        # Remove test type
        test_types.remove(entry.value)
        
        # Save updated list
        if write_json_file("test_type.json", test_types):
            logger.info(f"Test type deleted: {entry.value}")
            return {"message": "Test type deleted successfully"}
        else:
            raise HTTPException(
                status_code=500, 
                detail="Error saving test type data"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting test type: {e}")
        raise HTTPException(status_code=500, detail="Error deleting test type")

@router.post("/inertia-class", status_code=201)
def add_inertia_class(entry: InertiaClassCreate):
    """
    Add a new inertia class to the JSON data.
    
    @param entry: Inertia class details
    @return: The created inertia class info
    """
    try:
        # Get existing inertia classes
        inertia_classes = read_json_file("inertia_class.json")
        
        # Check if inertia class already exists
        if entry.inertia_class_name in inertia_classes:
            return {
                "message": "Inertia class already exists"
            }
            
        # Add new inertia class
        inertia_classes.append(entry.inertia_class_name)
        
        # Save updated list
        if write_json_file("inertia_class.json", inertia_classes):
            logger.info(f"Manual inertia class added: {entry.inertia_class_name}")
            return {
                "message": "Inertia class added successfully",
                "inertia_class_name": entry.inertia_class_name
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Error saving inertia class data"
            )
    except Exception as e:
        logger.error(f"Error adding inertia class: {e}")
        logger.debug(f"Error details: \n", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error adding inertia class. Please try again later."
        )

@router.delete("/inertia-class")
def delete_inertia_class(entry: StringValue):
    """Delete an inertia class entry."""
    try:
        # Get existing inertia classes
        inertia_classes = read_json_file("inertia_class.json")
        
        # Check if inertia class exists
        if entry.value not in inertia_classes:
            raise HTTPException(status_code=404, detail="Inertia class not found")

        # Remove inertia class
        inertia_classes.remove(entry.value)
        
        # Save updated list
        if write_json_file("inertia_class.json", inertia_classes):
            logger.info(f"Inertia class deleted: {entry.value}")
            return {"message": "Inertia class deleted successfully"}
        else:
            raise HTTPException(
                status_code=500, 
                detail="Error saving inertia class data"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting inertia class: {e}")
        raise HTTPException(status_code=500, detail="Error deleting inertia class")

@router.post("/mode", status_code=201)
def add_mode(entry: ModeCreate):
    """
    Add a new mode to the JSON data.
    
    @param entry: Mode details
    @return: The created mode info
    """
    try:
        # Get existing modes
        modes = read_json_file("mode.json")
        
        # Check if mode already exists
        if entry.mode_name in modes:
            return {
                "message": "Mode already exists"
            }
            
        # Add new mode
        modes.append(entry.mode_name)
        
        # Save updated list
        if write_json_file("mode.json", modes):
            logger.info(f"Manual mode added: {entry.mode_name}")
            return {
                "message": "Mode added successfully",
                "mode_name": entry.mode_name
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Error saving mode data"
            )
    except Exception as e:
        logger.error(f"Error adding mode: {e}")
        logger.debug(f"Error details: \n", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error adding mode. Please try again later."
        )

@router.delete("/mode")
def delete_mode(entry: StringValue):
    """Delete a mode entry."""
    try:
        # Get existing modes
        modes = read_json_file("mode.json")
        
        # Check if mode exists
        if entry.value not in modes:
            raise HTTPException(status_code=404, detail="Mode not found")

        # Remove mode
        modes.remove(entry.value)
        
        # Save updated list
        if write_json_file("mode.json", modes):
            logger.info(f"Mode deleted: {entry.value}")
            return {"message": "Mode deleted successfully"}
        else:
            raise HTTPException(
                status_code=500, 
                detail="Error saving mode data"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting mode: {e}")
        raise HTTPException(status_code=500, detail="Error deleting mode")

@router.post("/shift", status_code=201)
def add_shift(entry: ShiftCreate):
    """
    Add a new shift to the JSON data.
    
    @param entry: Shift details
    @return: The created shift info
    """
    try:
        # Get existing shifts
        shifts = read_json_file("shift.json")
        
        # Check if shift already exists
        if entry.shift_name in shifts:
            return {
                "message": "Shift already exists"
            }
            
        # Add new shift
        shifts.append(entry.shift_name)
        
        # Save updated list
        if write_json_file("shift.json", shifts):
            logger.info(f"Manual shift added: {entry.shift_name}")
            return {
                "message": "Shift added successfully",
                "shift_name": entry.shift_name
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Error saving shift data"
            )
    except Exception as e:
        logger.error(f"Error adding shift: {e}")
        logger.debug(f"Error details: \n", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error adding shift. Please try again later."
        )

@router.delete("/shift")
def delete_shift(entry: StringValue):
    """Delete a shift entry."""
    try:
        # Get existing shifts
        shifts = read_json_file("shift.json")
        
        # Check if shift exists
        if entry.value not in shifts:
            raise HTTPException(status_code=404, detail="Shift not found")

        # Remove shift
        shifts.remove(entry.value)
        
        # Save updated list
        if write_json_file("shift.json", shifts):
            logger.info(f"Shift deleted: {entry.value}")
            return {"message": "Shift deleted successfully"}
        else:
            raise HTTPException(
                status_code=500, 
                detail="Error saving shift data"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting shift: {e}")
        raise HTTPException(status_code=500, detail="Error deleting shift")

@router.post("/fuel-type", status_code=201)
def add_fuel_type(entry: FuelTypeCreate):
    """
    Add a new fuel type to the JSON data.
    
    @param entry: Fuel type details
    @return: The created fuel type info
    """
    try:
        # Get existing fuel types
        fuel_types = read_json_file("fuel_type.json")
        
        # Check if fuel type already exists
        if entry.fuel_type_name in fuel_types:
            return {
                "message": "Fuel type already exists"
            }
            
        # Add new fuel type
        fuel_types.append(entry.fuel_type_name)
        
        # Save updated list
        if write_json_file("fuel_type.json", fuel_types):
            logger.info(f"Manual fuel type added: {entry.fuel_type_name}")
            return {
                "message": "Fuel type added successfully",
                "fuel_type_name": entry.fuel_type_name
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Error saving fuel type data"
            )
    except Exception as e:
        logger.error(f"Error adding fuel type: {e}")
        logger.debug(f"Error details: \n", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error adding fuel type. Please try again later."
        )

@router.delete("/fuel-type")
def delete_fuel_type(entry: StringValue):
    """Delete a fuel type entry."""
    try:
        # Get existing fuel types
        fuel_types = read_json_file("fuel_type.json")
        
        # Check if fuel type exists
        if entry.value not in fuel_types:
            raise HTTPException(status_code=404, detail="Fuel type not found")

        # Remove fuel type
        fuel_types.remove(entry.value)
        
        # Save updated list
        if write_json_file("fuel_type.json", fuel_types):
            logger.info(f"Fuel type deleted: {entry.value}")
            return {"message": "Fuel type deleted successfully"}
        else:
            raise HTTPException(
                status_code=500, 
                detail="Error saving fuel type data"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting fuel type: {e}")
        raise HTTPException(status_code=500, detail="Error deleting fuel type")

@router.post("/vehicle-model", status_code=201)
def add_vehicle_model(entry: VehicleModelCreate):
    """
    Add a new vehicle model to the JSON data.
    
    @param entry: Vehicle model details
    @return: The created vehicle model info
    """
    try:
        # Get existing vehicle models
        vehicle_models = read_json_file("vehicle_models.json")
        
        # Check if vehicle model already exists
        if entry.model_name in vehicle_models:
            return {
                "message": "Vehicle model already exists"
            }
            
        # Add new vehicle model
        vehicle_models.append(entry.model_name)
        
        # Save updated list
        if write_json_file("vehicle_models.json", vehicle_models):
            logger.info(f"Manual vehicle model added: {entry.model_name}")
            return {
                "message": "Vehicle model added successfully",
                "model_name": entry.model_name
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Error saving vehicle model data"
            )
    except Exception as e:
        logger.error(f"Error adding vehicle model: {e}")
        logger.debug(f"Error details: \n", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error adding vehicle model. Please try again later."
        )

@router.delete("/vehicle-model")
def delete_vehicle_model(entry: StringValue):
    """Delete a vehicle model entry."""
    try:
        # Get existing vehicle models
        vehicle_models = read_json_file("vehicle_models.json")
        
        # Check if vehicle model exists
        if entry.value not in vehicle_models:
            raise HTTPException(status_code=404, detail="Vehicle model not found")

        # Remove vehicle model
        vehicle_models.remove(entry.value)
        
        # Save updated list
        if write_json_file("vehicle_models.json", vehicle_models):
            logger.info(f"Vehicle model deleted: {entry.value}")
            return {"message": "Vehicle model deleted successfully"}
        else:
            raise HTTPException(
                status_code=500, 
                detail="Error saving vehicle model data"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting vehicle model: {e}")
        raise HTTPException(status_code=500, detail="Error deleting vehicle model")