from backend.storage.models.models import Engine
from sqlalchemy.orm import Session

def create_engine(db: Session, engine_data: dict):
    engine = Engine(
        **engine_data
    )
    db.add(engine)
    db.commit()
    db.refresh(engine)
    return engine

def engine_to_dict(engine):
    return {
        "engine_serial_number": engine.engine_serial_number,
        "engine_build_level": engine.engine_build_level,
        "engine_capacity": engine.engine_capacity,
        "engine_type": engine.engine_type,
        "number_of_cylinders": engine.number_of_cylinders,
        "compression_ratio": engine.compression_ratio,
        "bore_mm": engine.bore_mm,
        "stroke_mm": engine.stroke_mm,
        "vacuum_modulator_make": engine.vacuum_modulator_make,
        "vacuum_modulator_details": engine.vacuum_modulator_details,
        "ecu_make": engine.ecu_make,
        "ecu_id_number": engine.ecu_id_number,
        "ecu_dataset_number": engine.ecu_dataset_number,
        "ecu_dataset_details": engine.ecu_dataset_details,
        "injector_type": engine.injector_type,
        "turbo_charger_type": engine.turbo_charger_type,
        "blow_by_recirculation": engine.blow_by_recirculation,
        "nozzle_hole_count": engine.nozzle_hole_count,
        "nozzle_through_flow": engine.nozzle_through_flow,
        "egr_valve_make": engine.egr_valve_make,
        "egr_valve_type": engine.egr_valve_type,
        "egr_valve_diameter_mm": engine.egr_valve_diameter_mm,
        "egr_cooler_make": engine.egr_cooler_make,
        "egr_cooler_capacity_kw": engine.egr_cooler_capacity_kw,
        "catcon_make": engine.catcon_make,
        "catcon_type": engine.catcon_type,
        "catcon_loading": engine.catcon_loading,
        "dpf_make": engine.dpf_make,
        "dpf_capacity": engine.dpf_capacity,
        "scr_make": engine.scr_make,
        "scr_capacity": engine.scr_capacity,
        "acc_compressor": engine.acc_compressor,
        "acc_compressor_details": engine.acc_compressor_details,
        "ps_pump": engine.ps_pump,
        "ps_details": engine.ps_details,
        "water_bypass": engine.water_bypass,
        "kerb_weight_faw_kg": engine.kerb_weight_faw_kg,
        "kerb_weight_raw_kg": engine.kerb_weight_raw_kg,
        "emission_status": engine.emission_status,
        "thermostat_details": engine.thermostat_details,
        "vehicle_serial_number": engine.vehicle_serial_number,
        "engine_family": engine.engine_family,
        "hv_battery_make": engine.hv_battery_make,
        "hv_battery_capacity": engine.hv_battery_capacity,
        "hv_battery_voltage": engine.hv_battery_voltage,
        "hv_battery_current": engine.hv_battery_current,
        "ev_motor_power_kw": engine.ev_motor_power_kw,
        "id_of_creator": engine.id_of_creator,
        "created_on": engine.created_on,
        "id_of_updater": engine.id_of_updater,
        "updated_on": engine.updated_on,
    }
