from pydantic import BaseModel
from typing import Optional

class ProjectCode(BaseModel):
    project_code_id: str
    project_code: str

class Vehicle(BaseModel):
    # vehicle_id: str
    vehicle_model: str

class EngineFamily(BaseModel):
    engine_family_id: str
    engine_family: str