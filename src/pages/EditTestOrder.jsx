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
  // State for mail loading indicator
  const [mailLoading, setMailLoading] = useState(false);
  // Function to send mail for test order status changes (logic taken from Chennai_create_joborder)
  const handleSendMail = async (caseId, directJobOrderId = null, testOrderId = null) => {
    setMailLoading(true);
    try {
      // First try to use the direct job order ID passed to this function
      // Then fall back to other sources if not provided
      const resolvedJobOrderId = directJobOrderId ||
        jobOrderId ||
        useStore.getState().backendJobOrderID;

      if (!resolvedJobOrderId) {
        showSnackbar("Job Order ID is missing. Cannot send mail.", "error");
        setMailLoading(false);
        return;
      }

      // Compose payload as per new API
      const payload = {
        user_name: userName,
        token_id: userId,
        role: userRole,
        job_order_id: resolvedJobOrderId,
        test_order_id: testOrderId || null, // Use testOrderId from parameter if available
        caseid: String(caseId),
        cft_members: "",
      };

      const response = await axios.post(`${apiURL}/send`, payload);

      if (response.status === 200) {
        showSnackbar("Mail sent successfully", "success");
      } else {
        showSnackbar("Failed to send mail", "error");
        console.error("Mail API responded with status:", response.status, response.data);
      }
    } catch (error) {
      showSnackbar("Error sending mail: " + (error?.message || "Unknown error"), "warning");
      console.error("Error sending mail", error);
    } finally {
      setMailLoading(false);
    }
  };
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, userId, userName } = useAuth();

  // Get test order and job order ID from location state
  const { testOrder, jobOrderId, returnPath, returnState } = location.state || {};

  // State to check if user is a Test Engineer
  const isTestEngineer = userRole === "TestEngineer";
  const isProjectTeam = userRole === "ProjectTeam";
  const isAdmin = userRole === "Admin";

  // State for test data
  const [test, setTest] = useState({
    testOrderId: testOrder?.test_order_id || "",
    // engineNumber removed
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
    emission_check_attachment: Array.isArray(testOrder?.emission_check_attachment)
      ? testOrder?.emission_check_attachment
      : testOrder?.emission_check_attachment
        ? testOrder?.emission_check_attachment
        : [],
    dataset_attachment: Array.isArray(testOrder?.dataset_attachment) ? testOrder?.dataset_attachment : [],
    a2l_attachment: Array.isArray(testOrder?.a2l_attachment) ? testOrder?.a2l_attachment : [],
    experiment_attachment: Array.isArray(testOrder?.experiment_attachment) ? testOrder?.experiment_attachment : [],
    dbc_attachment: Array.isArray(testOrder?.dbc_attachment) ? testOrder?.dbc_attachment : [],
    wltp_attachment: Array.isArray(testOrder?.wltp_attachment) ? testOrder?.wltp_attachment : [],
    pdf_report: Array.isArray(testOrder?.pdf_report) ? testOrder?.pdf_report : [],
    excel_report: Array.isArray(testOrder?.excel_report) ? testOrder?.excel_report : [],
    dat_file_attachment: Array.isArray(testOrder?.dat_file_attachment) ? testOrder?.dat_file_attachment : [],
    // Align with Dropzone name and backend spelling
    others_attachement: Array.isArray(testOrder?.others_attachement) ? testOrder?.others_attachement : [],
    specificInstruction: testOrder?.specific_instruction || "",
    status: testOrder?.status || "Created",
    // Creator info
    createdBy: testOrder?.name_of_creator || "",
    createdOn: testOrder?.created_on || "",
    // Set showCoastDownData to true if backend has coast down data
    showCoastDownData: Boolean(testOrder?.coast_down_data),
    // Coast Down Data fields from nested object
    cdReportRef: testOrder?.coast_down_data?.coast_down_reference || "",
    vehicleRefMass: testOrder?.coast_down_data?.vehicle_reference_mass || "",
    aN: testOrder?.coast_down_data?.a_value || "",
    bNkmph: testOrder?.coast_down_data?.b_value || "",
    cNkmph2: testOrder?.coast_down_data?.c_value || "",
    f0N: testOrder?.coast_down_data?.f0_value || "",
    f1Nkmph: testOrder?.coast_down_data?.f1_value || "",
    f2Nkmph2: testOrder?.coast_down_data?.f2_value || "",
    // Remarks
    rejection_remarks: testOrder?.rejection_remarks || "",
    remark: testOrder?.remark || "",
    complete_remarks: (testOrder?.status === "Completed") ? (testOrder?.complete_remarks || "") : "", // Only preserve complete_remarks if status is actually Completed
    coast_down_data: testOrder?.coast_down_data || null, 
    // Rating fields
    rating: testOrder?.rating || 0,
    rating_remarks: testOrder?.rating_remarks || "",
    // Validation fields
    validation_status: testOrder?.validation_status || null,
    validated_by: testOrder?.validated_by || "",
    validated_on: testOrder?.validated_on || "",
  });
  
  console.log("coast_down_data from backend:", testOrder?.coast_down_data);
  console.log("showCoastDownData state value:", test.showCoastDownData);
  console.log("Full testOrder object:", testOrder);
  console.log("Test state values:", {
    testType: test.testType,
    objective: test.objective,
    vehicleLocation: test.vehicleLocation,
    dpf: test.dpf,
    ess: test.ess,
    mode: test.mode,
    fuelType: test.fuelType,
    shift: test.shift,
    inertiaClass: test.inertiaClass
  });

  // States for API data
  const [testTypes, setTestTypes] = useState([]);
  const [inertiaClasses, setInertiaClasses] = useState([]);
  const [modes, setModes] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  // engineNumbers removed

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
  const [completeRemarks, setCompleteRemarks] = useState((testOrder?.status === "Completed") ? (testOrder?.complete_remarks || "") : ""); // Only initialize with complete_remarks if status is Completed

  // State for star rating
  const [starRatingModal, setStarRatingModal] = useState(false);
  const [rating, setRating] = useState(testOrder?.rating || 0);
  const [ratingRemarks, setRatingRemarks] = useState(testOrder?.rating_remarks || "");

  // State for validation status
  const [validationStatus, setValidationStatus] = useState(null); // 'valid' or 'invalid'
  
  // State for validation choice modal (new)
  const [validationChoiceModal, setValidationChoiceModal] = useState(false);
  const [selectedValidation, setSelectedValidation] = useState(null); // 'valid' or 'invalid'
  const [validationConfirmModal, setValidationConfirmModal] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  // Handle form field changes
  const handleTestChange = (field, value) => {
    setTest(prev => ({ ...prev, [field]: value }));
  };

  // Fetch API data on component mount
  useEffect(() => {
    // Debug log for coast down data after component mount
    console.log("Component mounted - Coast Down Data state:");
    console.log("showCoastDownData:", test.showCoastDownData);
    console.log("Coast down values:", {
      f0N: test.f0N,
      f1Nkmph: test.f1Nkmph,
      f2Nkmph2: test.f2Nkmph2,
      aN: test.aN,
      bNkmph: test.bNkmph,
      cNkmph2: test.cNkmph2,
      cdReportRef: test.cdReportRef,
      vehicleRefMass: test.vehicleRefMass
    });
    
    // Fetch test types
    const fetchTestTypes = async () => {
      try {
        const response = await axios.get(`${apiURL}/test-types`);
        const list = Array.isArray(response.data) ? response.data : [];
        const value = test.testType;
        const finalList = value && !list.includes(value) ? [value, ...list] : list;
        setTestTypes(finalList);
      } catch (error) {
        console.error("Error fetching test types:", error);
        setTestTypes([]);
      }
    };

    // Fetch inertia classes
    const fetchInertiaClasses = async () => {
      try {
        const response = await axios.get(`${apiURL}/inertia-classes`);
        const list = Array.isArray(response.data) ? response.data : [];
        const value = test.inertiaClass;
        const finalList = value && !list.includes(value) ? [value, ...list] : list;
        setInertiaClasses(finalList);
      } catch (error) {
        console.error("Error fetching inertia classes:", error);
        setInertiaClasses([]);
      }
    };

    // Fetch modes
    const fetchModes = async () => {
      try {
        const response = await axios.get(`${apiURL}/modes`);
        const list = Array.isArray(response.data) ? response.data : [];
        const value = test.mode;
        const finalList = value && !list.includes(value) ? [value, ...list] : list;
        setModes(finalList);
      } catch (error) {
        console.error("Error fetching modes:", error);
        setModes([]);
      }
    };

    // Fetch fuel types
    const fetchFuelTypes = async () => {
      try {
        const response = await axios.get(`${apiURL}/fuel-types`);
        const list = Array.isArray(response.data) ? response.data : [];
        const value = test.fuelType;
        const finalList = value && !list.includes(value) ? [value, ...list] : list;
        setFuelTypes(finalList);
      } catch (error) {
        console.error("Error fetching fuel types:", error);
        setFuelTypes([]);
      }
    };

    // Trigger all fetches so select values render correctly
    fetchTestTypes();
    fetchInertiaClasses();
    fetchModes();
    fetchFuelTypes();

    // Fetch engine numbers
  // Removed fetchEngineNumbers and its usage
  }, []);

  // Format date for display in IST
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

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
    emission_check_attachment:
      Array.isArray(test.emission_check_attachment)
        ? test.emission_check_attachment
        : test.emission_check_attachment
          ? test.emission_check_attachment
          : [],
    dataset_attachment: test.dataset_attachment || "",
    a2l_attachment: test.a2l_attachment || "",
    experiment_attachment: test.experiment_attachment || "",
    dbc_attachment: test.dbc_attachment || "",
    wltp_attachment: test.wltp_attachment || "",
    pdf_report: test.pdf_report || "",
    excel_report: test.excel_report || "",
    dat_file_attachment: test.dat_file_attachment || "",
    others_attachment: test.others_attachement || "",
    specific_instruction: test.specificInstruction || "",
    status: overrideStatus ?? test.status,
    complete_remarks: test.complete_remarks || "", // Add complete_remarks to payload
    id_of_creator: testOrder?.id_of_creator || "",
    name_of_creator: testOrder?.name_of_creator || "",
    created_on: testOrder?.created_on || new Date().toISOString(),
    id_of_updater: userId || "",
    name_of_updater: userName || "",
    updated_on: new Date().toISOString(),
    // Coast down data fields (ensure always sent)
    cdReportRef: test.cdReportRef || "",
    vehicleRefMass: test.vehicleRefMass || "",
    aN: test.aN || "",
    bNkmph: test.bNkmph || "",
    cNkmph2: test.cNkmph2 || "",
    f0N: test.f0N || "",
    f1Nkmph: test.f1Nkmph || "",
    f2Nkmph2: test.f2Nkmph2 || "",
    // Optionally, send the nested object if needed by backend
    coast_down_data: {
      coast_down_reference: test.cdReportRef || "",
      vehicle_reference_mass: test.vehicleRefMass || "",
      a_value: test.aN || "",
      b_value: test.bNkmph || "",
      c_value: test.cNkmph2 || "",
      f0_value: test.f0N || "",
      f1_value: test.f1Nkmph || "",
      f2_value: test.f2Nkmph2 || "",
    },
  });

  // Handler to update the test order
  const handleUpdateTestOrder = async () => {
    try {
      // If ProjectTeam is updating a test in Re-edit or Rejected status, set status to 'Created'
      let newStatus = test.status;
      if (isProjectTeam && (newStatus === "Re-edit" || newStatus === "Rejected")) {
        newStatus = "Created";
      }
      const testOrderPayload = getTestOrderPayload(newStatus);
      await axios.put(`${apiURL}/testorders-update?test_order_id=${encodeURIComponent(test.testOrderId)}`, testOrderPayload);
      showSnackbar("Test Order updated successfully!", "success");
      navigate(-1);
      await handleSendMail("5", jobOrderId, test.testOrderId); 
    } catch (err) {
      showSnackbar("Failed to update test order: " + (err.response?.data?.detail || err.message), "error");
    }
  };

  // Handler to update status (now always updates test order first)
  const handleStatusUpdate = async (status, remark = "") => {
    try {
      // Always update test order with latest form data and new status
      const testOrderPayload = getTestOrderPayload(status);
      await axios.put(`${apiURL}/testorders-update?test_order_id=${encodeURIComponent(test.testOrderId)}`, testOrderPayload);

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
      // If ProjectTeam is updating a test in Re-edit or Rejected status, set status back to 'Created'
      let newStatus = test.status;
      if (
        isProjectTeam &&
        (newStatus === "Re-edit" || newStatus === "Rejected")
      ) {
        newStatus = "Created";
      }

      const payload = {
        ...test,
        mail_remarks: mailRemarks,
        test_order_id: test.testOrderId,
        status: newStatus,
      };
      const testOrderPayload = getTestOrderPayload(newStatus);
      await axios.put(`${apiURL}/testorders-update?test_order_id=${encodeURIComponent(test.testOrderId)}`, testOrderPayload);
      await handleSendMail("5", jobOrderId, test.testOrderId); 
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
      await axios.put(`${apiURL}/testorders-update?test_order_id=${encodeURIComponent(test.testOrderId)}`, testOrderPayload);
      await handleStatusUpdate("Started");
    } catch (err) {
      showSnackbar("Failed to start test order: " + (err.response?.data?.detail || err.message), "error");
    }
  };

  // Handler to complete the test order with remarks
  const handleCompleteTestOrder = async () => {
    try {
      const testOrderPayload = {
        ...getTestOrderPayload("Completed"),
        complete_remarks: completeRemarks,
      };
      
      // Update the test order with completion status and remarks
      await axios.put(`${apiURL}/testorders-update?test_order_id=${encodeURIComponent(test.testOrderId)}`, testOrderPayload);
      await axios.post(`${apiURL}/testorders/status`, {
        test_order_id: test.testOrderId,
        status: "Completed",
        remark: completeRemarks,
      });
      
      // If Test Engineer provided validation status, update it
      if (isTestEngineer && selectedValidation) {
        const validationData = {
          validation_status: selectedValidation,
          validated_by: userName,
          validated_on: new Date().toISOString(),
        };
        
        // Update validation status in the test order
        await axios.put(`${apiURL}/testorders-update?test_order_id=${encodeURIComponent(test.testOrderId)}`, validationData);
        
        // Update local state with validation
        setTest(prev => ({
          ...prev,
          status: "Completed",
          remark: completeRemarks,
          complete_remarks: completeRemarks,
          validation_status: selectedValidation,
          validated_by: userName,
          validated_on: new Date().toISOString(),
        }));
        
        setValidationStatus(selectedValidation);
        
        showSnackbar(`Test order marked as Completed and validated as ${selectedValidation.toUpperCase()}.`, "success");
      } else {
        // Update local state without validation
        setTest(prev => ({
          ...prev,
          status: "Completed",
          remark: completeRemarks,
          complete_remarks: completeRemarks
        }));
        
        showSnackbar("Test order marked as Completed. The test can now be validated.", "success");
      }
      
      // Close the modal and reset validation states
      setMailRemarksModal(false);
      setSelectedValidation(null);
      
    } catch (err) {
      showSnackbar("Failed to complete test order: " + (err.response?.data?.detail || err.message), "error");
    }
  };

  // Handler for validation decision
  const handleValidationDecision = async (isValid) => {
    const validationData = {
      validation_status: isValid ? 'valid' : 'invalid',
      validated_by: userName,
      validated_on: new Date().toISOString(),
    };
    
    setValidationStatus(isValid ? 'valid' : 'invalid');
    
    try {
      // Update the test order with validation status
      await axios.post(`${apiURL}/testorders/validation`, {
        test_order_id: test.testOrderId,
        ...validationData,
      });
      
      // Update local state
      setTest(prev => ({
        ...prev,
        ...validationData
      }));
      
      if (isValid) {
        // Test marked as valid - TestEngineer's job is done
        showSnackbar("Test marked as valid. ProjectTeam can now rate this test.", "success");
        // Stay on the page to show validation status but don't show rating modal for TestEngineer
      } else {
        showSnackbar("Test marked as invalid. No rating will be available for this test.", "info");
        // Stay on the page to show validation status
      }
    } catch (err) {
      showSnackbar("Failed to update validation status: " + (err.response?.data?.detail || err.message), "error");
    }
  };

  // Helper function to determine if fields should be editable
  const areFieldsEditable = () => {
    // TestEngineer cannot edit fields
    if (isTestEngineer || isAdmin) return false;

    // ProjectTeam can edit if test is in Re-edit or Rejected status
    if (isProjectTeam) {
      return test.status === "Re-edit" || test.status === "Rejected";
    }

    // For admin or other roles, allow editing
    return true;
  };

  // Handler for submitting star rating
  const handleSubmitStarRating = async () => {
    try {
        const payload = {
            test_order_id: test.testOrderId,
            rating: rating,
            rating_remarks: ratingRemarks,
            rated_by: userName,
            rated_on: new Date().toISOString(),
        };

        await axios.post(`${apiURL}/testorders/rating`, payload);
        showSnackbar("Test order rated successfully!", "success");
        setStarRatingModal(false);
        // Update local state with the new rating
        setTest(prev => ({
            ...prev,
            rating: rating,
            rating_remarks: ratingRemarks
        }));
        // Send mail with caseId 8
        await handleSendMail("8", jobOrderId, test.testOrderId);
        // Go back one page after submitting rating
        navigate(-1);
    } catch (err) {
        showSnackbar("Failed to submit rating: " + (err.response?.data?.detail || err.message), "error");
    }
  };

  // Add a handler for saving updates
  const handleSaveUpdates = async () => {
    try {
      const testOrderPayload = getTestOrderPayload(test.status);
      await axios.put(`${apiURL}/testorders-update?test_order_id=${encodeURIComponent(test.testOrderId)}`, testOrderPayload);
      showSnackbar("Test order updated successfully!", "success");
      await handleSendMail("9", jobOrderId, test.testOrderId); // Send mail with case ID 9
      navigate(-1);
    } catch (err) {
      showSnackbar("Failed to save updates: " + (err.response?.data?.detail || err.message), "error");
    }
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
          </div>
        </div>

        {/* Main Form */}
        <div className="mx-8 mb-8 mt-4 border rounded-lg shadow-lg px-8 py-6 bg-white dark:bg-black dark:border-gray-300">
          {/* Test Created Info */}
          <div className="flex flex-col justify-between mb-4">
            <div className="flex flex-col items-start gap-2 mb-3">
              {test.createdBy && (
                <div className="flex items-center gap-2">
                  <span className="text-red-800 dark:text-red-400 text-sm font-medium">Test Created by:</span>
                  <span className="font-medium text-red-800 dark:text-red-400 text-sm">{test.createdBy}</span>
                </div>
              )}
              {test.createdOn && (
                <div className="flex items-center gap-2">
                  <span className="text-red-800 dark:text-red-400 text-sm font-medium">Test Created on:</span>
                  <span className="font-medium text-red-800 dark:text-red-400 text-sm">
                    {formatDate(test.createdOn)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status Display */}
                <div className="flex items-center gap-3 mb-4">
                <span className="font-bold text-base text-blue-900 dark:text-blue-300">Test{test.testNumber}</span>
                {test.status === "Started" && (
                  <span className="flex items-center bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200 font-semibold text-xs px-2 py-1 rounded shadow ml-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#FFA500" }}>
                    <circle cx="12" cy="12" r="9" stroke="#FFA500" strokeWidth="2" fill="none" />
                    <path d="M12 7v5l3 3" stroke="#FFA500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Started
                  </span>
                )}
                {test.status === "Rejected" && (
                  <span className="flex items-center bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-800 dark:text-red-200 font-semibold text-xs px-2 py-1 rounded shadow ml-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#e53935" }}>
                    <circle cx="12" cy="12" r="9" stroke="#e53935" strokeWidth="2" fill="none" />
                    <line x1="9" y1="9" x2="15" y2="15" stroke="#e53935" strokeWidth="2" />
                    <line x1="15" y1="9" x2="9" y2="15" stroke="#e53935" strokeWidth="2" />
                  </svg>
                  Rejected
                  </span>
                )}
                {test.status === "Re-edit" && (
                  <span className="flex items-center bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-200 font-semibold text-xs px-2 py-1 rounded shadow ml-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#1976d2" }}>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#1976d2" strokeWidth="2" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#1976d2" strokeWidth="2" />
                  </svg>
                  Re-edit
                  </span>
                )}
                {test.status === "Completed" && (
                  <span className="flex items-center bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-800 dark:text-green-200 font-semibold text-xs px-2 py-1 rounded shadow ml-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#43a047" }}>
                    <circle cx="12" cy="12" r="9" stroke="#43a047" strokeWidth="2" fill="none" />
                    <path d="M9 12l2 2 4-4" stroke="#43a047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Completed
                  </span>
                )}
                {test.status === "under progress" && (
                  <span className="flex items-center bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200 font-semibold text-xs px-2 py-1 rounded shadow ml-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#FFA500" }}>
                    <circle cx="12" cy="12" r="9" stroke="#FFA500" strokeWidth="2" fill="none" />
                    <path d="M12 7v5l3 3" stroke="#FFA500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Under Progress
                  </span>
                )}
                
                {/* Validation Status Display for Completed Tests */}
                {test.status === "Completed" && test.validation_status && (
                  <span className={`flex items-center ${
                  test.validation_status === 'valid' 
                    ? 'bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-200' 
                    : 'bg-orange-100 dark:bg-orange-900 border border-orange-400 dark:border-orange-600 text-orange-800 dark:text-orange-200'
                  } font-semibold text-xs px-2 py-1 rounded shadow ml-2`}>
                  {test.validation_status === 'valid' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#2563eb" }}>
                    <circle cx="12" cy="12" r="9" stroke="#2563eb" strokeWidth="2" fill="none" />
                    <path d="M9 12l2 2 4-4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                  {test.validation_status === 'valid' ? 'Valid' : 'Invalid'}
                  </span>
                )}

                {/* Star Rating Display for Completed and Valid Tests - Right side box */}
                {test.status === "Completed" && test.validation_status === 'valid' && (test.rating > 0 || testOrder?.rating > 0) && (
                  <div className="ml-auto flex-1 flex justify-end min-w-0">
                  <div className="w-full md:w-auto min-w-0 max-w-3xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg shadow px-6 py-3 flex flex-col items-start">
                    <div className="font-semibold text-blue-900 dark:text-blue-200 text-sm mb-2">
                    Initiator Rating Remarks
                    </div>
                    <div className="flex items-center mb-2 w-full">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                      key={star}
                      className={`h-6 w-6 ${
                        star <= (testOrder?.rating || test.rating || 0)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300 dark:text-gray-600"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                      ({testOrder?.rating || 0}/5)
                    </span>
                    </div>
                    {((testOrder && testOrder.rating_remarks) || test.rating_remarks || ratingRemarks) && (
                      <div className="w-full text-sm text-gray-700 dark:text-gray-300 break-words overflow-wrap-anywhere max-h-[60vh] overflow-auto">
                        {testOrder?.rating_remarks || test.rating_remarks || ratingRemarks}
                      </div>
                    )}
                  </div>
                  </div>
                )}

            
            {test.status === "Completed" && isProjectTeam && !(test.rating > 0 || testOrder?.rating > 0) && (
              <div className="flex items-center gap-2 ml-4">
                {/* button should not be visible once rating has been given for once */}
                <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 rounded"
                  onClick={() => setStarRatingModal(true)}
                >
                  Rate Test
                </Button>
              </div>
            )}
            </div>

            {/* Show rejection remarks if status is Rejected */}
          {test.status === "Rejected" && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg p-4 mt-4 mb-2 shadow-inner">
              <div className="font-semibold text-sm text-red-700 dark:text-red-300 mb-2">
                Rejected Reason
              </div>
              <textarea
                value={test.remark}
                readOnly
                className="w-full border rounded p-2 min-h-[60px] max-h-[120px] resize-vertical bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                style={{ minWidth: "100%", fontSize: "1rem" }}
                rows={3}
              />
            </div>
          )}

          {/* Show re-edit remarks if status is Re-edit */}
          {test.status === "Re-edit" && (
            <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-400 dark:border-blue-600 rounded-lg p-4 mt-4 mb-2 shadow-inner">
              <div className="font-semibold text-sm text-blue-700 dark:text-blue-300 mb-2">
                Re-edit Reason from Test Engineer
              </div>
              <div className="w-full border rounded p-2 min-h-[60px] bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                {test.remark || "No re-edit remarks provided"}
              </div>
            </div>
          )}

          {/* Show rejection status and remarks if status is Rejected */}
          {test.status === "Rejected" && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg p-4 mt-4 mb-2 shadow-inner">
              <div className="font-semibold text-sm text-red-700 dark:text-red-300 mb-2">
                Test Order Rejected - Waiting for ProjectTeam Resubmission
              </div>
              <div className="text-sm text-red-600 dark:text-red-400 mb-2">
                This test order has been rejected by the Test Engineer. The ProjectTeam needs to make necessary changes and resubmit.
              </div>
              {test.rejection_remarks && (
                <div>
                  <div className="font-medium text-sm text-red-700 dark:text-red-300 mb-1">
                    Rejection Reason:
                  </div>
                  <div className="w-full border rounded p-2 min-h-[60px] bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    {test.rejection_remarks}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main form fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div>
              <Label className="dark:text-white">Test Type</Label>
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
              <Label className="dark:text-white">
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
              <Label className="dark:text-white">Vehicle Location</Label>
              <Input
                value={test.vehicleLocation}
                onChange={(e) => handleTestChange("vehicleLocation", e.target.value)}
                placeholder="Enter Vehicle Location"
                disabled={!areFieldsEditable()}
              />
            </div>
            <div>
              <Label className="dark:text-white">Cycle Gear Shift</Label>
              <Input
                value={test.cycleGearShift}
                onChange={(e) => handleTestChange("cycleGearShift", e.target.value)}
                placeholder="Enter Cycle Gear Shift"
                disabled={!areFieldsEditable()}
              />
            </div>
            <div>
              <Label className="dark:text-white">Inertia Class</Label>
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
              <Label className="dark:text-white">Dataset Name</Label>
              <Input
                value={test.datasetName}
                onChange={(e) => handleTestChange("datasetName", e.target.value)}
                placeholder="Enter Dataset Name"
                disabled={!areFieldsEditable()}
              />
            </div>
            <div>
              <Label className="dark:text-white">DPF</Label>
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
                <Label className="dark:text-white">DPF Regen Occurs (g)*</Label>
                <Input
                  value={test.dpfRegenOccurs || ""}
                  onChange={(e) => handleTestChange("dpfRegenOccurs", e.target.value)}
                  placeholder="Enter DPF Regen Occurs (g)"
                  disabled={!areFieldsEditable()}
                />
              </div>
            )}
            <div>
              <Label className="dark:text-white">Dataset flashed</Label>
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
              <Label className="dark:text-white">ESS</Label>
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
              <Label className="dark:text-white">Mode</Label>
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
              <Label className="dark:text-white">Hardware Change</Label>
              <Input
                value={test.hardwareChange}
                onChange={(e) => handleTestChange("hardwareChange", e.target.value)}
                placeholder="Enter Hardware Change"
                disabled={!areFieldsEditable()}
              />
            </div>
            <div>
              <Label className="dark:text-white">Shift</Label>
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
              <Label className="dark:text-white">Fuel Type</Label>
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
              <Label className="dark:text-white">Equipment Required</Label>
              <Input
                value={test.equipmentRequired}
                onChange={(e) => handleTestChange("equipmentRequired", e.target.value)}
                placeholder="Enter Equipment Required"
                disabled={!areFieldsEditable()}
              />
            </div>
            <div>
              <Label className="dark:text-white">Preferred Date</Label>
              <Input
                type="date"
                value={test.preferredDate}
                onChange={(e) => handleTestChange("preferredDate", e.target.value)}
                disabled={!areFieldsEditable()}
                min={new Date().toISOString().split('T')[0]} // Block previous dates
              />
            </div>
            <div>
              <Label className="dark:text-white">Emission Checklist Date</Label>
              <Input
                type="date"
                value={test.emissionCheckDate}
                onChange={(e) => handleTestChange("emissionCheckDate", e.target.value)}
                disabled={!areFieldsEditable()}
                // min={new Date().toISOString().split('T')[0]} // Block previous dates
                min={(() => {
                            // Allow only last 15 days including today and any future date
                            const today = new Date();
                            const minDate = new Date(today);
                            minDate.setDate(today.getDate() - 15);
                            return minDate.toISOString().split('T')[0];
                          })()}
              />
            </div>
            <div className="col-span-2">
              <Label className="dark:text-white">Specific Instruction</Label>
              <textarea
                value={test.specificInstruction}
                onChange={(e) => handleTestChange("specificInstruction", e.target.value)}
                placeholder="Enter Specific Instructions"
                disabled={!areFieldsEditable()}
                className="w-full border rounded p-2 min-h-[60px] max-h-[120px] resize-vertical dark:bg-black dark:text-white dark:placeholder-gray-400"
                style={{ minWidth: "100%", fontSize: "1rem" }}
                rows={3}
              />
            </div>

          </div>

          {/* Coast Down Data Section */}
          <div className="mt-6 border rounded shadow px-4 py-3 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm text-blue-700 dark:text-blue-300">
                Coast Down Data
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {console.log("Coast Down Section Render - showCoastDownData:", test.showCoastDownData)}
                  Debug: {test.showCoastDownData ? "Visible" : "Hidden"}
                </span>
                <Switch
                  checked={test.showCoastDownData}
                  onCheckedChange={(checked) => {
                    console.log("Switch toggled to:", checked);
                    setTest(prev => ({ ...prev, showCoastDownData: checked }));
                  }}
                  className="data-[state=checked]:bg-red-500"
                />
              </div>
            </div>
            {test.showCoastDownData && (
              <div>
                <div className="mb-3">
                  <Label className="text-xs dark:text-white">
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
                <div className="mb-2 font-semibold text-xs dark:text-white">CD Values</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <Label className="text-xs dark:text-white">
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
                    <Label className="text-xs dark:text-white">A (N)</Label>
                    <Input
                      value={test.aN}
                      onChange={(e) => handleTestChange("aN", e.target.value)}
                      placeholder="Enter A (N)"
                      className="mt-1"
                      disabled={!areFieldsEditable()}
                    />
                  </div>
                  <div>
                    <Label className="text-xs dark:text-white">B (N/kmph)</Label>
                    <Input
                      value={test.bNkmph}
                      onChange={(e) => handleTestChange("bNkmph", e.target.value)}
                      placeholder="Enter B (N/kmph)"
                      className="mt-1"
                      disabled={!areFieldsEditable()}
                    />
                  </div>
                  <div>
                    <Label className="text-xs dark:text-white">C (N/kmph^2)</Label>
                    <Input
                      value={test.cNkmph2}
                      onChange={(e) => handleTestChange("cNkmph2", e.target.value)}
                      placeholder="Enter C (N/kmph^2)"
                      className="mt-1"
                      disabled={!areFieldsEditable()}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mt-3">
                  <div>
                    <Label className="text-xs dark:text-white">F0 (N)</Label>
                    <Input
                      value={test.f0N}
                      onChange={(e) => handleTestChange("f0N", e.target.value)}
                      placeholder="Enter F0 (N)"
                      className="mt-1"
                      disabled={!areFieldsEditable()}
                    />
                  </div>
                  <div>
                    <Label className="text-xs dark:text-white">F1 (N/kmph)</Label>
                    <Input
                      value={test.f1Nkmph}
                      onChange={(e) => handleTestChange("f1Nkmph", e.target.value)}
                      placeholder="Enter F1 (N/kmph)"
                      className="mt-1"
                      disabled={!areFieldsEditable()}
                    />
                  </div>
                  <div>
                    <Label className="text-xs dark:text-white">F2 (N/kmph^2)</Label>
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

          {/* Attachments Section */}
          <div className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-4 mt-4 mb-2 shadow-inner">
            <div className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
              Attachments
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="dark:text-white">Emission Checklist Attachment</Label>
                <Label className="dark:text-white">
                  {(returnPath && returnPath.includes('rde')) || (jobOrderId && jobOrderId.includes('RDE'))
                    ? "Emission Checklist Attachment / Type-1 Report"
                    : "Emission Checklist Attachment"
                  }
                </Label>
                <DropzoneFileList
                  buttonText={
                    (returnPath && returnPath.includes('rde')) || (jobOrderId && jobOrderId.includes('RDE'))
                      ? "Emission Checklist Attachment / Type-1 Report"
                      : "Emission Checklist Attachment"
                  }
                  name="emission_check_attachment"
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
                <Label className="dark:text-white">Dataset Attachment</Label>
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
                  viewOnly={isTestEngineer || isAdmin}
                />
              </div>
              <div>
                <Label className="dark:text-white">A2L Attachment</Label>
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
                  viewOnly={isTestEngineer || isAdmin}
                />
              </div>
              <div>
                <Label className="dark:text-white">Experiment Attachment</Label>
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
                  viewOnly={isTestEngineer || isAdmin}
                  originalJobOrderId={jobOrderId || ""}
                />
              </div>
              <div>
                <Label className="dark:text-white">DBC Attachment</Label>
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
                  viewOnly={isTestEngineer || isAdmin}
                  originalJobOrderId={jobOrderId || ""}
                />
              </div>
              <div>
                <Label className="dark:text-white">WLTP Input Sheet</Label>
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
                  viewOnly={isTestEngineer || isAdmin}
                  originalJobOrderId={jobOrderId || ""}
                />
              </div>
            </div>
          </div>

          {/* Test Engineers Attachments */}
          <div className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-4 mt-4 mb-2 shadow-inner">
            <div className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
              Test Engineers Attachments
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="dark:text-white">PDF Report</Label>
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
                <Label className="dark:text-white">Excel Report</Label>
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
                <Label className="dark:text-white">DAT File Attachment</Label>
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
                <Label className="dark:text-white">Others Attachment</Label>
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
              {test.status === "Completed" && isTestEngineer && !test.validation_status && (
                <div className="md:col-start-3 md:col-span-1">
                  <Label className="dark:text-white">Test Validation</Label>
                  {(test.complete_remarks) && (
                    <div className="mb-3">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                        Completion Remarks:
                      </Label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
                        <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                          {test.complete_remarks}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3 justify-end">
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                      type="button"
                      onClick={() => handleValidationDecision(false)}
                    >
                      Mark as Invalid
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                      type="button"
                      onClick={() => handleValidationDecision(true)}
                    >
                      Mark as Valid
                    </Button>
                  </div>
                </div>
              )}

              {/* Test Validation Status - positioned on the right side */}
                      {test.status === "Completed" && test.validation_status && (
                      <div className="md:col-start-3 md:col-span-1">
                        <Label className="dark:text-white">Test Validation</Label>
                        <div className={`mt-2 p-4 rounded-lg border ${
                        test.validation_status === 'valid'
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }`}>
                        <div className="mb-3">
                          <h3 className={`text-lg font-semibold mb-1 ${
                          test.validation_status === 'valid'
                            ? 'text-green-900 dark:text-green-100'
                            : 'text-red-900 dark:text-red-100'
                          }`}>
                          Test Validation: {test.validation_status === 'valid' ? 'VALID' : 'INVALID'}
                          </h3>
                          <p className={`text-sm ${
                          test.validation_status === 'valid'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                          }`}>
                          Validated by: {test.validated_by} on {formatDate(test.validated_on)}
                          </p>
                          
                          {/* Message for ProjectTeam about rating availability */}
                          {isProjectTeam && (
                          <div className={`mt-2 p-2 rounded text-xs ${
                            test.validation_status === 'valid'
                            ? 'bg-green-100 dark:bg-green-800/50 text-green-700 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-800/50 text-red-700 dark:text-red-300'
                          }`}>
                            {(test.rating > 0 || testOrder?.rating > 0)
                            ? '✓ You have already rated this test. Thank you for your feedback!'
                            : '✓ This test can be rated. Use the "Rate Test" button above to provide your feedback.'
                            }
                          </div>
                          )}
                        </div>
                        {(test.complete_remarks || test.remark) && (
                          <div>
                          <Label className={`text-sm font-medium mb-1 block ${
                            test.validation_status === 'valid'
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-red-700 dark:text-red-300'
                          }`}>
                            Completion Remarks:
                          </Label>
                          <div className="p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
                            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                            {test.complete_remarks || test.remark}
                            </p>
                          </div>
                          </div>
                        )}
                        </div>
                      </div>
                      )}
                    </div>
                    </div>

                    {/* Completion Remarks and Validation Section for TestEngineer */}
          {false && ( // removed standalone section; now rendered inside the main grid above
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            </div>
          )}

          {/* Validation Status Display for Completed Tests */}
          {false && (
            <div className={`mt-6 p-4 rounded-lg border`}>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end mt-6 gap-2">
            {/* Buttons for TestEngineer and admin role */}
            {(isTestEngineer || isAdmin) && (test.status === "Created") && (
              <>
                <Button
                  className="bg-green-600 text-white text-xs px-3 py-1 rounded"
                  type="button"
                  onClick={async () => {
                    await handleStartTestOrder();
                    await handleSendMail("1.1", jobOrderId, test.testOrderId);
                  }}
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
                    // Mail will be sent after rejection reason is filled and submitted
                  }}
                >
                  Reject
                </Button>
              </>
            )}

            {/* Buttons for TestEngineer and Admin - Only show Re-edit/Complete for Started and under progress */}
            {(isTestEngineer || isAdmin) && (test.status === "Started" || test.status === "under progress") && (
              <>
                <Button
                  className="bg-blue-600 text-white text-xs px-3 py-1 rounded"
                  type="button"
                  onClick={() => {
                    setModalActionType("re-edit");
                    setMailRemarks("");
                    setMailRemarksModal(true);
                    // Removed mail call from here
                  }}
                >
                  Re-edit
                </Button>
                <Button
                  className="bg-green-600 text-white text-xs px-3 py-1 rounded"
                  type="button"
                  onClick={() => {
                    // For Test Engineers, show validation choice modal first
                    if (isTestEngineer) {
                      setValidationChoiceModal(true);
                    } else {
                      // For other roles, go directly to completion remarks
                      setModalActionType("complete");
                      setMailRemarks("");
                      setCompleteRemarks((testOrder?.status === "Completed") ? (test.complete_remarks || "") : "");
                      setMailRemarksModal(true);
                    }
                  }}
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

            {/* Save button for Test Engineer after test order is completed */}
            {isTestEngineer && test.status === "Completed" && (
              <Button
                className="bg-blue-600 text-white text-xs px-6 py-2 rounded"
                onClick={handleSaveUpdates}
              >
                Save
              </Button>
            )}
          </div>
        </div>

        {/* Validation Choice Modal - For Test Engineers */}
        {validationChoiceModal && isTestEngineer && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-6 w-96">
              <div className="font-semibold mb-4 dark:text-white text-lg">
                Test Validation
              </div>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Please choose the validation status for this test:
              </div>
              <div className="flex flex-col gap-3 mb-6">
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded"
                  type="button"
                  onClick={() => {
                    setSelectedValidation('invalid');
                    setValidationChoiceModal(false);
                    setValidationConfirmModal(true);
                  }}
                >
                  Mark as Invalid
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded"
                  type="button"
                  onClick={() => {
                    setSelectedValidation('valid');
                    setValidationChoiceModal(false);
                    setValidationConfirmModal(true);
                  }}
                >
                  Mark as Valid
                </Button>
              </div>
              <div className="flex justify-end">
                <Button
                  className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-4 py-2 rounded"
                  type="button"
                  onClick={() => setValidationChoiceModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Confirmation Modal */}
        {validationConfirmModal && selectedValidation && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-6 w-96">
              <div className="font-semibold mb-4 dark:text-white text-lg">
                Confirm Validation
              </div>
              <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to mark this test as <span className={`font-semibold ${selectedValidation === 'valid' ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedValidation === 'valid' ? 'VALID' : 'INVALID'}
                </span>?
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-4 py-2 rounded"
                  type="button"
                  onClick={() => {
                    setValidationConfirmModal(false);
                    setSelectedValidation(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className={`${selectedValidation === 'valid' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white px-4 py-2 rounded`}
                  type="button"
                  onClick={() => {
                    // Close confirmation modal and show completion remarks modal
                    setValidationConfirmModal(false);
                    setModalActionType("complete");
                    setMailRemarks("");
                    setCompleteRemarks((testOrder?.status === "Completed") ? (test.complete_remarks || "") : "");
                    setMailRemarksModal(true);
                  }}
                >
                  Yes, Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mail Remarks Modal */}
        {mailRemarksModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-6 w-96">
              <div className="font-semibold mb-2 dark:text-white">
                {modalActionType === "re-edit"
                  ? "Re-edit Reason"
                  : modalActionType === "reject"
                    ? "Rejection Reason"
                    : modalActionType === "complete"
                      ? "Completion Remarks"
                      : "Update Comments"}
              </div>
              
              {/* Show validation status for completion remarks */}
              {modalActionType === "complete" && selectedValidation && (
                <div className="mb-3 p-2 rounded border">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Test Validation: </span>
                  <span className={`font-semibold ${selectedValidation === 'valid' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedValidation === 'valid' ? 'VALID' : 'INVALID'}
                  </span>
                </div>
              )}
              
              <textarea
                className="w-full border rounded p-2 mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                rows={3}
                value={
                  modalActionType === "complete"
                    ? completeRemarks
                    : mailRemarks
                }
                onChange={(e) => {
                  if (modalActionType === "complete") {
                    setCompleteRemarks(e.target.value);
                  } else {
                    setMailRemarks(e.target.value);
                  }
                }}
                placeholder={
                  modalActionType === "re-edit"
                    ? "Enter reason for re-edit..."
                    : modalActionType === "reject"
                      ? "Enter reason for rejection..."
                      : modalActionType === "complete"
                        ? "Enter completion remarks..."
                        : "Enter update comments..."
                }
              />
              <div className="flex justify-end gap-2">
                <Button
                  className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-4 py-1 rounded"
                  type="button"
                  onClick={() => {
                    setMailRemarksModal(false);
                    // Reset validation states if canceling completion
                    if (modalActionType === "complete") {
                      setSelectedValidation(null);
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className={`${modalActionType === "re-edit"
                    ? "bg-blue-600"
                    : modalActionType === "reject"
                      ? "bg-red-600"
                      : modalActionType === "complete"
                        ? "bg-green-600"
                        : "bg-blue-600"
                    } text-white px-4 py-1 rounded`}
                  type="button"
                  onClick={async () => {
                    if (modalActionType === "complete") {
                      await handleCompleteTestOrder();
                      await handleSendMail("6", jobOrderId, test.testOrderId); // Mail called after completion
                      // Don't navigate back here - stay on page to show validation section
                    } else if (isProjectTeam) {
                      handleSubmitMailRemarks();
                    } else if (isTestEngineer || isAdmin) {
                      if (modalActionType === "re-edit") {
                        await handleStatusUpdate("Re-edit", mailRemarks);
                        await handleSendMail("3", jobOrderId, test.testOrderId); // Mail called after remarks filled and submit
                      } else if (modalActionType === "reject") {
                        await handleStatusUpdate("Rejected", mailRemarks);
                        await handleSendMail("4", jobOrderId, test.testOrderId); // Mail called after rejection reason is filled and submitted
                      }
                    } else {
                      handleSubmitMailRemarks();
                    }
                  }}
                  disabled={
                    modalActionType === "complete"
                      ? !completeRemarks.trim()
                      : !mailRemarks.trim()
                  }
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Star Rating Modal - Only accessible by ProjectTeam for valid tests */}
               {starRatingModal && isProjectTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-6 w-96">
              <div className="font-semibold mb-4 dark:text-white">
                Rate Test Execution Performance
              </div>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2">
                  The test has been validated as{" "}
                  <span
                    className={`font-medium ${
                      test.validation_status === "valid"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {test.validation_status?.toUpperCase() || "INVALID"}
                  </span>{" "}
                  by the Test Engineer.
                </p>
                <p className="mb-2">
                  Please rate the quality and execution of this test order:
                </p>
              </div>
              
              {/* Star Rating Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rate the quality of test execution (1-5 stars):
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <svg
                        className={`h-8 w-8 cursor-pointer transition-colors ${
                          star <= rating 
                            ? "text-yellow-400 fill-current" 
                            : "text-gray-300 dark:text-gray-600 hover:text-yellow-200"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    ({rating}/5)
                  </span>
                </div>
              </div>

              {/* Rating Comments */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comments (optional):
                </label>
                <textarea
                  className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  rows={3}
                  value={ratingRemarks}
                  onChange={(e) => setRatingRemarks(e.target.value)}
                  placeholder="Share your feedback about the test execution quality, accuracy, timeliness, etc..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-4 py-1 rounded"
                  type="button"
                  onClick={() => {
                    setStarRatingModal(false);
                    setRating(testOrder?.rating || 0);
                    setRatingRemarks(testOrder?.rating_remarks || "");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded"
                  type="button"
                  onClick={async () => {
                    await handleSubmitStarRating();
                    // Stay on the page after rating submission
                  }}
                  disabled={rating === 0}
                >
                  Submit Rating
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
