import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/UI/button";
import { ArrowBack } from "@mui/icons-material";
import Navbar1 from "@/components/UI/navbar";
import { useNavigate } from "react-router-dom";
import useStore from "@/store/useStore";
const apiURL = import.meta.env.VITE_BACKEND_URL;

export default function VehicleEngineForm({ onSubmit, onClear }) {
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

  const [form, setForm] = useState({
    project: "",
    vehicleBuildLevel: "",
    vehicleModel: "",
    vehicleBodyNumber: "",
    vehicleSerialNumber: "", // Added
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
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRadioChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRatioChange = (e, field, part) => {
    setForm({
      ...form,
      [field]: { ...form[field], [part]: e.target.value },
    });
  };

  // Map form state to API schema
  function mapFormToApi(form) {
    return {
      project_code: form.project,
      vehicle_body_number: form.vehicleBodyNumber,
      vehicle_model: form.vehicleModel,
      vehicle_serial_number: form.vehicleSerialNumber, // Added
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
      engine_oil_specification: form.engineOilSpecification,
      axle_oil_specification: form.axleOilSpecification,
      transmission_oil_specification: form.transmissionOilSpecification,
      wd_type: form.driveType,
      driven_wheel: form.drivenWheel,
      intercooler_location: form.intercoolerLocation,
      gear_ratio_1:
        form.gearRatio1.numerator && form.gearRatio1.denominator
          ? `${form.gearRatio1.numerator}:${form.gearRatio1.denominator}`
          : "",
      gear_ratio_2:
        form.gearRatio2.numerator && form.gearRatio2.denominator
          ? `${form.gearRatio2.numerator}:${form.gearRatio2.denominator}`
          : "",
      gear_ratio_3:
        form.gearRatio3.numerator && form.gearRatio3.denominator
          ? `${form.gearRatio3.numerator}:${form.gearRatio3.denominator}`
          : "",
      gear_ratio_4:
        form.gearRatio4.numerator && form.gearRatio4.denominator
          ? `${form.gearRatio4.numerator}:${form.gearRatio4.denominator}`
          : "",
      gear_ratio_5:
        form.gearRatio5.numerator && form.gearRatio5.denominator
          ? `${form.gearRatio5.numerator}:${form.gearRatio5.denominator}`
          : "",
      reverse_gear_ratio:
        form.reverseGearRatio.numerator && form.reverseGearRatio.denominator
          ? `${form.reverseGearRatio.numerator}:${form.reverseGearRatio.denominator}`
          : "",
      // id_of_creator, created_on, id_of_updater, updated_on handled by backend
    };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Map of form keys to user-friendly field names
    const fieldNames = {
      project: "Project",
      vehicleBuildLevel: "Vehicle Build Level",
      vehicleModel: "Vehicle Model",
      vehicleBodyNumber: "Vehicle Body Number",
      vehicleSerialNumber: "Vehicle Serial Number", // Added
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
    };

    // Check for missing fields
    const missingFields = [];
    for (let key in form) {
      if (
        typeof form[key] === "object" &&
        form[key] !== null &&
        ("numerator" in form[key] || "denominator" in form[key])
      ) {
        // For ratio fields
        if (!form[key].numerator || !form[key].denominator) {
          missingFields.push(fieldNames[key]);
        }
      } else if (!form[key]) {
        missingFields.push(fieldNames[key]);
      }
    }
    if (missingFields.length > 0) {
      alert(
        "Please fill all fields.\nMissing: " +
        missingFields.join(", ")
      );
      return;
    }
    const payload = mapFormToApi(form);

    try {
      const response = await axios.post(`${apiURL}/vehicles`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      if (onSubmit) onSubmit(response.data);
      else alert("Vehicle added successfully!");
    } catch (err) {
      alert(
        "Error adding vehicle: " + (err.response?.data?.detail || err.message)
      );
    }
  };

  const handleClear = () => {
    setForm({
      project: "",
      vehicleBuildLevel: "",
      vehicleModel: "",
      vehicleBodyNumber: "",
      vehicleSerialNumber: "", // Added
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
      gearRatio: { numerator: "", denominator: "" },
      gearRatio1: { numerator: "", denominator: "" },
      gearRatio2: { numerator: "", denominator: "" },
      gearRatio3: { numerator: "", denominator: "" },
      gearRatio4: { numerator: "", denominator: "" },
      gearRatio5: { numerator: "", denominator: "" },
      reverseGearRatio: { numerator: "", denominator: "" },
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
      <div className="bg-white dark:bg-gray-900 shadow-md">
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
                  VTC CHENNAI
                </h1>
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
          {/* Vehicle Serial Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vehicle Serial Number <span className="text-red-500">*</span>
            </label>
            <input
              name="vehicleSerialNumber"
              value={form.vehicleSerialNumber}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
              placeholder="Enter Vehicle Serial Number"
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
          {/* Final Drive Axle Ratio */}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Engine Oil Specification <span className="text-red-500">*</span>
            </label>
            <input
              name="engineOilSpecification"
              value={form.engineOilSpecification}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
              placeholder="Enter Engine Oil Specification"
            />
          </div>
          {/* Axle Oil Specification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Axle Oil Specification <span className="text-red-500">*</span>
            </label>
            <input
              name="axleOilSpecification"
              value={form.axleOilSpecification}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
              placeholder="Enter Axle Oil Specification"
            />
          </div>
          {/* Transmission Oil Specification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transmission Oil Specification{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              name="transmissionOilSpecification"
              value={form.transmissionOilSpecification}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
              placeholder="Enter Transmission Oil Specification"
            />
          </div>
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
            </div>
          </div>
          {/* Intercooler Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Intercooler Location <span className="text-red-500">*</span>
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
          {/* Gear Ratio */}
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
        </div>
        {/* Buttons */}
        <div className="flex gap-4 mt-10 justify-end">
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow-md transition-all"
          >
            ADD VEHICLE
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