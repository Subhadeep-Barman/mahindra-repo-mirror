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
    vehicleNumber: "",
    transmissionType: "",
    finalDriveAxleRatio: "",
    engineNumber: "",
    domain: "",
    coastDownTestReportReference: "",
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
    gearRatio: "",
  });

  const dummyData = {
    project: "Project A",
    vehicleBuildLevel: "Level 1",
    vehicleModel: "Bolero",
    vehicleBodyNumber: "V.B.NO123456",
    vehicleNumber: "MH12AB1234",
    transmissionType: "MT",
    finalDriveAxleRatio: "3.73",
    engineNumber: "EN987654",
    domain: "OBD",
    coastDownTestReportReference: "CDTR-001",
    tyreMake: "MRF",
    tyreSize: "215/75R15",
    tyrePressureFront: "32",
    tyrePressureRear: "34",
    tyreRunIn: "500",
    engineRunIn: "1000",
    gearBoxRunIn: "800",
    axleRunIn: "600",
    engineOilSpecification: "5W30",
    axleOilSpecification: "80W90",
    transmissionOilSpecification: "75W85",
    driveType: "2WD",
    drivenWheel: "Rear",
    intercoolerLocation: "Front",
    gearRatio: "4.10",
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRadioChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Helper to generate UUID for vehicle_id
  function generateVehicleId() {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    // fallback for older browsers
    return "xxxxxxxxyxxxxyxxxyxxxxyxxxxyxxxxyx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      return r.toString(16);
    });
  }

  // Map form state to API schema
  function mapFormToApi(form) {
    return {
      vehicle_id: generateVehicleId(),
      project_code: form.project,
      vehicle_serial_number: form.engineNumber, // Assuming engineNumber as serial
      vehicle_body_number: form.vehicleBodyNumber,
      vehicle_model: form.vehicleModel,
      vehicle_number: form.vehicleNumber,
      vehicle_build_level: form.vehicleBuildLevel,
      transmission_type: form.transmissionType,
      final_drive_axle_ratio: form.finalDriveAxleRatio,
      domain: form.domain,
      coast_down_test_reference_report: form.coastDownTestReportReference,
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
      gear_ratio: form.gearRatio,
      // id_of_creator, created_on, id_of_updater, updated_on handled by backend
    };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (let key in form) {
      if (!form[key]) {
        alert("Please fill all fields.");
        return;
      }
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
      vehicleNumber: "",
      transmissionType: "",
      finalDriveAxleRatio: "",
      engineNumber: "",
      domain: "",
      coastDownTestReportReference: "",
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
      gearRatio: "",
    });
    if (onClear) onClear();
  };

  const handleFillDummy = () => {
    setForm(dummyData);
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
                <h1 className="text-sm font-medium text-gray-600 dark:text-red-500 ">
                  VTC CHENNAI
                </h1>
                <h2 className="text-xl font-bold text-gray-900 dark:text-red-500">
                  NEW VEHICLE
                </h2>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {["Job Order", "Vehicle", "Engine"].map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "outline"}
                  onClick={() => handleTabClick(tab)}
                  className={`rounded-xl ${
                    tab === "Job Order"
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : tab === "Vehicle" || tab === "Engine"
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "text-red-500 border-red-500 hover:bg-red-50"
                  }`}
                >
                  {tab}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Project */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Project <span className="text-red-500">*</span>
            </label>
            <select
              name="project"
              value={form.project}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full"
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
            <label className="block text-xs font-semibold mb-1">
              Vehicle Build Level <span className="text-red-500">*</span>
            </label>
            <input
              name="vehicleBuildLevel"
              value={form.vehicleBuildLevel}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full"
              placeholder="Enter Vehicle Build Level"
            />
          </div>
          {/* Vehicle Model */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Vehicle Model <span className="text-red-500">*</span>
            </label>
            <select
              name="vehicleModel"
              value={form.vehicleModel}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full"
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
            <label className="block text-xs font-semibold mb-1">
              Vehicle Body Number <span className="text-red-500">*</span>
            </label>
            <input
              name="vehicleBodyNumber"
              value={form.vehicleBodyNumber}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full"
              placeholder="Enter Vehicle Body Number"
            />
          </div>
          {/* Vehicle Number */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Vehicle Number <span className="text-red-500">*</span>
            </label>
            <input
              name="vehicleNumber"
              value={form.vehicleNumber}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full"
              placeholder="Enter Vehicle Number"
            />
          </div>
          {/* Transmission Type */}
          <div>
            <label className="block text-xs font-semibold mb-1">
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
            <label className="block text-xs font-semibold mb-1">
              Final Drive Axle Ratio <span className="text-red-500">*</span>
            </label>
            <input
              name="finalDriveAxleRatio"
              value={form.finalDriveAxleRatio}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full"
              placeholder="Enter"
            />
          </div>
          {/* Engine Number */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Engine Number <span className="text-red-500">*</span>
            </label>
            <input
              name="engineNumber"
              value={form.engineNumber}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full bg-gray-100"
              placeholder="Auto-fetched"
              readOnly
            />
          </div>
          {/* Domain */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Domain <span className="text-red-500">*</span>
            </label>
            <select
              name="domain"
              value={form.domain}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full"
            >
              <option value="">Select Domain</option>
              {domainOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          {/* Coast Down Test Report Reference */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Coast Down Test Report Reference{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              name="coastDownTestReportReference"
              value={form.coastDownTestReportReference}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full"
              placeholder="Enter Reference"
            />
          </div>
          {/* Tyre Make */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Tyre Make <span className="text-red-500">*</span>
            </label>
            <input
              name="tyreMake"
              value={form.tyreMake}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full"
              placeholder="Enter Tyre Make"
            />
          </div>
          {/* Tyre Size */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Tyre Size <span className="text-red-500">*</span>
            </label>
            <input
              name="tyreSize"
              value={form.tyreSize}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full"
              placeholder="Enter Tyre Size"
            />
          </div>
          {/* Tyre Pressure Front */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Tyre Pressure Front(psi) <span className="text-red-500">*</span>
            </label>
            <input
              name="tyrePressureFront"
              value={form.tyrePressureFront}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full"
              placeholder="Enter Front Tyre Pressure"
              type="number"
            />
          </div>
          {/* Tyre Pressure Rear */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Tyre Pressure Rear(psi) <span className="text-red-500">*</span>
            </label>
            <input
              name="tyrePressureRear"
              value={form.tyrePressureRear}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full"
              placeholder="Enter Rear Tyre Pressure"
              type="number"
            />
          </div>
          {/* Tyre Run-in(Kms) */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Tyre Run-in(Kms) <span className="text-red-500">*</span>
            </label>
            <input
              name="tyreRunIn"
              value={form.tyreRunIn}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full"
              placeholder="Enter Tyre Run-in(Kms)"
              type="number"
            />
          </div>
          {/* Engine Run-in(Kms) */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Engine Run-in(Kms) <span className="text-red-500">*</span>
            </label>
            <input
              name="engineRunIn"
              value={form.engineRunIn}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full"
              placeholder="Enter Engine Run-in(Kms)"
              type="number"
            />
          </div>
          {/* Gear Box Run-in(Kms) */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Gear Box Run-in(Kms) <span className="text-red-500">*</span>
            </label>
            <input
              name="gearBoxRunIn"
              value={form.gearBoxRunIn}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full"
              placeholder="Enter Gear Box Run-in(Kms)"
              type="number"
            />
          </div>
          {/* Axle Run-in(Kms) */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Axle Run-in(Kms) <span className="text-red-500">*</span>
            </label>
            <input
              name="axleRunIn"
              value={form.axleRunIn}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full"
              placeholder="Enter Axle Run-in(Kms)"
              type="number"
            />
          </div>
          {/* Engine Oil Specification */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Engine Oil Specification <span className="text-red-500">*</span>
            </label>
            <input
              name="engineOilSpecification"
              value={form.engineOilSpecification}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full"
              placeholder="Enter Engine Oil Specification"
            />
          </div>
          {/* Axle Oil Specification */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Axle Oil Specification <span className="text-red-500">*</span>
            </label>
            <input
              name="axleOilSpecification"
              value={form.axleOilSpecification}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full"
              placeholder="Enter Axle Oil Specification"
            />
          </div>
          {/* Transmission Oil Specification */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Transmission Oil Specification{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              name="transmissionOilSpecification"
              value={form.transmissionOilSpecification}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full"
              placeholder="Enter Transmission Oil Specification"
            />
          </div>
          {/* 2WD / 4WD */}
          <div>
            <label className="block text-xs font-semibold mb-1">
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
            <label className="block text-xs font-semibold mb-1">
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
            <label className="block text-xs font-semibold mb-1">
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
          <div>
            <label className="block text-xs font-semibold mb-1">
              Gear Ratio <span className="text-red-500">*</span>
            </label>
            <input
              name="gearRatio"
              value={form.gearRatio}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1 w-full"
              placeholder="Enter Gear Ratio"
            />
          </div>
        </div>
        {/* Buttons */}
        <div className="flex gap-4 mt-8 justify-end">
          <button
            type="submit"
            className="bg-red-500 text-white px-6 py-2 rounded flex items-center gap-2"
          >
            <span>ADD VEHICLE</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="bg-white border border-red-500 text-red-500 px-6 py-2 rounded flex items-center gap-2"
          >
            <span>CLEAR</span>
          </button>
          <button
            type="button"
            onClick={handleFillDummy}
            className="bg-gray-200 border border-gray-400 text-gray-700 px-6 py-2 rounded flex items-center gap-2"
          >
            <span>FILL DUMMY DATA</span>
          </button>
        </div>
        <div className="text-xs text-red-500 mt-2">*required field</div>
      </form>
    </>
  );
}
