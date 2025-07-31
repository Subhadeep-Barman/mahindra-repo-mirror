// Engine Form Component for RDE & VTC Chennai

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { RadioGroup, RadioGroupItem } from "@/components/UI/radio-group";
import { Card, CardContent } from "@/components/UI/card";
import { ArrowBack } from "@mui/icons-material";
import Navbar1 from "@/components/UI/navbar";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import showSnackbar from "@/utils/showSnackbar";

export default function VTCCEngineForm() {
  const [activeTab, setActiveTab] = useState("Engine");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const department = queryParams.get("department") || "VTC_JO Chennai";
  const isEditMode = queryParams.get("edit") === "true";

  // Check if we have engine data from navigation state
  const engineData = location.state?.engineData;
  const originalEngineData = location.state?.originalEngineData;

  const { apiUserRole, userId, userName } = useAuth();

  // Add domain state
  const [domain, setDomain] = useState("ICE"); // Default to ICE

  const [formData, setFormData] = useState({
    // Common fields
    engineSerialNumber: "",
    vehicleSerialNumber: "",
    vehicleBodyNumber: "",
    project: "",
    department: department,

    // ICE/Hybrid specific fields
    engineBuildLevel: "",
    engineType: "",
    engineCapacity: "",
    numberOfCylinders: "",
    compressionRatio: { numerator: "", denominator: "" },
    bore: "",
    stroke: "",
    vacuumModulatorMake: "",
    vacuumModulatorDetails: "",
    ecuMake: "",
    ecuIdNumber: "",
    ecuDatasetNumber: "",
    ecuDatasetDetails: "",
    injectorType: "",
    turbochargerType: "",
    blowByRecirculation: "",
    blowByRecirculationDetails: "",
    nozzleNumberOfHoles: "",
    nozzleThroughFlow: "",
    egrValveMake: "",
    egrValveType: "",
    egrValveDiameter: "",
    egrCoolerMake: "",
    egrCoolerCapacity: "",
    catconMass: "",
    catconType: "",
    catconLoading: "",
    dpfMake: "",
    dpfCapacity: "",
    scrMake: "",
    scrCapacity: "",
    acCompressor: "",
    acCompressorDetails: "",
    powerSteeringPump: "",
    powerSteeringDetails: "",
    waterByPass: "",
    kerbWeightFaw: "",
    kerbWeightRaw: "",
    emissionStatus: "",
    thermostatDetails: "",
    engineFamily: "",
    hvBatteryMake: "",
    hvBatteryCapacity: "",
    hvBatteryVoltage: "",
    hvBatteryCurrent: "",
    evMotorPower: "",

    // EV specific fields
    motorMake: "",
    motorFront: "",
    motorRear: "",
    frontMotorSerialNumber: "",
    rearMotorSerialNumber: "",
    frontMotorMaxPower: "",
    rearMotorMaxPower: "",
    frontMotorMaxTorque: "",
    rearMotorMaxTorque: "",
    frontMotorMake: "",
    rearMotorMake: "",
    motorMaxVoltage: "",
    batteryCapacityKwh: "",
    batteryMaxVoltage: "",
    batteryMaxCurrent: "",
  });

  // Helper function to parse ratio strings like "3.42:1" into {numerator: "3.42", denominator: "1"}
  const parseRatio = (ratioString) => {
    if (!ratioString) return { numerator: "", denominator: "" };
    const parts = ratioString.toString().split(":");
    return {
      numerator: parts[0] || "",
      denominator: parts[1] || ""
    };
  };

  // Populate form with existing engine data when editing
  useEffect(() => {
    if (isEditMode && engineData) {
      setFormData({
        engineBuildLevel: engineData.engine_build_level || "",
        engineSerialNumber: engineData.engine_serial_number || "",
        engineType: engineData.engine_type || "",
        engineCapacity: engineData.engine_capacity?.toString() || "",
        numberOfCylinders: engineData.number_of_cylinders || "",
        compressionRatio: parseRatio(engineData.compression_ratio),
        bore: engineData.bore_mm?.toString() || "",
        stroke: engineData.stroke_mm?.toString() || "",
        vacuumModulatorMake: engineData.vacuum_modulator_make || "",
        vacuumModulatorDetails: engineData.vacuum_modulator_details || "",
        ecuMake: engineData.ecu_make || "",
        ecuIdNumber: engineData.ecu_id_number || "",
        ecuDatasetNumber: engineData.ecu_dataset_number || "",
        ecuDatasetDetails: engineData.ecu_dataset_details || "",
        injectorType: engineData.injector_type || "",
        turbochargerType: engineData.turbo_charger_type || "",
        blowByRecirculation: engineData.blow_by_recirculation === true ? "Yes" : engineData.blow_by_recirculation === false ? "No" : "",
        blowByRecirculationDetails: "",
        nozzleNumberOfHoles: engineData.nozzle_hole_count || "",
        nozzleThroughFlow: engineData.nozzle_through_flow?.toString() || "",
        egrValveMake: engineData.egr_valve_make || "",
        egrValveType: engineData.egr_valve_type || "",
        egrValveDiameter: engineData.egr_valve_diameter_mm?.toString() || "",
        egrCoolerMake: engineData.egr_cooler_make || "",
        egrCoolerCapacity: engineData.egr_cooler_capacity_kw?.toString() || "",
        catconMass: engineData.catcon_make || "",
        catconType: engineData.catcon_type || "",
        catconLoading: engineData.catcon_loading || "",
        dpfMake: engineData.dpf_make || "",
        dpfCapacity: engineData.dpf_capacity || "",
        scrMake: engineData.scr_make || "",
        scrCapacity: engineData.scr_capacity || "",
        acCompressor: engineData.acc_compressor === true ? "Yes" : engineData.acc_compressor === false ? "No" : "",
        acCompressorDetails: engineData.acc_compressor_details || "",
        powerSteeringPump: engineData.ps_pump || "",
        powerSteeringDetails: engineData.ps_details || "",
        waterByPass: engineData.water_bypass || "",
        kerbWeightFaw: engineData.kerb_weight_faw_kg?.toString() || "",
        kerbWeightRaw: engineData.kerb_weight_raw_kg?.toString() || "",
        emissionStatus: engineData.emission_status || "",
        thermostatDetails: engineData.thermostat_details || "",
        vehicleSerialNumber: engineData.vehicle_serial_number || "",
        engineFamily: engineData.engine_family || "",
        hvBatteryMake: engineData.hv_battery_make || "",
        hvBatteryCapacity: engineData.hv_battery_capacity?.toString() || "",
        hvBatteryVoltage: engineData.hv_battery_voltage?.toString() || "",
        hvBatteryCurrent: engineData.hv_battery_current?.toString() || "",
        evMotorPower: engineData.ev_motor_power_kw?.toString() || "",
        department: engineData.department || department,

        // EV specific fields - add if available in engineData
        vehicleBodyNumber: engineData.vehicle_body_number || "",
        project: engineData.project || "",
        motorMake: engineData.motor_make || "",
        motorFront: engineData.motor_front === true ? "Yes" : engineData.motor_front === false ? "No" : "",
        motorRear: engineData.motor_rear === true ? "Yes" : engineData.motor_rear === false ? "No" : "",
        frontMotorSerialNumber: engineData.front_motor_serial_number || "",
        rearMotorSerialNumber: engineData.rear_motor_serial_number || "",
        frontMotorMaxPower: engineData.front_motor_max_power?.toString() || "",
        rearMotorMaxPower: engineData.rear_motor_max_power?.toString() || "",
        frontMotorMaxTorque: engineData.front_motor_max_torque?.toString() || "",
        rearMotorMaxTorque: engineData.rear_motor_max_torque?.toString() || "",
        frontMotorMake: engineData.front_motor_make || "",
        rearMotorMake: engineData.rear_motor_make || "",
        motorMaxVoltage: engineData.motor_max_voltage?.toString() || "",
        batteryCapacityKwh: engineData.battery_capacity_kwh?.toString() || "",
        batteryMaxVoltage: engineData.battery_max_voltage?.toString() || "",
        batteryMaxCurrent: engineData.battery_max_current?.toString() || "",
      });
    }
  }, [isEditMode, engineData, department]);

  const [engineFamilies, setEngineFamilies] = useState([]);
  const [vehicleSerialNumbers, setVehicleSerialNumbers] = useState([]);
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRatioChange = (field, part, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [part]: value },
    }));
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "Job Order") navigate("/vtc-chennai");
    else if (tab === "Vehicle") navigate("/vtccvehicle");
    else if (tab === "Engine") navigate("/engineform");
  };

  const handleClear = () => {
    setFormData({
      engineBuildLevel: "",
      engineSerialNumber: "",
      engineType: "",
      engineCapacity: "",
      numberOfCylinders: "",
      compressionRatio: { numerator: "", denominator: "" },
      bore: "",
      stroke: "",
      vacuumModulatorMake: "",
      vacuumModulatorDetails: "",
      ecuMake: "",
      ecuIdNumber: "",
      ecuDatasetNumber: "",
      ecuDatasetDetails: "",
      injectorType: "",
      turbochargerType: "",
      blowByRecirculation: "",
      blowByRecirculationDetails: "",
      nozzleNumberOfHoles: "",
      nozzleThroughFlow: "",
      egrValveMake: "",
      egrValveType: "",
      egrValveDiameter: "",
      egrCoolerMake: "",
      egrCoolerCapacity: "",
      catconMass: "",
      catconType: "",
      catconLoading: "",
      dpfMake: "",
      dpfCapacity: "",
      scrMake: "",
      scrCapacity: "",
      acCompressor: "",
      acCompressorDetails: "",
      powerSteeringPump: "",
      powerSteeringDetails: "",
      waterByPass: "",
      kerbWeightFaw: "",
      kerbWeightRaw: "",
      emissionStatus: "",
      thermostatDetails: "",
      vehicleSerialNumber: "",
      engineFamily: "",
      hvBatteryMake: "",
      hvBatteryCapacity: "",
      hvBatteryVoltage: "",
      hvBatteryCurrent: "",
      evMotorPower: "",
      department: department,

      // EV specific fields
      vehicleBodyNumber: "",
      project: "",
      motorMake: "",
      motorFront: "",
      motorRear: "",
      frontMotorSerialNumber: "",
      rearMotorSerialNumber: "",
      frontMotorMaxPower: "",
      rearMotorMaxPower: "",
      frontMotorMaxTorque: "",
      rearMotorMaxTorque: "",
      frontMotorMake: "",
      rearMotorMake: "",
      motorMaxVoltage: "",
      batteryCapacityKwh: "",
      batteryMaxVoltage: "",
      batteryMaxCurrent: "",
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Convert current time to IST and format as ISO 8601
  const currentISTTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  const formattedISTTime = new Date(currentISTTime).toISOString();

  // Utility to map frontend formData to backend schema
  const mapFormDataToSchema = (formData) => {
    const parseFloatOrUndefined = (val) => (val ? parseFloat(val) : undefined);
    const parseIntOrUndefined = (val) => (val ? parseInt(val) : undefined);
    const parseBool = (val) =>
      val === "Yes" ? true : val === "No" ? false : undefined;

    let compression_ratio = undefined;
    if (
      formData.compressionRatio.numerator &&
      formData.compressionRatio.denominator
    ) {
      const num = parseFloat(formData.compressionRatio.numerator);
      const den = parseFloat(formData.compressionRatio.denominator);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        compression_ratio = num / den;
      }
    }

    const baseData = {
      department: formData.department,
      domain: domain,
      vehicle_serial_number: formData.vehicleSerialNumber || undefined,
      // Add tracking fields
      ...(isEditMode ? {
        id_of_updater: userId || "",
        name_of_updater: userName || "",
        updated_on: formattedISTTime
      } : {
        id_of_creator: userId || "",
        name_of_creator: userName || "",
        created_on: formattedISTTime,
        updated_on: formattedISTTime
      })
    };

    if (domain === "EV") {
      return {
        ...baseData,
        motor_serial_number: formData.engineSerialNumber || undefined,
        vehicle_body_number: formData.vehicleBodyNumber || undefined,
        project: formData.project || undefined,
        motor_make: formData.motorMake || undefined,
        motor_front: parseBool(formData.motorFront),
        motor_rear: parseBool(formData.motorRear),
        front_motor_serial_number: formData.frontMotorSerialNumber || undefined,
        rear_motor_serial_number: formData.rearMotorSerialNumber || undefined,
        front_motor_max_power: parseFloatOrUndefined(formData.frontMotorMaxPower),
        rear_motor_max_power: parseFloatOrUndefined(formData.rearMotorMaxPower),
        front_motor_max_torque: parseFloatOrUndefined(formData.frontMotorMaxTorque),
        rear_motor_max_torque: parseFloatOrUndefined(formData.rearMotorMaxTorque),
        front_motor_make: formData.frontMotorMake || undefined,
        rear_motor_make: formData.rearMotorMake || undefined,
        motor_max_voltage: parseFloatOrUndefined(formData.motorMaxVoltage),
        battery_capacity_kwh: parseFloatOrUndefined(formData.batteryCapacityKwh),
        battery_max_voltage: parseFloatOrUndefined(formData.batteryMaxVoltage),
        battery_max_current: parseFloatOrUndefined(formData.batteryMaxCurrent),
      };
    } else {
      // ICE/Hybrid
      return {
        ...baseData,
        engine_serial_number: formData.engineSerialNumber || undefined,
        engine_build_level: formData.engineBuildLevel || undefined,
        engine_capacity: parseFloatOrUndefined(formData.engineCapacity),
        engine_type: formData.engineType || undefined,
        number_of_cylinders: formData.numberOfCylinders || undefined,
        compression_ratio,
        bore_mm: parseFloatOrUndefined(formData.bore),
        stroke_mm: parseFloatOrUndefined(formData.stroke),
        vacuum_modulator_make: formData.vacuumModulatorMake || undefined,
        vacuum_modulator_details: formData.vacuumModulatorDetails || undefined,
        ecu_make: formData.ecuMake || undefined,
        ecu_id_number: formData.ecuIdNumber || undefined,
        ecu_dataset_number: formData.ecuDatasetNumber || undefined,
        ecu_dataset_details: formData.ecuDatasetDetails || undefined,
        injector_type: formData.injectorType || undefined,
        turbo_charger_type: formData.turbochargerType || undefined,
        blow_by_recirculation: parseBool(formData.blowByRecirculation),
        nozzle_hole_count: formData.nozzleNumberOfHoles || undefined,
        nozzle_through_flow: parseFloatOrUndefined(formData.nozzleThroughFlow),
        egr_valve_make: formData.egrValveMake || undefined,
        egr_valve_type: formData.egrValveType || undefined,
        egr_valve_diameter_mm: parseFloatOrUndefined(formData.egrValveDiameter),
        egr_cooler_make: formData.egrCoolerMake || undefined,
        egr_cooler_capacity_kw: parseFloatOrUndefined(formData.egrCoolerCapacity),
        catcon_make: formData.catconMass || undefined,
        catcon_type: formData.catconType || undefined,
        catcon_loading: formData.catconLoading || undefined,
        dpf_make: formData.dpfMake || undefined,
        dpf_capacity: formData.dpfCapacity || undefined,
        scr_make: formData.scrMake || undefined,
        scr_capacity: formData.scrCapacity || undefined,
        acc_compressor: parseBool(formData.acCompressor),
        acc_compressor_details: formData.acCompressorDetails || undefined,
        ps_pump: formData.powerSteeringPump || undefined,
        ps_details: formData.powerSteeringDetails || undefined,
        water_bypass: formData.waterByPass || undefined,
        kerb_weight_faw_kg: parseFloatOrUndefined(formData.kerbWeightFaw),
        kerb_weight_raw_kg: parseFloatOrUndefined(formData.kerbWeightRaw),
        emission_status: formData.emissionStatus || undefined,
        thermostat_details: formData.thermostatDetails || undefined,
        engine_family: formData.engineFamily || undefined,
        hv_battery_make: formData.hvBatteryMake || undefined,
        hv_battery_capacity: parseFloatOrUndefined(formData.hvBatteryCapacity),
        hv_battery_voltage: parseFloatOrUndefined(formData.hvBatteryVoltage),
        hv_battery_current: parseFloatOrUndefined(formData.hvBatteryCurrent),
        ev_motor_power_kw: parseFloatOrUndefined(formData.evMotorPower),
      };
    }
  };

  const handleAddEngine = async () => {
    const payload = mapFormDataToSchema(formData);
    try {
      let response;
      const endpoint = domain === "EV" ? "/motors" : "/engines";
      const identifier = domain === "EV" ? formData.engineSerialNumber : formData.engineSerialNumber;

      if (isEditMode) {
        response = await axios.put(
          `${apiUrl}${endpoint}/${identifier}`,
          payload
        );
        showSnackbar(`${domain === "EV" ? "Motor" : "Engine"} updated successfully!`, "success");
      } else {
        response = await axios.post(`${apiUrl}${endpoint}`, payload);
        showSnackbar(
          `${domain === "EV" ? "Motor" : "Engine"} added successfully! Serial Number: ${response.data[domain === "EV" ? "motor_serial_number" : "engine_serial_number"] || formData.engineSerialNumber}`,
          "success"
        );
      }
      navigate(-1);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        showSnackbar(
          `Failed to ${isEditMode ? 'update' : 'add'} ${domain === "EV" ? "motor" : "engine"}: ` + err.response.data.detail,
          "error"
        );
      } else {
        showSnackbar(
          `Failed to ${isEditMode ? 'update' : 'add'} ${domain === "EV" ? "motor" : "engine"}. Please try again.`,
          "error"
        );
      }
    }
  };

  useEffect(() => {
    axios
      .get(`${apiUrl}/engine-families`)
      .then((res) => {
        setEngineFamilies(res.data);
      })
      .catch(() => {
        setEngineFamilies([]);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${apiUrl}/vehicle_serial_numbers`)
      .then((res) => {
        setVehicleSerialNumbers(res.data);
      })
      .catch(() => {
        setVehicleSerialNumbers([]);
      });
  }, []);

  return (
    <>
      <Navbar1 />
      {/* Header */}
      <div className="bg-white dark:bg-black">
        <div className="bg-white dark:bg-black">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:border-red-500 dark:hover:bg-red-950 rounded-full border border-red-500"
                >
                  <ArrowBack className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-800 dark:text-red-500">
                    {isEditMode ? `EDIT ${domain === "EV" ? "MOTOR" : "ENGINE"}: ${formData.engineSerialNumber}` : `NEW ${domain === "EV" ? "MOTOR" : "ENGINE"} - ${department}`}
                  </h1>
                  {isEditMode && (
                    <p className="text-sm text-gray-600">
                      Editing {domain === "EV" ? "motor" : "engine"}: {engineData?.engine_serial_number || engineData?.motor_serial_number} | Department: {department}
                    </p>
                  )}
                </div>
              </div>
              {/* Domain Dropdown */}
              <div className="flex items-center space-x-3">
                <Label htmlFor="domain" className="text-sm font-medium">Domain:</Label>
                <Select
                  value={domain}
                  onValueChange={setDomain}
                  disabled={isEditMode}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select Domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ICE">ICE</SelectItem>
                    <SelectItem value="EV">EV</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardContent className="p-6">
            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Project (EV only) */}
              {domain === "EV" && (
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Input
                    id="project"
                    value={formData.project}
                    onChange={(e) =>
                      handleInputChange("project", e.target.value)
                    }
                    placeholder="Enter Project"
                  />
                </div>
              )}

              {/* Vehicle Body Number (EV only) */}
              {domain === "EV" && (
                <div className="space-y-2">
                  <Label htmlFor="vehicleBodyNumber">Vehicle Body Number</Label>
                  <Input
                    id="vehicleBodyNumber"
                    value={formData.vehicleBodyNumber}
                    onChange={(e) =>
                      handleInputChange("vehicleBodyNumber", e.target.value)
                    }
                    placeholder="Enter Vehicle Body Number"
                  />
                </div>
              )}

              {/* Motor/Engine Serial Number */}
              <div className="space-y-2">
                <Label htmlFor="engineSerialNumber">
                  {domain === "EV" ? "Motor Serial Number" : "Engine Serial Number"}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="engineSerialNumber"
                  value={formData.engineSerialNumber}
                  onChange={(e) =>
                    handleInputChange("engineSerialNumber", e.target.value)
                  }
                  disabled={isEditMode}
                  className={isEditMode ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
                  placeholder={`Enter ${domain === "EV" ? "Motor" : "Engine"} Serial Number`}
                />
              </div>

              {/* EV Specific Fields */}
              {domain === "EV" && (
                <>
                  {/* Engine Build Level */}
                  <div className="space-y-2">
                    <Label htmlFor="engineBuildLevel">Engine Build Level</Label>
                    <Input
                      id="engineBuildLevel"
                      value={formData.engineBuildLevel}
                      onChange={(e) =>
                        handleInputChange("engineBuildLevel", e.target.value)
                      }
                      placeholder="Enter Engine Build Level"
                    />
                  </div>

                  {/* Engine Type */}
                  <div className="space-y-2">
                    <Label htmlFor="engineType">Engine Type</Label>
                    <Input
                      id="engineType"
                      value={formData.engineType}
                      onChange={(e) =>
                        handleInputChange("engineType", e.target.value)
                      }
                      placeholder="Enter Engine Type"
                    />
                  </div>

                  {/* Engine Capacity */}
                  <div className="space-y-2">
                    <Label htmlFor="engineCapacity">Engine Capacity (cc)</Label>
                    <Input
                      id="engineCapacity"
                      value={formData.engineCapacity}
                      onChange={(e) =>
                        handleInputChange("engineCapacity", e.target.value)
                      }
                      placeholder="Enter Engine Capacity (cc)"
                    />
                  </div>

                  {/* Motor Make */}
                  <div className="space-y-2">
                    <Label htmlFor="motorMake">Motor Make</Label>
                    <Input
                      id="motorMake"
                      value={formData.motorMake}
                      onChange={(e) =>
                        handleInputChange("motorMake", e.target.value)
                      }
                      placeholder="Enter Motor Make"
                    />
                  </div>

                  {/* Motor Front */}
                  <div className="space-y-2">
                    <Label>Motor Front</Label>
                    <RadioGroup
                      value={formData.motorFront}
                      onValueChange={(value) =>
                        handleInputChange("motorFront", value)
                      }
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="motor-front-yes" />
                          <Label htmlFor="motor-front-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="motor-front-no" />
                          <Label htmlFor="motor-front-no">No</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Motor Rear */}
                  <div className="space-y-2">
                    <Label>Motor Rear</Label>
                    <RadioGroup
                      value={formData.motorRear}
                      onValueChange={(value) =>
                        handleInputChange("motorRear", value)
                      }
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="motor-rear-yes" />
                          <Label htmlFor="motor-rear-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="motor-rear-no" />
                          <Label htmlFor="motor-rear-no">No</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Front Motor Serial Number */}
                  <div className="space-y-2">
                    <Label htmlFor="frontMotorSerialNumber">Front Motor Serial No.</Label>
                    <Input
                      id="frontMotorSerialNumber"
                      value={formData.frontMotorSerialNumber}
                      onChange={(e) =>
                        handleInputChange("frontMotorSerialNumber", e.target.value)
                      }
                      placeholder="Enter Front Motor Serial Number"
                    />
                  </div>

                  {/* Rear Motor Serial Number */}
                  <div className="space-y-2">
                    <Label htmlFor="rearMotorSerialNumber">Rear Motor Serial No.</Label>
                    <Input
                      id="rearMotorSerialNumber"
                      value={formData.rearMotorSerialNumber}
                      onChange={(e) =>
                        handleInputChange("rearMotorSerialNumber", e.target.value)
                      }
                      placeholder="Enter Rear Motor Serial Number"
                    />
                  </div>

                  {/* Front Motor Max Power */}
                  <div className="space-y-2">
                    <Label htmlFor="frontMotorMaxPower">Front Motor Max Power</Label>
                    <Input
                      id="frontMotorMaxPower"
                      value={formData.frontMotorMaxPower}
                      onChange={(e) =>
                        handleInputChange("frontMotorMaxPower", e.target.value)
                      }
                      placeholder="Enter Front Motor Max Power"
                    />
                  </div>

                  {/* Rear Motor Max Power */}
                  <div className="space-y-2">
                    <Label htmlFor="rearMotorMaxPower">Rear Motor Max Power</Label>
                    <Input
                      id="rearMotorMaxPower"
                      value={formData.rearMotorMaxPower}
                      onChange={(e) =>
                        handleInputChange("rearMotorMaxPower", e.target.value)
                      }
                      placeholder="Enter Rear Motor Max Power"
                    />
                  </div>

                  {/* Front Motor Max Torque */}
                  <div className="space-y-2">
                    <Label htmlFor="frontMotorMaxTorque">Front Motor Max Torque</Label>
                    <Input
                      id="frontMotorMaxTorque"
                      value={formData.frontMotorMaxTorque}
                      onChange={(e) =>
                        handleInputChange("frontMotorMaxTorque", e.target.value)
                      }
                      placeholder="Enter Front Motor Max Torque"
                    />
                  </div>

                  {/* Rear Motor Max Torque */}
                  <div className="space-y-2">
                    <Label htmlFor="rearMotorMaxTorque">Rear Motor Max Torque</Label>
                    <Input
                      id="rearMotorMaxTorque"
                      value={formData.rearMotorMaxTorque}
                      onChange={(e) =>
                        handleInputChange("rearMotorMaxTorque", e.target.value)
                      }
                      placeholder="Enter Rear Motor Max Torque"
                    />
                  </div>

                  {/* Front Motor Make */}
                  <div className="space-y-2">
                    <Label htmlFor="frontMotorMake">Front Motor Make</Label>
                    <Input
                      id="frontMotorMake"
                      value={formData.frontMotorMake}
                      onChange={(e) =>
                        handleInputChange("frontMotorMake", e.target.value)
                      }
                      placeholder="Enter Front Motor Make"
                    />
                  </div>

                  {/* Rear Motor Make */}
                  <div className="space-y-2">
                    <Label htmlFor="rearMotorMake">Rear Motor Make</Label>
                    <Input
                      id="rearMotorMake"
                      value={formData.rearMotorMake}
                      onChange={(e) =>
                        handleInputChange("rearMotorMake", e.target.value)
                      }
                      placeholder="Enter Rear Motor Make"
                    />
                  </div>

                  {/* Motor Max Voltage */}
                  <div className="space-y-2">
                    <Label htmlFor="motorMaxVoltage">Motor Max Voltage</Label>
                    <Input
                      id="motorMaxVoltage"
                      value={formData.motorMaxVoltage}
                      onChange={(e) =>
                        handleInputChange("motorMaxVoltage", e.target.value)
                      }
                      placeholder="Enter Motor Max Voltage"
                    />
                  </div>

                  {/* Battery Capacity - kWh */}
                  <div className="space-y-2">
                    <Label htmlFor="batteryCapacityKwh">Battery Capacity - kWh</Label>
                    <Input
                      id="batteryCapacityKwh"
                      value={formData.batteryCapacityKwh}
                      onChange={(e) =>
                        handleInputChange("batteryCapacityKwh", e.target.value)
                      }
                      placeholder="Enter Battery Capacity (kWh)"
                    />
                  </div>

                  {/* Battery Max Voltage */}
                  <div className="space-y-2">
                    <Label htmlFor="batteryMaxVoltage">Battery Max Voltage</Label>
                    <Input
                      id="batteryMaxVoltage"
                      value={formData.batteryMaxVoltage}
                      onChange={(e) =>
                        handleInputChange("batteryMaxVoltage", e.target.value)
                      }
                      placeholder="Enter Battery Max Voltage"
                    />
                  </div>

                  {/* Battery Max Current */}
                  <div className="space-y-2">
                    <Label htmlFor="batteryMaxCurrent">Battery Max Current</Label>
                    <Input
                      id="batteryMaxCurrent"
                      value={formData.batteryMaxCurrent}
                      onChange={(e) =>
                        handleInputChange("batteryMaxCurrent", e.target.value)
                      }
                      placeholder="Enter Battery Max Current"
                    />
                  </div>

                  {/* Number of Cylinders */}
                  <div className="space-y-2">
                    <Label htmlFor="numberOfCylinders">Number of Cylinders</Label>
                    <Input
                      id="numberOfCylinders"
                      value={formData.numberOfCylinders}
                      onChange={(e) =>
                        handleInputChange("numberOfCylinders", e.target.value)
                      }
                      placeholder="Enter Number of Cylinders"
                    />
                  </div>

                  {/* Compression Ratio */}
                  <div className="space-y-2">
                    <Label htmlFor="compressionRatio">Compression Ratio</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="compressionRatioNumerator"
                        value={formData.compressionRatio.numerator}
                        onChange={(e) =>
                          handleRatioChange("compressionRatio", "numerator", e.target.value)
                        }
                        placeholder="Enter numerator"
                        className="w-1/2"
                      />
                      <span className="text-gray-500">:</span>
                      <Input
                        id="compressionRatioDenominator"
                        value={formData.compressionRatio.denominator}
                        onChange={(e) =>
                          handleRatioChange("compressionRatio", "denominator", e.target.value)
                        }
                        placeholder="Enter denominator"
                        className="w-1/2"
                      />
                    </div>
                  </div>

                  {/* Bore */}
                  <div className="space-y-2">
                    <Label htmlFor="bore">Bore (mm)</Label>
                    <Input
                      id="bore"
                      value={formData.bore}
                      onChange={(e) =>
                        handleInputChange("bore", e.target.value)
                      }
                      placeholder="Enter Bore (mm)"
                    />
                  </div>

                  {/* Stroke */}
                  <div className="space-y-2">
                    <Label htmlFor="stroke">Stroke (mm)</Label>
                    <Input
                      id="stroke"
                      value={formData.stroke}
                      onChange={(e) =>
                        handleInputChange("stroke", e.target.value)
                      }
                      placeholder="Enter Stroke (mm)"
                    />
                  </div>

                  {/* Vacuum Modulator Make */}
                  <div className="space-y-2">
                    <Label htmlFor="vacuumModulatorMake">Vacuum Modulator Make</Label>
                    <Input
                      id="vacuumModulatorMake"
                      value={formData.vacuumModulatorMake}
                      onChange={(e) =>
                        handleInputChange("vacuumModulatorMake", e.target.value)
                      }
                      placeholder="Enter Vacuum Modulator Make"
                    />
                  </div>

                  {/* Vacuum Modulator Details */}
                  <div className="space-y-2">
                    <Label htmlFor="vacuumModulatorDetails">Vacuum Modulator Details</Label>
                    <Input
                      id="vacuumModulatorDetails"
                      value={formData.vacuumModulatorDetails}
                      onChange={(e) =>
                        handleInputChange("vacuumModulatorDetails", e.target.value)
                      }
                      placeholder="Enter Vacuum Modulator Details"
                    />
                  </div>

                  {/* ECU Make */}
                  <div className="space-y-2">
                    <Label htmlFor="ecuMake">ECU Make</Label>
                    <Input
                      id="ecuMake"
                      value={formData.ecuMake}
                      onChange={(e) =>
                        handleInputChange("ecuMake", e.target.value)
                      }
                      placeholder="Enter ECU Make"
                    />
                  </div>

                  {/* ECU ID Number */}
                  <div className="space-y-2">
                    <Label htmlFor="ecuIdNumber">ECU ID Number</Label>
                    <Input
                      id="ecuIdNumber"
                      value={formData.ecuIdNumber}
                      onChange={(e) =>
                        handleInputChange("ecuIdNumber", e.target.value)
                      }
                      placeholder="Enter ECU ID Number"
                    />
                  </div>

                  {/* ECU Dataset Number */}
                  <div className="space-y-2">
                    <Label htmlFor="ecuDatasetNumber">ECU Dataset Number</Label>
                    <Input
                      id="ecuDatasetNumber"
                      value={formData.ecuDatasetNumber}
                      onChange={(e) =>
                        handleInputChange("ecuDatasetNumber", e.target.value)
                      }
                      placeholder="Enter ECU Dataset Number"
                    />
                  </div>

                  {/* ECU Dataset Details */}
                  <div className="space-y-2">
                    <Label htmlFor="ecuDatasetDetails">ECU Dataset Details</Label>
                    <Input
                      id="ecuDatasetDetails"
                      value={formData.ecuDatasetDetails}
                      onChange={(e) =>
                        handleInputChange("ecuDatasetDetails", e.target.value)
                      }
                      placeholder="Enter ECU Dataset Details"
                    />
                  </div>

                  {/* Injector Type */}
                  <div className="space-y-2">
                    <Label htmlFor="injectorType">Injector Type</Label>
                    <Input
                      id="injectorType"
                      value={formData.injectorType}
                      onChange={(e) =>
                        handleInputChange("injectorType", e.target.value)
                      }
                      placeholder="Enter Injector Type"
                    />
                  </div>

                  {/* Turbocharger Type */}
                  <div className="space-y-2">
                    <Label htmlFor="turbochargerType">Turbo charger Type</Label>
                    <Input
                      id="turbochargerType"
                      value={formData.turbochargerType}
                      onChange={(e) =>
                        handleInputChange("turbochargerType", e.target.value)
                      }
                      placeholder="Enter Turbocharger Type"
                    />
                  </div>

                  {/* Blow by Recirculation */}
                  <div className="space-y-2">
                    <Label>Blow by Recirculation</Label>
                    <RadioGroup
                      value={formData.blowByRecirculation}
                      onValueChange={(value) =>
                        handleInputChange("blowByRecirculation", value)
                      }
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="blow-yes" />
                          <Label htmlFor="blow-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="blow-no" />
                          <Label htmlFor="blow-no">No</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Blow by Recirculation Details */}
                  <div className="space-y-2">
                    <Label htmlFor="blowByRecirculationDetails">Blow by Recirculation Details</Label>
                    <Input
                      id="blowByRecirculationDetails"
                      value={formData.blowByRecirculationDetails}
                      onChange={(e) =>
                        handleInputChange("blowByRecirculationDetails", e.target.value)
                      }
                      placeholder="Enter Blow by Recirculation Details"
                    />
                  </div>

                  {/* Nozzle Number of Holes */}
                  <div className="space-y-2">
                    <Label htmlFor="nozzleNumberOfHoles">Nozzle Number of Holes</Label>
                    <Input
                      id="nozzleNumberOfHoles"
                      value={formData.nozzleNumberOfHoles}
                      onChange={(e) =>
                        handleInputChange("nozzleNumberOfHoles", e.target.value)
                      }
                      placeholder="Enter Nozzle Number of Holes"
                    />
                  </div>

                  {/* Nozzle Through Flow */}
                  <div className="space-y-2">
                    <Label htmlFor="nozzleThroughFlow">Nozzle Through Flow</Label>
                    <Input
                      id="nozzleThroughFlow"
                      value={formData.nozzleThroughFlow}
                      onChange={(e) =>
                        handleInputChange("nozzleThroughFlow", e.target.value)
                      }
                      placeholder="Enter Nozzle Through Flow"
                    />
                  </div>

                  {/* EGR Valve Make */}
                  <div className="space-y-2">
                    <Label htmlFor="egrValveMake">EGR Valve Make</Label>
                    <Input
                      id="egrValveMake"
                      value={formData.egrValveMake}
                      onChange={(e) =>
                        handleInputChange("egrValveMake", e.target.value)
                      }
                      placeholder="Enter EGR Valve Make"
                    />
                  </div>

                  {/* EGR Valve Type */}
                  <div className="space-y-2">
                    <Label htmlFor="egrValveType">EGR Valve Type</Label>
                    <Input
                      id="egrValveType"
                      value={formData.egrValveType}
                      onChange={(e) =>
                        handleInputChange("egrValveType", e.target.value)
                      }
                      placeholder="Enter EGR Valve Type"
                    />
                  </div>

                  {/* EGR Valve Diameter */}
                  <div className="space-y-2">
                    <Label htmlFor="egrValveDiameter">EGR Valve Diameter (mm)</Label>
                    <Input
                      id="egrValveDiameter"
                      value={formData.egrValveDiameter}
                      onChange={(e) =>
                        handleInputChange("egrValveDiameter", e.target.value)
                      }
                      placeholder="Enter EGR Valve Diameter (mm)"
                    />
                  </div>

                  {/* EGR Cooler Make */}
                  <div className="space-y-2">
                    <Label htmlFor="egrCoolerMake">EGR Cooler Make</Label>
                    <Input
                      id="egrCoolerMake"
                      value={formData.egrCoolerMake}
                      onChange={(e) =>
                        handleInputChange("egrCoolerMake", e.target.value)
                      }
                      placeholder="Enter EGR Cooler Make"
                    />
                  </div>

                  {/* EGR Cooler Capacity */}
                  <div className="space-y-2">
                    <Label htmlFor="egrCoolerCapacity">EGR Cooler Capacity (KW)</Label>
                    <Input
                      id="egrCoolerCapacity"
                      value={formData.egrCoolerCapacity}
                      onChange={(e) =>
                        handleInputChange("egrCoolerCapacity", e.target.value)
                      }
                      placeholder="Enter EGR Cooler Capacity (kW)"
                    />
                  </div>

                  {/* CATCON Make */}
                  <div className="space-y-2">
                    <Label htmlFor="catconMass">CATCON Make</Label>
                    <Input
                      id="catconMass"
                      value={formData.catconMass}
                      onChange={(e) =>
                        handleInputChange("catconMass", e.target.value)
                      }
                      placeholder="Enter CATCON Make"
                    />
                  </div>

                  {/* CATCON Type */}
                  <div className="space-y-2">
                    <Label htmlFor="catconType">CATCON Type</Label>
                    <Input
                      id="catconType"
                      value={formData.catconType}
                      onChange={(e) =>
                        handleInputChange("catconType", e.target.value)
                      }
                      placeholder="Enter CATCON Type"
                    />
                  </div>

                  {/* CATCON Loading */}
                  <div className="space-y-2">
                    <Label htmlFor="catconLoading">CATCON Loading</Label>
                    <Input
                      id="catconLoading"
                      value={formData.catconLoading}
                      onChange={(e) =>
                        handleInputChange("catconLoading", e.target.value)
                      }
                      placeholder="Enter CATCON Loading"
                    />
                  </div>

                  {/* DPF Make */}
                  <div className="space-y-2">
                    <Label htmlFor="dpfMake">DPF Make</Label>
                    <Input
                      id="dpfMake"
                      value={formData.dpfMake}
                      onChange={(e) =>
                        handleInputChange("dpfMake", e.target.value)
                      }
                      placeholder="Enter DPF Make"
                    />
                  </div>

                  {/* DPF Capacity */}
                  <div className="space-y-2">
                    <Label htmlFor="dpfCapacity">DPF Capacity</Label>
                    <Input
                      id="dpfCapacity"
                      value={formData.dpfCapacity}
                      onChange={(e) =>
                        handleInputChange("dpfCapacity", e.target.value)
                      }
                      placeholder="Enter DPF Capacity"
                    />
                  </div>

                  {/* SCR Make */}
                  <div className="space-y-2">
                    <Label htmlFor="scrMake">SCR Make</Label>
                    <Input
                      id="scrMake"
                      value={formData.scrMake}
                      onChange={(e) =>
                        handleInputChange("scrMake", e.target.value)
                      }
                      placeholder="Enter SCR Make"
                    />
                  </div>

                  {/* SCR Capacity */}
                  <div className="space-y-2">
                    <Label htmlFor="scrCapacity">SCR Capacity</Label>
                    <Input
                      id="scrCapacity"
                      value={formData.scrCapacity}
                      onChange={(e) =>
                        handleInputChange("scrCapacity", e.target.value)
                      }
                      placeholder="Enter SCR Capacity"
                    />
                  </div>

                  {/* A/C Compressor */}
                  <div className="space-y-2">
                    <Label>A/C Compressor</Label>
                    <RadioGroup
                      value={formData.acCompressor}
                      onValueChange={(value) =>
                        handleInputChange("acCompressor", value)
                      }
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="ac-yes" />
                          <Label htmlFor="ac-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="ac-no" />
                          <Label htmlFor="ac-no">No</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* A/C Compressor Details */}
                  <div className="space-y-2">
                    <Label htmlFor="acCompressorDetails">A/C Compressor Details</Label>
                    <Input
                      id="acCompressorDetails"
                      value={formData.acCompressorDetails}
                      onChange={(e) =>
                        handleInputChange("acCompressorDetails", e.target.value)
                      }
                      placeholder="Enter A/C Compressor Details"
                    />
                  </div>

                  {/* Power Steering Pump */}
                  <div className="space-y-2">
                    <Label htmlFor="powerSteeringPump">Power Steering Pump</Label>
                    <Input
                      id="powerSteeringPump"
                      value={formData.powerSteeringPump}
                      onChange={(e) =>
                        handleInputChange("powerSteeringPump", e.target.value)
                      }
                      placeholder="Enter Power Steering Pump"
                    />
                  </div>

                  {/* Power Steering Details */}
                  <div className="space-y-2">
                    <Label htmlFor="powerSteeringDetails">Power Steering Details</Label>
                    <Input
                      id="powerSteeringDetails"
                      value={formData.powerSteeringDetails}
                      onChange={(e) =>
                        handleInputChange("powerSteeringDetails", e.target.value)
                      }
                      placeholder="Enter Power Steering Details"
                    />
                  </div>

                  {/* Water by pass */}
                  <div className="space-y-2">
                    <Label htmlFor="waterByPass">Water by pass</Label>
                    <Input
                      id="waterByPass"
                      value={formData.waterByPass}
                      onChange={(e) =>
                        handleInputChange("waterByPass", e.target.value)
                      }
                      placeholder="Enter Water by pass"
                    />
                  </div>

                  {/* Kerb Weight FAW */}
                  <div className="space-y-2">
                    <Label htmlFor="kerbWeightFaw">
                      Kerb Weight FAW (Kg){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="kerbWeightFaw"
                      value={formData.kerbWeightFaw}
                      onChange={(e) =>
                        handleInputChange("kerbWeightFaw", e.target.value)
                      }
                      placeholder="Enter Kerb Weight FAW (Kg)"
                    />
                  </div>

                  {/* Kerb Weight RAW */}
                  <div className="space-y-2">
                    <Label htmlFor="kerbWeightRaw">
                      Kerb Weight RAW (Kg){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="kerbWeightRaw"
                      value={formData.kerbWeightRaw}
                      onChange={(e) =>
                        handleInputChange("kerbWeightRaw", e.target.value)
                      }
                      placeholder="Enter Kerb Weight RAW (Kg)"
                    />
                  </div>

                  {/* Emission Status */}
                  <div className="space-y-2">
                    <Label htmlFor="emissionStatus">Emission Status of the Vehicle</Label>
                    <Input
                      id="emissionStatus"
                      value={formData.emissionStatus}
                      onChange={(e) =>
                        handleInputChange("emissionStatus", e.target.value)
                      }
                      placeholder="Enter Emission Status of the Vehicle"
                    />
                  </div>

                  {/* Thermostat Details */}
                  <div className="space-y-2">
                    <Label htmlFor="thermostatDetails">Thermostat Details</Label>
                    <Textarea
                      id="thermostatDetails"
                      value={formData.thermostatDetails}
                      onChange={(e) =>
                        handleInputChange("thermostatDetails", e.target.value)
                      }
                      placeholder="Enter Thermostat Details"
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Vehicle Serial Number */}
                  <div className="space-y-2">
                    <Label htmlFor="vehicleSerialNumber">
                      Vehicle Serial Number{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.vehicleSerialNumber}
                      onValueChange={(value) =>
                        handleInputChange("vehicleSerialNumber", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Vehicle Serial No" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleSerialNumbers.length > 0 ? (
                          vehicleSerialNumbers.map((serialNumber) => (
                            <SelectItem
                              key={serialNumber}
                              value={serialNumber}
                            >
                              {serialNumber}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled>
                            No Vehicle Serial Numbers Available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Engine Family */}
                  <div className="space-y-2">
                    <Label htmlFor="engineFamily">Engine Family</Label>
                    <Select
                      value={formData.engineFamily}
                      onValueChange={(value) =>
                        handleInputChange("engineFamily", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Engine Family" />
                      </SelectTrigger>
                      <SelectContent>
                        {engineFamilies.length > 0 ? (
                          engineFamilies.map((family) => (
                            <SelectItem
                              key={family.value || family.id || family}
                              value={family}
                            >
                              {family}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled>
                            No Engine Families Available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* HV Battery Make */}
                  <div className="space-y-2">
                    <Label htmlFor="hvBatteryMake">HV Battery Make</Label>
                    <Input
                      id="hvBatteryMake"
                      value={formData.hvBatteryMake}
                      onChange={(e) =>
                        handleInputChange("hvBatteryMake", e.target.value)
                      }
                      placeholder="Enter HV Battery Make"
                    />
                  </div>

                  {/* HV Battery Capacity */}
                  <div className="space-y-2">
                    <Label htmlFor="hvBatteryCapacity">HV Battery Capacity</Label>
                    <Input
                      id="hvBatteryCapacity"
                      value={formData.hvBatteryCapacity}
                      onChange={(e) =>
                        handleInputChange("hvBatteryCapacity", e.target.value)
                      }
                      placeholder="Enter HV Battery Capacity"
                    />
                  </div>

                  {/* HV Battery Voltage (V) */}
                  <div className="space-y-2">
                    <Label htmlFor="hvBatteryVoltage">HV Battery Voltage (V)</Label>
                    <Input
                      id="hvBatteryVoltage"
                      value={formData.hvBatteryVoltage}
                      onChange={(e) =>
                        handleInputChange("hvBatteryVoltage", e.target.value)
                      }
                      placeholder="Enter HV Battery Voltage (V)"
                    />
                  </div>

                  {/* HV Battery Current (A) */}
                  <div className="space-y-2">
                    <Label htmlFor="hvBatteryCurrent">HV Battery Current (A)</Label>
                    <Input
                      id="hvBatteryCurrent"
                      value={formData.hvBatteryCurrent}
                      onChange={(e) =>
                        handleInputChange("hvBatteryCurrent", e.target.value)
                      }
                      placeholder="Enter HV Battery Current (A)"
                    />
                  </div>

                  {/* EV Motor Power (KW) */}
                  <div className="space-y-2">
                    <Label htmlFor="evMotorPower">EV Motor Power (KW)</Label>
                    <Input
                      id="evMotorPower"
                      value={formData.evMotorPower}
                      onChange={(e) =>
                        handleInputChange("evMotorPower", e.target.value)
                      }
                      placeholder="Enter EV Motor Power (KW)"
                    />
                  </div>

                </>
              )}

              {/* ICE/Hybrid Specific Fields */}
              {(domain === "ICE" || domain === "Hybrid") && (
                <>
                  {/* Engine Build Level */}
                  <div className="space-y-2">
                    <Label htmlFor="engineBuildLevel">Engine Build Level</Label>
                    <Input
                      id="engineBuildLevel"
                      value={formData.engineBuildLevel}
                      onChange={(e) =>
                        handleInputChange("engineBuildLevel", e.target.value)
                      }
                      placeholder="Enter Engine Build Level"
                    />
                  </div>

                  {/* Engine Type */}
                  <div className="space-y-2">
                    <Label htmlFor="engineType">Engine Type</Label>
                    <Input
                      id="engineType"
                      value={formData.engineType}
                      onChange={(e) =>
                        handleInputChange("engineType", e.target.value)
                      }
                      placeholder="Enter Engine Type"
                    />
                  </div>

                  {/* Engine Capacity */}
                  <div className="space-y-2">
                    <Label htmlFor="engineCapacity">Engine Capacity (cc)</Label>
                    <Input
                      id="engineCapacity"
                      value={formData.engineCapacity}
                      onChange={(e) =>
                        handleInputChange("engineCapacity", e.target.value)
                      }
                      placeholder="Enter Engine Capacity (cc)"
                    />
                  </div>

                  {/* Number of Cylinders */}
                  <div className="space-y-2">
                    <Label htmlFor="numberOfCylinders">Number of Cylinders</Label>
                    <Input
                      id="numberOfCylinders"
                      value={formData.numberOfCylinders}
                      onChange={(e) =>
                        handleInputChange("numberOfCylinders", e.target.value)
                      }
                      placeholder="Enter Number of Cylinders"
                    />
                  </div>

                  {/* Compression Ratio */}
                  <div className="space-y-2">
                    <Label htmlFor="compressionRatio">Compression Ratio</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="compressionRatioNumerator"
                        value={formData.compressionRatio.numerator}
                        onChange={(e) =>
                          handleRatioChange("compressionRatio", "numerator", e.target.value)
                        }
                        placeholder="Enter numerator"
                        className="w-1/2"
                      />
                      <span className="text-gray-500">:</span>
                      <Input
                        id="compressionRatioDenominator"
                        value={formData.compressionRatio.denominator}
                        onChange={(e) =>
                          handleRatioChange("compressionRatio", "denominator", e.target.value)
                        }
                        placeholder="Enter denominator"
                        className="w-1/2"
                      />
                    </div>
                  </div>

                  {/* Bore */}
                  <div className="space-y-2">
                    <Label htmlFor="bore">Bore (mm)</Label>
                    <Input
                      id="bore"
                      value={formData.bore}
                      onChange={(e) =>
                        handleInputChange("bore", e.target.value)
                      }
                      placeholder="Enter Bore (mm)"
                    />
                  </div>

                  {/* Stroke */}
                  <div className="space-y-2">
                    <Label htmlFor="stroke">Stroke (mm)</Label>
                    <Input
                      id="stroke"
                      value={formData.stroke}
                      onChange={(e) =>
                        handleInputChange("stroke", e.target.value)
                      }
                      placeholder="Enter Stroke (mm)"
                    />
                  </div>

                  {/* Vacuum Modulator Make */}
                  <div className="space-y-2">
                    <Label htmlFor="vacuumModulatorMake">Vacuum Modulator Make</Label>
                    <Input
                      id="vacuumModulatorMake"
                      value={formData.vacuumModulatorMake}
                      onChange={(e) =>
                        handleInputChange("vacuumModulatorMake", e.target.value)
                      }
                      placeholder="Enter Vacuum Modulator Make"
                    />
                  </div>

                  {/* Vacuum Modulator Details */}
                  <div className="space-y-2">
                    <Label htmlFor="vacuumModulatorDetails">Vacuum Modulator Details</Label>
                    <Input
                      id="vacuumModulatorDetails"
                      value={formData.vacuumModulatorDetails}
                      onChange={(e) =>
                        handleInputChange("vacuumModulatorDetails", e.target.value)
                      }
                      placeholder="Enter Vacuum Modulator Details"
                    />
                  </div>

                  {/* ECU Make */}
                  <div className="space-y-2">
                    <Label htmlFor="ecuMake">ECU Make</Label>
                    <Input
                      id="ecuMake"
                      value={formData.ecuMake}
                      onChange={(e) =>
                        handleInputChange("ecuMake", e.target.value)
                      }
                      placeholder="Enter ECU Make"
                    />
                  </div>

                  {/* ECU ID Number */}
                  <div className="space-y-2">
                    <Label htmlFor="ecuIdNumber">ECU ID Number</Label>
                    <Input
                      id="ecuIdNumber"
                      value={formData.ecuIdNumber}
                      onChange={(e) =>
                        handleInputChange("ecuIdNumber", e.target.value)
                      }
                      placeholder="Enter ECU ID Number"
                    />
                  </div>

                  {/* ECU Dataset Number */}
                  <div className="space-y-2">
                    <Label htmlFor="ecuDatasetNumber">ECU Dataset Number</Label>
                    <Input
                      id="ecuDatasetNumber"
                      value={formData.ecuDatasetNumber}
                      onChange={(e) =>
                        handleInputChange("ecuDatasetNumber", e.target.value)
                      }
                      placeholder="Enter ECU Dataset Number"
                    />
                  </div>

                  {/* ECU Dataset Details */}
                  <div className="space-y-2">
                    <Label htmlFor="ecuDatasetDetails">ECU Dataset Details</Label>
                    <Input
                      id="ecuDatasetDetails"
                      value={formData.ecuDatasetDetails}
                      onChange={(e) =>
                        handleInputChange("ecuDatasetDetails", e.target.value)
                      }
                      placeholder="Enter ECU Dataset Details"
                    />
                  </div>

                  {/* Injector Type */}
                  <div className="space-y-2">
                    <Label htmlFor="injectorType">Injector Type</Label>
                    <Input
                      id="injectorType"
                      value={formData.injectorType}
                      onChange={(e) =>
                        handleInputChange("injectorType", e.target.value)
                      }
                      placeholder="Enter Injector Type"
                    />
                  </div>

                  {/* Turbocharger Type */}
                  <div className="space-y-2">
                    <Label htmlFor="turbochargerType">Turbo charger Type</Label>
                    <Input
                      id="turbochargerType"
                      value={formData.turbochargerType}
                      onChange={(e) =>
                        handleInputChange("turbochargerType", e.target.value)
                      }
                      placeholder="Enter Turbocharger Type"
                    />
                  </div>

                  {/* Blow by Recirculation */}
                  <div className="space-y-2">
                    <Label>Blow by Recirculation</Label>
                    <RadioGroup
                      value={formData.blowByRecirculation}
                      onValueChange={(value) =>
                        handleInputChange("blowByRecirculation", value)
                      }
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="blow-yes" />
                          <Label htmlFor="blow-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="blow-no" />
                          <Label htmlFor="blow-no">No</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Blow by Recirculation Details */}
                  <div className="space-y-2">
                    <Label htmlFor="blowByRecirculationDetails">Blow by Recirculation Details</Label>
                    <Input
                      id="blowByRecirculationDetails"
                      value={formData.blowByRecirculationDetails}
                      onChange={(e) =>
                        handleInputChange("blowByRecirculationDetails", e.target.value)
                      }
                      placeholder="Enter Blow by Recirculation Details"
                    />
                  </div>

                  {/* Nozzle Number of Holes */}
                  <div className="space-y-2">
                    <Label htmlFor="nozzleNumberOfHoles">Nozzle Number of Holes</Label>
                    <Input
                      id="nozzleNumberOfHoles"
                      value={formData.nozzleNumberOfHoles}
                      onChange={(e) =>
                        handleInputChange("nozzleNumberOfHoles", e.target.value)
                      }
                      placeholder="Enter Nozzle Number of Holes"
                    />
                  </div>

                  {/* Nozzle Through Flow */}
                  <div className="space-y-2">
                    <Label htmlFor="nozzleThroughFlow">Nozzle Through Flow</Label>
                    <Input
                      id="nozzleThroughFlow"
                      value={formData.nozzleThroughFlow}
                      onChange={(e) =>
                        handleInputChange("nozzleThroughFlow", e.target.value)
                      }
                      placeholder="Enter Nozzle Through Flow"
                    />
                  </div>

                  {/* EGR Valve Make */}
                  <div className="space-y-2">
                    <Label htmlFor="egrValveMake">EGR Valve Make</Label>
                    <Input
                      id="egrValveMake"
                      value={formData.egrValveMake}
                      onChange={(e) =>
                        handleInputChange("egrValveMake", e.target.value)
                      }
                      placeholder="Enter EGR Valve Make"
                    />
                  </div>

                  {/* EGR Valve Type */}
                  <div className="space-y-2">
                    <Label htmlFor="egrValveType">EGR Valve Type</Label>
                    <Input
                      id="egrValveType"
                      value={formData.egrValveType}
                      onChange={(e) =>
                        handleInputChange("egrValveType", e.target.value)
                      }
                      placeholder="Enter EGR Valve Type"
                    />
                  </div>

                  {/* EGR Valve Diameter */}
                  <div className="space-y-2">
                    <Label htmlFor="egrValveDiameter">EGR Valve Diameter (mm)</Label>
                    <Input
                      id="egrValveDiameter"
                      value={formData.egrValveDiameter}
                      onChange={(e) =>
                        handleInputChange("egrValveDiameter", e.target.value)
                      }
                      placeholder="Enter EGR Valve Diameter (mm)"
                    />
                  </div>

                  {/* EGR Cooler Make */}
                  <div className="space-y-2">
                    <Label htmlFor="egrCoolerMake">EGR Cooler Make</Label>
                    <Input
                      id="egrCoolerMake"
                      value={formData.egrCoolerMake}
                      onChange={(e) =>
                        handleInputChange("egrCoolerMake", e.target.value)
                      }
                      placeholder="Enter EGR Cooler Make"
                    />
                  </div>

                  {/* EGR Cooler Capacity */}
                  <div className="space-y-2">
                    <Label htmlFor="egrCoolerCapacity">EGR Cooler Capacity (KW)</Label>
                    <Input
                      id="egrCoolerCapacity"
                      value={formData.egrCoolerCapacity}
                      onChange={(e) =>
                        handleInputChange("egrCoolerCapacity", e.target.value)
                      }
                      placeholder="Enter EGR Cooler Capacity (kW)"
                    />
                  </div>

                  {/* CATCON Make */}
                  <div className="space-y-2">
                    <Label htmlFor="catconMass">CATCON Make</Label>
                    <Input
                      id="catconMass"
                      value={formData.catconMass}
                      onChange={(e) =>
                        handleInputChange("catconMass", e.target.value)
                      }
                      placeholder="Enter CATCON Make"
                    />
                  </div>

                  {/* CATCON Type */}
                  <div className="space-y-2">
                    <Label htmlFor="catconType">CATCON Type</Label>
                    <Input
                      id="catconType"
                      value={formData.catconType}
                      onChange={(e) =>
                        handleInputChange("catconType", e.target.value)
                      }
                      placeholder="Enter CATCON Type"
                    />
                  </div>

                  {/* CATCON Loading */}
                  <div className="space-y-2">
                    <Label htmlFor="catconLoading">CATCON Loading</Label>
                    <Input
                      id="catconLoading"
                      value={formData.catconLoading}
                      onChange={(e) =>
                        handleInputChange("catconLoading", e.target.value)
                      }
                      placeholder="Enter CATCON Loading"
                    />
                  </div>

                  {/* DPF Make */}
                  <div className="space-y-2">
                    <Label htmlFor="dpfMake">DPF Make</Label>
                    <Input
                      id="dpfMake"
                      value={formData.dpfMake}
                      onChange={(e) =>
                        handleInputChange("dpfMake", e.target.value)
                      }
                      placeholder="Enter DPF Make"
                    />
                  </div>

                  {/* DPF Capacity */}
                  <div className="space-y-2">
                    <Label htmlFor="dpfCapacity">DPF Capacity</Label>
                    <Input
                      id="dpfCapacity"
                      value={formData.dpfCapacity}
                      onChange={(e) =>
                        handleInputChange("dpfCapacity", e.target.value)
                      }
                      placeholder="Enter DPF Capacity"
                    />
                  </div>

                  {/* SCR Make */}
                  <div className="space-y-2">
                    <Label htmlFor="scrMake">SCR Make</Label>
                    <Input
                      id="scrMake"
                      value={formData.scrMake}
                      onChange={(e) =>
                        handleInputChange("scrMake", e.target.value)
                      }
                      placeholder="Enter SCR Make"
                    />
                  </div>

                  {/* SCR Capacity */}
                  <div className="space-y-2">
                    <Label htmlFor="scrCapacity">SCR Capacity</Label>
                    <Input
                      id="scrCapacity"
                      value={formData.scrCapacity}
                      onChange={(e) =>
                        handleInputChange("scrCapacity", e.target.value)
                      }
                      placeholder="Enter SCR Capacity"
                    />
                  </div>

                  {/* A/C Compressor */}
                  <div className="space-y-2">
                    <Label>A/C Compressor</Label>
                    <RadioGroup
                      value={formData.acCompressor}
                      onValueChange={(value) =>
                        handleInputChange("acCompressor", value)
                      }
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="ac-yes" />
                          <Label htmlFor="ac-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="ac-no" />
                          <Label htmlFor="ac-no">No</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* A/C Compressor Details */}
                  <div className="space-y-2">
                    <Label htmlFor="acCompressorDetails">A/C Compressor Details</Label>
                    <Input
                      id="acCompressorDetails"
                      value={formData.acCompressorDetails}
                      onChange={(e) =>
                        handleInputChange("acCompressorDetails", e.target.value)
                      }
                      placeholder="Enter A/C Compressor Details"
                    />
                  </div>

                  {/* Power Steering Pump */}
                  <div className="space-y-2">
                    <Label htmlFor="powerSteeringPump">Power Steering Pump</Label>
                    <Input
                      id="powerSteeringPump"
                      value={formData.powerSteeringPump}
                      onChange={(e) =>
                        handleInputChange("powerSteeringPump", e.target.value)
                      }
                      placeholder="Enter Power Steering Pump"
                    />
                  </div>

                  {/* Power Steering Details */}
                  <div className="space-y-2">
                    <Label htmlFor="powerSteeringDetails">Power Steering Details</Label>
                    <Input
                      id="powerSteeringDetails"
                      value={formData.powerSteeringDetails}
                      onChange={(e) =>
                        handleInputChange("powerSteeringDetails", e.target.value)
                      }
                      placeholder="Enter Power Steering Details"
                    />
                  </div>

                  {/* Water by pass */}
                  <div className="space-y-2">
                    <Label htmlFor="waterByPass">Water by pass</Label>
                    <Input
                      id="waterByPass"
                      value={formData.waterByPass}
                      onChange={(e) =>
                        handleInputChange("waterByPass", e.target.value)
                      }
                      placeholder="Enter Water by pass"
                    />
                  </div>

                  {/* Kerb Weight FAW */}
                  <div className="space-y-2">
                    <Label htmlFor="kerbWeightFaw">
                      Kerb Weight FAW (Kg){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="kerbWeightFaw"
                      value={formData.kerbWeightFaw}
                      onChange={(e) =>
                        handleInputChange("kerbWeightFaw", e.target.value)
                      }
                      placeholder="Enter Kerb Weight FAW (Kg)"
                    />
                  </div>

                  {/* Kerb Weight RAW */}
                  <div className="space-y-2">
                    <Label htmlFor="kerbWeightRaw">
                      Kerb Weight RAW (Kg){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="kerbWeightRaw"
                      value={formData.kerbWeightRaw}
                      onChange={(e) =>
                        handleInputChange("kerbWeightRaw", e.target.value)
                      }
                      placeholder="Enter Kerb Weight RAW (Kg)"
                    />
                  </div>

                  {/* Emission Status */}
                  <div className="space-y-2">
                    <Label htmlFor="emissionStatus">Emission Status of the Vehicle</Label>
                    <Input
                      id="emissionStatus"
                      value={formData.emissionStatus}
                      onChange={(e) =>
                        handleInputChange("emissionStatus", e.target.value)
                      }
                      placeholder="Enter Emission Status of the Vehicle"
                    />
                  </div>

                  {/* Thermostat Details */}
                  <div className="space-y-2">
                    <Label htmlFor="thermostatDetails">Thermostat Details</Label>
                    <Textarea
                      id="thermostatDetails"
                      value={formData.thermostatDetails}
                      onChange={(e) =>
                        handleInputChange("thermostatDetails", e.target.value)
                      }
                      placeholder="Enter Thermostat Details"
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Vehicle Serial Number */}
                  <div className="space-y-2">
                    <Label htmlFor="vehicleSerialNumber">
                      Vehicle Serial Number{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.vehicleSerialNumber}
                      onValueChange={(value) =>
                        handleInputChange("vehicleSerialNumber", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Vehicle Serial No" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleSerialNumbers.length > 0 ? (
                          vehicleSerialNumbers.map((serialNumber) => (
                            <SelectItem
                              key={serialNumber}
                              value={serialNumber}
                            >
                              {serialNumber}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled>
                            No Vehicle Serial Numbers Available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Engine Family */}
                  <div className="space-y-2">
                    <Label htmlFor="engineFamily">Engine Family</Label>
                    <Select
                      value={formData.engineFamily}
                      onValueChange={(value) =>
                        handleInputChange("engineFamily", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Engine Family" />
                      </SelectTrigger>
                      <SelectContent>
                        {engineFamilies.length > 0 ? (
                          engineFamilies.map((family) => (
                            <SelectItem
                              key={family.value || family.id || family}
                              value={family}
                            >
                              {family}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled>
                            No Engine Families Available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* HV Battery Make */}
                  <div className="space-y-2">
                    <Label htmlFor="hvBatteryMake">HV Battery Make</Label>
                    <Input
                      id="hvBatteryMake"
                      value={formData.hvBatteryMake}
                      onChange={(e) =>
                        handleInputChange("hvBatteryMake", e.target.value)
                      }
                      placeholder="Enter HV Battery Make"
                    />
                  </div>

                  {/* HV Battery Capacity */}
                  <div className="space-y-2">
                    <Label htmlFor="hvBatteryCapacity">HV Battery Capacity</Label>
                    <Input
                      id="hvBatteryCapacity"
                      value={formData.hvBatteryCapacity}
                      onChange={(e) =>
                        handleInputChange("hvBatteryCapacity", e.target.value)
                      }
                      placeholder="Enter HV Battery Capacity"
                    />
                  </div>

                  {/* HV Battery Voltage (V) */}
                  <div className="space-y-2">
                    <Label htmlFor="hvBatteryVoltage">HV Battery Voltage (V)</Label>
                    <Input
                      id="hvBatteryVoltage"
                      value={formData.hvBatteryVoltage}
                      onChange={(e) =>
                        handleInputChange("hvBatteryVoltage", e.target.value)
                      }
                      placeholder="Enter HV Battery Voltage (V)"
                    />
                  </div>

                  {/* HV Battery Current (A) */}
                  <div className="space-y-2">
                    <Label htmlFor="hvBatteryCurrent">HV Battery Current (A)</Label>
                    <Input
                      id="hvBatteryCurrent"
                      value={formData.hvBatteryCurrent}
                      onChange={(e) =>
                        handleInputChange("hvBatteryCurrent", e.target.value)
                      }
                      placeholder="Enter HV Battery Current (A)"
                    />
                  </div>

                  {/* EV Motor Power (KW) */}
                  <div className="space-y-2">
                    <Label htmlFor="evMotorPower">EV Motor Power (KW)</Label>
                    <Input
                      id="evMotorPower"
                      value={formData.evMotorPower}
                      onChange={(e) =>
                        handleInputChange("evMotorPower", e.target.value)
                      }
                      placeholder="Enter EV Motor Power (KW)"
                    />
                  </div>
                </>
              )}

              {/* Department (fixed, read-only) */}
              <div className="space-y-2">
                <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
                <Input
                  id="department"
                  value={formData.department}
                  readOnly
                  className="bg-gray-100 text-gray-500"
                  placeholder="Department"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={handleAddEngine}
                className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-6"
              >
                {isEditMode ? `✓ UPDATE ${domain === "EV" ? "MOTOR" : "ENGINE"}` : `✓ ADD ${domain === "EV" ? "MOTOR" : "ENGINE"}`}
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-6"
              >
                ✕ CLEAR
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}