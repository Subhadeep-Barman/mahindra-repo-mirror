"use client";
import { ArrowBack } from "@mui/icons-material";
import { Button } from "@/components/UI/button";
import DropzoneFileList from "@/components/UI/DropzoneFileList";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import Navbar1 from "@/components/UI/navbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Switch } from "@/components/UI/switch";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import showSnackbar from "@/utils/showSnackbar";

const apiURL = import.meta.env.VITE_BACKEND_URL;

export default function EditTestOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, userId, userName } = useAuth();

  // Get test order and job order ID from location state
  const { testOrder, jobOrderId, returnPath, returnState } = location.state || {};

  // State to check if user is a Test Engineer
  const isTestEngineer = userRole === "TestEngineer";
  const isProjectTeam = userRole === "ProjectTeam";

  // State for test data
  const [test, setTest] = useState({
    testOrderId: testOrder?.test_order_id || "",
    testType: testOrder?.test_type || "",
    objective: testOrder?.test_objective || "",
    vehicleLocation: testOrder?.vehicle_location || "",
    cycleGearShift: testOrder?.cycle_gear_shift || "",
    datasetName: testOrder?.dataset_name || "",
    inertiaClass: testOrder?.inertia_class || "",
    dpf: testOrder?.dpf || "",
    dpfRegenOccurs: testOrder?.dpf_regen_occurs || "",
    datasetflashed: testOrder?.dataset_flashed === true ? "Yes" :
      testOrder?.dataset_flashed === false ? "No" : "",
    ess: testOrder?.ess || "",
    mode: testOrder?.mode || "",
    hardwareChange: testOrder?.hardware_change || "",
    equipmentRequired: testOrder?.equipment_required || "",
    shift: testOrder?.shift || "",
    fuelType: testOrder?.fuel_type || "",
    preferredDate: testOrder?.preferred_date || "",
    emissionCheckDate: testOrder?.emission_check_date || "",
    emissionCheckAttachment: testOrder?.emission_check_attachment || "",
    dataset_attachment: testOrder?.dataset_attachment || "",
    a2l_attachment: testOrder?.a2l_attachment || "",
    experiment_attachment: testOrder?.experiment_attachment || "",
    dbc_attachment: testOrder?.dbc_attachment || "",
    wltp_attachment: testOrder?.wltp_attachment || "",
    pdf_report: testOrder?.pdf_report || "",
    excel_report: testOrder?.excel_report || "",
    dat_file_attachment: testOrder?.dat_file_attachment || "",
    others_attachment: testOrder?.others_attachment || "",
    specificInstruction: testOrder?.specific_instruction || "",
    status: testOrder?.status || "Created",
    showCoastDownData: false,
    // Coast down data
    cdReportRef: testOrder?.coast_down_reference || "",
    vehicleRefMass: testOrder?.vehicle_reference_mass?.toString() || "",
    aN: testOrder?.a_value?.toString() || "",
    bNkmph: testOrder?.b_value?.toString() || "",
    cNkmph2: testOrder?.c_value?.toString() || "",
    f0N: testOrder?.f0_value?.toString() || "",
    f1Nkmph: testOrder?.f1_value?.toString() || "",
    f2Nkmph2: testOrder?.f2_value?.toString() || "",
    // Remarks
    rejection_remarks: testOrder?.rejection_remarks || "",
    re_edit_remarks: testOrder?.re_edit_remarks || "",
  });

  // States for API data
  const [testTypes, setTestTypes] = useState([]);
  const [inertiaClasses, setInertiaClasses] = useState([]);
  const [modes, setModes] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);

  // States for file modals
  const [emissionCheckModal, setEmissionCheckModal] = useState(false);
  const [datasetModal, setDatasetModal] = useState(false);
  const [a2lModal, setA2LModal] = useState(false);
  const [experimentModal, setExperimentModal] = useState(false);
  const [dbcModal, setDBCModal] = useState(false);
  const [wltpModal, setWLTPModal] = useState(false);
  const [pdfReportModal, setPdfReportModal] = useState(false);
  const [excelReportModal, setExcelReportModal] = useState(false);
  const [datFileModal, setDatFileModal] = useState(false);
  const [othersModal, setOthersModal] = useState(false);

  // State for remarks modals
  const [mailRemarksModal, setMailRemarksModal] = useState(false);
  const [mailRemarks, setMailRemarks] = useState("");
  const [modalActionType, setModalActionType] = useState(""); // "re-edit" or "reject" or "update"

  const handleBack = () => {
    navigate(-1);
  };

  // Handle form field changes
  const handleTestChange = (field, value) => {
    setTest(prev => ({ ...prev, [field]: value }));
  };

  // Fetch API data on component mount
  useEffect(() => {
    // Fetch test types
    const fetchTestTypes = async () => {
      try {
        const response = await axios.get(`${apiURL}/test-types`);
        setTestTypes(response.data || []);
      } catch (error) {
        console.error("Error fetching test types:", error);
        setTestTypes([]);
      }
    };

    // Fetch inertia classes
    const fetchInertiaClasses = async () => {
      try {
        const response = await axios.get(`${apiURL}/inertia-classes`);
        setInertiaClasses(response.data || []);
      } catch (error) {
        console.error("Error fetching inertia classes:", error);
        setInertiaClasses([]);
      }
    };

    // Fetch modes
    const fetchModes = async () => {
      try {
        const response = await axios.get(`${apiURL}/modes`);
        setModes(response.data || []);
      } catch (error) {
        console.error("Error fetching modes:", error);
        setModes([]);
      }
    };

    // Fetch fuel types
    const fetchFuelTypes = async () => {
      try {
        const response = await axios.get(`${apiURL}/fuel-types`);
        setFuelTypes(response.data || []);
      } catch (error) {
        console.error("Error fetching fuel types:", error);
        setFuelTypes([]);
      }
    };

    // Execute fetch functions
    fetchTestTypes();
    fetchInertiaClasses();
    fetchModes();
    fetchFuelTypes();
  }, []);

  // Helper to build the test order payload
  const getTestOrderPayload = (overrideStatus) => ({
    test_order_id: test.testOrderId,
    job_order_id: jobOrderId || null,
    CoastDownData_id: testOrder?.CoastDownData_id || null,
    test_type: test.testType || "",
    test_objective: test.objective || "",
    vehicle_location: test.vehicleLocation || "",
    cycle_gear_shift: test.cycleGearShift || "",
    inertia_class: test.inertiaClass || "",
    dataset_name: test.datasetName || "",
    dpf: test.dpf || "",
    dpf_regen_occurs: test.dpfRegenOccurs || "",
    dataset_flashed:
      test.datasetflashed === "Yes"
        ? true
        : test.datasetflashed === "No"
          ? false
          : null,
    ess: test.ess || "",
    mode: test.mode || "",
    hardware_change: test.hardwareChange || "",
    equipment_required: test.equipmentRequired || "",
    shift: test.shift || "",
    fuel_type: test.fuelType || "",
    preferred_date: test.preferredDate || null,
    emission_check_date: test.emissionCheckDate || null,
    emission_check_attachment: test.emissionCheckAttachment || "",
    dataset_attachment: test.dataset_attachment || "",
    a2l_attachment: test.a2l_attachment || "",
    experiment_attachment: test.experiment_attachment || "",
    dbc_attachment: test.dbc_attachment || "",
    wltp_attachment: test.wltp_attachment || "",
    pdf_report: test.pdf_report || "",
    excel_report: test.excel_report || "",
    dat_file_attachment: test.dat_file_attachment || "",
    others_attachment: test.others_attachment || "",
    specific_instruction: test.specificInstruction || "",
    status: overrideStatus ?? test.status,
    id_of_creator: testOrder?.id_of_creator || "",
    name_of_creator: testOrder?.name_of_creator || "",
    created_on: testOrder?.created_on || new Date().toISOString(),
    id_of_updater: userId || "",
    name_of_updater: userName || "",
    updated_on: new Date().toISOString(),
  });

  // Handler to update the test order
  const handleUpdateTestOrder = async () => {
    try {
      // If ProjectTeam is updating a test in Re-edit status, set status to 'Started'
      let newStatus = test.status;
      if (isProjectTeam && newStatus === "Re-edit") {
        newStatus = "Started";
      }
      const testOrderPayload = getTestOrderPayload(newStatus);
      await axios.put(`${apiURL}/testorders/${test.testOrderId}`, testOrderPayload);
      showSnackbar("Test Order updated successfully!", "success");
      navigate(-1);
    } catch (err) {
      showSnackbar("Failed to update test order: " + (err.response?.data?.detail || err.message), "error");
    }
  };

  // Handler to update status (now always updates test order first)
  const handleStatusUpdate = async (status, remark = "") => {
    try {
      // Always update test order with latest form data and new status
      const testOrderPayload = getTestOrderPayload(status);
      await axios.put(`${apiURL}/testorders/${test.testOrderId}`, testOrderPayload);

      const payload = {
        test_order_id: test.testOrderId,
        status,
        remark,
      };
      await axios.post(`${apiURL}/testorders/status`, payload);
      showSnackbar(`Test order status updated to ${status}`, "success");
      handleBack();
    } catch (err) {
      showSnackbar("Failed to update status: " + (err.response?.data?.detail || err.message), "error");
    }
  };

  // Handler for mail remarks
  const handleSubmitMailRemarks = async () => {
    try {
      // If ProjectTeam is updating a test in Re-edit or Rejected status, set status to 'Started'
      let newStatus = test.status;
      if (
        isProjectTeam &&
        (newStatus === "Re-edit" || newStatus === "Rejected")
      ) {
        newStatus = "Started";
      }

      const payload = {
        ...test,
        mail_remarks: mailRemarks,
        test_order_id: test.testOrderId,
        status: newStatus,
      };

      await axios.put(`${apiURL}/testorders/${test.testOrderId}`, payload);
      setMailRemarksModal(false);
      showSnackbar("Test order updated successfully!", "success");
      handleBack();
    } catch (err) {
      showSnackbar("Failed to submit mail remarks: " + (err.response?.data?.detail || err.message), "error");
    }
  };

  // Handler to start the test order (update with form data, then update status)
  const handleStartTestOrder = async () => {
    try {
      const testOrderPayload = getTestOrderPayload("Started");
      await axios.put(`${apiURL}/testorders/${test.testOrderId}`, testOrderPayload);
      await handleStatusUpdate("Started");
    } catch (err) {
      showSnackbar("Failed to start test order: " + (err.response?.data?.detail || err.message), "error");
    }
  };

  // Helper function to determine if fields should be editable
  const areFieldsEditable = () => {
    // TestEngineer cannot edit fields
    if (isTestEngineer) return false;

    // ProjectTeam can edit if test is in Re-edit or Rejected status
    if (isProjectTeam) {
      return test.status === "Re-edit" || test.status === "Rejected";
    }

    // For admin or other roles, allow editing
    return true;
  };

  return (
    <>
      <Navbar1 />
      <div className="bg-white dark:bg-black min-h-screen">
        {/* Header Row */}
        <div className="flex items-center justify-between px-8 pt-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:border-red-500 dark:hover:bg-red-950 rounded-full border border-red-500"
            >
              <ArrowBack className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                {jobOrderId || "Job Order"}
              </Button>
              <Button
                variant="outline"
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                {test.testOrderId || "Test Order"}
              </Button>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg">Edit Test Order</span>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="mx-8 mb-8 mt-4 border rounded-lg shadow-lg px-8 py-6 bg-white">
          {/* Status Display */}
          <div className="flex items-center gap-3 mb-4">
            <span className="font-bold text-base text-blue-900">Test Details</span>
            {test.status === "Started" && (
              <span className="flex items-center bg-yellow-100 border border-yellow-400 text-yellow-800 font-semibold text-xs px-2 py-1 rounded shadow ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#FFA500" }}>
                  <circle cx="12" cy="12" r="9" stroke="#FFA500" strokeWidth="2" fill="none" />
                  <path d="M12 7v5l3 3" stroke="#FFA500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Started
              </span>
            )}
            {test.status === "Rejected" && (
              <span className="flex items-center bg-red-100 border border-red-400 text-red-800 font-semibold text-xs px-2 py-1 rounded shadow ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#e53935" }}>
                  <circle cx="12" cy="12" r="9" stroke="#e53935" strokeWidth="2" fill="none" />
                  <line x1="9" y1="9" x2="15" y2="15" stroke="#e53935" strokeWidth="2" />
                  <line x1="15" y1="9" x2="9" y2="15" stroke="#e53935" strokeWidth="2" />
                </svg>
                Rejected
              </span>
            )}
            {test.status === "Re-edit" && (
              <span className="flex items-center bg-blue-100 border border-blue-400 text-blue-800 font-semibold text-xs px-2 py-1 rounded shadow ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#1976d2" }}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#1976d2" strokeWidth="2" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#1976d2" strokeWidth="2" />
                </svg>
                Re-edit
              </span>
            )}
            {test.status === "Completed" && (
              <span className="flex items-center bg-green-100 border border-green-400 text-green-800 font-semibold text-xs px-2 py-1 rounded shadow ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#43a047" }}>
                  <circle cx="12" cy="12" r="9" stroke="#43a047" strokeWidth="2" fill="none" />
                  <path d="M9 12l2 2 4-4" stroke="#43a047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Completed
              </span>
            )}
          </div>

          {/* Show rejection remarks if status is Rejected */}
          {test.status === "Rejected" && (
            <div className="bg-red-100 border border-red-400 rounded-lg p-4 mt-4 mb-2 shadow-inner">
              <div className="font-semibold text-sm text-red-700 mb-2">
                Rejected Reason
              </div>
              <textarea
                value={test.rejection_remarks}
                readOnly
                className="w-full border rounded p-2 min-h-[60px] max-h-[120px] resize-vertical bg-white"
                style={{ minWidth: "100%", fontSize: "1rem" }}
                rows={3}
              />
            </div>
          )}

          {/* Show re-edit remarks if status is Re-edit */}
          {test.status === "Re-edit" && (
            <div className="bg-blue-100 border border-blue-400 rounded-lg p-4 mt-4 mb-2 shadow-inner">
              <div className="font-semibold text-sm text-blue-700 mb-2">
                Re-edit Reason from Test Engineer
              </div>
              <div className="w-full border rounded p-2 min-h-[60px] bg-white">
                {test.re_edit_remarks || "No re-edit remarks provided"}
              </div>
            </div>
          )}

          {/* Main form fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div>
              <Label>Test Type</Label>
              <Select
                value={test.testType}
                onValueChange={(v) => handleTestChange("testType", v)}
                disabled={!areFieldsEditable()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {testTypes.map((testType, index) => (
                    <SelectItem key={`${testType}-${index}`} value={testType}>
                      {testType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>
                Objective of the Test <span className="text-red-500">*</span>
              </Label>
              <Input
                value={test.objective}
                onChange={(e) => handleTestChange("objective", e.target.value)}
                placeholder="TESTING"
                disabled={!areFieldsEditable()}
              />
            </div>
            <div>
              <Label>Vehicle Location</Label>
              <Input
                value={test.vehicleLocation}
                onChange={(e) => handleTestChange("vehicleLocation", e.target.value)}
                placeholder="Enter Vehicle Location"
                disabled={!areFieldsEditable()}
              />
            </div>
            <div>
              <Label>Cycle Gear Shift</Label>
              <Input
                value={test.cycleGearShift}
                onChange={(e) => handleTestChange("cycleGearShift", e.target.value)}
                placeholder="Enter Cycle Gear Shift"
                disabled={!areFieldsEditable()}
              />
            </div>
            <div>
              <Label>Inertia Class</Label>
              <Select
                value={test.inertiaClass}
                onValueChange={(v) => handleTestChange("inertiaClass", v)}
                disabled={!areFieldsEditable()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {inertiaClasses.map((inertiaClass, index) => (
                    <SelectItem
                      key={`${inertiaClass}-${index}`}
                      value={inertiaClass}
                    >
                      {inertiaClass}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Dataset Name</Label>
              <Input
                value={test.datasetName}
                onChange={(e) => handleTestChange("datasetName", e.target.value)}
                placeholder="Enter Dataset Name"
                disabled={!areFieldsEditable()}
              />
            </div>
            <div>
              <Label>DPF</Label>
              <div className="flex gap-2 mt-2">
                <label>
                  <input
                    type="radio"
                    name="dpf"
                    value="Yes"
                    checked={test.dpf === "Yes"}
                    onChange={() => handleTestChange("dpf", "Yes")}
                    disabled={!areFieldsEditable()}
                  />{" "}
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name="dpf"
                    value="No"
                    checked={test.dpf === "No"}
                    onChange={() => handleTestChange("dpf", "No")}
                    disabled={!areFieldsEditable()}
                  />{" "}
                  No
                </label>
                <label>
                  <input
                    type="radio"
                    name="dpf"
                    value="NA"
                    checked={test.dpf === "NA"}
                    onChange={() => handleTestChange("dpf", "NA")}
                    disabled={!areFieldsEditable()}
                  />{" "}
                  NA
                </label>
              </div>
            </div>
            {test.dpf === "Yes" && (
              <div>
                <Label>DPF Regen Occurs (g)*</Label>
                <Input
                  value={test.dpfRegenOccurs || ""}
                  onChange={(e) => handleTestChange("dpfRegenOccurs", e.target.value)}
                  placeholder="Enter DPF Regen Occurs (g)"
                  disabled={!areFieldsEditable()}
                />
              </div>
            )}
            <div>
              <Label>Dataset flashed</Label>
              <div className="flex gap-2 mt-2">
                <label>
                  <input
                    type="radio"
                    name="datasetflashed"
                    value="Yes"
                    checked={test.datasetflashed === "Yes"}
                    onChange={() => handleTestChange("datasetflashed", "Yes")}
                    disabled={!areFieldsEditable()}
                  />{" "}
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name="datasetflashed"
                    value="No"
                    checked={test.datasetflashed === "No"}
                    onChange={() => handleTestChange("datasetflashed", "No")}
                    disabled={!areFieldsEditable()}
                  />{" "}
                  No
                </label>
              </div>
            </div>
            <div>
              <Label>ESS</Label>
              <div className="flex gap-2 mt-2">
                <label>
                  <input
                    type="radio"
                    name="ess"
                    value="On"
                    checked={test.ess === "On"}
                    onChange={() => handleTestChange("ess", "On")}
                    disabled={!areFieldsEditable()}
                  />{" "}
                  On
                </label>
                <label>
                  <input
                    type="radio"
                    name="ess"
                    value="Off"
                    checked={test.ess === "Off"}
                    onChange={() => handleTestChange("ess", "Off")}
                    disabled={!areFieldsEditable()}
                  />{" "}
                  Off
                </label>
                <label>
                  <input
                    type="radio"
                    name="ess"
                    value="NA"
                    checked={test.ess === "NA"}
                    onChange={() => handleTestChange("ess", "NA")}
                    disabled={!areFieldsEditable()}
                  />{" "}
                  NA
                </label>
              </div>
            </div>
            <div>
              <Label>Mode</Label>
              <Select
                value={test.mode}
                onValueChange={(v) => handleTestChange("mode", v)}
                disabled={!areFieldsEditable()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {modes.map((mode, index) => (
                    <SelectItem key={`${mode}-${index}`} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Hardware Change</Label>
              <Input
                value={test.hardwareChange}
                onChange={(e) => handleTestChange("hardwareChange", e.target.value)}
                placeholder="Enter Hardware Change"
                disabled={!areFieldsEditable()}
              />
            </div>
            <div>
              <Label>Shift</Label>
              <Select
                value={test.shift}
                onValueChange={(v) => handleTestChange("shift", v)}
                disabled={!areFieldsEditable()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Shift1">Shift1</SelectItem>
                  <SelectItem value="Shift2">Shift2</SelectItem>
                  <SelectItem value="Shift3">Shift3</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fuel Type</Label>
              <Select
                value={test.fuelType}
                onValueChange={(v) => handleTestChange("fuelType", v)}
                disabled={!areFieldsEditable()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypes.map((fuelType, index) => (
                    <SelectItem key={`${fuelType}-${index}`} value={fuelType}>
                      {fuelType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Equipment Required</Label>
              <Input
                value={test.equipmentRequired}
                onChange={(e) => handleTestChange("equipmentRequired", e.target.value)}
                placeholder="Enter Equipment Required"
                disabled={!areFieldsEditable()}
              />
            </div>
            <div>
              <Label>Preferred Date</Label>
              <Input
                type="date"
                value={test.preferredDate}
                onChange={(e) => handleTestChange("preferredDate", e.target.value)}
                disabled={!areFieldsEditable()}
              />
            </div>
            <div>
              <Label>Emission Check Date</Label>
              <Input
                type="date"
                value={test.emissionCheckDate}
                onChange={(e) => handleTestChange("emissionCheckDate", e.target.value)}
                disabled={!areFieldsEditable()}
              />
            </div>
            <div className="col-span-2">
              <Label>Specific Instruction</Label>
              <textarea
                value={test.specificInstruction}
                onChange={(e) => handleTestChange("specificInstruction", e.target.value)}
                placeholder="Enter Specific Instructions"
                disabled={!areFieldsEditable()}
                className="w-full border rounded p-2 min-h-[60px] max-h-[120px] resize-vertical"
                style={{ minWidth: "100%", fontSize: "1rem" }}
                rows={3}
              />
            </div>
          </div>

          {/* Attachments Section */}
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mt-4 mb-2 shadow-inner">
            <div className="font-semibold text-sm text-gray-700 mb-2">
              Attachments
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Emission Check Attachment</Label>
                <DropzoneFileList
                  buttonText="Emission Check Attachment"
                  name="emmission_check_attachment"
                  maxFiles={5}
                  formData={{
                    ...test,
                    originalJobOrderId: jobOrderId || ""
                  }}
                  setFormData={(updatedData) => {
                    setTest(prev => ({ ...prev, ...updatedData }));
                  }}
                  id="test-edit"
                  submitted={false}
                  setSubmitted={() => { }}
                  openModal={emissionCheckModal}
                  handleOpenModal={() => setEmissionCheckModal(true)}
                  handleCloseModal={() => setEmissionCheckModal(false)}
                  disabled={!areFieldsEditable()}
                  originalJobOrderId={jobOrderId || ""}
                />
              </div>
              <div>
                <Label>Dataset Attachment</Label>
                <DropzoneFileList
                  buttonText="Dataset Attachment"
                  name="dataset_attachment"
                  maxFiles={5}
                  formData={{
                    ...test,
                    originalJobOrderId: jobOrderId || ""
                  }}
                  setFormData={(updatedData) => {
                    setTest(prev => ({ ...prev, ...updatedData }));
                  }}
                  id="test-edit"
                  submitted={false}
                  setSubmitted={() => { }}
                  openModal={datasetModal}
                  handleOpenModal={() => setDatasetModal(true)}
                  handleCloseModal={() => setDatasetModal(false)}
                  disabled={!areFieldsEditable()}
                  originalJobOrderId={jobOrderId || ""}
                  viewOnly={isTestEngineer}
                />
              </div>
              <div>
                <Label>A2L Attachment</Label>
                <DropzoneFileList
                  buttonText="A2L Attachment"
                  name="a2l_attachment"
                  maxFiles={5}
                  formData={{
                    ...test,
                    originalJobOrderId: jobOrderId || ""
                  }}
                  setFormData={(updatedData) => {
                    setTest(prev => ({ ...prev, ...updatedData }));
                  }}
                  id="test-edit"
                  submitted={false}
                  setSubmitted={() => { }}
                  openModal={a2lModal}
                  handleOpenModal={() => setA2LModal(true)}
                  handleCloseModal={() => setA2LModal(false)}
                  disabled={!areFieldsEditable()}
                  originalJobOrderId={jobOrderId || ""}
                  viewOnly={isTestEngineer}
                />
              </div>
              <div>
                <Label>Experiment Attachment</Label>
                <DropzoneFileList
                  buttonText="Experiment Attachment"
                  name="experiment_attachment"
                  maxFiles={5}
                  formData={{
                    ...test,
                    originalJobOrderId: jobOrderId || ""
                  }}
                  setFormData={(updatedData) => {
                    setTest(prev => ({ ...prev, ...updatedData }));
                  }}
                  id="test-edit"
                  submitted={false}
                  setSubmitted={() => { }}
                  openModal={experimentModal}
                  handleOpenModal={() => setExperimentModal(true)}
                  handleCloseModal={() => setExperimentModal(false)}
                  disabled={!areFieldsEditable()}
                  viewOnly={isTestEngineer}
                  originalJobOrderId={jobOrderId || ""}
                />
              </div>
              <div>
                <Label>DBC Attachment</Label>
                <DropzoneFileList
                  buttonText="DBC Attachment"
                  name="dbc_attachment"
                  maxFiles={5}
                  formData={{
                    ...test,
                    originalJobOrderId: jobOrderId || ""
                  }}
                  setFormData={(updatedData) => {
                    setTest(prev => ({ ...prev, ...updatedData }));
                  }}
                  id="test-edit"
                  submitted={false}
                  setSubmitted={() => { }}
                  openModal={dbcModal}
                  handleOpenModal={() => setDBCModal(true)}
                  handleCloseModal={() => setDBCModal(false)}
                  disabled={!areFieldsEditable()}
                  viewOnly={isTestEngineer}
                  originalJobOrderId={jobOrderId || ""}
                />
              </div>
              <div>
                <Label>WLTP Input Sheet</Label>
                <DropzoneFileList
                  buttonText="WLTP Input Sheet"
                  name="wltp_attachment"
                  maxFiles={5}
                  formData={{
                    ...test,
                    originalJobOrderId: jobOrderId || ""
                  }}
                  setFormData={(updatedData) => {
                    setTest(prev => ({ ...prev, ...updatedData }));
                  }}
                  id="test-edit"
                  submitted={false}
                  setSubmitted={() => { }}
                  openModal={wltpModal}
                  handleOpenModal={() => setWLTPModal(true)}
                  handleCloseModal={() => setWLTPModal(false)}
                  disabled={!areFieldsEditable()}
                  viewOnly={isTestEngineer}
                  originalJobOrderId={jobOrderId || ""}
                />
              </div>
            </div>
          </div>

          {/* Test Engineers Attachments */}
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mt-4 mb-2 shadow-inner">
            <div className="font-semibold text-sm text-gray-700 mb-2">
              Test Engineers Attachments
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>PDF Report</Label>
                <DropzoneFileList
                  buttonText="PDF Report"
                  name="pdf_report"
                  maxFiles={5}
                  formData={{
                    ...test,
                    originalJobOrderId: jobOrderId || ""
                  }}
                  setFormData={(updatedData) => {
                    setTest(prev => ({ ...prev, ...updatedData }));
                  }}
                  id="test-edit"
                  submitted={false}
                  setSubmitted={() => { }}
                  openModal={pdfReportModal}
                  handleOpenModal={() => setPdfReportModal(true)}
                  handleCloseModal={() => setPdfReportModal(false)}
                  disabled={userRole === "ProjectTeam"}
                  originalJobOrderId={jobOrderId || ""}
                  viewOnly={userRole === "ProjectTeam"}
                />
              </div>
              <div>
                <Label>Excel Report</Label>
                <DropzoneFileList
                  buttonText="Excel Report"
                  name="excel_report"
                  maxFiles={5}
                  formData={{
                    ...test,
                    originalJobOrderId: jobOrderId || ""
                  }}
                  setFormData={(updatedData) => {
                    setTest(prev => ({ ...prev, ...updatedData }));
                  }}
                  id="test-edit"
                  submitted={false}
                  setSubmitted={() => { }}
                  openModal={excelReportModal}
                  handleOpenModal={() => setExcelReportModal(true)}
                  handleCloseModal={() => setExcelReportModal(false)}
                  originalJobOrderId={jobOrderId || ""}
                  disabled={userRole === "ProjectTeam"}
                  viewOnly={userRole === "ProjectTeam"}
                />
              </div>
              <div>
                <Label>DAT File Attachment</Label>
                <DropzoneFileList
                  buttonText="DAT File Attachment"
                  name="dat_file_attachment"
                  maxFiles={5}
                  formData={{
                    ...test,
                    originalJobOrderId: jobOrderId || ""
                  }}
                  setFormData={(updatedData) => {
                    setTest(prev => ({ ...prev, ...updatedData }));
                  }}
                  id="test-edit"
                  submitted={false}
                  setSubmitted={() => { }}
                  openModal={datFileModal}
                  handleOpenModal={() => setDatFileModal(true)}
                  handleCloseModal={() => setDatFileModal(false)}
                  originalJobOrderId={jobOrderId || ""}
                  disabled={userRole === "ProjectTeam"}
                  viewOnly={userRole === "ProjectTeam"}
                />
              </div>
              <div>
                <Label>Others Attachment</Label>
                <DropzoneFileList
                  buttonText="Others Attachment"
                  name="others_attachement"
                  maxFiles={5}
                  formData={{
                    ...test,
                    originalJobOrderId: jobOrderId || ""
                  }}
                  setFormData={(updatedData) => {
                    setTest(prev => ({ ...prev, ...updatedData }));
                  }}
                  id="test-edit"
                  submitted={false}
                  setSubmitted={() => { }}
                  openModal={othersModal}
                  handleOpenModal={() => setOthersModal(true)}
                  handleCloseModal={() => setOthersModal(false)}
                  originalJobOrderId={jobOrderId || ""}
                  disabled={userRole === "ProjectTeam"}
                  viewOnly={userRole === "ProjectTeam"}
                />
              </div>
            </div>
          </div>

          {/* Coast Down Data Section */}
          <div className="mt-6 border rounded shadow px-4 py-3 bg-blue-50">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-semibold text-sm text-blue-700">
                Coast Down Data
              </span>
              <Switch
                checked={test.showCoastDownData}
                onCheckedChange={(checked) => {
                  setTest(prev => ({ ...prev, showCoastDownData: checked }));
                }}
                disabled={!areFieldsEditable()}
                className="data-[state=checked]:bg-red-500"
              />
            </div>
            {test.showCoastDownData && (
              <div>
                <div className="mb-3">
                  <Label className="text-xs">
                    Coast Down Test Report Reference
                  </Label>
                  <Input
                    value={test.cdReportRef}
                    onChange={(e) => handleTestChange("cdReportRef", e.target.value)}
                    placeholder="Enter Coast Test Report Ref."
                    className="mt-1"
                    disabled={!areFieldsEditable()}
                  />
                </div>
                <div className="mb-2 font-semibold text-xs">CD Values</div>
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div>
                    <Label className="text-xs">
                      Vehicle Reference mass (Kg)
                    </Label>
                    <Input
                      value={test.vehicleRefMass}
                      onChange={(e) => handleTestChange("vehicleRefMass", e.target.value)}
                      placeholder="Enter Vehicle Reference mass"
                      className="mt-1"
                      disabled={!areFieldsEditable()}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">A (N)</Label>
                    <Input
                      value={test.aN}
                      onChange={(e) => handleTestChange("aN", e.target.value)}
                      placeholder="Enter A (N)"
                      className="mt-1"
                      disabled={!areFieldsEditable()}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">B (N/kmph)</Label>
                    <Input
                      value={test.bNkmph}
                      onChange={(e) => handleTestChange("bNkmph", e.target.value)}
                      placeholder="Enter B (N/kmph)"
                      className="mt-1"
                      disabled={!areFieldsEditable()}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">C (N/kmph^2)</Label>
                    <Input
                      value={test.cNkmph2}
                      onChange={(e) => handleTestChange("cNkmph2", e.target.value)}
                      placeholder="Enter C (N/kmph^2)"
                      className="mt-1"
                      disabled={!areFieldsEditable()}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs mt-3">
                  <div>
                    <Label className="text-xs">F0 (N)</Label>
                    <Input
                      value={test.f0N}
                      onChange={(e) => handleTestChange("f0N", e.target.value)}
                      placeholder="Enter F0 (N)"
                      className="mt-1"
                      disabled={!areFieldsEditable()}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">F1 (N/kmph)</Label>
                    <Input
                      value={test.f1Nkmph}
                      onChange={(e) => handleTestChange("f1Nkmph", e.target.value)}
                      placeholder="Enter F1 (N/kmph)"
                      className="mt-1"
                      disabled={!areFieldsEditable()}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">F2 (N/kmph^2)</Label>
                    <Input
                      value={test.f2Nkmph2}
                      onChange={(e) => handleTestChange("f2Nkmph2", e.target.value)}
                      placeholder="Enter F2 (N/kmph^2)"
                      className="mt-1"
                      disabled={!areFieldsEditable()}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-6 gap-2">
            {/* Buttons for TestEngineer */}
            {isTestEngineer && (test.status === "Created") && (
              <>
                <Button
                  className="bg-green-600 text-white text-xs px-3 py-1 rounded"
                  type="button"
                  onClick={handleStartTestOrder}
                >
                  Start
                </Button>
                <Button
                  className="bg-red-600 text-white text-xs px-3 py-1 rounded"
                  type="button"
                  onClick={() => {
                    setModalActionType("reject");
                    setMailRemarks("");
                    setMailRemarksModal(true);
                  }}
                >
                  Reject
                </Button>
              </>
            )}

            {/* Buttons for TestEngineer */}
            {isTestEngineer && (test.status === "Started" || test.status === "Rejected" || test.status === "under progress") && (
              <>
                <Button
                  className="bg-blue-600 text-white text-xs px-3 py-1 rounded"
                  type="button"
                  onClick={() => {
                    setModalActionType("re-edit");
                    setMailRemarks("");
                    setMailRemarksModal(true);
                  }}
                >
                  Re-edit
                </Button>
                <Button
                  className="bg-green-600 text-white text-xs px-3 py-1 rounded"
                  type="button"
                  onClick={() => handleStatusUpdate("Completed")}
                >
                  Complete
                </Button>
              </>
            )}

            {/* Update button for all users when editable */}
            {areFieldsEditable() && (
              <Button
                className="bg-red-600 text-white text-xs px-6 py-2 rounded"
                onClick={() => {
                  if (isProjectTeam) {
                    setModalActionType("update");
                    setMailRemarks("");
                    setMailRemarksModal(true);
                  } else {
                    handleUpdateTestOrder();
                  }
                }}
              >
                UPDATE TEST ORDER
              </Button>
            )}
          </div>
        </div>

        {/* Mail Remarks Modal */}
        {mailRemarksModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg p-6 w-96">
              <div className="font-semibold mb-2">
                {modalActionType === "re-edit"
                  ? "Re-edit Reason"
                  : modalActionType === "reject"
                    ? "Rejection Reason"
                    : "Update Comments"}
              </div>
              <textarea
                className="w-full border rounded p-2 mb-4"
                rows={3}
                value={mailRemarks}
                onChange={(e) => setMailRemarks(e.target.value)}
                placeholder={
                  modalActionType === "re-edit"
                    ? "Enter reason for re-edit..."
                    : modalActionType === "reject"
                      ? "Enter reason for rejection..."
                      : "Enter update comments..."
                }
              />
              <div className="flex justify-end gap-2">
                <Button
                  className="bg-gray-300 text-black px-4 py-1 rounded"
                  type="button"
                  onClick={() => setMailRemarksModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className={`${modalActionType === "re-edit"
                      ? "bg-blue-600"
                      : modalActionType === "reject"
                        ? "bg-red-600"
                        : "bg-blue-600"
                    } text-white px-4 py-1 rounded`}
                  type="button"
                  onClick={() => {
                    if (isProjectTeam) {
                      handleSubmitMailRemarks();
                    } else if (isTestEngineer) {
                      if (modalActionType === "re-edit") {
                        handleStatusUpdate("Re-edit", mailRemarks);
                      } else if (modalActionType === "reject") {
                        handleStatusUpdate("Rejected", mailRemarks);
                      }
                    } else {
                      handleSubmitMailRemarks();
                    }
                  }}
                  disabled={!mailRemarks.trim()}
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
