from backend.storage.models.models import Vehicle
from sqlalchemy.orm import Session
from datetime import datetime

def create_vehicle(db: Session, vehicle_data: dict):
    vehicle = Vehicle(
        **vehicle_data
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

def vehicle_to_dict(vehicle):
    return {
        "project_code": vehicle.project_code,
        "vehicle_serial_number": vehicle.vehicle_serial_number,
        "vehicle_body_number": vehicle.vehicle_body_number,
        "vehicle_model": vehicle.vehicle_model,
        "vehicle_build_level": vehicle.vehicle_build_level,
        "transmission_type": vehicle.transmission_type,
        "final_drive_axle_ratio": vehicle.final_drive_axle_ratio,
        "domain": vehicle.domain,
        "tyre_make": vehicle.tyre_make,
        "tyre_size": vehicle.tyre_size,
        "tyre_pressure_front": vehicle.tyre_pressure_front,
        "tyre_pressure_rear": vehicle.tyre_pressure_rear,
        "tyre_run_in": vehicle.tyre_run_in,
        "engine_run_in": vehicle.engine_run_in,
        "gearbox_run_in": vehicle.gearbox_run_in,
        "axle_run_in": vehicle.axle_run_in,
        "engine_oil_specification": vehicle.engine_oil_specification,
        "axle_oil_specification": vehicle.axle_oil_specification,
        "transmission_oil_specification": vehicle.transmission_oil_specification,
        "wd_type": vehicle.wd_type,
        "driven_wheel": vehicle.driven_wheel,
        "intercooler_location": vehicle.intercooler_location,
        "gear_ratio_1": vehicle.gear_ratio_1,
        "gear_ratio_2": vehicle.gear_ratio_2,
        "gear_ratio_3": vehicle.gear_ratio_3,
        "gear_ratio_4": vehicle.gear_ratio_4,
        "gear_ratio_5": vehicle.gear_ratio_5,
        "reverse_gear_ratio": vehicle.reverse_gear_ratio,
        "id_of_creator": vehicle.id_of_creator,
        "created_on": vehicle.created_on,
        "id_of_updater": vehicle.id_of_updater,
        "updated_on": vehicle.updated_on,
    }
