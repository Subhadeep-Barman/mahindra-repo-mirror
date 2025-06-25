from pydantic import BaseModel
from typing import Optional

class TestType(BaseModel):
    test_type: str

class InertiaClass(BaseModel):
    inertia_class: str

class Mode(BaseModel):
    mode_name: str

class FuelType(BaseModel):
    fuel_type: str