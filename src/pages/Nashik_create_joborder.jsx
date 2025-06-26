"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select";
import Navbar2 from "@/components/UI/navbar2";
import { useNavigate } from "react-router-dom";

// Mock data for dropdowns
const projectCodes = ["U352", "U952"];
const vehicleBodyNumbers = [
  { body: "V.B.NO123456", vehicle: "V.S.NO123456", engine: "E.S.NO123456", engineType: "Diesel" },
  { body: "V.B.NO654321", vehicle: "V.S.NO654321", engine: "E.S.NO654321", engineType: "Gasoline" },
];
const engineTypes = ["Gasoline", "Diesel", "CNG", "HYBRID", "ePT"];
const domains = ["OBD", "BOE", "SCR", "GENERAL"];
const departments = ["VTC JO", "RDE JO", "VTC_JO Nashik"];

export default function CreateJobOrder() {
  const [form, setForm] = useState({
    projectCode: "",
    vehicleBuildLevel: "",
    vehicleModel: "",
    vehicleBodyNumber: "",
    vehicleNumber: "",
    transmissionType: "",
    finalDriveAxleRatio: "",
    engineNumber: "",
    engineType: "",
    domain: "",
    department: "",
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
    cdReportRef: "",
    vehicleRefMass: "",
    aN: "",
    bNkmph: "",
    cNkmph2: "",
    f0N: "",
    f1Nkmph: "",
    f2Nkmph2: "",
  });

  const [vehicleFormData, setVehicleFormData] = useState(null);
  const [engineFormData, setEngineFormData] = useState(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(true);
  const [showEngineDetails, setShowEngineDetails] = useState(true);

  // Test state
  const [tests, setTests] = useState([]);

  // Handler to add a new test
  const handleAddTest = () => {
    setTests(prev => [
      ...prev,
      {
        testType: "",
        objective: "",
        vehicleLocation: "",
        cycleGearShift: "",
        datasetName: "",
        inertiaClass: "",
        dpf: "",
        datasetRefreshed: "",
        ess: "",
        mode: "",
        hardwareChange: "",
        instructions: "",
        shift: "",
        preferredDate: "",
        uploadDocuments: null,
      },
    ]);
  };

  // Handler to update a test
  const handleTestChange = (idx, field, value) => {
    setTests(prev =>
      prev.map((test, i) =>
        i === idx ? { ...test, [field]: value } : test
      )
    );
  };

  // Handler to delete a test
  const handleDeleteTest = (idx) => {
    setTests(prev => prev.filter((_, i) => i !== idx));
  };

  const handleTabClick = (tab) => {
  setActiveTab(tab);
  if (tab === "Job Order") navigate("/nashik/joborder");
  else if (tab === "Vehicle") navigate("/nashik/vehicle");
  else if (tab === "Engine") navigate("/nashik/engine");
};

  // Fetch vehicle and engine form data from localStorage
  useEffect(() => {
    const vData = localStorage.getItem("vehicleFormData");
    if (vData) setVehicleFormData(JSON.parse(vData));
    const eData = localStorage.getItem("engineFormData");
    if (eData) setEngineFormData(JSON.parse(eData));
  }, []);

  // Get engine numbers filtered by selected vehicle body number
  const engineNumbers = form.vehicleBodyNumber
    ? vehicleBodyNumbers
        .filter(v => v.body === form.vehicleBodyNumber)
        .map(v => v.engine)
    : vehicleBodyNumbers.map(v => v.engine);

  // Handle dropdown/input changes
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // When vehicle body number changes, auto-fill vehicle number and engine type, but let engine number be selected
  const handleVehicleBodyChange = (value) => {
    const found = vehicleBodyNumbers.find((v) => v.body === value);
    setForm((prev) => ({
      ...prev,
      vehicleBodyNumber: value,
      vehicleNumber: found ? found.vehicle : "",
      engineNumber: "", // reset engine number so user can select
      engineType: found ? found.engineType : "",
    }));
  };

  // When engine number changes, optionally auto-fill engine type if needed
  const handleEngineNumberChange = (value) => {
    const found = vehicleBodyNumbers.find((v) => v.engine === value);
    setForm((prev) => ({
      ...prev,
      engineNumber: value,
      engineType: found ? found.engineType : prev.engineType,
    }));
  };

  return (
    <>
      <Navbar2 />
      <div className="bg-white dark:bg-black min-h-screen">
        {/* Header Row */}
        <div className="flex items-center justify-between px-8 pt-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" className="bg-red-600 text-white px-3 py-1 rounded">Nashik Job Order</Button>
            <span className="font-semibold text-lg">New Job Order</span>
          </div>
          <div className="flex gap-2">
            <Button className="bg-red-600 text-white px-4 py-1 rounded">Job Order</Button>
            <Button className="bg-white text-red-600 border border-red-600 px-4 py-1 rounded">Vehicle</Button>
            <Button className="bg-white text-red-600 border border-red-600 px-4 py-1 rounded">Engine</Button>
          </div>
        </div>
        {/* Form Row */}
        <form className="flex flex-row gap-6 px-8 py-6 items-end">
          {/* Project Code */}
          <div className="flex flex-col">
            <Label htmlFor="projectCode">
              Project <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.projectCode}
              onValueChange={(value) => handleChange("projectCode", value)}
              required
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {projectCodes.map((code) => (
                  <SelectItem key={code} value={code}>{code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Vehicle Body Number */}
          <div className="flex flex-col">
            <Label htmlFor="vehicleBodyNumber">
              Vehicle Body Number <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.vehicleBodyNumber}
              onValueChange={handleVehicleBodyChange}
              required
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {vehicleBodyNumbers.map((v) => (
                  <SelectItem key={v.body} value={v.body}>{v.body}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Vehicle Number (auto) */}
          <div className="flex flex-col">
            <Label htmlFor="vehicleNumber">
              Vehicle Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vehicleNumber"
              value={form.vehicleNumber}
              readOnly
              className="w-44"
              placeholder="Auto-fetched"
              required
            />
          </div>
          {/* Engine Number (dropdown) */}
          <div className="flex flex-col">
            <Label htmlFor="engineNumber">
              Engine Number <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.engineNumber}
              onValueChange={handleEngineNumberChange}
              required
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {engineNumbers.map((engine) => (
                  <SelectItem key={engine} value={engine}>{engine}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Type of Engine */}
          <div className="flex flex-col">
            <Label htmlFor="engineType">
              Type of Engine <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.engineType}
              onValueChange={(value) => handleChange("engineType", value)}
              required
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {engineTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Domain */}
          <div className="flex flex-col">
            <Label htmlFor="domain">
              Domain <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.domain}
              onValueChange={(value) => handleChange("domain", value)}
              required
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {domains.map((domain) => (
                  <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Department */}
          <div className="flex flex-col">
            <Label htmlFor="department">
              Department <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.department}
              onValueChange={(value) => handleChange("department", value)}
              required
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dep) => (
                  <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
        
        {/* Vehicle Details Accordion */}
        {vehicleFormData && (
          <div className="mx-8 mt-2 mb-4 border rounded shadow">
            <div
              className="flex items-center justify-between bg-gray-100 border-t-4 border-red-600 px-4 py-2 cursor-pointer"
              onClick={() => setShowVehicleDetails((prev) => !prev)}
            >
              <span className="font-semibold text-sm">Vehicle Details (from Vehicle Form)</span>
              <span>{showVehicleDetails ? "▲" : "▼"}</span>
            </div>
            {showVehicleDetails && (
              <div className="bg-white px-4 py-4">
                <div className="grid grid-cols-4 gap-4 text-xs">
                  {Object.entries(vehicleFormData).map(([label, value]) => (
                    <div key={label}>
                      <span className="font-semibold">{label}: </span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Engine Details Accordion */}
        {engineFormData && (
          <div className="mx-8 mt-2 mb-4 border rounded shadow">
            <div
              className="flex items-center justify-between bg-gray-100 border-t-4 border-red-600 px-4 py-2 cursor-pointer"
              onClick={() => setShowEngineDetails((prev) => !prev)}
            >
              <span className="font-semibold text-sm">Engine Details (from Engine Form)</span>
              <span>{showEngineDetails ? "▲" : "▼"}</span>
            </div>
            {showEngineDetails && (
              <div className="bg-white px-4 py-4">
                <div className="grid grid-cols-4 gap-4 text-xs">
                  {Object.entries(engineFormData).map(([label, value]) => (
                    <div key={label}>
                      <span className="font-semibold">{label}: </span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Test Forms */}
        {tests.map((test, idx) => (
          <div key={idx} className="mx-8 mb-4 border rounded shadow px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-sm text-yellow-700">Test {idx + 1}</div>
              <Button
                variant="ghost"
                className="text-xs text-red-600 px-2 py-0"
                type="button"
                onClick={() => handleDeleteTest(idx)}
              >
                Delete
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-2">
              <div>
                <Label>Test Type</Label>
                <Select
                  value={test.testType}
                  onValueChange={v => handleTestChange(idx, "testType", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Type1">Type1</SelectItem>
                    <SelectItem value="Type2">Type2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Objective of the Test <span className="text-red-500">*</span></Label>
                <Input
                  value={test.objective}
                  onChange={e => handleTestChange(idx, "objective", e.target.value)}
                  placeholder="TESTING"
                />
              </div>
              <div>
                <Label>Vehicle Location</Label>
                <Input
                  value={test.vehicleLocation}
                  onChange={e => handleTestChange(idx, "vehicleLocation", e.target.value)}
                  placeholder="Enter Vehicle Location"
                />
              </div>
              <div>
                <Label>Upload Documents</Label>
                <Input
                  type="file"
                  onChange={e => handleTestChange(idx, "uploadDocuments", e.target.files[0])}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-2">
              <div>
                <Label>Cycle Gear Shift</Label>
                <Input
                  value={test.cycleGearShift}
                  onChange={e => handleTestChange(idx, "cycleGearShift", e.target.value)}
                  placeholder="Enter Cycle Gear Shift"
                />
              </div>
              <div>
                <Label>Dataset Name</Label>
                <Input
                  value={test.datasetName}
                  onChange={e => handleTestChange(idx, "datasetName", e.target.value)}
                  placeholder="Enter Dataset Name"
                />
              </div>
              <div>
                <Label>Inertia Class</Label>
                <Select
                  value={test.inertiaClass}
                  onValueChange={v => handleTestChange(idx, "inertiaClass", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Class1">Class1</SelectItem>
                    <SelectItem value="Class2">Class2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>DPF</Label>
                <div className="flex gap-2 mt-2">
                  <label><input type="radio" name={`dpf${idx}`} value="Yes" checked={test.dpf === "Yes"} onChange={() => handleTestChange(idx, "dpf", "Yes")} /> Yes</label>
                  <label><input type="radio" name={`dpf${idx}`} value="No" checked={test.dpf === "No"} onChange={() => handleTestChange(idx, "dpf", "No")} /> No</label>
                  <label><input type="radio" name={`dpf${idx}`} value="NA" checked={test.dpf === "NA"} onChange={() => handleTestChange(idx, "dpf", "NA")} /> NA</label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-2">
              <div>
                <Label>Dataset Refreshed</Label>
                <div className="flex gap-2 mt-2">
                  <label><input type="radio" name={`datasetRefreshed${idx}`} value="Yes" checked={test.datasetRefreshed === "Yes"} onChange={() => handleTestChange(idx, "datasetRefreshed", "Yes")} /> Yes</label>
                  <label><input type="radio" name={`datasetRefreshed${idx}`} value="No" checked={test.datasetRefreshed === "No"} onChange={() => handleTestChange(idx, "datasetRefreshed", "No")} /> No</label>
                </div>
              </div>
              <div>
                <Label>ESS</Label>
                <div className="flex gap-2 mt-2">
                  <label><input type="radio" name={`ess${idx}`} value="On" checked={test.ess === "On"} onChange={() => handleTestChange(idx, "ess", "On")} /> On</label>
                  <label><input type="radio" name={`ess${idx}`} value="Off" checked={test.ess === "Off"} onChange={() => handleTestChange(idx, "ess", "Off")} /> Off</label>
                  <label><input type="radio" name={`ess${idx}`} value="NA" checked={test.ess === "NA"} onChange={() => handleTestChange(idx, "ess", "NA")} /> NA</label>
                </div>
              </div>
              <div>
                <Label>Mode</Label>
                <Select
                  value={test.mode}
                  onValueChange={v => handleTestChange(idx, "mode", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mode1">Mode1</SelectItem>
                    <SelectItem value="Mode2">Mode2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Hardware Change</Label>
                <Input
                  value={test.hardwareChange}
                  onChange={e => handleTestChange(idx, "hardwareChange", e.target.value)}
                  placeholder="Enter Hardware Change"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-2">
              <div className="col-span-2">
                <Label>Any Specific Instruction to VTC Team</Label>
                <Input
                  value={test.instructions}
                  onChange={e => handleTestChange(idx, "instructions", e.target.value)}
                  placeholder="Enter Instructions"
                />
              </div>
              <div>
                <Label>Shift</Label>
                <Select
                  value={test.shift}
                  onValueChange={v => handleTestChange(idx, "shift", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Shift1">Shift1</SelectItem>
                    <SelectItem value="Shift2">Shift2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Preferred Date</Label>
                <Input
                  type="date"
                  value={test.preferredDate}
                  onChange={e => handleTestChange(idx, "preferredDate", e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button className="bg-red-600 text-white text-xs px-6 py-2 rounded">✓ UPDATE JOB ORDER</Button>
            </div>
          </div>
        ))}

        {/* Test Actions */}
        <div className="flex items-center mt-4 gap-6 px-8">
          <Button variant="ghost" className="text-xs text-blue-700 px-0" onClick={handleAddTest}>+ ADD TEST</Button>
          <Button variant="ghost" className="text-xs text-blue-700 px-0">+ CFT MEMBERS</Button>
          <div className="flex-1"></div>
        </div>

        {/* Coast Down Data (CD) Section */}
        <div className="mx-8 mb-4 border rounded shadow px-6 py-4">
          <div className="mb-2 font-semibold text-sm">Coast Down Data (CD)</div>
          <div className="mb-2">
            <Label htmlFor="cdReportRef">Coast Down Test Report Reference</Label>
            <Input
              id="cdReportRef"
              placeholder="Enter Coast Test Report Ref."
              className="w-80 mt-1"
              value={form.cdReportRef}
              onChange={e => setForm(prev => ({ ...prev, cdReportRef: e.target.value }))}
            />
          </div>
          <div className="mb-2 font-semibold text-xs">CD Values</div>
          <div className="grid grid-cols-7 gap-4">
            <div>
              <Label htmlFor="vehicleRefMass" className="text-xs">Vehicle Reference mass (Kg)</Label>
              <Input
                id="vehicleRefMass"
                placeholder="Enter Vehicle Reference mass (Kg)"
                className="mt-1"
                value={form.vehicleRefMass}
                onChange={e => setForm(prev => ({ ...prev, vehicleRefMass: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="aN" className="text-xs">A (N)</Label>
              <Input
                id="aN"
                placeholder="Enter A (N)"
                className="mt-1"
                value={form.aN}
                onChange={e => setForm(prev => ({ ...prev, aN: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="bNkmph" className="text-xs">B (N/kmph)</Label>
              <Input
                id="bNkmph"
                placeholder="Enter B (N/kmph)"
                className="mt-1"
                value={form.bNkmph}
                onChange={e => setForm(prev => ({ ...prev, bNkmph: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="cNkmph2" className="text-xs">C (N/kmph^2)</Label>
              <Input
                id="cNkmph2"
                placeholder="Enter C (N/kmph^2)"
                className="mt-1"
                value={form.cNkmph2}
                onChange={e => setForm(prev => ({ ...prev, cNkmph2: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="f0N" className="text-xs">F0 (N)</Label>
              <Input
                id="f0N"
                placeholder="Enter F0 (N)"
                className="mt-1"
                value={form.f0N}
                onChange={e => setForm(prev => ({ ...prev, f0N: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="f1Nkmph" className="text-xs">F1 (N/kmph)</Label>
              <Input
                id="f1Nkmph"
                placeholder="Enter F1 (N/kmph)"
                className="mt-1"
                value={form.f1Nkmph}
                onChange={e => setForm(prev => ({ ...prev, f1Nkmph: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="f2Nkmph2" className="text-xs">F2 (N/kmph^2)</Label>
              <Input
                id="f2Nkmph2"
                placeholder="Enter F2 (N/kmph^2)"
                className="mt-1"
                value={form.f2Nkmph2}
                onChange={e => setForm(prev => ({ ...prev, f2Nkmph2: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex items-center mt-4 gap-6">
            <Button className="bg--900 text-white text-xs px-6 py-2 rounded">CREATE JOB ORDER</Button>
            <Button
              className="bg-white text-blue-900 border border-blue-900 text-xs px-6 py-2 rounded"
              type="button"
              onClick={() =>
                setForm(prev => ({
                  ...prev,
                  cdReportRef: "",
                  vehicleRefMass: "",
                  aN: "",
                  bNkmph: "",
                  cNkmph2: "",
                  f0N: "",
                  f1Nkmph: "",
                  f2Nkmph2: "",
                }))
              }
            >
              CLEAR
            </Button>
          </div>
        </div>

        {/* Red line below */}
        <div className="border-b-4 border-red-600 mx-8" />
      </div>
    </>
  );
}