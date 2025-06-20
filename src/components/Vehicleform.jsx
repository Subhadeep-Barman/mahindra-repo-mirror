import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowBack } from "@mui/icons-material";
import Navbar2 from "@/components/ui/navbar2";
import { useNavigate } from "react-router-dom";

export default function VehicleEngineForm({ onSubmit, onClear }) {
  // Replace these with your actual lists
  const projectOptions = ["Project A", "Project B"];
  const vehicleModelOptions = ["Bolero", "Scorpio", "XUV700"];
  const domainOptions = ["OBD", "BOE", "SCR", "GENERAL"];

  const [form, setForm] = useState({
    project: "",
    vehicleBuildLevel: "",
    vehicleModel: "",
    vehicleBodyNumber: "",
    vehicleNumber: "",
    transmissionType: "",
    finalDriveAxleRatio: "",
    engineNumber: "", // Auto-fetch in your logic
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRadioChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    for (let key in form) {
      if (!form[key]) {
        alert("Please fill all fields.");
        return;
      }
    }
    if (onSubmit) onSubmit(form);
    else console.log(form);
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

  const [activeTab, setActiveTab] = useState("Vehicle");
const navigate = useNavigate();

const handleTabClick = (tab) => {
  setActiveTab(tab);
  if (tab === "Job Order") navigate("/cjoborder");
  else if (tab === "Vehicle") navigate("/vtcvehicle/new");
  else if (tab === "Engine") navigate("/engineform");
};

const handleBack = () => {
  navigate(-1);
};
  return (<>
  <Navbar2 />
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <option key={opt} value={opt}>{opt}</option>
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
              <option key={opt} value={opt}>{opt}</option>
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
        {/* Engine Number (auto-fetch) */}
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
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        {/* Coast Down Test Report Reference */}
        <div>
          <label className="block text-xs font-semibold mb-1">
            Coast Down Test Report Reference <span className="text-red-500">*</span>
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
            Transmission Oil Specification <span className="text-red-500">*</span>
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
      </div>
      <div className="text-xs text-red-500 mt-2">*required field</div>
    </form>
  </>  
  );
}