"use client";
import { ArrowBack, Add, Cancel, Edit, Done, CheckCircle, Close as CloseIcon } from "@mui/icons-material";
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
import useStore from "@/store/useStore";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import CFTMembers from "@/components/CFTMembers";
import showSnackbar from "@/utils/showSnackbar";
import { GrClone } from "react-icons/gr";
import { MdPeopleAlt } from "react-icons/md";

const apiURL = import.meta.env.VITE_BACKEND_URL

const departments = ["VTC_JO Chennai", "RDE JO", "VTC_JO Nashik"];

export default function CreateJobOrder() {
  const [cftMembers, setCftMembers] = useState([]);
  const [form, setForm] = useState({
    projectCode: "",
    vehicleBuildLevel: "",
    vehicleModel: "",
    vehicleBodyNumber: "",
    vehicleSerialNumber: "",
    transmissionType: "",
    finalDriveAxleRatio: "",
    engineSerialNumber: "",
    engineType: "",
    domain: "",
    department: "VTC_JO Chennai", // Default value for Chennai
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
    // New fields for RDE JO
    wbsCode: "",
    vehicleGVW: "",
    vehicleKerbWeight: "",
    vehicleTestPayloadCriteria: "",
    requestedPayloadKg: "",
    idleExhaustMassFlow: "",
  });

  const [vehicleFormData, setVehicleFormData] = useState(null);
  const [engineFormData, setEngineFormData] = useState(null);
  const [showCFTPanel, setShowCFTPanel] = useState(false);
  const [cdFieldErrors, setCdFieldErrors] = useState({});
  const [cdError, setCdError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [jobOrderId, setJobOrderId] = useState();
  const [vehicleList, setVehicleList] = useState([]);
  const [engineList, setEngineList] = useState([]);
  const [vehicleBodyNumbers, setVehicleBodyNumbers] = useState([]);
  const [engineNumbers, setEngineNumbers] = useState([]);
  const { userRole, userId, userName } = useAuth();
  const [isPreFilling, setIsPreFilling] = useState(false);
  const [vehicleAccordionOpen, setVehicleAccordionOpen] = useState(false);
  const [vehicleEditable, setVehicleEditable] = useState(null);
  const [vehicleEditMode, setVehicleEditMode] = useState(false); // New state for vehicle edit mode
  const [engineAccordionOpen, setEngineAccordionOpen] = useState(false);
  const [engineEditable, setEngineEditable] = useState(null);
  const [engineEditMode, setEngineEditMode] = useState(false); // New state for engine edit mode
  const [mailLoading, setMailLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [existingCoastDownId, setExistingCoastDownId] = useState(null);
  const [testTypes, setTestTypes] = useState([]);
  const [inertiaClasses, setInertiaClasses] = useState([]);
  const [modes, setModes] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);

  // Add state for clone modal
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [cloneDropdownOpen, setCloneDropdownOpen] = useState(false);
  const [selectedTestOrderForClone, setSelectedTestOrderForClone] = useState("");

  const handleAddTest = () => {
    const existingTestOrdersCount = (allTestOrders[location.state?.originalJobOrderId] || []).length;
    const currentTestsCount = tests.length;
    const nextTestNumber = existingTestOrdersCount + currentTestsCount + 1;

    setTests((prev) => [
      ...prev,
      {
        testNumber: nextTestNumber, // Add test number
        engineNumber: "",
        testType: "",
        objective: "",
        vehicleLocation: "",
        cycleGearShift: "",
        datasetName: "",
        inertiaClass: "",
        dpf: "",
        dpfRegenOccurs: "",
        datasetflashed: "",
        ess: "",
        mode: "",
        hardwareChange: "",
        equipmentRequired: "",
        shift: "",
        fuelType: "",
        preferredDate: "",
        emissionCheckDate: "",
        emissionCheckAttachment: "",
        dataset_attachment: "",
        a2l_attachment: "",
        experiment_attachment: "",
        dbc_attachment: "",
        wltp_attachment: "",
        pdf_report: "",
        excel_report: "",
        dat_file_attachment: "",
        others_attachment: "",
        specificInstruction: "",
        uploadDocuments: null,
        testOrderId: null,
        job_order_id: null,
        showCoastDownData: false,
        // Coast down data fields for individual test
        cdReportRef: "",
        vehicleRefMass: "",
        aN: "",
        bNkmph: "",
        cNkmph2: "",
        f0N: "",
        f1Nkmph: "",
        f2Nkmph2: "",
      },
    ]);
  };

  const handleCloneTest = async () => {
    setCloneDropdownOpen(!cloneDropdownOpen);
  };

  // Add function to handle cloning a specific test order
  const handleCloneSpecificTestOrder = async (testOrderId) => {
    try {
      // Fetch the specific test order details
      const testOrderData = await fetchTestOrderById(testOrderId);

      if (!testOrderData) {
        showSnackbar("Failed to fetch test order details", "error");
        return;
      }

      // Calculate the next test number
      const existingTestOrdersCount = (allTestOrders[location.state?.originalJobOrderId] || []).length;
      const currentTestsCount = tests.length;
      const nextTestNumber = existingTestOrdersCount + currentTestsCount + 1;

      // Create a new test with prefilled values from the cloned test order
      const clonedTest = {
        testNumber: nextTestNumber,
        engineNumber: testOrderData.engine_number || "",
        testType: testOrderData.test_type || "",
        objective: testOrderData.test_objective || "",
        vehicleLocation: testOrderData.vehicle_location || "",
        cycleGearShift: testOrderData.cycle_gear_shift || "",
        datasetName: testOrderData.dataset_name || "",
        inertiaClass: testOrderData.inertia_class || "",
        dpf: testOrderData.dpf || "",
        dpfRegenOccurs: testOrderData.dpf_regen_occurs || "",
        datasetflashed: testOrderData.dataset_flashed === true ? "Yes" : testOrderData.dataset_flashed === false ? "No" : "",
        ess: testOrderData.ess || "",
        mode: testOrderData.mode || "",
        hardwareChange: testOrderData.hardware_change || "",
        equipmentRequired: testOrderData.equipment_required || "",
        shift: testOrderData.shift || "",
        fuelType: testOrderData.fuel_type || "",
        preferredDate: testOrderData.preferred_date || "",
        emissionCheckDate: testOrderData.emission_check_date || "",
        specificInstruction: testOrderData.specific_instruction || "",

        // Parse attachment fields
        emissionCheckAttachment: parseAttachment(testOrderData.emission_check_attachment),
        dataset_attachment: parseAttachment(testOrderData.dataset_attachment),
        a2l_attachment: parseAttachment(testOrderData.a2l_attachment),
        experiment_attachment: parseAttachment(testOrderData.experiment_attachment),
        dbc_attachment: parseAttachment(testOrderData.dbc_attachment),
        wltp_attachment: parseAttachment(testOrderData.wltp_attachment),
        pdf_report: parseAttachment(testOrderData.pdf_report),
        excel_report: parseAttachment(testOrderData.excel_report),
        dat_file_attachment: parseAttachment(testOrderData.dat_file_attachment),
        others_attachment: parseAttachment(testOrderData.others_attachement),

        // Reset fields for new test order
        testOrderId: null,
        job_order_id: null,
        status: null,
        showCoastDownData: false,

        // Coast down data fields (empty for new test)
        cdReportRef: "",
        vehicleRefMass: "",
        aN: "",
        bNkmph: "",
        cNkmph2: "",
        f0N: "",
        f1Nkmph: "",
        f2Nkmph2: "",
      };

      // Add the cloned test to the tests array
      setTests((prev) => [...prev, clonedTest]);

      // Close the modal and reset selection
      setCloneModalOpen(false);
      setSelectedTestOrderForClone("");

      showSnackbar(`Test cloned successfully from Test Order: ${testOrderId}`, "success");

    } catch (err) {
      console.error("Error cloning test order:", err);
      showSnackbar("Failed to clone test order: " + (err.response?.data?.detail || err.message), "error");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };
  // Handler to update a test
  const handleTestChange = (idx, field, value) => {
    setTests((prev) =>
      prev.map((test, i) => (i === idx ? { ...test, [field]: value } : test))
    );
  };

  // Handler to delete a test
  const handleDeleteTest = (idx) => {
    setTests((prev) => prev.filter((_, i) => i !== idx));
  };

  // Fetch vehicle and engine form data from localStorage
  useEffect(() => {
    const vData = localStorage.getItem("vehicleFormData");
    if (vData) setVehicleFormData(JSON.parse(vData));
    const eData = localStorage.getItem("engineFormData");
    if (eData) setEngineFormData(JSON.parse(eData));
  }, []);

  // Use global store for project and domain options
  const projectOptions = useStore((state) => state.projectOptions);
  const fetchProjects = useStore((state) => state.fetchProjects);
  const domainOptions = useStore((state) => state.domainOptions);
  const fetchDomains = useStore((state) => state.fetchDomains);

  // Fetch project and domain options on mount
  useEffect(() => {
    fetchProjects();
    fetchDomains();
  }, [fetchProjects, fetchDomains]);

  // Fetch test types from API
  useEffect(() => {
    const fetchTestTypes = async () => {
      try {
        const response = await axios.get(`${apiURL}/test-types`);
        setTestTypes(response.data || []);
      } catch (error) {
        console.error("Error fetching test types:", error);
        setTestTypes([]);
      }
    };

    fetchTestTypes();
  }, []);

  // Fetch inertia classes from API
  useEffect(() => {
    const fetchInertiaClasses = async () => {
      try {
        const response = await axios.get(`${apiURL}/inertia-classes`);
        setInertiaClasses(response.data || []);
      } catch (error) {
        console.error("Error fetching inertia classes:", error);
        setInertiaClasses([]);
      }
    };

    fetchInertiaClasses();
  }, []);

  // Fetch modes from API
  useEffect(() => {
    const fetchModes = async () => {
      try {
        const response = await axios.get(`${apiURL}/modes`);
        setModes(response.data || []);
      } catch (error) {
        console.error("Error fetching modes:", error);
        setModes([]);
      }
    };

    fetchModes();
  }, []);

  // Fetch fuel types from API
  useEffect(() => {
    const fetchFuelTypes = async () => {
      try {
        const response = await axios.get(`${apiURL}/fuel-types`);
        setFuelTypes(response.data || []);
      } catch (error) {
        console.error("Error fetching fuel types:", error);
        setFuelTypes([]);
      }
    };

    fetchFuelTypes();
  }, []);

  // Fetch vehicle and engine lists from API on mount
  useEffect(() => {
    // Replace with your actual API endpoints
    fetch("/api/vehicles")
      .then((res) => res.json())
      .then((data) => setVehicleList(data || []));
    fetch("/api/engines")
      .then((res) => res.json())
      .then((data) => setEngineList(data || []));

    // Determine department - check if we have job order data first
    const currentDepartment = location.state?.jobOrder?.department || form.department || "VTC_JO Chennai";

    // Fetch vehicle body numbers (now returns both body number and vehicle_serial_number)
    (async () => {
      try {
        // Pass department as query param for filtering
        const res = await axios.get(
          `${apiURL}/vehicle-body-numbers`,
          { params: { department: currentDepartment } }
        );
        setVehicleBodyNumbers(res.data || []);
      } catch (err) {
        setVehicleBodyNumbers([]);
      }
    })();

    // Fetch engine numbers from FastAPI endpoint
    (async () => {
      try {
        // Pass department as query param for filtering
        const res = await axios.get(
          `${apiURL}/engine-numbers`,
          { params: { department: currentDepartment } }
        );
        setEngineNumbers(res.data || []);
      } catch (err) {
        setEngineNumbers([]);
      }
    })();
  }, [location.state?.jobOrder?.department]); // Add dependency on job order department

  // Fetch vehicle details using the new API when body number changes
  const handleVehicleBodyChange = (value) => {
    // Don't interfere if we're currently pre-filling
    if (isPreFilling) return;

    const found = vehicleBodyNumbers.find(
      (v) => v.vehicle_body_number === value
    );
    setForm((prev) => ({
      ...prev,
      vehicleBodyNumber: value,
      vehicleSerialNumber: found?.vehicle_serial_number || "",
      engineSerialNumber: "",
      engineType: "",
    }));
    // Use the new API endpoint
    if (value) {
      axios
        .get(`${apiURL}/vehicles/by-body-number/${encodeURIComponent(value)}`)
        .then((res) => {
          setVehicleEditable(res.data);
        })
        .catch((error) => {
          setVehicleEditable(null);
        });
    }
  };

  // Keep vehicleEditable in sync with API response
  useEffect(() => {
    if (form.vehicleBodyNumber && !isPreFilling) {
      axios
        .get(
          `${apiURL}/vehicles/by-body-number/${encodeURIComponent(
            form.vehicleBodyNumber
          )}`
        )
        .then((res) => setVehicleEditable(res.data))
        .catch(() => setVehicleEditable(null));
    } else if (!form.vehicleBodyNumber && !isPreFilling) {
      setVehicleEditable(null);
    }
    // eslint-disable-next-line
  }, [form.vehicleBodyNumber, isPreFilling]);

  // Handler for editable vehicle form changes
  const handleVehicleEditableChange = (field, value) => {
    setVehicleEditable((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fetch engine details using the new API when engine number changes
  const handleEngineNumberChange = (value) => {
    // Don't interfere if we're currently pre-filling
    if (isPreFilling) return;

    setForm((prev) => ({
      ...prev,
      engineSerialNumber: value,
    }));
    // Use the new API endpoint
    if (value) {
      axios
        .get(`${apiURL}/engines/by-engine-number/${encodeURIComponent(value)}`)
        .then((res) => {
          setEngineEditable(res.data);
          setForm((prev) => ({
            ...prev,
            engineType: res.data?.engineType || prev.engineType,
          }));
        })
        .catch((error) => {
          setEngineEditable(null);
        });
    }
  };

  // Keep engineEditable in sync with API response
  useEffect(() => {
    if (form.engineSerialNumber && !isPreFilling) {
      axios
        .get(
          `${apiURL}/engines/by-engine-number/${encodeURIComponent(
            form.engineSerialNumber
          )}`
        )
        .then((res) => setEngineEditable(res.data))
        .catch(() => setEngineEditable(null));
    } else if (!form.engineSerialNumber && !isPreFilling) {
      setEngineEditable(null);
    }
    // eslint-disable-next-line
  }, [form.engineSerialNumber, isPreFilling]);

  // Handler for editable engine form changes
  const handleEngineEditableChange = (field, value) => {
    setEngineEditable((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Prefill form if jobOrder is passed via navigation state
  // In the useEffect that handles pre-filling (around line 490-600), update this part:

  useEffect(() => {
    // Only run once when component mounts and we have job order data
    if (location.state?.jobOrder && !hasPreFilledRef.current) {
      const jobOrder = location.state.jobOrder;

      // Mark that we've started pre-filling to prevent multiple executions
      hasPreFilledRef.current = true;

      // Set pre-filling state to prevent other useEffects from interfering
      setIsPreFilling(true);
      setIsLoading(true);

      // Show success message if this is for creating test orders
      if (location.state.isEdit) {
      }

      // Function to fetch and pre-fill coast down data
      const fetchAndFillCoastDownData = async (coastDownDataId) => {
        if (coastDownDataId) {
          try {
            const response = await axios.get(
              `${apiURL}/coastdown/${coastDownDataId}`
            );
            const coastDownData = response.data;

            return {
              cdReportRef: coastDownData.coast_down_reference || "",
              vehicleRefMass:
                coastDownData.vehicle_reference_mass?.toString() || "",
              aN: coastDownData.a_value?.toString() || "",
              bNkmph: coastDownData.b_value?.toString() || "",
              cNkmph2: coastDownData.c_value?.toString() || "",
              f0N: coastDownData.f0_value?.toString() || "",
              f1Nkmph: coastDownData.f1_value?.toString() || "",
              f2Nkmph2: coastDownData.f2_value?.toString() || "",
            };
          } catch (error) {
            console.error("Error fetching coast down data:", error);
            return {};
          }
        }
        return {};
      };

      const jobOrderId =
        location.state?.originalJobOrderId ||
        location.state?.jobOrder?.job_order_id ||
        "";

      // Async function to handle the pre-filling with coast down data
      const preFillForm = async () => {
        // Set existing CoastDownData_id for potential updates
        if (jobOrder.CoastDownData_id) {
          setExistingCoastDownId(jobOrder.CoastDownData_id);
        }

        // Fetch coast down data if CoastDownData_id is available
        const coastDownFields = await fetchAndFillCoastDownData(
          jobOrder.CoastDownData_id
        );

        // Update department-specific data based on job order department
        const departmentFromJobOrder = jobOrder.department || "VTC_JO Chennai";

        // Fetch vehicle body numbers and engine numbers for the specific department
        try {
          const [vehicleBodyRes, engineNumberRes] = await Promise.all([
            axios.get(`${apiURL}/vehicle-body-numbers`, {
              params: { department: departmentFromJobOrder }
            }),
            axios.get(`${apiURL}/engine-numbers`, {
              params: { department: departmentFromJobOrder }
            })
          ]);

          setVehicleBodyNumbers(vehicleBodyRes.data || []);
          setEngineNumbers(engineNumberRes.data || []);
        } catch (error) {
          console.error("Error fetching department-specific data:", error);
          setVehicleBodyNumbers([]);
          setEngineNumbers([]);
        }

        const newFormData = {
          ...form, // Preserve existing form state first
          projectCode: jobOrder.project_code || "",
          vehicleBuildLevel:
            jobOrder.vehicle_build_level || jobOrder.vehicleBuildLevel || "",
          vehicleModel: jobOrder.vehicle_model || jobOrder.vehicleModel || "",
          vehicleBodyNumber: jobOrder.vehicle_body_number || "",
          vehicleSerialNumber: jobOrder.vehicle_serial_number || "",
          transmissionType:
            jobOrder.transmission_type || jobOrder.transmissionType || "",
          finalDriveAxleRatio:
            jobOrder.final_drive_axle_ratio ||
            jobOrder.finalDriveAxleRatio ||
            "",
          engineSerialNumber: jobOrder.engine_serial_number || "",
          engineType:
            jobOrder.type_of_engine ||
            jobOrder.engine_type ||
            jobOrder.engineType ||
            "",
          domain: jobOrder.domain || "",
          department: jobOrder.department || "",
          coastDownTestReportReference:
            jobOrder.coast_down_test_report_reference ||
            jobOrder.coastDownTestReportReference ||
            "",
          tyreMake: jobOrder.tyre_make || jobOrder.tyreMake || "",
          tyreSize: jobOrder.tyre_size || jobOrder.tyreSize || "",
          tyrePressureFront:
            jobOrder.tyre_pressure_front || jobOrder.tyrePressureFront || "",
          tyrePressureRear:
            jobOrder.tyre_pressure_rear || jobOrder.tyrePressureRear || "",
          tyreRunIn: jobOrder.tyre_run_in || jobOrder.tyreRunIn || "",
          engineRunIn: jobOrder.engine_run_in || jobOrder.engineRunIn || "",
          gearBoxRunIn: jobOrder.gearbox_run_in || jobOrder.gearBoxRunIn || "",
          axleRunIn: jobOrder.axle_run_in || jobOrder.axleRunIn || "",
          engineOilSpecification:
            jobOrder.engine_oil_specification ||
            jobOrder.engineOilSpecification ||
            "",
          axleOilSpecification:
            jobOrder.axle_oil_specification ||
            jobOrder.axleOilSpecification ||
            "",
          transmissionOilSpecification:
            jobOrder.transmission_oil_specification ||
            jobOrder.transmissionOilSpecification ||
            "",
          driveType: jobOrder.drive_type || jobOrder.driveType || "",
          drivenWheel: jobOrder.driven_wheel || jobOrder.drivenWheel || "",
          intercoolerLocation:
            jobOrder.intercooler_location || jobOrder.intercoolerLocation || "",
          gearRatio: jobOrder.gear_ratio || jobOrder.gearRatio || "",
          // Coast down data from API (takes precedence over job order fallback)
          ...coastDownFields,
          // Fallback to job order fields if coast down API didn't return data
          cdReportRef:
            coastDownFields.cdReportRef ||
            jobOrder.cd_report_ref ||
            jobOrder.cdReportRef ||
            "",
          vehicleRefMass:
            coastDownFields.vehicleRefMass ||
            jobOrder.vehicle_ref_mass ||
            jobOrder.vehicleRefMass ||
            "",
          aN: coastDownFields.aN || jobOrder.a_n || jobOrder.aN || "",
          bNkmph:
            coastDownFields.bNkmph ||
            jobOrder.b_n_kmph ||
            jobOrder.bNkmph ||
            "",
          cNkmph2:
            coastDownFields.cNkmph2 ||
            jobOrder.c_n_kmph2 ||
            jobOrder.cNkmph2 ||
            "",
          f0N: coastDownFields.f0N || jobOrder.f0_n || jobOrder.f0N || "",
          f1Nkmph:
            coastDownFields.f1Nkmph ||
            jobOrder.f1_n_kmph ||
            jobOrder.f1Nkmph ||
            "",
          f2Nkmph2:
            coastDownFields.f2Nkmph2 ||
            jobOrder.f2_n_kmph2 ||
            jobOrder.f2Nkmph2 ||
            "",
          // Add new fields for RDE JO
          wbsCode: jobOrder.wbsCode || jobOrder.wbs_code || "",
          vehicleGVW: jobOrder.vehicleGVW || jobOrder.vehicle_gwv || "",
          vehicleKerbWeight: jobOrder.vehicleKerbWeight || jobOrder.vehicle_kerb_weight || "",
          vehicleTestPayloadCriteria: jobOrder.vehicleTestPayloadCriteria || jobOrder.vehicle_test_payload_criteria || "",
          requestedPayloadKg: jobOrder.requestedPayloadKg || jobOrder.requested_payload || "",
          idleExhaustMassFlow: jobOrder.idleExhaustMassFlow || jobOrder.idle_exhaust_mass_flow || "",
        };

        setForm(newFormData);

        // Prefill vehicleEditable and engineEditable if present
        if (jobOrder.vehicleDetails)
          setVehicleEditable(jobOrder.vehicleDetails);
        if (jobOrder.engineDetails) setEngineEditable(jobOrder.engineDetails);

        // Prefill CFT members if present in job order
        if (Array.isArray(jobOrder.cft_members)) {
          setCftMembers(jobOrder.cft_members);
        }

        // Use setTimeout to allow form state to settle before enabling other useEffects
        setTimeout(() => {
          setIsPreFilling(false);
          setIsLoading(false);
        }, 1000); // Increased timeout to 1 second
      };

      // Execute the pre-filling
      preFillForm();
      // If this is an update (read API), disable the form
      if (location.state?.isEdit) {
        setFormDisabled(true);
      }
    }
  }, []); // Empty dependency array - only run once on mount

  const handleTabClick = (tab) => {
    if (tab === "Job Order") navigate("/chennai/joborder");
    else if (tab === "Vehicle") navigate("/chennai/vehicle");
    else if (tab === "Engine") navigate("/chennai/engine");
  };

  // Add this function to handle dropdown changes
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
        cft_members: cftMembers,
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

  // Handler for creating job order
  const handleCreateJobOrder = async (e) => {
    e.preventDefault();

    // Require at least one CFT member
    if (!cftMembers || cftMembers.length === 0) {
      showSnackbar("Please add at least one CFT member before creating a job order.", "error");
      return;
    }

    // Generate job_order_id and CoastDownData_id based on timestamp
    const job_order_id = "JO" + Date.now();
    const CoastDownData_id = "CD" + Date.now();

    // Convert current time to IST and format as ISO 8601
    const currentISTTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const formattedISTTime = new Date(currentISTTime).toISOString();

    const jobOrderPayload = {
      job_order_id,
      project_code: form.projectCode || null,
      vehicle_serial_number: vehicleEditable?.vehicle_serial_number || null,
      vehicle_body_number: form.vehicleBodyNumber || null,
      engine_serial_number: engineEditable?.engine_serial_number || null,
      CoastDownData_id, // Now always a string
      type_of_engine: form.engineType || null,
      department: form.department || null,
      domain: form.domain || null,
      job_order_status: "Created",
      remarks: "",
      rejection_remarks: "",
      mail_remarks: "",
      id_of_creator: userId || "",
      name_of_creator: userName || "",
      created_on: formattedISTTime, // Send created_on in ISO 8601 format
      id_of_updater: "",
      name_of_updater: "",
      cft_members: cftMembers, // Pass CFT members in payload
      // updated_on: null, // Do not send updated_on during creation
    };

    // Coast Down Data payload
    const coastDownPayload = {
      CoastDownData_id,
      job_order_id,
      coast_down_reference: form.cdReportRef || null,
      vehicle_reference_mass: form.vehicleRefMass
        ? parseFloat(form.vehicleRefMass)
        : null,
      a_value: form.aN ? parseFloat(form.aN) : null,
      b_value: form.bNkmph ? parseFloat(form.bNkmph) : null,
      c_value: form.cNkmph2 ? parseFloat(form.cNkmph2) : null,
      f0_value: form.f0N ? parseFloat(form.f0N) : null,
      f1_value: form.f1Nkmph ? parseFloat(form.f1Nkmph) : null,
      f2_value: form.f2Nkmph2 ? parseFloat(form.f2Nkmph2) : null,
      id_of_creator: userId || "",
      created_on: formattedISTTime, // Send created_on in ISO 8601 format
      id_of_updater: "",
      // updated_on: null, // Do not send updated_on during creation
    };

    try {
      // Create job order first
      const jobOrderRes = await axios.post(
        `${apiURL}/joborders`,
        jobOrderPayload
      );

      // Then create coast down data if there's any coast down information
      const hasCoastDownData =
        form.cdReportRef ||
        form.vehicleRefMass ||
        form.aN ||
        form.bNkmph ||
        form.cNkmph2 ||
        form.f0N ||
        form.f1Nkmph ||
        form.f2Nkmph2;

      if (hasCoastDownData) {
        await axios.post(`${apiURL}/coastdown`, coastDownPayload);
      }
      setJobOrderId(job_order_id);

      // Get the job order ID from the API response
      const createdJobOrderId = jobOrderRes.data.job_order_id || job_order_id;

      // Set the job order ID in state (for future reference)
      setJobOrderId(createdJobOrderId);

      showSnackbar(
        "Job Order Created! ID: " + createdJobOrderId,
        "success"
      );

      // Send mail with the job order ID directly from the API response
      // BEFORE navigation
      await handleSendMail(1, createdJobOrderId, null);

      // Navigate only after mail is sent
      navigate(-1);
    } catch (err) {
      console.error("Error creating job order:", err);
      showSnackbar(
        "Failed to create job order: " +
        (err.response?.data?.detail || err.message),
        "error"
      );
    }
  };

  const handleCreateTestOrder = async (testIndex) => {
    const test = tests[testIndex];

    if (!test.objective) {
      showSnackbar(
        "Please fill in the objective of the test before creating test order.",
        "warning"
      );
      return;
    }

    const test_order_id = "TO" + Date.now();

    const job_order_id = location.state?.jobOrder?.job_order_id || location.state?.originalJobOrderId || "";

    const currentISTTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const formattedISTTime = new Date(currentISTTime).toISOString();

    let CoastDownData_id =
      location.state?.jobOrder?.CoastDownData_id || existingCoastDownId || "";

    const hasTestSpecificCoastDownData =
      test.cdReportRef ||
      test.vehicleRefMass ||
      test.aN ||
      test.bNkmph ||
      test.cNkmph2 ||
      test.f0N ||
      test.f1Nkmph ||
      test.f2Nkmph2;

    if (hasTestSpecificCoastDownData) {
      CoastDownData_id = "CD" + Date.now() + "_T" + testIndex;

      // Create coast down data payload for this test
      const testCoastDownPayload = {
        CoastDownData_id,
        job_order_id,
        coast_down_reference:
          test.cdReportRef || test.cdReportRef || form.cdReportRef || null,
        vehicle_reference_mass:
          test.vehicleRefMass || form.vehicleRefMass
            ? parseFloat(test.vehicleRefMass || form.vehicleRefMass)
            : null,
        a_value: test.aN || form.aN ? parseFloat(test.aN || form.aN) : null,
        b_value:
          test.bNkmph || form.bNkmph
            ? parseFloat(test.bNkmph || form.bNkmph)
            : null,
        c_value:
          test.cNkmph2 || form.cNkmph2
            ? parseFloat(test.cNkmph2 || form.cNkmph2)
            : null,
        f0_value:
          test.f0N || form.f0N ? parseFloat(test.f0N || form.f0N) : null,
        f1_value:
          test.f1Nkmph || form.f1Nkmph
            ? parseFloat(test.f1Nkmph || form.f1Nkmph)
            : null,
        f2_value:
          test.f2Nkmph2 || form.f2Nkmph2
            ? parseFloat(test.f2Nkmph2 || form.f2Nkmph2)
            : null,
        id_of_creator: userId || "",
        created_on: formattedISTTime, // Now this is defined
        id_of_updater: "",
      };

      try {
        await axios.post(`${apiURL}/coastdown`, testCoastDownPayload);
      } catch (err) {
        console.error("Error creating test-specific coast down data:", err);
        showSnackbar(
          "Failed to create coast down data for test: " +
          (err.response?.data?.detail || err.message),
          "error"
        );
        return;
      }
    }

    const testOrderPayload = {
      test_order_id,
      job_order_id: job_order_id || "",
      CoastDownData_id: CoastDownData_id || "",
      engine_number: test.engineNumber || "",
      test_type: test.testType || "",
      test_objective: test.objective || "",
      vehicle_location: test.vehicleLocation || "",
      cycle_gear_shift: test.cycleGearShift || "",
      inertia_class: test.inertiaClass || "",
      dataset_name: test.datasetName || "",
      dpf: test.dpf || "",
      dpfRegenOccurs: test.dpfRegenOccurs || "",
      dataset_flashed:
        test.datasetflashed === "Yes"
          ? true
          : test.datasetflashed === "No"
            ? false
            : null,
      ess: test.ess || "",
      mode: test.mode || "",
      fuel_type: test.fuelType || "",
      hardware_change: test.hardwareChange || "",
      equipment_required: test.equipmentRequired || "",
      shift: test.shift || "",
      preferred_date: test.preferredDate || null,
      emission_check_date: test.emissionCheckDate || null,
      specific_instruction: test.specificInstruction || "",
      status: "Created",
      id_of_creator: userId || "",
      name_of_creator: userName || "",
      created_on: formattedISTTime,
      id_of_updater: "",
      name_of_updater: "",
      updated_on: formattedISTTime,
      // Only one set of each attachment key, pass as array
      emission_check_attachment: test.Emission_check || test.emissionCheckAttachment || [],
      dataset_attachment: test.Dataset_attachment || test.dataset_attachment || [],
      a2l_attachment: test.A2L || test.a2l_attachment || [],
      experiment_attachment: test.Experiment_attachment || test.experiment_attachment || [],
      dbc_attachment: test.DBC_attachment || test.dbc_attachment || [],
      wltp_attachment: test.WLTP_input_sheet || test.wltp_attachment || [],
      pdf_report: test.PDF_report || test.pdf_report || [],
      excel_report: test.Excel_report || test.excel_report || [],
      dat_file_attachment: test.DAT_file_attachment || test.dat_file_attachment || [],
      others_attachement: test.Others_attachment || test.others_attachement || [],
    };

    try {
      const response = await axios.post(
        `${apiURL}/testorders`,
        testOrderPayload
      );

      // Update the test in state with the created test order ID and disable its fields
      setTests((prev) =>
        prev.map((t, i) =>
          i === testIndex
            ? { ...t, testOrderId: response.data.test_order_id, disabled: true }
            : t
        )
      );

      showSnackbar(
        "Test Order Created! ID: " +
        response.data.test_order_id +
        (hasTestSpecificCoastDownData
          ? " | Coast Down Data ID: " + CoastDownData_id
          : ""),
        "success"
      );
      // Send mail with the test order ID
      await handleSendMail(2, job_order_id, response.data.test_order_id);
      navigate(-1);

      // Redirect based on department
      const dept = form.department || (location.state?.jobOrder?.department) || "";
      if (dept === "RDE JO") {
        navigate("/rde-chennai");
      } else if (dept === "VTC_JO Chennai") {
        navigate("/vtc-chennai");
      } else if (dept === "VTC_JO Nashik") {
        navigate("/vtc-nashik");
      } else {
        navigate("/"); // fallback
      }
    } catch (err) {
      console.error("Error creating test order:", err);
      showSnackbar(
        "Failed to create test order: " +
        (err.response?.data?.detail || err.message),
        "error"
      );
    }
  };

  useEffect(() => {
    tests.forEach((test, idx) => {
    });
  }, [tests]);

  // Handler for updating coast down data when editing existing job order
  const handleUpdateCoastDownData = async (existingCoastDownId) => {
    if (!existingCoastDownId) return;

    const coastDownUpdatePayload = {
      CoastDownData_id: existingCoastDownId,
      coast_down_reference: form.cdReportRef || null,
      vehicle_reference_mass: form.vehicleRefMass
        ? parseFloat(form.vehicleRefMass)
        : null,
      a_value: form.aN ? parseFloat(form.aN) : null,
      b_value: form.bNkmph ? parseFloat(form.bNkmph) : null,
      c_value: form.cNkmph2 ? parseFloat(form.cNkmph2) : null,
      f0_value: form.f0N ? parseFloat(form.f0N) : null,
      f1_value: form.f1Nkmph ? parseFloat(form.f1Nkmph) : null,
      f2_value: form.f2Nkmph2 ? parseFloat(form.f2Nkmph2) : null,
      id_of_updater: "",
      updated_on: new Date().toISOString(),
    };

    try {
      await axios.put(
        `${apiURL}/coastdown/${existingCoastDownId}`,
        coastDownUpdatePayload
      );
    } catch (err) {
      throw err; // Re-throw to handle in calling function
    }
  };

  const [formDisabled, setFormDisabled] = useState(false);

  // Ref to track if we've already pre-filled to prevent multiple executions
  const hasPreFilledRef = useRef(false);

  // Debug useEffect to monitor form state changes
  useEffect(() => {
    // Check if form is being reset unexpectedly
    const hasValues = Object.values(form).some((value) => value !== "");
    if (!hasValues && hasPreFilledRef.current && !isPreFilling) {
      console.warn("⚠️ Form was reset unexpectedly after pre-filling!");
    }
  }, [form, isPreFilling, isLoading]);

  useEffect(() => {
    tests.forEach((test, idx) => {
    });
  }, [tests]);

  // Cleanup function to reset ref when component unmounts
  useEffect(() => {
    return () => {
      hasPreFilledRef.current = false;
    };
  }, []);

  // Utility function to fetch all coastdown data
  const fetchAllCoastDownData = async () => {
    try {
      const response = await axios.get(`${apiURL}/coastdown`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all coast down data:", error);
      return [];
    }
  };

  // Utility function to find coastdown data by job order ID
  const findCoastDownByJobOrderId = async (jobOrderId) => {
    try {
      const allCoastDownData = await fetchAllCoastDownData();
      return allCoastDownData.find((cd) => cd.job_order_id === jobOrderId);
    } catch (error) {
      console.error("Error finding coast down data by job order ID:", error);
      return null;
    }
  };

  // Add state for all test orders and editing
  const [allTestOrders, setAllTestOrders] = useState([]);
  const [editingTestOrderIdx, setEditingTestOrderIdx] = useState(null);

  // Fetch all test orders from API
  const fetchAllTestOrders = async () => {
    try {
      const res = await axios.get(`${apiURL}/testorders`);
      // Group test orders by job_order_id
      const grouped = {};
      (res.data || []).forEach((order) => {
        if (!grouped[order.job_order_id]) grouped[order.job_order_id] = [];
        grouped[order.job_order_id].push(order);
      });
      setAllTestOrders(grouped);
    } catch (err) {
      setAllTestOrders({});
      console.error("Failed to fetch test orders:", err);
    }
  };

  // Fetch a single test order by ID
  const fetchTestOrderById = async (test_order_id) => {
    try {
      const res = await axios.get(`${apiURL}/testorders/${test_order_id}`);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch test order:", err);
      return null;
    }
  };

  // Update a test order by ID
  const updateTestOrder = async (test_order_id, updatedData) => {
    try {
      const res = await axios.put(
        `${apiURL}/testorders/${test_order_id}`,
        updatedData
      );
      return res.data;
    } catch (err) {
      console.error("Failed to update test order:", err);
      throw err;
    }
  };

  // Fetch all test orders on mount
  useEffect(() => {
    fetchAllTestOrders();
  }, []);

  // Handler to load a test order into the test form for editing
  const handleEditTestOrder = async (testOrder, idx) => {
    // Helper to ensure attachment fields are always arrays
    const ensureArray = (val) => Array.isArray(val) ? val : (val ? [val] : []);

    // Find the test in the tests array or add a new one if not present
    let testIdx = idx;
    if (typeof testIdx !== "number" || testIdx >= tests.length) {
      setTests((prev) => [...prev, {}]);
      testIdx = tests.length;
    }

    // Fill the test form with test order data
    setTests((prev) => {
      const updated = [...prev];
      updated[testIdx] = {
        ...updated[testIdx],
        engineNumber: testOrder.engine_number || "",
        testType: testOrder.test_type || "",
        objective: testOrder.test_objective || "",
        vehicleLocation: testOrder.vehicle_location || "",
        cycleGearShift: testOrder.cycle_gear_shift || "",
        datasetName: testOrder.dataset_name || "",
        inertiaClass: testOrder.inertia_class || "",
        dpf: testOrder.dpf || "",
        dpfRegenOccurs: testOrder.dpfRegenOccurs || "",
        datasetflashed:
          testOrder.dataset_flashed === true
            ? "Yes"
            : testOrder.dataset_flashed === false
              ? "No"
              : "",
        ess: testOrder.ess || "",
        mode: testOrder.mode || "",
        fuelType: testOrder.fuel_type || "",
        hardwareChange: testOrder.hardware_change || "",
        equipmentRequired: testOrder.equipment_required || "",
        shift: testOrder.shift || "",
        preferredDate: testOrder.preferred_date || "",
        emissionCheckDate: testOrder.emission_check_date || "",
        // Only one set of each attachment field, parsed
        emissionCheckAttachment: parseAttachment(testOrder.emission_check_attachment),
        dataset_attachment: parseAttachment(testOrder.dataset_attachment),
        a2l_attachment: parseAttachment(testOrder.a2l_attachment),
        experiment_attachment: parseAttachment(testOrder.experiment_attachment),
        dbc_attachment: parseAttachment(testOrder.dbc_attachment),
        wltp_attachment: parseAttachment(testOrder.wltp_attachment),
        pdf_report: parseAttachment(testOrder.pdf_report),
        excel_report: parseAttachment(testOrder.excel_report),
        dat_file_attachment: parseAttachment(testOrder.dat_file_attachment),
        others_attachement: parseAttachment(testOrder.others_attachement),
        specificInstruction: testOrder.specific_instruction || "",
        testOrderId: testOrder.test_order_id,
        status: testOrder.status || "Created",
        remark: testOrder.remark || "",
        rejection_remarks: testOrder.rejection_remarks || "",
        // Coast down fields if present
        cdReportRef: testOrder.cdReportRef || "",
        vehicleRefMass: testOrder.vehicleRefMass || "",
        aN: testOrder.aN || "",
        bNkmph: testOrder.bNkmph || "",
        cNkmph2: testOrder.cNkmph2 || "",
        f0N: testOrder.f0N || "",
        f1Nkmph: testOrder.f1Nkmph || "",
        f2Nkmph2: testOrder.f2Nkmph2 || "",
        // Add originalJobOrderId for DropzoneFileList
        originalJobOrderId: location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || "",
      };
      return updated;
    });
    setEditingTestOrderIdx(testIdx);
  };

  // Handler to update the test order from the test form
  const handleUpdateTestOrder = async (idx) => {
    const test = tests[idx];
    if (!test.testOrderId) {
      showSnackbar("No test order selected for update.", "warning");
      return;
    }
    const currentISTTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const formattedISTTime = new Date(currentISTTime).toISOString();
    // If ProjectTeam is updating a test in Re-edit status, set status to 'Started' (under progress)
    let newStatus = test.status;
    if (isProjectTeam && test.status === "Re-edit") {
      newStatus = "Started";
    }
    // In handleCreateTestOrder function, around line 790-850
    // Update the test order payload creation in handleCreateTestOrder function (around line 790-850)
    const testOrderPayload = {
      test_order_id: test.testOrderId,
      job_order_id: location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || "",
      CoastDownData_id: test.CoastDownData_id || "",
      engine_number: test.engineNumber || "",
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
      fuel_type: test.fuelType || "",
      hardware_change: test.hardwareChange || "",
      equipment_required: test.equipmentRequired || "",
      shift: test.shift || "",
      preferred_date: test.preferredDate || null,
      emission_check_date: test.emissionCheckDate || null,
      specific_instruction: test.specificInstruction || "",
      status: newStatus,
      id_of_updater: userId || "",
      name_of_updater: userName || "",
      updated_on: formattedISTTime,
      // Attachment fields
      emission_check_attachment: JSON.stringify(test.emissionCheckAttachment || []),
      dataset_attachment: JSON.stringify(test.dataset_attachment || []),
      a2l_attachment: JSON.stringify(test.a2l_attachment || []),
      experiment_attachment: JSON.stringify(test.experiment_attachment || []),
      dbc_attachment: JSON.stringify(test.dbc_attachment || []),
      wltp_attachment: JSON.stringify(test.wltp_attachment || []),
      pdf_report: JSON.stringify(test.pdf_report || []),
      excel_report: JSON.stringify(test.excel_report || []),
      dat_file_attachment: JSON.stringify(test.dat_file_attachment || []),
      others_attachement: JSON.stringify(test.others_attachement || []),
    };

    try {
      await updateTestOrder(test.testOrderId, testOrderPayload);
      const jobOrderId = location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id;
      if (jobOrderId) {
        const jobOrderUpdatePayload = {
          id_of_updater: userId || "",
          name_of_updater: userName || "",
          updated_on: formattedISTTime,
        };

        // Update job order with new updater info from test order
        await axios.patch(`${apiURL}/joborders/${jobOrderId}`, jobOrderUpdatePayload);
      }

      showSnackbar("Test Order updated successfully!", "success");
      fetchAllTestOrders();
      setEditingTestOrderIdx(null);
    } catch (err) {
      showSnackbar(
        "Failed to update test order: " +
        (err.response?.data?.detail || err.message),
        "error"
      );
    }
  };

  const [emissionCheckModals, setEmissionCheckModals] = useState({});
  const [datasetModals, setDatasetModals] = useState({});
  const [a2lModals, setA2LModals] = useState({});
  const [experimentModals, setExperimentModals] = useState({});
  const [dbcModals, setDBCModals] = useState({});
  const [wltpModals, setWLTPModals] = useState({});

  const [pdfReportModals, setpdfReportModals] = useState({});
  const [excelReportModals, setexcelReportModals] = useState({});
  const [datFileModals, setDATModals] = useState({});
  const [othersModals, setOthersModals] = useState({});

  const [remarkModalOpen, setRemarkModalOpen] = useState(false);
  const [remarkType, setRemarkType] = useState("");
  const [remarkInput, setRemarkInput] = useState("");

  // Add state for re-edit and rejection remarks
  const [reEditRemarks, setReEditRemarks] = useState({});
  const [rejectionRemarks, setRejectionRemarks] = useState({});
  const [mailRemarks, setMailRemarks] = useState("");

  // Add modal state for re-edit, rejection, and mail remarks
  const [reEditModalOpen, setReEditModalOpen] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [mailRemarksModalOpen, setMailRemarksModalOpen] = useState(false);

  // Add handler to open re-edit modal
  const handleOpenReEditModal = (idx) => {
    setReEditModalOpen(idx);
  };

  // Add handler to open rejection modal
  const handleOpenRejectionModal = (idx) => {
    setRejectionModalOpen(idx);
  };

  // Add handler to open mail remarks modal
  const handleOpenMailRemarksModal = () => {
    setMailRemarksModalOpen(true);
  };

  // Add handler to submit re-edit remarks
  const handleSubmitReEditRemarks = async (idx) => {
    const testOrderId = tests[idx]?.testOrderId;
    try {
      await handleStatusUpdate("Re-edit", reEditRemarks[idx], testOrderId, idx);
      setReEditModalOpen(false);
      // Clear the re-edit remarks from local state
      setReEditRemarks((prev) => ({ ...prev, [idx]: "" }));
    } catch (err) {
      showSnackbar("Failed to submit re-edit remarks: " + err.message, "error");
    }
  };

  // Add handler to submit rejection remarks
  const handleSubmitRejectionRemarks = async (idx) => {
    const testOrderId = tests[idx]?.testOrderId;
    try {
      await handleStatusUpdate("Rejected", rejectionRemarks[idx], testOrderId, idx);
      setRejectionModalOpen(false);
    } catch (err) {
      showSnackbar("Failed to submit rejection remarks: " + err.message, "error");
    }
  };

  // Add handler to submit mail remarks
  const handleSubmitMailRemarks = async (idx) => {
    const testOrderId = tests[idx]?.testOrderId;
    try {
      // If ProjectTeam is updating a test in Re-edit status, set status to 'Started'
      let newStatus = tests[idx]?.status;
      if (isProjectTeam && newStatus === "Re-edit") {
        newStatus = "Started";
      }
      await updateTestOrder(testOrderId, {
        ...tests[idx],
        mailRemarks,
        test_order_id: testOrderId,
        status: newStatus,
      });
      setMailRemarksModalOpen(false);
      showSnackbar("Test order updated successfully!", "success");
    } catch (err) {
      showSnackbar("Failed to submit mail remarks: " + err.message, "error");
    }
  };

  const handleStatusUpdate = async (status, remark = "", testOrderId = null, testIdx = null) => {
    try {
      // Get current IST time
      const currentISTTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });
      const formattedISTTime = new Date(currentISTTime).toISOString();

      // Only send test_order_id, status, and remark
      const payload = {
        test_order_id: testOrderId,
        status,
        remark,
        id_of_updater: userId || "",
        name_of_updater: userName || "",
        updated_on: formattedISTTime,
      };

      await axios.post(`${apiURL}/testorders/status`, payload);

      // Update the parent job order's "Updated by" and "Updated on" fields with test order update info
      const jobOrderId = location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id;
      if (jobOrderId) {
        const jobOrderUpdatePayload = {
          id_of_updater: userId || "",
          name_of_updater: userName || "",
          updated_on: formattedISTTime,
        };

        // Update job order with new updater info from test order
        await axios.patch(`${apiURL}/joborders/${jobOrderId}`, jobOrderUpdatePayload);
      }

      // Update test status and remarks in UI if testIdx is provided
      if (typeof testIdx === "number") {
        setTests((prev) =>
          prev.map((t, i) =>
            i === testIdx
              ? {
                ...t,
                status,
                // Store remarks based on status type
                ...(status === "Re-edit" && { re_edit_remarks: remark }),
                ...(status === "Rejected" && { rejection_remarks: remark })
              }
              : t
          )
        );
      }
      setRemarkInput("");
      setRemarkModalOpen(false);
    } catch (err) {
      showSnackbar(
        "Failed to update status: " + (err.response?.data?.detail || err.message),
        "error"
      );
    }
  };

  const handleCDNumberInput = (field, value) => {
    // Allow empty value
    if (value === "") {
      setCdFieldErrors((prev) => ({ ...prev, [field]: "" }));
      setForm((prev) => ({ ...prev, [field]: "" }));
      return;
    }
    // Allow only numbers (including decimals)
    if (/^-?\d*\.?\d*$/.test(value)) {
      setCdFieldErrors((prev) => ({ ...prev, [field]: "" }));
      setForm((prev) => ({ ...prev, [field]: value }));
    } else {
      setCdFieldErrors((prev) => ({ ...prev, [field]: "Please enter valid numbers" }));
    }
  };

  // Helper function to get attachment file count
  const getAttachmentFileCount = (test, attachmentField) => {
    const attachment = test[attachmentField];
    if (!attachment) return 0;
    if (Array.isArray(attachment)) return attachment.length;
    if (typeof attachment === 'string') {
      try {
        const parsed = JSON.parse(attachment);
        return Array.isArray(parsed) ? parsed.length : (parsed ? 1 : 0);
      } catch {
        return attachment ? 1 : 0;
      }
    }
    return 0;
  };

  // Helper function to get attachment button color based on file count
  const getAttachmentColor = (fileCount) => {
    return fileCount > 0 ? '#dc2626' : '#2563eb'; // Red if files exist, Blue if empty
  };

  // Helper function to get attachment background color
  const getAttachmentBackgroundColor = (fileCount) => {
    return fileCount > 0 ? '#fef2f2' : '#eff6ff'; // Light red if files exist, Light blue if empty
  };

  // Helper function to parse attachments consistently
  const parseAttachment = (attachment) => {
    if (!attachment) return [];
    if (Array.isArray(attachment)) return attachment;
    if (typeof attachment === 'string') {
      try {
        const parsed = JSON.parse(attachment);
        return Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
      } catch {
        return attachment ? [attachment] : [];
      }
    }
    return attachment ? [attachment] : [];
  };

  // Modal component
  const RemarkModal = ({ open, onClose, onSubmit, type, value, setValue }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded shadow-lg p-6 w-96">
          <div className="font-semibold mb-2">
            {type === "Reject" ? "Reason for Reject" : "Reason for Edit"}
          </div>
          <textarea
            className="w-full border rounded p-2 mb-4"
            rows={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Enter remark for ${type.toLowerCase()}...`}
          />
          <div className="flex justify-end gap-2">
            <Button
              className="bg-gray-300 text-black px-4 py-1 rounded"
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white px-4 py-1 rounded"
              type="button"
              onClick={onSubmit}
              disabled={!value.trim()}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const isTestEngineer = userRole === "TestEngineer";
  const isProjectTeam = userRole === "ProjectTeam";

  // Helper function to determine if test fields should be editable
  const areTestFieldsEditable = (test, idx) => {
    // If test is disabled globally, don't allow editing
    if (test.disabled) return false;

    // If test order is already created and not in edit mode, don't allow editing
    if (!!test.testOrderId && editingTestOrderIdx !== idx) return false;

    // TestEngineer cannot edit fields
    if (isTestEngineer) return false;

    // ProjectTeam can edit if:
    // 1. Test order is being created (no testOrderId)
    // 2. Test order is in Re-edit status and currently being edited
    if (isProjectTeam) {
      if (!test.testOrderId) return true; // Creating new test order
      if (test.status === "Re-edit" && editingTestOrderIdx === idx) return true; // Editing re-edit test
      return false;
    }

    // For other roles, follow existing logic
    return !test.disabled && (!test.testOrderId || editingTestOrderIdx === idx);
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
            <Button
              variant="outline"
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              {location.state?.isEdit && (location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id)
                ? (location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id)
                : "Chennai Job Order"}
            </Button>
            <div className="flex flex-col">
              {/* <span className="font-semibold text-lg">New Job Order</span>
              {location.state?.isEdit && (
                // <span className="text-sm text-blue-600 font-medium">
                //   {isLoading
                //     ? "Loading job order data..."
                //     : `Pre-filled from Job Order: ${location.state.originalJobOrderId}`}
                // </span>
              )} */}
            </div>
          </div>
          {/* <div className="flex gap-2">
            <Button className="bg-red-600 text-white px-4 py-1 rounded">
              Job Order
            </Button>
            <Button className="bg-white text-red-600 border border-red-600 px-4 py-1 rounded">
              Vehicle
            </Button>
            <Button className="bg-white text-red-600 border border-red-600 px-4 py-1 rounded">
              Engine
            </Button>
          </div> */}
        </div>
        {/* Form Row */}
        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-8 px-8 py-6">
          {/* Project Code */}
          <div className="flex flex-col">
            <Label htmlFor="projectCode" className="mb-2">
              Project <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.projectCode}
              onValueChange={(value) => handleChange("projectCode", value)}
              required
              disabled={formDisabled || isTestEngineer}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {projectOptions.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Vehicle Body Number */}
          <div className="flex flex-col">
            <Label htmlFor="vehicleBodyNumber" className="mb-2">
              Vehicle Body No. <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.vehicleBodyNumber}
              onValueChange={handleVehicleBodyChange}
              required
              disabled={formDisabled || isTestEngineer}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {vehicleBodyNumbers.map((item, index) => (
                  <SelectItem
                    key={`${item.vehicle_body_number}-${index}`}
                    value={item.vehicle_body_number}
                  >
                    {item.vehicle_body_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* vehicle_serial_number (auto) */}
          <div className="flex flex-col">
            <Label htmlFor="vehicleSerialNumber" className="mb-2">
              Vehicle Serial Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vehicleSerialNumber"
              value={form.vehicleSerialNumber}
              readOnly
              className="w-full"
              placeholder="Auto-fetched"
              required
              disabled={!formDisabled || isTestEngineer}
            />
          </div>
          {/* Engine Number (dropdown) */}
          <div className="flex flex-col">
            <Label htmlFor="engineSerialNumber" className="mb-2">
              Engine Serial Number <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.engineSerialNumber}
              onValueChange={handleEngineNumberChange}
              required
              disabled={
                formDisabled ||
                isTestEngineer ||
                !!(location.state?.originalJobOrderId &&
                  (allTestOrders[location.state?.originalJobOrderId] || []).length > 0)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {engineNumbers.map((engineSerialNumber) => (
                  <SelectItem key={engineSerialNumber} value={engineSerialNumber}>
                    {engineSerialNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Type of Engine */}
          <div className="flex flex-col">
            <Label htmlFor="engineType" className="mb-2">
              Type of Engine <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.engineType}
              onValueChange={(value) => handleChange("engineType", value)}
              required
              disabled={formDisabled || isTestEngineer}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gasoline">Gasoline</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="CNG">CNG</SelectItem>
                <SelectItem value="HYBRID">HYBRID</SelectItem>
                <SelectItem value="ePT">ePT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Domain */}
          <div className="flex flex-col">
            <Label htmlFor="domain" className="mb-2">
              Domain <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.domain}
              onValueChange={(value) => handleChange("domain", value)}
              required
              disabled={formDisabled || isTestEngineer}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {domainOptions.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Department */}
          <div className="flex flex-col">
            <Label htmlFor="department" className="mb-2">
              Department <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.department}
              onValueChange={(value) => handleChange("department", value)}
              required
              disabled={true} // Always disabled for Chennai
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dep) => (
                  <SelectItem key={dep} value={dep}>
                    {dep}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>

        {/* Extra fields for RDE JO */}
        {form.department === "RDE JO" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-8 px-8 pb-4">
            {/* WBS Code */}
            <div className="flex flex-col">
              <Label htmlFor="wbsCode" className="mb-2">
                WBS Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="wbsCode"
                value={form.wbsCode}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, wbsCode: e.target.value }))
                }
                className="w-full"
                required
                disabled={formDisabled}
                placeholder="Enter WBS Code"
              />
            </div>
            {/* Vehicle GVW */}
            <div className="flex flex-col">
              <Label htmlFor="vehicleGVW" className="mb-2">
                Vehicle GVW (Kg) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="vehicleGVW"
                value={form.vehicleGVW}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, vehicleGVW: e.target.value }))
                }
                className="w-full"
                required
                disabled={formDisabled}
                placeholder="Enter GVW"
                type="number"
                min="0"
              />
            </div>
            {/* Vehicle Kerb weight */}
            <div className="flex flex-col">
              <Label htmlFor="vehicleKerbWeight" className="mb-2">
                Vehicle Kerb weight (Kg) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="vehicleKerbWeight"
                value={form.vehicleKerbWeight}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    vehicleKerbWeight: e.target.value,
                  }))
                }
                className="w-full"
                required
                disabled={formDisabled}
                placeholder="Enter Kerb Weight"
                type="number"
                min="0"
              />
            </div>
            {/* Vehicle Test Payload criteria */}
            <div className="flex flex-col">
              <Label htmlFor="vehicleTestPayloadCriteria" className="mb-2">
                Vehicle Test Payload criteria (Kg){" "}
                <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.vehicleTestPayloadCriteria}
                onValueChange={(value) => {
                  setForm((prev) => ({
                    ...prev,
                    vehicleTestPayloadCriteria: value,
                    requestedPayloadKg: value === "Manual Entry" ? prev.requestedPayloadKg : "",
                  }));
                }}
                required
                disabled={formDisabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Legislation">Legislation</SelectItem>
                  <SelectItem value="Manual Entry">Manual Entry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Show manual entry field only if 'Manual Entry' is selected */}
            {form.vehicleTestPayloadCriteria === "Manual Entry" && (
              <div className="flex flex-col">
                <Label htmlFor="requestedPayloadKg" className="mb-2">
                  Requested Payload in kgs <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="requestedPayloadKg"
                  value={form.requestedPayloadKg}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      requestedPayloadKg: e.target.value,
                    }))
                  }
                  required
                  disabled={formDisabled}
                  className="w-full"
                  placeholder="Enter Requested Payload"
                  type="number"
                  min="0"
                />
              </div>
            )}
            {/* Idle Exhaust Mass Flow */}
            <div className="flex flex-col">
              <Label htmlFor="idleExhaustMassFlow" className="mb-2">
                Idle Exhaust Mass Flow (Kg/hr){" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="idleExhaustMassFlow"
                value={form.idleExhaustMassFlow}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    idleExhaustMassFlow: e.target.value,
                  }))
                }
                className="w-full"
                required
                disabled={formDisabled}
                placeholder="Enter Idle Exhaust Mass Flow"
                type="number"
                min="0"
              />
            </div>
          </div>
        )}

        {/* Editable Vehicle Details Accordion */}
        {vehicleEditable && (
          <div className="mx-8 mt-2 mb-4 border rounded shadow">
            <div
              className="flex items-center justify-between bg-gray-100 dark:bg-black border-t-4 border-red-600 px-4 py-2 cursor-pointer"
              onClick={() => setVehicleAccordionOpen((prev) => !prev)}
            >
              <span className="font-semibold text-sm">
                Vehicle Details
              </span>
              <span>{vehicleAccordionOpen ? "▲" : "▼"}</span>
            </div>
            {vehicleAccordionOpen && (
              <form className="bg-white px-4 py-4 dark:bg-black">
                <div className="grid grid-cols-4 gap-4 text-xs">
                  {Object.entries(vehicleEditable).map(([label, value]) => (
                    <div key={label} className="flex flex-col">
                      <Label className="font-semibold capitalize">
                        {label.replace(/_/g, " ")}
                      </Label>
                      <Input
                        value={value ?? ""}
                        onChange={(e) =>
                          handleVehicleEditableChange(label, e.target.value)
                        }
                        className="mt-1"
                        disabled={!vehicleEditMode || isTestEngineer}
                      />
                    </div>
                  ))}
                </div>
              </form>
            )}
          </div>
        )}

        {/* Editable Engine Details Accordion */}
        {engineEditable && (
          <div className="mx-8 mt-2 mb-4 border rounded shadow">
            <div
              className="flex items-center justify-between bg-gray-100 dark:bg-black border-t-4 border-blue-600 px-4 py-2 cursor-pointer"
              onClick={() => setEngineAccordionOpen((prev) => !prev)}
            >
              <span className="font-semibold text-sm">
                Engine Details
              </span>
              <span>{engineAccordionOpen ? "▲" : "▼"}</span>
            </div>
            {engineAccordionOpen && (
              <form className="bg-white dark:bg-black px-4 py-4">
                <div className="grid grid-cols-4 gap-4 text-xs">
                  {Object.entries(engineEditable).map(([label, value]) => (
                    <div key={label} className="flex flex-col">
                      <Label className="font-semibold capitalize">
                        {label.replace(/_/g, " ")}
                      </Label>
                      <Input
                        value={value ?? ""}
                        onChange={(e) =>
                          handleEngineEditableChange(label, e.target.value)
                        }
                        className="mt-1"
                        disabled={!engineEditMode || isTestEngineer}
                      />
                    </div>
                  ))}
                </div>
              </form>
            )}
          </div>
        )}

        {/* Coast Down Data (CD) Section */}
        <div className="mx-8 mb-4 border rounded shadow px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Label htmlFor="cdReportRef" className="mb-2">
                Coast Down Test Report Reference
              </Label>
              {location.state?.isEdit && existingCoastDownId && (
                <span className="text-sm text-blue-600 ml-2">
                  {/* (Editing existing data - ID: {existingCoastDownId}) */}
                </span>
              )}
            </div>
          </div>
          <Input
            id="cdReportRef"
            placeholder="Enter Coast Test Report Ref."
            className="w-80 mt-1"
            value={form.cdReportRef}
            onChange={(e) => handleCDNumberInput("cdReportRef", e.target.value)}
            disabled={formDisabled || isTestEngineer}
          />
          {cdFieldErrors.cdReportRef && (
            <div className="text-red-600 text-xs mt-1">{cdFieldErrors.cdReportRef}</div>
          )}
          <div className="mb-2 font-semibold text-xs mt-4">CD Values</div>

          <div className="grid grid-cols-7 gap-4">
            <div>
              <Label htmlFor="vehicleRefMass" className="text-xs mb-2">
                Vehicle Reference Mass (Kg)
              </Label>
              <Input
                id="vehicleRefMass"
                placeholder="Enter Vehicle Reference mass (Kg)"
                className="mt-1"
                value={form.vehicleRefMass}
                onChange={(e) => handleCDNumberInput("vehicleRefMass", e.target.value)}
                disabled={formDisabled || isTestEngineer}
              />
              {cdFieldErrors.vehicleRefMass && (
                <div className="text-red-600 text-xs mt-1">{cdFieldErrors.vehicleRefMass}</div>
              )}
            </div>
            <div>
              <Label htmlFor="aN" className="text-xs mb-2">
                A (N)
              </Label>
              <Input
                id="aN"
                placeholder="Enter A (N)"
                className="mt-1"
                value={form.aN}
                onChange={(e) => handleCDNumberInput("aN", e.target.value)}
                disabled={formDisabled || isTestEngineer}
              />
              {cdFieldErrors.aN && (
                <div className="text-red-600 text-xs mt-1">{cdFieldErrors.aN}</div>
              )}
            </div>
            <div>
              <Label htmlFor="bNkmph" className="text-xs mb-2">
                B (N/kmph)
              </Label>
              <Input
                id="bNkmph"
                placeholder="Enter B (N/kmph)"
                className="mt-1"
                value={form.bNkmph}
                onChange={(e) => handleCDNumberInput("bNkmph", e.target.value)}
                disabled={formDisabled || isTestEngineer}
              />
              {cdFieldErrors.bNkmph && (
                <div className="text-red-600 text-xs mt-1">{cdFieldErrors.bNkmph}</div>
              )}
            </div>
            <div>
              <Label htmlFor="cNkmph2" className="text-xs mb-2">
                C (N/kmph^2)
              </Label>
              <Input
                id="cNkmph2"
                placeholder="Enter C (N/kmph^2)"
                className="mt-1"
                value={form.cNkmph2}
                onChange={(e) => handleCDNumberInput("cNkmph2", e.target.value)}
                disabled={formDisabled || isTestEngineer}
              />
              {cdFieldErrors.cNkmph2 && (
                <div className="text-red-600 text-xs mt-1">{cdFieldErrors.cNkmph2}</div>
              )}
            </div>
            <div>
              <Label htmlFor="f0N" className="text-xs mb-2">
                F0 (N)
              </Label>
              <Input
                id="f0N"
                placeholder="Enter F0 (N)"
                className="mt-1"
                value={form.f0N}
                onChange={(e) => handleCDNumberInput("f0N", e.target.value)}
                disabled={formDisabled || isTestEngineer}
              />
              {cdFieldErrors.f0N && (
                <div className="text-red-600 text-xs mt-1">{cdFieldErrors.vehicleRefMass}</div>
              )}
            </div>
            <div>
              <Label htmlFor="f1Nkmph" className="text-xs mb-2">
                F1 (N/kmph)
              </Label>
              <Input
                id="f1Nkmph"
                placeholder="Enter F1 (N/kmph)"
                className="mt-1"
                value={form.f1Nkmph}
                onChange={(e) => handleCDNumberInput("f1Nkmph", e.target.value)}
                disabled={formDisabled || isTestEngineer}
              />
              {cdFieldErrors.f1Nkmph && (
                <div className="text-red-600 text-xs mt-1">{cdFieldErrors.f1Nkmph}</div>
              )}
            </div>
            <div>
              <Label htmlFor="f2Nkmph2" className="text-xs mb-2">
                F2 (N/kmph^2)
              </Label>
              <Input
                id="f2Nkmph2"
                placeholder="Enter F2 (N/kmph^2)"
                className="mt-1"
                value={form.f2Nkmph2}
                onChange={(e) => handleCDNumberInput("f2Nkmph2", e.target.value)}
                disabled={formDisabled || isTestEngineer}
              />
              {cdError && (
                <div className="text-red-600 text-xs mt-2">{cdError}</div>
              )}
            </div>
          </div>
          <div className="flex items-center mt-4 gap-6">
            <Button
              className="bg-white dark:bg-black text-red-900 dark:text-red-500 border border-red-900 dark:border-red-500 text-xs px-6 py-2 rounded"
              onClick={handleCreateJobOrder}
              disabled={isTestEngineer}
            >
              {location.state?.isEdit ? "UPDATE JOB ORDER" : "CREATE JOB ORDER"}
            </Button>
            {/* {location.state?.isEdit && existingCoastDownId && (
              <Button
                className="bg-blue-600 text-white text-xs px-6 py-2 rounded"
                onClick={async () => {
                  try {
                    await handleUpdateCoastDownData(existingCoastDownId);
                    showSnackbar("Coast Down Data updated successfully!", "success");
                  } catch (err) {
                    showSnackbar(
                      "Failed to update coast down data: " +
                      (err.response?.data?.detail || err.message),
                      "error"
                    );
                  }
                }}
              >
                UPDATE COAST DOWN DATA
              </Button>
            )} */}
            {/* <Button
              className="bg-white text-red-900 border border-red-900 text-xs px-6 py-2 rounded"
              type="button"
              onClick={() =>
                setForm((prev) => ({
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
            </Button> */}
          </div>
        </div>

        {/* Test Actions */}
        <div className="flex items-center mt-4 gap-6 px-8">
          <Button
            variant="ghost"
            className="text-xs text-blue-700 px-0"
            onClick={handleAddTest}
            disabled={isTestEngineer}
          >
            + ADD TEST
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              className="text-xs text-blue-700 px-0"
              onClick={handleCloneTest}
              disabled={isTestEngineer}
            >
              <GrClone />
              CLONE TEST
            </Button>

            {cloneDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-black border border-gray-300 rounded-lg shadow-lg z-50 w-36">
                <div className="p-2">
                  <div className="text-xs font-medium mb-2 text-gray-700 dark:text-white">
                    Select Test to Clone:
                  </div>
                  {(allTestOrders[location.state?.originalJobOrderId] || []).length > 0 ? (
                    <div className="max-h-48 overflow-y-auto">
                      {(allTestOrders[location.state?.originalJobOrderId] || []).map((testOrder, index) => (
                        <button
                          key={testOrder.test_order_id}
                          onClick={() => {
                            handleCloneSpecificTestOrder(testOrder.test_order_id);
                            setCloneDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-2 my-1 hover:bg-gray-400 bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-black text-sm">Test {index + 1}</span>
                            {/* <span className="text-xs text-gray-500">{testOrder.test_order_id}</span> */}
                          </div>

                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 py-4 text-center">
                      No test orders available to clone from this job order
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            className="text-xs text-blue-700 px-0 flex items-center gap-1"
            onClick={() => {
              setShowCFTPanel((prev) => !prev);
            }}
            disabled={isTestEngineer}
          >
            <MdPeopleAlt className="text-sm" />
            {showCFTPanel ? "CFT MEMBERS" : "CFT MEMBERS"}
          </Button>
          <div className="flex-1"></div>
        </div>
        {showCFTPanel && !isTestEngineer && (
          <div className="mt-4 mx-8 mb-8 bg-white border rounded-lg">
            <CFTMembers
              jobOrderId={
                location.state?.originalJobOrderId ||
                location.state?.jobOrder?.job_order_id ||
                jobOrderId ||
                null
              }
              members={cftMembers}
              setMembers={setCftMembers}
              disabled={formDisabled}
            />
          </div>
        )}



        {/* Test Forms */}
        {tests.map((test, idx) => {
          // Calculate the display number for this test
          const existingTestOrdersCount = (allTestOrders[location.state?.originalJobOrderId] || []).length;
          const displayNumber = existingTestOrdersCount + idx + 1;

          return (
            <div
              key={idx}
              className="mx-8 mb-8 border rounded-lg shadow-lg px-8 py-6 bg-white dark:bg-black"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-base text-blue-900">Test {displayNumber}</span>
                  {/* Status Icon and Label */}
                  {test?.status === "Started" && (
                    <span className="flex items-center bg-yellow-100 border border-yellow-400 text-yellow-800 font-semibold text-xs px-2 py-1 rounded shadow ml-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#FFA500" }}>
                        <circle cx="12" cy="12" r="9" stroke="#FFA500" strokeWidth="2" fill="none" />
                        <path d="M12 7v5l3 3" stroke="#FFA500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Started
                    </span>
                  )}
                  {test?.status === "Rejected" && (
                    <span className="flex items-center bg-red-100 border border-red-400 text-red-800 font-semibold text-xs px-2 py-1 rounded shadow ml-2">
                      <Cancel className="h-4 w-4 mr-1" style={{ color: "#e53935" }} />
                      Rejected
                    </span>
                  )}
                  {test?.status === "Re-edit" && (
                    <span className="flex items-center bg-blue-100 border border-blue-400 text-blue-800 font-semibold text-xs px-2 py-1 rounded shadow ml-2">
                      <Edit className="h-4 w-4 mr-1" style={{ color: "#1976d2" }} />
                      Re-edit
                    </span>
                  )}
                  {test?.status === "Completed" && (
                    <span className="flex items-center bg-green-100 border border-green-400 text-green-800 font-semibold text-xs px-2 py-1 rounded shadow ml-2">
                      <CheckCircle className="h-4 w-4 mr-1" style={{ color: "#43a047" }} />
                      Completed
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {/* Buttons for TestEngineer */}
                  {isTestEngineer && (!test?.status || test?.status === "Created") && (
                    <>
                      <Button
                        className="bg-green-600 text-white text-xs px-3 py-1 rounded"
                        type="button"
                        onClick={async () => {
                          await handleStatusUpdate("Started", "", test.testOrderId, idx);
                        }}
                      >
                        Start
                      </Button>
                      <Button
                        className="bg-red-600 text-white text-xs px-3 py-1 rounded"
                        type="button"
                        onClick={() => {
                          setRemarkType("Reject");
                          setRemarkModalOpen({ idx, type: "Reject" });
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {/* Buttons for ProjectTeam */}
                  {/* ProjectTeam should NOT see the Re-edit button */}
                  {/* Buttons for TestEngineer */}
                  {isTestEngineer && (test?.status === "Started" || test?.status === "Rejected" || test?.status === "Re-edit") && (
                    <>
                      <Button
                        className="bg-blue-600 text-white text-xs px-3 py-1 rounded"
                        type="button"
                        onClick={() => handleOpenReEditModal(idx)}
                      >
                        Re-edit
                      </Button>
                      <Button
                        className="bg-green-600 text-white text-xs px-3 py-1 rounded"
                        type="button"
                        onClick={async () => {
                          await handleStatusUpdate("Completed", "", test.testOrderId, idx);
                        }}
                      >
                        Completed
                      </Button>
                    </>
                  )}
                  {/* Close button always available for ProjectTeam */}
                  {!isTestEngineer && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTest(idx)}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 hover:bg-red-200 transition-colors border border-gray-300 text-gray-600 hover:text-red-600 focus:outline-none"
                      title="Close"
                      style={{ minWidth: 0, padding: 0 }}
                    >
                      <CloseIcon fontSize="small" />
                    </button>
                  )}
                </div>
              </div>
              {/* Make form editable if status is Rejected */}
              {test?.status === "Rejected" && (
                <div className="bg-red-100 border border-red-400 rounded-lg p-4 mt-4 mb-2 shadow-inner">
                  <div className="font-semibold text-sm text-red-700 mb-2">
                    Rejected Reason
                  </div>
                  <textarea
                    value={test.rejection_remarks}
                    onChange={(e) =>
                      handleTestChange(idx, "rejection_remarks", e.target.value)
                    }
                    placeholder="Enter rejection remarks"
                    className="w-full border rounded p-2 min-h-[60px] max-h-[120px] resize-vertical"
                    style={{ minWidth: "100%", fontSize: "1rem" }}
                    rows={3}
                  />
                </div>
              )}
              {/* Display re-edit remarks if status is Re-edit */}
              {test?.status === "Re-edit" && (
                <div className="bg-blue-100 border border-blue-400 rounded-lg p-4 mt-4 mb-2 shadow-inner">
                  <div className="font-semibold text-sm text-blue-700 mb-2">
                    Re-edit Reason from Test Engineer
                  </div>
                  <div className="w-full border rounded p-2 min-h-[60px] bg-white">
                    {test.re_edit_remarks || "No re-edit remarks provided"}
                  </div>
                </div>
              )}
              {/* Inputs above attachments */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                {/* All test fields disabled for TestEngineer except status actions */}
                <div className="flex flex-col">
                  <Label htmlFor={`engineNumber${idx}`} className="mb-2">
                    Engine Number <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={test.engineNumber || ""}
                    onValueChange={(value) => {
                      if (value !== form.engineSerialNumber) {
                        showSnackbar && showSnackbar("Warning: You are selecting a different engine number than the main form.", "warning");
                      }
                      handleTestChange(idx, "engineNumber", value);
                    }}
                    required
                    disabled={!areTestFieldsEditable(test, idx)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {engineNumbers.map((engineNumber) => (
                        <SelectItem key={engineNumber} value={engineNumber}>
                          {engineNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Test Type</Label>
                  <Select
                    value={test.testType}
                    onValueChange={(v) => handleTestChange(idx, "testType", v)}
                    disabled={!areTestFieldsEditable(test, idx)}
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
                    onChange={(e) =>
                      handleTestChange(idx, "objective", e.target.value)
                    }
                    placeholder="TESTING"
                    disabled={!areTestFieldsEditable(test, idx)}
                  />
                </div>
                <div>
                  <Label>Vehicle Location</Label>
                  <Input
                    value={test.vehicleLocation}
                    onChange={(e) =>
                      handleTestChange(idx, "vehicleLocation", e.target.value)
                    }
                    placeholder="Enter Vehicle Location"
                    disabled={!areTestFieldsEditable(test, idx)}
                  />
                </div>
                <div>
                  <Label>Cycle Gear Shift</Label>
                  <Input
                    value={test.cycleGearShift}
                    onChange={(e) =>
                      handleTestChange(idx, "cycleGearShift", e.target.value)
                    }
                    placeholder="Enter Cycle Gear Shift"
                    disabled={!areTestFieldsEditable(test, idx)}
                  />
                </div>
                <div>
                  <Label>Inertia Class</Label>
                  <Select
                    value={test.inertiaClass}
                    onValueChange={(v) =>
                      handleTestChange(idx, "inertiaClass", v)
                    }
                    disabled={!areTestFieldsEditable(test, idx)}
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
                    onChange={(e) =>
                      handleTestChange(idx, "datasetName", e.target.value)
                    }
                    placeholder="Enter Dataset Name"
                    disabled={!areTestFieldsEditable(test, idx)}
                  />
                </div>
                <div>
                  <Label>DPF</Label>
                  <div className="flex gap-2 mt-2">
                    <label>
                      <input
                        type="radio"
                        name={`dpf${idx}`}
                        value="Yes"
                        checked={test.dpf === "Yes"}
                        onChange={() => handleTestChange(idx, "dpf", "Yes")}
                        disabled={!areTestFieldsEditable(test, idx)}
                      />{" "}
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`dpf${idx}`}
                        value="No"
                        checked={test.dpf === "No"}
                        onChange={() => handleTestChange(idx, "dpf", "No")}
                        disabled={!areTestFieldsEditable(test, idx)}
                      />{" "}
                      No
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`dpf${idx}`}
                        value="NA"
                        checked={test.dpf === "NA"}
                        onChange={() => handleTestChange(idx, "dpf", "NA")}
                        disabled={!areTestFieldsEditable(test, idx)}
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
                      onChange={(e) => handleTestChange(idx, "dpfRegenOccurs", e.target.value)}
                      placeholder="Enter DPF Regen Occurs (g)"
                      disabled={!areTestFieldsEditable(test, idx)}
                    />
                  </div>
                )}
                <div>
                  <Label>Dataset flashed</Label>
                  <div className="flex gap-2 mt-2">
                    <label>
                      <input
                        type="radio"
                        name={`datasetflashed${idx}`}
                        value="Yes"
                        checked={test.datasetflashed === "Yes"}
                        onChange={() =>
                          handleTestChange(idx, "datasetflashed", "Yes")
                        }
                        disabled={!areTestFieldsEditable(test, idx)}
                      />{" "}
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`datasetflashed${idx}`}
                        value="No"
                        checked={test.datasetflashed === "No"}
                        onChange={() =>
                          handleTestChange(idx, "datasetflashed", "No")
                        }
                        disabled={!areTestFieldsEditable(test, idx)}
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
                        name={`ess${idx}`}
                        value="On"
                        checked={test.ess === "On"}
                        onChange={() => handleTestChange(idx, "ess", "On")}
                        disabled={!areTestFieldsEditable(test, idx)}
                      />{" "}
                      On
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`ess${idx}`}
                        value="Off"
                        checked={test.ess === "Off"}
                        onChange={() => handleTestChange(idx, "ess", "Off")}
                        disabled={!areTestFieldsEditable(test, idx)}
                      />{" "}
                      Off
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`ess${idx}`}
                        value="NA"
                        checked={test.ess === "NA"}
                        onChange={() => handleTestChange(idx, "ess", "NA")}
                        disabled={!areTestFieldsEditable(test, idx)}
                      />{" "}
                      NA
                    </label>
                  </div>
                </div>
                <div>
                  <Label>Mode</Label>
                  <Select
                    value={test.mode}
                    onValueChange={(v) => handleTestChange(idx, "mode", v)}
                    disabled={!areTestFieldsEditable(test, idx)}
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
                    onChange={(e) =>
                      handleTestChange(idx, "hardwareChange", e.target.value)
                    }
                    placeholder="Enter Hardware Change"
                    disabled={!areTestFieldsEditable(test, idx)}
                  />
                </div>
                <div>
                  <Label>Shift</Label>
                  <Select
                    value={test.shift}
                    onValueChange={(v) => handleTestChange(idx, "shift", v)}
                    disabled={!areTestFieldsEditable(test, idx)}
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
                    onValueChange={(v) => handleTestChange(idx, "fuelType", v)}
                    disabled={!areTestFieldsEditable(test, idx)}
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
                    onChange={(e) =>
                      handleTestChange(idx, "equipmentRequired", e.target.value)
                    }
                    placeholder="Enter Equipment Required"
                    disabled={!areTestFieldsEditable(test, idx)}
                  />
                </div>
                <div>
                  <Label>Preferred Date</Label>
                  <Input

                    type="date"
                    value={test.preferredDate}
                    onChange={(e) =>
                      handleTestChange(idx, "preferredDate", e.target.value)
                    }
                    disabled={!areTestFieldsEditable(test, idx)}
                  />
                </div>
                <div>
                  <Label>Emission Check Date</Label>
                  <Input
                    type="date"
                    value={test.emissionCheckDate}
                    onChange={(e) =>
                      handleTestChange(idx, "emissionCheckDate", e.target.value)
                    }
                    disabled={!areTestFieldsEditable(test, idx)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Specific Instruction</Label>
                  <textarea
                    value={test.specificInstruction}
                    onChange={(e) =>
                      handleTestChange(idx, "specificInstruction", e.target.value)
                    }
                    placeholder="Enter Specific Instructions"
                    disabled={!areTestFieldsEditable(test, idx)}
                    className="w-full border rounded p-2 min-h-[60px] max-h-[120px] resize-vertical dark:bg-black"
                    style={{ minWidth: "100%", fontSize: "1rem" }}
                    rows={3}
                  />
                </div>
              </div>
              {/* Attachments Card */}
              <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 rounded-lg p-4 mt-4 mb-2 shadow-inner">
                <div className="font-semibold text-sm text-gray-700 dark:text-white mb-2">
                  Attachments
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>
                      Emission Check Attachment
                      {test.emissionCheckAttachment && test.emissionCheckAttachment.length > 0 && (
                        <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          {Array.isArray(test.emissionCheckAttachment) ? test.emissionCheckAttachment.length : 1}
                        </span>
                      )}
                    </Label>
                    <DropzoneFileList
                      buttonText="Emission Check Attachment"
                      name="emission_check_attachment"
                      maxFiles={5}
                      formData={{
                        ...test,
                        job_order_id: location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || "",
                        test_order_id: test.testOrderId || "",
                        originalJobOrderId: location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""
                      }}
                      setFormData={(updatedTest) => {
                        setTests((prev) =>
                          prev.map((t, i) => (i === idx ? { ...t, ...updatedTest } : t))
                        );
                      }}
                      id={`test${idx}`}
                      submitted={false}
                      setSubmitted={() => { }}
                      openModal={!!emissionCheckModals[idx]}
                      handleOpenModal={() =>
                        setEmissionCheckModals((prev) => ({ ...prev, [idx]: true }))
                      }
                      handleCloseModal={() =>
                        setEmissionCheckModals((prev) => ({ ...prev, [idx]: false }))
                      }
                      disabled={!areTestFieldsEditable(test, idx)}
                      originalJobOrderId={location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""}
                      viewOnly={userRole === "TestEngineer"}
                      // Add custom styling based on file count
                      customButtonStyle={{
                        backgroundColor: getAttachmentColor(getAttachmentFileCount(test, 'emissionCheckAttachment')),
                        borderColor: getAttachmentColor(getAttachmentFileCount(test, 'emissionCheckAttachment')),
                        color: 'white'
                      }}
                      customContainerStyle={{
                        backgroundColor: getAttachmentBackgroundColor(getAttachmentFileCount(test, 'emissionCheckAttachment'))
                      }}
                    />
                  </div>

                  <div>
                    <Label>
                      Dataset Attachment
                      {test.dataset_attachment && test.dataset_attachment.length > 0 && (
                        <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          {Array.isArray(test.dataset_attachment) ? test.dataset_attachment.length : 1}
                        </span>
                      )}
                    </Label>
                    <DropzoneFileList
                      buttonText="Dataset Attachment"
                      name="dataset_attachment"
                      maxFiles={5}
                      formData={{
                        ...test,
                        originalJobOrderId: location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""
                      }}
                      setFormData={(updatedTest) => {
                        setTests((prev) =>
                          prev.map((t, i) => (i === idx ? { ...t, ...updatedTest } : t))
                        );
                      }}
                      id={`test${idx}`}
                      submitted={false}
                      setSubmitted={() => { }}
                      openModal={!!datasetModals[idx]}
                      handleOpenModal={() =>
                        setDatasetModals((prev) => ({ ...prev, [idx]: true }))
                      }
                      handleCloseModal={() =>
                        setDatasetModals((prev) => ({ ...prev, [idx]: false }))
                      }
                      disabled={userRole === "TestEngineer" || test.disabled || !!test.testOrderId}
                      originalJobOrderId={location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""}
                      viewOnly={userRole === "TestEngineer"}
                      // Add custom styling
                      customButtonStyle={{
                        backgroundColor: getAttachmentColor(getAttachmentFileCount(test, 'dataset_attachment')),
                        borderColor: getAttachmentColor(getAttachmentFileCount(test, 'dataset_attachment')),
                        color: 'white'
                      }}
                      customContainerStyle={{
                        backgroundColor: getAttachmentBackgroundColor(getAttachmentFileCount(test, 'dataset_attachment'))
                      }}
                    />
                  </div>

                  {/* Continue this pattern for all other attachment fields */}
                  <div>
                    <Label>
                      A2L Attachment
                      {test.a2l_attachment && test.a2l_attachment.length > 0 && (
                        <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          {Array.isArray(test.a2l_attachment) ? test.a2l_attachment.length : 1}
                        </span>
                      )}
                    </Label>
                    <DropzoneFileList
                      buttonText="A2L Attachment"
                      name="a2l_attachment"
                      maxFiles={5}
                      formData={{
                        ...test,
                        originalJobOrderId: location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""
                      }}
                      setFormData={(updatedTest) => {
                        setTests((prev) =>
                          prev.map((t, i) => (i === idx ? { ...t, ...updatedTest } : t))
                        );
                      }}
                      id={`test${idx}`}
                      submitted={false}
                      setSubmitted={() => { }}
                      openModal={!!a2lModals[idx]}
                      handleOpenModal={() =>
                        setA2LModals((prev) => ({ ...prev, [idx]: true }))
                      }
                      handleCloseModal={() =>
                        setA2LModals((prev) => ({ ...prev, [idx]: false }))
                      }
                      disabled={userRole === "TestEngineer" || test.disabled || !!test.testOrderId}
                      originalJobOrderId={location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""}
                      viewOnly={userRole === "TestEngineer"}
                      customButtonStyle={{
                        backgroundColor: getAttachmentColor(getAttachmentFileCount(test, 'a2l_attachment')),
                        borderColor: getAttachmentColor(getAttachmentFileCount(test, 'a2l_attachment')),
                        color: 'white'
                      }}
                      customContainerStyle={{
                        backgroundColor: getAttachmentBackgroundColor(getAttachmentFileCount(test, 'a2l_attachment'))
                      }}
                    />
                  </div>
                  <div>
                    <Label>
                      Experiment Attachment
                      {test.experiment_attachment && test.experiment_attachment.length > 0 && (
                        <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          {Array.isArray(test.experiment_attachment) ? test.experiment_attachment.length : 1}
                        </span>
                      )}
                    </Label>
                    <DropzoneFileList
                      buttonText="Experiment Attachment"
                      name="experiment_attachment"
                      maxFiles={5}
                      formData={{
                        ...test,
                        originalJobOrderId: location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""
                      }}
                      setFormData={(updatedTest) => {
                        setTests((prev) =>
                          prev.map((t, i) => (i === idx ? { ...t, ...updatedTest } : t))
                        );
                      }}
                      id={`test${idx}`}
                      submitted={false}
                      setSubmitted={() => { }}
                      openModal={!!experimentModals[idx]}
                      handleOpenModal={() =>
                        setExperimentModals((prev) => ({ ...prev, [idx]: true }))
                      }
                      handleCloseModal={() =>
                        setExperimentModals((prev) => ({ ...prev, [idx]: false }))
                      }
                      disabled={userRole === "TestEngineer" || test.disabled || !!test.testOrderId}
                      viewOnly={userRole === "TestEngineer"}
                      originalJobOrderId={location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""}
                      customButtonStyle={{
                        backgroundColor: getAttachmentColor(getAttachmentFileCount(test, 'experiment_attachment')),
                        borderColor: getAttachmentColor(getAttachmentFileCount(test, 'experiment_attachment')),
                        color: 'white'
                      }}
                      customContainerStyle={{
                        backgroundColor: getAttachmentBackgroundColor(getAttachmentFileCount(test, 'experiment_attachment'))
                      }}
                    />
                  </div>

                  <div>
                    <Label>
                      DBC Attachment
                      {test.dbc_attachment && test.dbc_attachment.length > 0 && (
                        <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          {Array.isArray(test.dbc_attachment) ? test.dbc_attachment.length : 1}
                        </span>
                      )}
                    </Label>
                    <DropzoneFileList
                      buttonText="DBC Attachment"
                      name="dbc_attachment"
                      maxFiles={5}
                      formData={{
                        ...test,
                        originalJobOrderId: location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""
                      }}
                      setFormData={(updatedTest) => {
                        setTests((prev) =>
                          prev.map((t, i) => (i === idx ? { ...t, ...updatedTest } : t))
                        );
                      }}
                      id={`test${idx}`}
                      submitted={false}
                      setSubmitted={() => { }}
                      openModal={!!dbcModals[idx]}
                      handleOpenModal={() =>
                        setDBCModals((prev) => ({ ...prev, [idx]: true }))
                      }
                      handleCloseModal={() =>
                        setDBCModals((prev) => ({ ...prev, [idx]: false }))
                      }
                      disabled={userRole === "TestEngineer" || test.disabled || !!test.testOrderId}
                      viewOnly={userRole === "TestEngineer"}
                      originalJobOrderId={location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""}
                      customButtonStyle={{
                        backgroundColor: getAttachmentColor(getAttachmentFileCount(test, 'dbc_attachment')),
                        borderColor: getAttachmentColor(getAttachmentFileCount(test, 'dbc_attachment')),
                        color: 'white'
                      }}
                      customContainerStyle={{
                        backgroundColor: getAttachmentBackgroundColor(getAttachmentFileCount(test, 'dbc_attachment'))
                      }}
                    />
                  </div>

                  <div>
                    <Label>
                      WLTP Input Sheet
                      {test.wltp_attachment && test.wltp_attachment.length > 0 && (
                        <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          {Array.isArray(test.wltp_attachment) ? test.wltp_attachment.length : 1}
                        </span>
                      )}
                    </Label>
                    <DropzoneFileList
                      buttonText="WLTP Input Sheet"
                      name="wltp_attachment"
                      maxFiles={5}
                      formData={{
                        ...test,
                        originalJobOrderId: location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""
                      }}
                      setFormData={(updatedTest) => {
                        setTests((prev) =>
                          prev.map((t, i) => (i === idx ? { ...t, ...updatedTest } : t))
                        );
                      }}
                      id={`test${idx}`}
                      submitted={false}
                      setSubmitted={() => { }}
                      openModal={!!wltpModals[idx]}
                      handleOpenModal={() =>
                        setWLTPModals((prev) => ({ ...prev, [idx]: true }))
                      }
                      handleCloseModal={() =>
                        setWLTPModals((prev) => ({ ...prev, [idx]: false }))
                      }
                      disabled={userRole === "TestEngineer" || test.disabled || !!test.testOrderId}
                      viewOnly={userRole === "TestEngineer"}
                      originalJobOrderId={location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""}
                      customButtonStyle={{
                        backgroundColor: getAttachmentColor(getAttachmentFileCount(test, 'wltp_attachment')),
                        borderColor: getAttachmentColor(getAttachmentFileCount(test, 'wltp_attachment')),
                        color: 'white'
                      }}
                      customContainerStyle={{
                        backgroundColor: getAttachmentBackgroundColor(getAttachmentFileCount(test, 'wltp_attachment'))
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Test Engineers Attachments Card */}
              <div className="bg-gray-100 border border-gray-300 dark:bg-gray-800 rounded-lg p-4 mt-4 mb-2 shadow-inner">
                <div className="font-semibold text-sm text-gray-700 mb-2">
                  Test Engineers Attachments
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>PDF Report</Label>
                    <DropzoneFileList
                      buttonText="PDF Report"
                      name="PDF_report"
                      maxFiles={5}
                      formData={{
                        ...test,
                        originalJobOrderId: location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""
                      }}
                      setFormData={(updatedTest) => {
                        setTests((prev) =>
                          prev.map((t, i) => (i === idx ? { ...t, ...updatedTest } : t))
                        );
                      }}
                      id={`test${idx}`}
                      submitted={false}
                      setSubmitted={() => { }}
                      openModal={!!pdfReportModals[idx]}
                      handleOpenModal={() =>
                        setpdfReportModals((prev) => ({ ...prev, [idx]: true }))
                      }
                      handleCloseModal={() =>
                        setpdfReportModals((prev) => ({ ...prev, [idx]: false }))
                      }
                      disabled={userRole === "ProjectTeam"}
                      originalJobOrderId={location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""}
                      viewOnly={userRole === "ProjectTeam"}
                      team="testTeam" // Add team prop for test engineer attachments
                      customButtonStyle={{
                        backgroundColor: getAttachmentColor(getAttachmentFileCount(test, 'PDF_report')),
                        borderColor: getAttachmentColor(getAttachmentFileCount(test, 'PDF_report')),
                        color: 'white'
                      }}
                      customContainerStyle={{
                        backgroundColor: getAttachmentBackgroundColor(getAttachmentFileCount(test, 'PDF_report'))
                      }}
                    />
                  </div>

                  <div>
                    <Label>Excel Report</Label>
                    <DropzoneFileList
                      buttonText="Excel Report"
                      name="Excel_report"
                      maxFiles={5}
                      formData={{
                        ...test,
                        originalJobOrderId: location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""
                      }}
                      setFormData={(updatedTest) => {
                        setTests((prev) =>
                          prev.map((t, i) => (i === idx ? { ...t, ...updatedTest } : t))
                        );
                      }}
                      id={`test${idx}`}
                      submitted={false}
                      setSubmitted={() => { }}
                      openModal={!!excelReportModals[idx]}
                      handleOpenModal={() =>
                        setexcelReportModals((prev) => ({ ...prev, [idx]: true }))
                      }
                      handleCloseModal={() =>
                        setexcelReportModals((prev) => ({ ...prev, [idx]: false }))
                      }
                      originalJobOrderId={location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""}
                      disabled={userRole === "ProjectTeam"}
                      viewOnly={userRole === "ProjectTeam"}
                      team="testTeam" // Add team prop
                      customButtonStyle={{
                        backgroundColor: getAttachmentColor(getAttachmentFileCount(test, 'Excel_report')),
                        borderColor: getAttachmentColor(getAttachmentFileCount(test, 'Excel_report')),
                        color: 'white'
                      }}
                      customContainerStyle={{
                        backgroundColor: getAttachmentBackgroundColor(getAttachmentFileCount(test, 'Excel_report'))
                      }}
                    />
                  </div>

                  <div>
                    <Label>DAT File Attachment</Label>
                    <DropzoneFileList
                      buttonText="DAT File Attachment"
                      name="DAT_file_attachment"
                      maxFiles={5}
                      formData={{
                        ...test,
                        originalJobOrderId: location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""
                      }}
                      setFormData={(updatedTest) => {
                        setTests((prev) =>
                          prev.map((t, i) => (i === idx ? { ...t, ...updatedTest } : t))
                        );
                      }}
                      id={`test${idx}`}
                      submitted={false}
                      setSubmitted={() => { }}
                      openModal={!!datFileModals[idx]}
                      handleOpenModal={() =>
                        setDATModals((prev) => ({ ...prev, [idx]: true }))
                      }
                      handleCloseModal={() =>
                        setDATModals((prev) => ({ ...prev, [idx]: false }))
                      }
                      originalJobOrderId={location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""}
                      disabled={userRole === "ProjectTeam"}
                      viewOnly={userRole === "ProjectTeam"}
                      team="testTeam" // Add team prop
                      customButtonStyle={{
                        backgroundColor: getAttachmentColor(getAttachmentFileCount(test, 'DAT_file_attachment')),
                        borderColor: getAttachmentColor(getAttachmentFileCount(test, 'DAT_file_attachment')),
                        color: 'white'
                      }}
                      customContainerStyle={{
                        backgroundColor: getAttachmentBackgroundColor(getAttachmentFileCount(test, 'DAT_file_attachment'))
                      }}
                    />
                  </div>

                  <div>
                    <Label>Others Attachment</Label>
                    <DropzoneFileList
                      buttonText="Others Attachment"
                      name="Others_attachment"
                      maxFiles={5}
                      formData={{
                        ...test,
                        originalJobOrderId: location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""
                      }}
                      setFormData={(updatedTest) => {
                        setTests((prev) =>
                          prev.map((t, i) => (i === idx ? { ...t, ...updatedTest } : t))
                        );
                      }}
                      id={`test${idx}`}
                      submitted={false}
                      setSubmitted={() => { }}
                      openModal={!!othersModals[idx]}
                      handleOpenModal={() =>
                        setOthersModals((prev) => ({ ...prev, [idx]: true }))
                      }
                      handleCloseModal={() =>
                        setOthersModals((prev) => ({ ...prev, [idx]: false }))
                      }
                      originalJobOrderId={location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""}
                      disabled={userRole === "ProjectTeam"}
                      viewOnly={userRole === "ProjectTeam"}
                      team="testTeam" // Add team prop
                      customButtonStyle={{
                        backgroundColor: getAttachmentColor(getAttachmentFileCount(test, 'Others_attachment')),
                        borderColor: getAttachmentColor(getAttachmentFileCount(test, 'Others_attachment')),
                        color: 'white'
                      }}
                      customContainerStyle={{
                        backgroundColor: getAttachmentBackgroundColor(getAttachmentFileCount(test, 'Others_attachment'))
                      }}
                    />
                  </div>
                </div>
              </div>
              {/* Coast Down Data Section for Test */}
              <div className="mt-6 border rounded shadow px-4 py-3 bg-blue-50">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-semibold text-sm text-blue-700">
                    Coast Down Data for Test {idx + 1}
                  </span>
                  <Switch
                    checked={!!test.showCoastDownData}
                    onCheckedChange={(checked) => {
                      const updatedTests = [...tests];
                      updatedTests[idx].showCoastDownData = checked;
                      setTests(updatedTests);
                    }}
                    disabled={!areTestFieldsEditable(test, idx)}
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
                        value={test.cdReportRef || form.cdReportRef}
                        onChange={(e) =>
                          handleTestChange(idx, "cdReportRef", e.target.value)
                        }
                        placeholder="Enter Coast Test Report Ref."
                        className="mt-1"
                        disabled={!areTestFieldsEditable(test, idx)}
                      />
                    </div>
                    <div className="mb-2 font-semibold text-xs">CD Values</div>
                    <div className="grid grid-cols-4 gap-3 text-xs">
                      <div>
                        <Label className="text-xs">
                          Vehicle Reference mass (Kg)
                        </Label>
                        <Input
                          value={test.vehicleRefMass || form.vehicleRefMass}
                          onChange={(e) =>
                            handleTestChange(
                              idx,
                              "vehicleRefMass",
                              e.target.value
                            )
                          }
                          placeholder="Enter Vehicle Reference mass"
                          className="mt-1"
                          disabled={!areTestFieldsEditable(test, idx)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">A (N)</Label>
                        <Input
                          value={test.aN || form.aN}
                          onChange={(e) =>
                            handleTestChange(idx, "aN", e.target.value)
                          }
                          placeholder="Enter A (N)"
                          className="mt-1"
                          disabled={!areTestFieldsEditable(test, idx)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">B (N/kmph)</Label>
                        <Input
                          value={test.bNkmph || form.bNkmph}
                          onChange={(e) =>
                            handleTestChange(idx, "bNkmph", e.target.value)
                          }
                          placeholder="Enter B (N/kmph)"
                          className="mt-1"
                          disabled={!areTestFieldsEditable(test, idx)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">C (N/kmph^2)</Label>
                        <Input
                          value={test.cNkmph2 || form.cNkmph2}
                          onChange={(e) =>
                            handleTestChange(idx, "cNkmph2", e.target.value)
                          }
                          placeholder="Enter C (N/kmph^2)"
                          className="mt-1"
                          disabled={!areTestFieldsEditable(test, idx)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs mt-3">
                      <div>
                        <Label className="text-xs">F0 (N)</Label>
                        <Input
                          value={test.f0N || form.f0N}
                          onChange={(e) =>
                            handleTestChange(idx, "f0N", e.target.value)
                          }
                          placeholder="Enter F0 (N)"
                          className="mt-1"
                          disabled={!areTestFieldsEditable(test, idx)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">F1 (N/kmph)</Label>
                        <Input
                          value={test.f1Nkmph || form.f1Nkmph}
                          onChange={(e) =>
                            handleTestChange(idx, "f1Nkmph", e.target.value)
                          }
                          placeholder="Enter F1 (N/kmph)"
                          className="mt-1"
                          disabled={!areTestFieldsEditable(test, idx)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">F2 (N/kmph^2)</Label>
                        <Input
                          value={test.f2Nkmph2 || form.f2Nkmph2}
                          onChange={(e) =>
                            handleTestChange(idx, "f2Nkmph2", e.target.value)
                          }
                          placeholder="Enter F2 (N/kmph^2)"
                          className="mt-1"
                          disabled={!areTestFieldsEditable(test, idx)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button
                        type="button"
                        className="bg-blue-600 text-white text-xs px-4 py-1 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={!areTestFieldsEditable(test, idx)}
                        onClick={() => {
                          // Copy coast down data from main form to this test
                          handleTestChange(idx, "cdReportRef", form.cdReportRef);
                          handleTestChange(idx, "vehicleRefMass", form.vehicleRefMass);
                          handleTestChange(idx, "aN", form.aN);
                          handleTestChange(idx, "bNkmph", form.bNkmph);
                          handleTestChange(idx, "cNkmph2", form.cNkmph2);
                          handleTestChange(idx, "f0N", form.f0N);
                          handleTestChange(idx, "f1Nkmph", form.f1Nkmph);
                          handleTestChange(idx, "f2Nkmph2", form.f2Nkmph2);
                        }}
                      >
                        Load from Main Form
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-6">
                <Button
                  className="bg-red-600 text-white text-xs px-6 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                  onClick={() => handleCreateTestOrder(idx)}
                  disabled={!!test.testOrderId || test.disabled}
                >
                  {test.testOrderId ? " TEST ORDER CREATED" : " CREATE TEST ORDER"}
                </Button>
                {editingTestOrderIdx === idx && (
                  <Button
                    className="bg-blue-600 text-white text-xs px-6 py-2 rounded ml-2"
                    onClick={() => {
                      if (isProjectTeam) {
                        handleOpenMailRemarksModal(idx);
                      } else {
                        handleUpdateTestOrder(idx);
                      }
                    }}
                  >
                    UPDATE TEST ORDER
                  </Button>
                )}
              </div>

              {/* Re-edit remarks modal */}
              {reEditModalOpen === idx && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white rounded shadow-lg p-6 w-96">
                    <div className="font-semibold mb-2">Reason for Re-edit</div>
                    <textarea
                      className="w-full border rounded p-2 mb-4"
                      rows={3}
                      value={reEditRemarks[idx] || ""}
                      onChange={(e) => setReEditRemarks((prev) => ({ ...prev, [idx]: e.target.value }))}
                      placeholder="Enter reason for re-edit..."
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        className="bg-gray-300 text-black px-4 py-1 rounded"
                        type="button"
                        onClick={() => setReEditModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-blue-600 text-white px-4 py-1 rounded"
                        type="button"
                        onClick={() => handleSubmitReEditRemarks(idx)}
                        disabled={!reEditRemarks[idx]?.trim()}
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              {/* Rejection remarks modal */}
              {rejectionModalOpen === idx && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white rounded shadow-lg p-6 w-96">
                    <div className="font-semibold mb-2">Reason for Rejection</div>
                    <textarea
                      className="w-full border rounded p-2 mb-4"
                      rows={3}
                      value={rejectionRemarks[idx] || ""}
                      onChange={(e) => setRejectionRemarks((prev) => ({ ...prev, [idx]: e.target.value }))}
                      placeholder="Enter reason for rejection..."
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        className="bg-gray-300 text-black px-4 py-1 rounded"
                        type="button"
                        onClick={() => setRejectionModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-red-600 text-white px-4 py-1 rounded"
                        type="button"
                        onClick={() => handleSubmitRejectionRemarks(idx)}
                        disabled={!rejectionRemarks[idx]?.trim()}
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              {/* mail remarks modal */}
              {mailRemarksModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white rounded shadow-lg p-6 w-96">
                    <div className="font-semibold mb-2">mail remarks</div>
                    <textarea
                      className="w-full border rounded p-2 mb-4"
                      rows={3}
                      value={mailRemarks}
                      onChange={(e) => setMailRemarks(e.target.value)}
                      placeholder="Enter mail remarks..."
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        className="bg-gray-300 text-black px-4 py-1 rounded"
                        type="button"
                        onClick={() => setMailRemarksModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-blue-600 text-white px-4 py-1 rounded"
                        type="button"
                        onClick={() => handleSubmitMailRemarks(idx)}
                        disabled={!mailRemarks.trim()}
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Show all test orders in a table */}
        <div className="mx-8 my-8">
          <div className="font-semibold mb-2">All Test Orders</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border ">
              <thead>
                <tr className="bg-gray-200 dark:bg-black">
                  <th className="border px-2 py-1">Test</th> {/* Add sequential number column */}
                  <th className="border px-2 py-1">Job Order ID</th>
                  <th className="border px-2 py-1">Test Order ID</th>
                  <th className="border px-2 py-1">Test Type</th>
                  <th className="border px-2 py-1">Objective</th>
                  <th className="border px-2 py-1">Fuel Type</th>
                  <th className="border px-2 py-1">Status</th>
                  <th className="border px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(allTestOrders[location.state?.originalJobOrderId] || []).map((to, index) => (
                  <tr key={to.test_order_id}>
                    <td className="border px-2 py-1">{index + 1}</td> {/* Sequential number */}
                    <td className="border px-2 py-1">{to.job_order_id}</td>
                    <td className="border px-2 py-1">{to.test_order_id}</td>
                    <td className="border px-2 py-1">{to.test_type}</td>
                    <td className="border px-2 py-1">{to.test_objective}</td>
                    <td className="border px-2 py-1">{to.fuel_type}</td>
                    <td className="border px-2 py-1">{to.status}</td>
                    <td className="border px-2 py-1 flex justify-center items-center gap-2">
                      {/* Show Edit button based on user role and test status */}
                      {(() => {
                        // For ProjectTeam: Show edit button when status is "Re-edit" 
                        if (isProjectTeam && to.status === "Re-edit") {
                          return (
                            <Button
                              className="bg-blue-600 text-white text-xs px-4 py-1 rounded"
                              onClick={() => navigate('/editTestOrder', {
                                state: {
                                  testOrder: to,
                                  jobOrderId: location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id,
                                  returnPath: location.pathname,
                                  returnState: location.state
                                }
                              })}
                            >
                              Edit
                            </Button>
                          );
                        }
                        // For other roles (but not TestEngineer when status is "Re-edit"): Show edit button
                        else if (!isTestEngineer || (isTestEngineer && to.status !== "Re-edit")) {
                          return (
                            <Button
                              className="bg-blue-600 text-white text-xs px-4 py-1 rounded"
                              onClick={() => navigate('/editTestOrder', {
                                state: {
                                  testOrder: to,
                                  jobOrderId: location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id,
                                  returnPath: location.pathname,
                                  returnState: location.state
                                }
                              })}
                            >
                              Edit
                            </Button>
                          );
                        }
                        // Hide edit button for TestEngineer when status is "Re-edit"
                        else {
                          return (
                            <span className="text-gray-400 text-xs">No action</span>
                          );
                        }
                      })()}
                    </td>
                  </tr>
                ))}
                {(allTestOrders[location.state?.originalJobOrderId] || []).length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-2 text-gray-500">
                      No test orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Red line below */}
        <div className="border-b-4 border-red-600 mx-8" />
      </div>

      {/* Remark Modal */}
      <RemarkModal
        open={!!remarkModalOpen}
        onClose={() => {
          setRemarkModalOpen(false);
          setRemarkInput("");
        }}
        onSubmit={async () => {
          if (remarkModalOpen) {
            const { idx, type } = remarkModalOpen;
            const testOrderId = tests[idx]?.testOrderId;
            if (type === "Reject") {
              await handleStatusUpdate("Rejected", remarkInput, testOrderId, idx);
            } else if (type === "Edit") {
              await handleStatusUpdate("Edit", remarkInput, testOrderId, idx);
            }
          }
        }}
        type={remarkType}
        value={remarkInput}
        setValue={setRemarkInput}
      />
    </>
  );
}