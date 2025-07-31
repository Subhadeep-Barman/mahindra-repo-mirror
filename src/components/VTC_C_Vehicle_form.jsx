import { useState, useEffect, useId } from "react";
import axios from "axios";
import { Button } from "@/components/UI/button";
import { ArrowBack } from "@mui/icons-material";
import Navbar1 from "@/components/UI/navbar";
import { useNavigate, useLocation } from "react-router-dom";
import useStore from "@/store/useStore";
import { useAuth } from "@/context/AuthContext";
import showSnackbar from "@/utils/showSnackbar";

const apiURL = import.meta.env.VITE_BACKEND_URL;

const departments = ["VTC_JO Chennai", "RDE JO", "VTC_JO Nashik"];

export default function VehicleEngineForm({ onSubmit, onClear }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const department = queryParams.get("department") || "VTC_JO Chennai";
  const isEditMode = queryParams.get("edit") === "true";

  // Check if we have vehicle data from navigation state
  const vehicleData = location.state?.vehicleData;
  const originalVehicleData = location.state?.originalVehicleData;

  // Use global store for dropdowns
  const projectOptions = useStore((state) => state.projectOptions);
  const setProjectOptions = useStore((state) => state.setProjectOptions);
  const vehicleModelOptions = useStore((state) => state.vehicleModelOptions);
  const setVehicleModelOptions = useStore(
    (state) => state.setVehicleModelOptions
  );
  const domainOptions = useStore((state) => state.domainOptions);
  const setDomainOptions = useStore((state) => state.setDomainOptions);
  const fetchProjects = useStore((state) => state.fetchProjects);
  const fetchVehicleModels = useStore((state) => state.fetchVehicleModels);
  const fetchDomains = useStore((state) => state.fetchDomains);

  const { apiUserRole, userId, userName } = useAuth();

  // Helper function to parse ratio strings like "3.42:1" into {numerator: "3.42", denominator: "1"}
  const parseRatio = (ratioString) => {
    if (!ratioString) return { numerator: "", denominator: "" };
    const parts = ratioString.split(":");
    return {
      numerator: parts[0] || "",
      denominator: parts[1] || ""
    };
  };

  // Initialize form with empty values or vehicle data if editing
  const [form, setForm] = useState({
    project: "",
    vehicleBuildLevel: "",
    vehicleModel: "",
    vehicleBodyNumber: "",
    vehicleSerialNumber: "",
    transmissionType: "",
    finalDriveAxleRatio: { numerator: "", denominator: "" },
    domain: "",
    tyreMake: "",
    tyreSize: "",
    tyrePressureFront: "",
    tyrePressureRear: "",
    tyreRunIn: "",
    engineRunIn: "",
    gearBoxRunIn: "",
    axleRunIn: "",
    engineOilSpecification: "",
    axleOilSpecification: "",
    transmissionOilSpecification: "",
    driveType: "",
    drivenWheel: "",
    intercoolerLocation: "",
    gearRatio1: { numerator: "", denominator: "" },
    gearRatio2: { numerator: "", denominator: "" },
    gearRatio3: { numerator: "", denominator: "" },
    gearRatio4: { numerator: "", denominator: "" },
    gearRatio5: { numerator: "", denominator: "" },
    reverseGearRatio: { numerator: "", denominator: "" },
    department: department,
    vehicleKerbWeight: "",
    vehicleGVW: "",
    kerbFAW: "",
    kerbRAW: "",
    awdRwdFwd: "",
  });

  // Populate form with existing vehicle data when editing
  useEffect(() => {
    if (isEditMode && vehicleData) {
      setForm({
        project: vehicleData.project_code || "",
        vehicleBuildLevel: vehicleData.vehicle_build_level || "",
        vehicleModel: vehicleData.vehicle_model || "",
        vehicleBodyNumber: vehicleData.vehicle_body_number || "",
        vehicleSerialNumber: vehicleData.vehicle_serial_number || "",
        transmissionType: vehicleData.transmission_type || "",
        finalDriveAxleRatio: parseRatio(vehicleData.final_drive_axle_ratio),
        domain: vehicleData.domain || "",
        tyreMake: vehicleData.tyre_make || "",
        tyreSize: vehicleData.tyre_size || "",
        tyrePressureFront: vehicleData.tyre_pressure_front || "",
        tyrePressureRear: vehicleData.tyre_pressure_rear || "",
        tyreRunIn: vehicleData.tyre_run_in || "",
        engineRunIn: vehicleData.engine_run_in || "",
        gearBoxRunIn: vehicleData.gearbox_run_in || "",
        axleRunIn: vehicleData.axle_run_in || "",
        engineOilSpecification: vehicleData.engine_oil_specification || "",
        axleOilSpecification: vehicleData.axle_oil_specification || "",
        transmissionOilSpecification: vehicleData.transmission_oil_specification || "",
        driveType: vehicleData.wd_type || "",
        drivenWheel: vehicleData.driven_wheel || "",
        intercoolerLocation: vehicleData.intercooler_location || "",
        gearRatio1: parseRatio(vehicleData.gear_ratio_1),
        gearRatio2: parseRatio(vehicleData.gear_ratio_2),
        gearRatio3: parseRatio(vehicleData.gear_ratio_3),
        gearRatio4: parseRatio(vehicleData.gear_ratio_4),
        gearRatio5: parseRatio(vehicleData.gear_ratio_5),
        reverseGearRatio: parseRatio(vehicleData.reverse_gear_ratio),
        department: vehicleData.department || department,
        vehicleKerbWeight: vehicleData.vehicle_kerb_weight || "",
        vehicleGVW: vehicleData.vehicle_gvw || "",
        kerbFAW: vehicleData.kerb_faw || "",
        kerbRAW: vehicleData.kerb_raw || "",
        awdRwdFwd: vehicleData.awd_rwd_fwd || "",
      });
    }
  }, [isEditMode, vehicleData, department]);

  const isEV = form.domain === "EV";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    if (name === "driveType") {
      setForm({
        ...form,
        [name]: value,
        drivenWheel: ""
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleRatioChange = (e, field, part) => {
    setForm({
      ...form,
      [field]: { ...form[field], [part]: e.target.value },
    });
  };

  // Convert current time to IST and format as ISO 8601
  const currentISTTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  const formattedISTTime = new Date(currentISTTime).toISOString();

  // Map form state to API schema
  function mapFormToApi(form) {
    return {
      project_code: form.project,
      vehicle_body_number: form.vehicleBodyNumber,
      vehicle_model: form.vehicleModel,
      vehicle_serial_number: form.vehicleSerialNumber,
      vehicle_build_level: form.vehicleBuildLevel,
      transmission_type: form.transmissionType,
      final_drive_axle_ratio:
        form.finalDriveAxleRatio.numerator && form.finalDriveAxleRatio.denominator
          ? `${form.finalDriveAxleRatio.numerator}:${form.finalDriveAxleRatio.denominator}`
          : "",
      domain: form.domain,
      tyre_make: form.tyreMake,
      tyre_size: form.tyreSize,
      tyre_pressure_front: form.tyrePressureFront
        ? parseFloat(form.tyrePressureFront)
        : null,
      tyre_pressure_rear: form.tyrePressureRear
        ? parseFloat(form.tyrePressureRear)
        : null,
      tyre_run_in: form.tyreRunIn ? parseFloat(form.tyreRunIn) : null,
      engine_run_in: form.engineRunIn ? parseFloat(form.engineRunIn) : null,
      gearbox_run_in: form.gearBoxRunIn ? parseFloat(form.gearBoxRunIn) : null,
      axle_run_in: form.axleRunIn ? parseFloat(form.axleRunIn) : null,
      engine_oil_specification: isEV ? "" : form.engineOilSpecification,
      axle_oil_specification: isEV ? "" : form.axleOilSpecification,
      transmission_oil_specification: isEV ? "" : form.transmissionOilSpecification,
      wd_type: form.driveType,
      driven_wheel: form.drivenWheel,
      intercooler_location: isEV ? "NA" : form.intercoolerLocation,
      gear_ratio_1: isEV ? "" : (form.gearRatio1.numerator && form.gearRatio1.denominator
        ? `${form.gearRatio1.numerator}:${form.gearRatio1.denominator}` : ""),
      gear_ratio_2: isEV ? "" : (form.gearRatio2.numerator && form.gearRatio2.denominator
        ? `${form.gearRatio2.numerator}:${form.gearRatio2.denominator}` : ""),
      gear_ratio_3: isEV ? "" : (form.gearRatio3.numerator && form.gearRatio3.denominator
        ? `${form.gearRatio3.numerator}:${form.gearRatio3.denominator}` : ""),
      gear_ratio_4: isEV ? "" : (form.gearRatio4.numerator && form.gearRatio4.denominator
        ? `${form.gearRatio4.numerator}:${form.gearRatio4.denominator}` : ""),
      gear_ratio_5: isEV ? "" : (form.gearRatio5.numerator && form.gearRatio5.denominator
        ? `${form.gearRatio5.numerator}:${form.gearRatio5.denominator}` : ""),
      reverse_gear_ratio: isEV ? "" : (form.reverseGearRatio.numerator && form.reverseGearRatio.denominator
        ? `${form.reverseGearRatio.numerator}:${form.reverseGearRatio.denominator}` : ""),
      department: form.department,
      vehicle_kerb_weight: form.vehicleKerbWeight ? parseFloat(form.vehicleKerbWeight) : null,
      vehicle_gvw: form.vehicleGVW ? parseFloat(form.vehicleGVW) : null,
      kerb_faw: form.kerbFAW ? parseFloat(form.kerbFAW) : null,
      kerb_raw: form.kerbRAW ? parseFloat(form.kerbRAW) : null,
      awd_rwd_fwd: form.awdRwdFwd,
    };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Field validation logic (same as before)
    const fieldNames = {
      project: "Project",
      vehicleBuildLevel: "Vehicle Build Level",
      vehicleModel: "Vehicle Model",
      vehicleBodyNumber: "Vehicle Body Number",
      vehicleSerialNumber: "Vehicle Serial Number",
      transmissionType: "Transmission Type",
      finalDriveAxleRatio: "Final Drive Axle Ratio",
      domain: "Domain",
      tyreMake: "Tyre Make",
      tyreSize: "Tyre Size",
      tyrePressureFront: "Tyre Pressure Front",
      tyrePressureRear: "Tyre Pressure Rear",
      tyreRunIn: "Tyre Run-in",
      engineRunIn: "Engine Run-in",
      gearBoxRunIn: "Gear Box Run-in",
      axleRunIn: "Axle Run-in",
      engineOilSpecification: "Engine Oil Specification",
      axleOilSpecification: "Axle Oil Specification",
      transmissionOilSpecification: "Transmission Oil Specification",
      driveType: "2WD / 4WD",
      drivenWheel: "Driven Wheel",
      intercoolerLocation: "Intercooler Location",
      gearRatio1: "1st Gear Ratio",
      gearRatio2: "2nd Gear Ratio",
      gearRatio3: "3rd Gear Ratio",
      gearRatio4: "4th Gear Ratio",
      gearRatio5: "5th Gear Ratio",
      reverseGearRatio: "Reverse Gear Ratio",
      department: "Department",
      vehicleKerbWeight: "Vehicle Kerb Weight",
      vehicleGVW: "Vehicle GVW",
      kerbFAW: "Kerb FAW",
      kerbRAW: "Kerb RAW",
      awdRwdFwd: "AWD/RWD/FWD",
    };

    // Check for missing fields
    const missingFields = [];
    for (let key in form) {
      // Skip certain fields if EV
      if (isEV) {
        if (
          [
            "engineOilSpecification",
            "axleOilSpecification",
            "transmissionOilSpecification",
            "intercoolerLocation",
            "gearRatio1",
            "gearRatio2",
            "gearRatio3",
            "gearRatio4",
            "gearRatio5",
            "reverseGearRatio",
          ].includes(key)
        ) {
          continue;
        }
      }
      if (
        typeof form[key] === "object" &&
        form[key] !== null &&
        ("numerator" in form[key] || "denominator" in form[key])
      ) {
        // For ratio fields
        if (!isEV && (!form[key].numerator || !form[key].denominator)) {
          missingFields.push(fieldNames[key]);
        }
      } else if (!form[key] && (!isEV || key !== "finalDriveRatio")) {
        // For non-EV or non-finalDriveRatio fields
        if (
          key !== "finalDriveRatio" // Only check finalDriveRatio for EV
        ) {
          missingFields.push(fieldNames[key]);
        }
      }
    }
    if (missingFields.length > 0) {
      showSnackbar(
        "Please fill all fields. Missing: " + missingFields.join(", "),
        "warning"
      );
      return;
    }

    const payload = mapFormToApi(form);

    try {
      let response;
      if (isEditMode) {
        // Update existing vehicle
        response = await axios.put(
          `${apiURL}/vehicles/${form.vehicleSerialNumber}`,
          payload,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        if (onSubmit) onSubmit(response.data);
        else showSnackbar("Vehicle updated successfully!", "success");
      } else {
        // Create new vehicle
        response = await axios.post(`${apiURL}/vehicles`, payload, {
          headers: { "Content-Type": "application/json" },
        });
        if (onSubmit) onSubmit(response.data);
        else showSnackbar("Vehicle added successfully!", "success");
      }
      navigate(-1);
    } catch (err) {
      showSnackbar(
        `Error ${isEditMode ? 'updating' : 'adding'} vehicle: ` +
        (err.response?.data?.detail || err.message),
        "error"
      );
    }
  };

  const handleClear = () => {
    setForm({
      project: "",
      vehicleBuildLevel: "",
      vehicleModel: "",
      vehicleBodyNumber: "",
      vehicleSerialNumber: "",
      transmissionType: "",
      finalDriveAxleRatio: { numerator: "", denominator: "" },
      domain: "",
      tyreMake: "",
      tyreSize: "",
      tyrePressureFront: "",
      tyrePressureRear: "",
      tyreRunIn: "",
      engineRunIn: "",
      gearBoxRunIn: "",
      axleRunIn: "",
      engineOilSpecification: "",
      axleOilSpecification: "",
      transmissionOilSpecification: "",
      driveType: "",
      drivenWheel: "",
      intercoolerLocation: isEV ? "NA" : "",
      gearRatio: { numerator: "", denominator: "" },
      gearRatio1: { numerator: "", denominator: "" },
      gearRatio2: { numerator: "", denominator: "" },
      gearRatio3: { numerator: "", denominator: "" },
      gearRatio4: { numerator: "", denominator: "" },
      gearRatio5: { numerator: "", denominator: "" },
      reverseGearRatio: { numerator: "", denominator: "" },
      department: department,
      vehicleKerbWeight: "",
      vehicleGVW: "",
      kerbFAW: "",
      kerbRAW: "",
      awdRwdFwd: "",
    });
    if (onClear) onClear();
  };

  const [activeTab, setActiveTab] = useState("Vehicle");
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "Job Order") navigate("/vtc-chennai");
    else if (tab === "Vehicle") navigate("/vtcvehicle/new");
    else if (tab === "Engine") navigate("/engineform");
  };

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const getDropdownData = async () => {
      const projects = await fetchProjects();
      const vehicleModels = await fetchVehicleModels();
      const domains = await fetchDomains();
      setProjectOptions(projects);
      setVehicleModelOptions(vehicleModels);
      setDomainOptions(domains);
    };
    getDropdownData();
  }, [
    fetchProjects,
    fetchVehicleModels,
    fetchDomains,
    setProjectOptions,
    setVehicleModelOptions,
    setDomainOptions,
  ]);

  return (
    <>
      <Navbar1 />
      {/* Header */}
      <div className="">
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
                  {isEditMode ? `EDIT VEHICLE: ${form.vehicleSerialNumber}` : `NEW VEHICLE - ${department}`}
                </h1>
                {isEditMode && (
                  <p className="text-sm text-gray-600">
                    Editing vehicle: {vehicleData?.vehicle_serial_number} | Department: {department}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-7xl mx-auto mt-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Vehicle Serial Number - Disable editing in edit mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vehicle Serial Number <span className="text-red-500">*</span>
            </label>
            <input
              name="vehicleSerialNumber"
              value={form.vehicleSerialNumber}
              onChange={handleChange}
              required
              disabled={isEditMode}
              className={`border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500 ${isEditMode ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                }`}
              placeholder="Enter Vehicle Serial Number"
            />
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project <span className="text-red-500">*</span>
            </label>
            <select
              name="project"
              value={form.project}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select Project</option>
              {projectOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          {/* Vehicle Build Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vehicle Build Level <span className="text-red-500">*</span>
            </label>
            <input
              name="vehicleBuildLevel"
              value={form.vehicleBuildLevel}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
              placeholder="Enter Vehicle Build Level"
            />
          </div>
          {/* Vehicle Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vehicle Model <span className="text-red-500">*</span>
            </label>
            <select
              name="vehicleModel"
              value={form.vehicleModel}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select Model</option>
              {vehicleModelOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          {/* Vehicle Body Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vehicle Body Number <span className="text-red-500">*</span>
            </label>
            <input
              name="vehicleBodyNumber"
              value={form.vehicleBodyNumber}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
              placeholder="Enter Vehicle Body Number"
            />
          </div>
          {/* Transmission Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transmission Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <label>
                <input
                  type="radio"
                  name="transmissionType"
                  value="AT"
                  checked={form.transmissionType === "AT"}
                  onChange={handleRadioChange}
                  required
                />{" "}
                AT
              </label>
              <label>
                <input
                  type="radio"
                  name="transmissionType"
                  value="MT"
                  checked={form.transmissionType === "MT"}
                  onChange={handleRadioChange}
                  required
                />{" "}
                MT
              </label>
              <label>
                <input
                  type="radio"
                  name="transmissionType"
                  value="AMT"
                  checked={form.transmissionType === "AMT"}
                  onChange={handleRadioChange}
                  required
                />{" "}
                AMT
              </label>
            </div>
          </div>
          {/* Vehicle Kerb Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vehicle Kerb Weight (kg) <span className="text-red-500">*</span>
            </label>
            <input
              name="vehicleKerbWeight"
              value={form.vehicleKerbWeight}
              onChange={handleChange}
              required
              type="number"
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
              placeholder="Enter Vehicle Kerb Weight"
            />
          </div>

          {/* Vehicle GVW */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vehicle GVW (kg) <span className="text-red-500">*</span>
            </label>
            <input
              name="vehicleGVW"
              value={form.vehicleGVW}
              onChange={handleChange}
              required
              type="number"
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
              placeholder="Enter Vehicle GVW"
            />
          </div>

          {/* Kerb FAW */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kerb FAW (kg) <span className="text-red-500">*</span>
            </label>
            <input
              name="kerbFAW"
              value={form.kerbFAW}
              onChange={handleChange}
              required
              type="number"
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
              placeholder="Enter Kerb FAW"
            />
          </div>

          {/* Kerb RAW */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kerb RAW (kg) <span className="text-red-500">*</span>
            </label>
            <input
              name="kerbRAW"
              value={form.kerbRAW}
              onChange={handleChange}
              required
              type="number"
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
              placeholder="Enter Kerb RAW"
            />
          </div>

          {/* AWD/RWD/FWD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AWD/RWD/FWD <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <label>
                <input
                  type="radio"
                  name="awdRwdFwd"
                  value="AWD"
                  checked={form.awdRwdFwd === "AWD"}
                  onChange={handleRadioChange}
                  required
                />{" "}
                AWD
              </label>
              <label>
                <input
                  type="radio"
                  name="awdRwdFwd"
                  value="RWD"
                  checked={form.awdRwdFwd === "RWD"}
                  onChange={handleRadioChange}
                  required
                />{" "}
                RWD
              </label>
              <label>
                <input
                  type="radio"
                  name="awdRwdFwd"
                  value="FWD"
                  checked={form.awdRwdFwd === "FWD"}
                  onChange={handleRadioChange}
                  required
                />{" "}
                FWD
              </label>
            </div>
          </div>

          {/* Final Drive Ratio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Final Drive Axle Ratio <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={form.finalDriveAxleRatio.numerator}
                onChange={(e) =>
                  handleRatioChange(e, "finalDriveAxleRatio", "numerator")
                }
                required
                className="border rounded-lg px-3 py-2 w-1/2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter numerator"
              />
              <span className="text-gray-500">:</span>
              <input
                type="number"
                value={form.finalDriveAxleRatio.denominator}
                onChange={(e) =>
                  handleRatioChange(e, "finalDriveAxleRatio", "denominator")
                }
                required
                className="border rounded-lg px-3 py-2 w-1/2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter denominator"
              />
            </div>
          </div>
          {/* Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Domain <span className="text-red-500">*</span>
            </label>
            <select
              name="domain"
              value={form.domain}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select Domain</option>
              {domainOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          {/* Tyre Make */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tyre Make <span className="text-red-500">*</span>
            </label>
            <input
              name="tyreMake"
              value={form.tyreMake}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
              placeholder="Enter Tyre Make"
            />
          </div>
          {/* Tyre Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tyre Size <span className="text-red-500">*</span>
            </label>
            <input
              name="tyreSize"
              value={form.tyreSize}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
              placeholder="Enter Tyre Size"
            />
          </div>
          {/* Tyre Pressure Front */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tyre Pressure Front(psi) <span className="text-red-500">*</span>
            </label>
            <input
              name="tyrePressureFront"
              value={form.tyrePressureFront}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
              placeholder="Enter Front Tyre Pressure"
              type="number"
            />
          </div>
          {/* Tyre Pressure Rear */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tyre Pressure Rear(psi) <span className="text-red-500">*</span>
            </label>
            <input
              name="tyrePressureRear"
              value={form.tyrePressureRear}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
              placeholder="Enter Rear Tyre Pressure"
              type="number"
            />
          </div>
          {/* Tyre Run-in(Kms) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tyre Run-in(Kms) <span className="text-red-500">*</span>
            </label>
            <input
              name="tyreRunIn"
              value={form.tyreRunIn}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
              placeholder="Enter Tyre Run-in(Kms)"
              type="number"
            />
          </div>
          {/* Engine Run-in(Kms) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Engine Run-in(Kms) <span className="text-red-500">*</span>
            </label>
            <input
              name="engineRunIn"
              value={form.engineRunIn}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
              placeholder="Enter Engine Run-in(Kms)"
              type="number"
            />
          </div>
          {/* Gear Box Run-in(Kms) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gear Box Run-in(Kms) <span className="text-red-500">*</span>
            </label>
            <input
              name="gearBoxRunIn"
              value={form.gearBoxRunIn}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
              placeholder="Enter Gear Box Run-in(Kms)"
              type="number"
            />
          </div>
          {/* Axle Run-in(Kms) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Axle Run-in(Kms) <span className="text-red-500">*</span>
            </label>
            <input
              name="axleRunIn"
              value={form.axleRunIn}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
              placeholder="Enter Axle Run-in(Kms)"
              type="number"
            />
          </div>
          {/* Engine Oil Specification */}
          {!isEV && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Engine Oil Specification <span className="text-red-500">*</span>
              </label>
              <input
                name="engineOilSpecification"
                value={form.engineOilSpecification}
                onChange={handleChange}
                required={!isEV}
                className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
                placeholder="Enter Engine Oil Specification"
              />
            </div>
          )}
          {/* Axle Oil Specification */}
          {!isEV && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Axle Oil Specification <span className="text-red-500">*</span>
              </label>
              <input
                name="axleOilSpecification"
                value={form.axleOilSpecification}
                onChange={handleChange}
                required={!isEV}
                className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
                placeholder="Enter Axle Oil Specification"
              />
            </div>
          )}
          {/* Transmission Oil Specification */}
          {!isEV && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transmission Oil Specification{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="transmissionOilSpecification"
                value={form.transmissionOilSpecification}
                onChange={handleChange}
                required={!isEV}
                className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
                placeholder="Enter Transmission Oil Specification"
              />
            </div>
          )}
          {/* 2WD / 4WD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              2WD / 4WD <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <label>
                <input
                  type="radio"
                  name="driveType"
                  value="2WD"
                  checked={form.driveType === "2WD"}
                  onChange={handleRadioChange}
                  required
                />{" "}
                2WD
              </label>
              <label>
                <input
                  type="radio"
                  name="driveType"
                  value="4WD"
                  checked={form.driveType === "4WD"}
                  onChange={handleRadioChange}
                  required
                />{" "}
                4WD
              </label>
            </div>
          </div>
          {/* Driven Wheel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Driven Wheel <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {form.driveType === "2WD" ? (
                <>
                  <label>
                    <input
                      type="radio"
                      name="drivenWheel"
                      value="Front"
                      checked={form.drivenWheel === "Front"}
                      onChange={handleRadioChange}
                      required
                    />{" "}
                    Front
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="drivenWheel"
                      value="Rear"
                      checked={form.drivenWheel === "Rear"}
                      onChange={handleRadioChange}
                      required
                    />{" "}
                    Rear
                  </label>
                </>
              ) : form.driveType === "4WD" ? (
                // For 4WD, allow multiple selections with checkboxes
                <>
                  <label>
                    <input
                      type="checkbox"
                      name="drivenWheel"
                      value="Front"
                      checked={form.drivenWheel.includes("Front")}
                      onChange={(e) => {
                        const { value, checked } = e.target;
                        let newValue = form.drivenWheel || "";
                        if (checked) {
                          newValue = newValue ? `${newValue}, ${value}` : value;
                        } else {
                          newValue = newValue.split(", ").filter(item => item !== value).join(", ");
                        }
                        setForm({ ...form, drivenWheel: newValue });
                      }}
                    />{" "}
                    Front
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="drivenWheel"
                      value="Rear"
                      checked={form.drivenWheel.includes("Rear")}
                      onChange={(e) => {
                        const { value, checked } = e.target;
                        let newValue = form.drivenWheel || "";
                        if (checked) {
                          newValue = newValue ? `${newValue}, ${value}` : value;
                        } else {
                          newValue = newValue.split(", ").filter(item => item !== value).join(", ");
                        }
                        setForm({ ...form, drivenWheel: newValue });
                      }}
                    />{" "}
                    Rear
                  </label>
                </>
              ) : (
                <p className="flex gap-2">
                  <label>
                    <input
                      type="radio"
                      name="drivenWheel"
                      value="Front"
                      checked={form.drivenWheel === "Front"}
                      onChange={handleRadioChange}
                      required
                    />{" "}
                    Front
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="drivenWheel"
                      value="Rear"
                      checked={form.drivenWheel === "Rear"}
                      onChange={handleRadioChange}
                      required
                    />{" "}
                    Rear
                  </label>
                </p>
              )}
            </div>
          </div>
          {/* Intercooler Location */}
          {!isEV && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Intercooler Location<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <label>
                  <input
                    type="radio"
                    name="intercoolerLocation"
                    value="Front"
                    checked={form.intercoolerLocation === "Front"}
                    onChange={handleRadioChange}
                    required
                  />{" "}
                  Front
                </label>
                <label>
                  <input
                    type="radio"
                    name="intercoolerLocation"
                    value="Rear"
                    checked={form.intercoolerLocation === "Rear"}
                    onChange={handleRadioChange}
                    required
                  />{" "}
                  Rear
                </label>
                <label>
                  <input
                    type="radio"
                    name="intercoolerLocation"
                    value="Top"
                    checked={form.intercoolerLocation === "Top"}
                    onChange={handleRadioChange}
                    required
                  />{" "}
                  Top
                </label>
              </div>
            </div>
          )}
          {/* Gear Ratios or Final Drive Ratio */}
          {isEV ? null : (
            <>
              {/* 1st Gear Ratio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  1st Gear Ratio <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.gearRatio1.numerator}
                    onChange={(e) => handleRatioChange(e, "gearRatio1", "numerator")}
                    required
                    className="border rounded-lg px-3 py-2 w-1/2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter numerator"
                  />
                  <span className="text-gray-500">:</span>
                  <input
                    type="number"
                    value={form.gearRatio1.denominator}
                    onChange={(e) => handleRatioChange(e, "gearRatio1", "denominator")}
                    required
                    className="border rounded-lg px-3 py-2 w-1/2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter denominator"
                  />
                </div>
              </div>
              {/* 2nd Gear Ratio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  2nd Gear Ratio <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.gearRatio2.numerator}
                    onChange={(e) => handleRatioChange(e, "gearRatio2", "numerator")}
                    required
                    className="border rounded-lg px-3 py-2 w-1/2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter numerator"
                  />
                  <span className="text-gray-500">:</span>
                  <input
                    type="number"
                    value={form.gearRatio2.denominator}
                    onChange={(e) => handleRatioChange(e, "gearRatio2", "denominator")}
                    required
                    className="border rounded-lg px-3 py-2 w-1/2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter denominator"
                  />
                </div>
              </div>
              {/* 3rd Gear Ratio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  3rd Gear Ratio <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.gearRatio3.numerator}
                    onChange={(e) => handleRatioChange(e, "gearRatio3", "numerator")}
                    required
                    className="border rounded-lg px-3 py-2 w-1/2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter numerator"
                  />
                  <span className="text-gray-500">:</span>
                  <input
                    type="number"
                    value={form.gearRatio3.denominator}
                    onChange={(e) => handleRatioChange(e, "gearRatio3", "denominator")}
                    required
                    className="border rounded-lg px-3 py-2 w-1/2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter denominator"
                  />
                </div>
              </div>
              {/* 4th Gear Ratio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  4th Gear Ratio <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.gearRatio4.numerator}
                    onChange={(e) => handleRatioChange(e, "gearRatio4", "numerator")}
                    required
                    className="border rounded-lg px-3 py-2 w-1/2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter numerator"
                  />
                  <span className="text-gray-500">:</span>
                  <input
                    type="number"
                    value={form.gearRatio4.denominator}
                    onChange={(e) => handleRatioChange(e, "gearRatio4", "denominator")}
                    required
                    className="border rounded-lg px-3 py-2 w-1/2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter denominator"
                  />
                </div>
              </div>
              {/* 5th Gear Ratio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  5th Gear Ratio <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.gearRatio5.numerator}
                    onChange={(e) => handleRatioChange(e, "gearRatio5", "numerator")}
                    required
                    className="border rounded-lg px-3 py-2 w-1/2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter numerator"
                  />
                  <span className="text-gray-500">:</span>
                  <input
                    type="number"
                    value={form.gearRatio5.denominator}
                    onChange={(e) => handleRatioChange(e, "gearRatio5", "denominator")}
                    required
                    className="border rounded-lg px-3 py-2 w-1/2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter denominator"
                  />
                </div>
              </div>
              {/* Reverse Gear Ratio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reverse Gear Ratio <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.reverseGearRatio.numerator}
                    onChange={(e) => handleRatioChange(e, "reverseGearRatio", "numerator")}
                    required
                    className="border rounded-lg px-3 py-2 w-1/2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter numerator"
                  />
                  <span className="text-gray-500">:</span>
                  <input
                    type="number"
                    value={form.reverseGearRatio.denominator}
                    onChange={(e) => handleRatioChange(e, "reverseGearRatio", "denominator")}
                    required
                    className="border rounded-lg px-3 py-2 w-1/2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter denominator"
                  />
                </div>
              </div>
            </>
          )}
          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <input
              name="department"
              value={form.department}
              readOnly
              className="border rounded-lg px-3 py-2 w-full bg-gray-100 text-gray-500"
              placeholder="Department"
            />
          </div>
        </div>
        {/* Buttons */}
        <div className="flex gap-4 mt-10 justify-end">
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow-md transition-all"
          >
            {isEditMode ? "UPDATE VEHICLE" : "ADD VEHICLE"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="bg-gray-100 hover:bg-gray-200 text-red-500 border border-red-500 px-6 py-3 rounded-lg shadow-md transition-all"
          >
            CLEAR
          </button>
        </div>
      </form>
    </>
  );
}