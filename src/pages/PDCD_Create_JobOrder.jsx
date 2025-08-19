"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import DropzoneFileList from "@/components/UI/DropzoneFileList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import Navbar1 from "@/components/UI/navbar";
import { useNavigate, useLocation } from "react-router-dom";
import { Switch } from "@/components/UI/switch";
import useStore from "@/store/useStore";
import axios from "axios";
import CFTMembers from "@/components/CFTMembers";
import { ArrowBack, Close as CloseIcon } from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import showSnackbar from "@/utils/showSnackbar";

const apiURL = import.meta.env.VITE_BACKEND_URL;

const departments = ["VTC_JO Chennai", "RDE JO", "VTC_JO Nashik", "PDCD_JO Chennai"];

export default function PDCDCreateJobOrder() {
  const [mailLoading, setMailLoading] = useState(false);
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
    department: "PDCD_JO Chennai", // Default to Chennai
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
  const [showCFTPanel, setShowCFTPanel] = useState(false);
  const [cdError, setCdError] = useState("");
  const [cdFieldErrors, setCdFieldErrors] = useState({});

  // State to control pre-filling mode to prevent useEffect conflicts
  const [isPreFilling, setIsPreFilling] = useState(false);

  // State to show loading during pre-fill
  const [isLoading, setIsLoading] = useState(false);

  // Test state
  const [tests, setTests] = useState([]);

  // State to track existing CoastDownData_id for updates
  const [existingCoastDownId, setExistingCoastDownId] = useState(null);

  // State for test types from API
  const [testTypes, setTestTypes] = useState([]);

  // State for inertia classes from API
  const [inertiaClasses, setInertiaClasses] = useState([]);

  // State for modes from API
  const [modes, setModes] = useState([]);

  const [fuelTypes, setFuelTypes] = useState([]);
  const [engineNumbers, setEngineNumbers] = useState([]);

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

  // Handler to add a new test
  const handleAddTest = () => {
    setTests((prev) => [
      ...prev,
      {
        engineNumber: "", // New field for engine number
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
        equipmentRequired: "",
        shift: "",
        preferredDate: "",
        emissionCheckDate: "",
        emissionCheckAttachment: "",
        specificInstruction: "",
        uploadDocuments: null,
        testOrderId: null, // Track created test order ID
        showCoastDownData: false, // Toggle for coast down data section
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


  // New: State for fetched vehicles by project
    const [projectVehicles, setProjectVehicles] = useState([]);
    // New: State for selected vehicle's engine numbers
    const [vehicleEngineNumbers, setVehicleEngineNumbers] = useState([]);
  
    useEffect(() => {
      // When project code changes, fetch vehicles for that project
      if (form.projectCode) {
        axios
          .get(`${apiURL}/vehicles/by-project/${encodeURIComponent(form.projectCode)}`)
          .then((res) => {
            setProjectVehicles(res.data.vehicles || []);
          })
          .catch(() => {
            setProjectVehicles([]);
          });
        // Reset vehicle and engine selections
        setForm((prev) => ({
          ...prev,
          vehicleBodyNumber: "",
          vehicleSerialNumber: "",
          engineNumber: "",
          engineType: "",
        }));
        setVehicleEngineNumbers([]);
      } else {
        setProjectVehicles([]);
        setVehicleEngineNumbers([]);
        setForm((prev) => ({
          ...prev,
          vehicleBodyNumber: "",
          vehicleSerialNumber: "",
          engineNumber: "",
          engineType: "",
        }));
      }
      // eslint-disable-next-line
    }, [form.projectCode]);

  // Accordion state for vehicle details
  const [vehicleAccordionOpen, setVehicleAccordionOpen] = useState(false);

  // Editable vehicle form state
  const [vehicleEditable, setVehicleEditable] = useState(null);
  const [vehicleEditMode, setVehicleEditMode] = useState(false);

  // Fetch vehicle details using the new API when body number changes
  const handleVehicleBodyChange = (value) => {
    // Don't interfere if we're currently pre-filling
    if (isPreFilling) return;

    const found = projectVehicles.find((v) => v.vehicle_body_number === value);
    setForm((prev) => ({
      ...prev,
      vehicleBodyNumber: value,
      vehicleSerialNumber: found?.vehicle_serial_number || "",
      engineSerialNumber: "",
      engineType: "",
    }));
    setVehicleEngineNumbers(found?.engine_numbers || []);
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

  // Accordion state for engine details
  const [engineAccordionOpen, setEngineAccordionOpen] = useState(false);

  // Editable engine form state
  const [engineEditable, setEngineEditable] = useState(null);
  const [engineEditMode, setEngineEditMode] = useState(false);

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

  // Handler for editable engine form changes
  const handleEngineEditableChange = (field, value) => {
    setEngineEditable((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const navigate = useNavigate();
  const location = useLocation();

  // Prefill form if jobOrder is passed via navigation state
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
        showSnackbar("Job order pre-filled successfully", "success");
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

        const newFormData = {
          ...form, // Preserve existing form state first
          projectCode: jobOrder.project_code || "",
          vehicleBuildLevel:
            jobOrder.vehicle_build_level || jobOrder.vehicleBuildLevel || "",
          vehicleModel: jobOrder.vehicle_model || jobOrder.vehicleModel || "",
          vehicleBodyNumber: jobOrder.vehicle_body_number || "",
          transmissionType:
            jobOrder.transmission_type || jobOrder.transmissionType || "",
          finalDriveAxleRatio:
            jobOrder.final_drive_axle_ratio ||
            jobOrder.finalDriveAxleRatio ||
            "",
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
    }
  }, []); // Empty dependency array - only run once on mount

  // Add these handlers
  const handleTabClick = (tab) => {
    if (tab === "Job Order") navigate("/chennai/joborder");
    else if (tab === "Vehicle") navigate("/chennai/vehicle");
    else if (tab === "Engine") navigate("/chennai/engine");
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Add this function to handle dropdown changes
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      created_on: formattedISTTime,
      id_of_updater: "",
      name_of_updater: "",
      // updated_on: new Date().toISOString(),
      cft_members: cftMembers,
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
      id_of_creator: "",
      created_on: new Date().toISOString(),
      id_of_updater: "",
      updated_on: new Date().toISOString(),
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
      showSnackbar("Job Order Created! ID: " + jobOrderRes.data.job_order_id, "success");
      // Optionally, reset form or navigate
      handleSendMail(1, jobOrderRes.data.job_order_id, null);
      navigate(-1);
    } catch (err) {
      console.error("Error creating job order:", err);
      showSnackbar(
        "Failed to create job order: " + (err.response?.data?.detail || err.message),
        "error"
      );
    }
  };

  // Helper function to validate test data
  const isTestValid = (test) => {
    const requiredFields = [
      'testType',
      'objective',
      'vehicleLocation',
      'cycleGearShift',
      'datasetName',
      'inertiaClass',
      'dpf',
      'datasetRefreshed',
      'ess',
      'mode',
      'hardwareChange',
      'shift',
      'preferredDate',
      'fuelType',
      'equipmentRequired',
      'emissionCheckDate',
      'specificInstruction'
    ];

    // Check if all required fields are filled
    for (const field of requiredFields) {
      if (!test[field] || test[field].toString().trim() === '') {
        return false;
      }
    }

    // If DPF is Yes, require regen value
    if (test.dpf === 'Yes') {
      const regen = test.dpfRegenOccurs;
      if (regen === undefined || regen === null || (typeof regen === 'string' && regen.trim() === '')) return false;
    }

    // Check if required attachments are present
    const requiredAttachments = [
      'datasetAttachments', 
      'experimentAttachments'
    ];

    for (const attachment of requiredAttachments) {
      if (!test[attachment] || !Array.isArray(test[attachment]) || test[attachment].length === 0) {
        return false;
      }
    }

    return true;
  };

  // Handler for creating test order
  const handleCreateTestOrder = async (testIndex) => {
    const test = tests[testIndex];

    // Use comprehensive validation
    if (!isTestValid(test)) {
      showSnackbar("Please fill in all required fields and upload all mandatory attachments before creating test order.", "error");
      return;
    }

    // If DPF is Yes, require DPF Regen Occurs (g)
    if (test.dpf === 'Yes') {
      const regen = test.dpfRegenOccurs;
      if (regen === undefined || regen === null || (typeof regen === 'string' && regen.trim() === '')) {
        showSnackbar('DPF Regen Occurs (g) is required when DPF is Yes.', 'warning');
        return;
      }
    }

    // Generate test_order_id based on timestamp
    // const test_order_id = "TO" + Date.now();

    // Get job_order_id from location state or create a new one if not available
    const job_order_id = location.state?.jobOrder?.job_order_id || location.state?.originalJobOrderId || "";
    const test_order_id = `${job_order_id}/${test.testNumber}`;



    // Create or update coast down data for this specific test
    let CoastDownData_id =
      location.state?.jobOrder?.CoastDownData_id || existingCoastDownId;

    // If test has its own coast down data, create a new coast down entry
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
      // Generate new CoastDownData_id for this test
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
        id_of_creator: "",
        created_on: new Date().toISOString(),
        id_of_updater: "",
        updated_on: new Date().toISOString(),
      };

      try {
        await axios.post(`${apiURL}/coastdown`, testCoastDownPayload);
      } catch (err) {
        console.error("Error creating test-specific coast down data:", err);
        showSnackbar("Failed to create coast down data for test: " + (err.response?.data?.detail || err.message), "error");
        return;
      }
    }

    // Create test order payload matching the API schema
    const testOrderPayload = {
      test_order_id,
      job_order_id,
      CoastDownData_id,
      engine_number: "",
      test_type: test.testType || "",
      test_objective: test.objective || "",
      vehicle_location: test.vehicleLocation || "",
      cycle_gear_shift: test.cycleGearShift || "",
      inertia_class: test.inertiaClass || "",
      dataset_name: test.datasetName || "",
      dpf: test.dpf || "",
      dpf_regen_occurs: test.dpfRegenOccurs || "",
      dataset_flashed:
        test.datasetRefreshed === "Yes"
          ? true
          : test.datasetRefreshed === "No"
            ? false
            : null,
      ess: test.ess || "",
      mode: test.mode || "",
      hardware_change: test.hardwareChange || "",
      equipment_required: test.equipmentRequired || "",
      shift: test.shift || "",
      preferred_date: test.preferredDate || null,
      emission_check_date: test.emissionCheckDate || null,
      emission_check_attachment: test.emissionCheckAttachment || "",
      specific_instruction: test.specificInstruction || "",
      status: "Created",
      id_of_creator: "",
      name_of_creator: "",
      created_on: new Date().toISOString(),
      id_of_updater: "",
      name_of_updater: "",
      updated_on: new Date().toISOString(),
    };

    try {
      const response = await axios.post(
        `${apiURL}/testorders`,
        testOrderPayload
      );

      // Update the test in state with the created test order ID
      setTests((prev) =>
        prev.map((t, i) =>
          i === testIndex
            ? { ...t, testOrderId: response.data.test_order_id }
            : t
        )
      );
      showSnackbar(
        "Test Order Created! ID: " + response.data.test_order_id +
        (hasTestSpecificCoastDownData
          ? "\nCoast Down Data ID: " + CoastDownData_id
          : "")
      );
      handleSendMail(2, job_order_id, response.data.test_order_id);
      navigate(-1);
    } catch (err) {
      console.error("Error creating test order:", err);
      showSnackbar(
        "Failed to create test order: " + (err.response?.data?.detail || err.message),
        "error"
      );
    }
  };

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
      console.error("Error updating coast down data:", err);
      throw err; // Re-throw to handle in calling function
    }
  };

  const [formDisabled, setFormDisabled] = useState(false);

  // Ref to track if we've already pre-filled to prevent multiple executions
  const hasPreFilledRef = useRef(false);

  // Debug useEffect to monitor form state changes
  useEffect(() => {
    const hasValues = Object.values(form).some((value) => value !== "");
    if (!hasValues && hasPreFilledRef.current && !isPreFilling) {
      console.warn("⚠️ Form was reset unexpectedly after pre-filling!");
    }
  }, [form, isPreFilling, isLoading]);

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
        dpfRegenOccurs: testOrder.dpf_regen_occurs || "",
        datasetRefreshed:
          testOrder.dataset_flashed === true
            ? "Yes"
            : testOrder.dataset_flashed === false
              ? "No"
              : "",
        ess: testOrder.ess || "",
        mode: testOrder.mode || "",
        hardwareChange: testOrder.hardware_change || "",
        equipmentRequired: testOrder.equipment_required || "",
        shift: testOrder.shift || "",
        preferredDate: testOrder.preferred_date || "",
        emissionCheckDate: testOrder.emission_check_date || "",
        emissionCheckAttachment: testOrder.emission_check_attachment || "",
        specificInstruction: testOrder.specific_instruction || "",
        testOrderId: testOrder.test_order_id,
        // Coast down fields if present
        cdReportRef: testOrder.cdReportRef || "",
        vehicleRefMass: testOrder.vehicleRefMass || "",
        aN: testOrder.aN || "",
        bNkmph: testOrder.bNkmph || "",
        cNkmph2: testOrder.cNkmph2 || "",
        f0N: testOrder.f0N || "",
        f1Nkmph: testOrder.f1Nkmph || "",
        f2Nkmph2: testOrder.f2Nkmph2 || "",
      };
      return updated;
    });
    setEditingTestOrderIdx(testIdx);
  };

  // Handler to update the test order from the test form
  const handleUpdateTestOrder = async (idx) => {
    const test = tests[idx];
    if (!test.testOrderId) {
      showSnackbar("No test order selected for update.", "error");
      return;
    }
    // Prepare payload matching API schema
    const testOrderPayload = {
      test_order_id: test.testOrderId,
      job_order_id: location.state?.jobOrder?.job_order_id || null,
      CoastDownData_id:
        location.state?.jobOrder?.CoastDownData_id || existingCoastDownId,
      engine_number: "",
      test_type: test.testType || "",
      test_objective: test.objective || "",
      vehicle_location: test.vehicleLocation || "",
      cycle_gear_shift: test.cycleGearShift || "",
      inertia_class: test.inertiaClass || "",
      dataset_name: test.datasetName || "",
      dpf: test.dpf || "",
      dpf_regen_occurs: test.dpfRegenOccurs || "",
      dataset_flashed:
        test.datasetRefreshed === "Yes"
          ? true
          : test.datasetRefreshed === "No"
            ? false
            : null,
      ess: test.ess || "",
      mode: test.mode || "",
      hardware_change: test.hardwareChange || "",
      equipment_required: test.equipmentRequired || "",
      shift: test.shift || "",
      preferred_date: test.preferredDate || null,
      emission_check_date: test.emissionCheckDate || null,
      emission_check_attachment: test.emissionCheckAttachment || "",
      specific_instruction: test.specificInstruction || "",
      status: "Created",
      id_of_creator: "",
      name_of_creator: "",
      created_on: new Date().toISOString(),
      id_of_updater: "",
      name_of_updater: "",
      updated_on: new Date().toISOString(),
    };
    try {
      await updateTestOrder(test.testOrderId, testOrderPayload);
      showSnackbar("Test Order updated successfully!");
      fetchAllTestOrders();
      setEditingTestOrderIdx(null);
    } catch (err) {
      showSnackbar(
        "Failed to update test order: " +
        (err.response?.data?.detail || err.message)
      );
    }
  };

  // Add modal state for remark and modal type
  const [remarkModalOpen, setRemarkModalOpen] = useState(false);
  const [remarkType, setRemarkType] = useState(""); // "Reject" or "Edit"
  const [remarkInput, setRemarkInput] = useState("");

  // Handler to send status update to backend
  const handleStatusUpdate = async (status, remark = "", testOrderId = null, testIdx = null) => {
    try {
      // Only send test_order_id, status, and remark
      const payload = {
        test_order_id: testOrderId,
        status,
        remark,
      };
      await axios.post(`${apiURL}/testorders/status`, payload);
      // Update test status in UI if testIdx is provided
      if (typeof testIdx === "number") {
        setTests((prev) =>
          prev.map((t, i) =>
            i === testIdx
              ? { ...t, status }
              : t
          )
        );
      }
      setRemarkInput("");
      setRemarkModalOpen(false);
    } catch (err) {
      showSnackbar("Failed to update status: " + (err.response?.data?.detail || err.message), "error");
    }
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

  const { userRole, userId, userName } = useAuth();
  const isTestEngineer = userRole === "TestEngineer";
  const isProjectTeam = userRole === "ProjectTeam";
  const isAdmin = userRole == "Admin";

  // Helper function to determine if test fields should be editable
  const areTestFieldsEditable = (test, idx) => {
    if (test.disabled) return false;
    if (!!test.testOrderId && editingTestOrderIdx !== idx) return false;
    if (isTestEngineer) return false;
    if (isProjectTeam) {
      if (!test.testOrderId) return true;
      if (test.status === "Re-edit" && editingTestOrderIdx === idx) return true;
      return false;
    }
    return !test.disabled && (!test.testOrderId || editingTestOrderIdx === idx);
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
              className="bg-red-600 text-white px-3 py-1 rounded-full"
            >
              PDCD Job Order
            </Button>
            <div className="flex flex-col">
              {location.state?.isEdit && (
                <span className="text-sm text-blue-600 font-medium">
                  {isLoading
                    ? "Loading job order data..."
                    : `Pre-filled from Job Order: ${location.state.originalJobOrderId}`}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6" />
        
        {/* Main Job Order Form */}
        <div className="bg-white-50 border border-gray-200 rounded-lg mx-8 mb-6 p-6 shadow-lg shadow-gray-300/40 transition-all duration-200 hover:shadow-xl hover:shadow-gray-400/40 hover:-translate-y-1 cursor-pointer">
          {/* Form Row */}
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Project Code */}
          <div>
            <Label
              htmlFor="projectCode"
              className="text-sm text-gray-600 mb-1 block"
            >
              Project <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.projectCode}
              onValueChange={(value) => handleChange("projectCode", value)}
              required
              disabled={formDisabled || isTestEngineer}
            >
              <SelectTrigger className="w-full h-10 border-gray-300">
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
          <div>
            <Label
              htmlFor="vehicleBodyNumber"
              className="text-sm text-gray-600 mb-1 block"
            >
              Vehicle Body Number <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.vehicleBodyNumber}
              onValueChange={handleVehicleBodyChange}
              required
              disabled={formDisabled || isTestEngineer || !form.projectCode}
            >
              <SelectTrigger className="w-full h-10 border-gray-300">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {projectVehicles.map((item, index) => (
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
          {/* Vehicle Number (auto) */}
          <div className="flex flex-col">
            <Label htmlFor="vehicleSerialNumber" className="mb-2">
              Vehicle Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vehicleSerialNumber"
              value={form.vehicleSerialNumber}
              readOnly
              className="w-full"
              placeholder="Auto-fetched"
              required
              disabled={formDisabled || isTestEngineer}
            />
          </div>
          {/* Engine Number (dropdown) */}
          <div>
            <Label
              htmlFor="engineSerialNumber"
              className="text-sm text-gray-600 mb-1 block"
            >
              Engine Number <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.engineSerialNumber}
              onValueChange={handleEngineNumberChange}
              required
              disabled={formDisabled || isTestEngineer || !form.vehicleBodyNumber}
            >
              <SelectTrigger className="w-full h-10 border-gray-300">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {vehicleEngineNumbers.map((engineSerialNumber) => (
                  <SelectItem key={engineSerialNumber} value={engineSerialNumber}>
                    {engineSerialNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Type of Engine */}
          <div>
            <Label
              htmlFor="engineType"
              className="text-sm text-gray-600 mb-1 block"
            >
              Type of Engine <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.engineType}
              onValueChange={(value) => handleChange("engineType", value)}
              required
              disabled={formDisabled || isTestEngineer}
            >
              <SelectTrigger className="w-full h-10 border-gray-300">
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
          <div>
            <Label
              htmlFor="domain"
              className="text-sm text-gray-600 mb-1 block"
            >
              Domain <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.domain}
              onValueChange={(value) => handleChange("domain", value)}
              required
              disabled={formDisabled || isTestEngineer}
            >
              <SelectTrigger className="w-full h-10 border-gray-300">
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
          <div>
            <Label
              htmlFor="department"
              className="text-sm text-gray-600 mb-1 block"
            >
              Department <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.department}
              onValueChange={(value) => handleChange("department", value)}
              required
              disabled={true}
            >
              <SelectTrigger className="w-full h-10 border-gray-300">
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
        </div>

        {/* Editable Vehicle Details Accordion */}
        {vehicleEditable && (
          <div className="mx-8 mt-2 mb-4 border rounded shadow-lg shadow-gray-300/40 transition-all duration-200 hover:shadow-xl hover:shadow-gray-400/40 hover:-translate-y-1 cursor-pointer">
            <div
              className="flex items-center justify-between bg-gray-100 border-t-4 border-red-600 px-4 py-2 cursor-pointer"
              onClick={() => setVehicleAccordionOpen((prev) => !prev)}
            >
              <span className="font-semibold text-sm">
                Vehicle Details
              </span>
              <span>{vehicleAccordionOpen ? "▲" : "▼"}</span>
            </div>
            {vehicleAccordionOpen && (
              <form className="bg-white px-4 py-4">
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
                {/* Optionally, add a Save button here */}
              </form>
            )}
          </div>
        )}

        {/* Editable Engine Details Accordion */}
        {engineEditable && (
          <div className="mx-8 mt-2 mb-4 border rounded shadow-lg shadow-gray-300/40 transition-all duration-200 hover:shadow-xl hover:shadow-gray-400/40 hover:-translate-y-1 cursor-pointer">
            <div
              className="flex items-center justify-between bg-gray-100 border-t-4 border-blue-600 px-4 py-2 cursor-pointer"
              onClick={() => setEngineAccordionOpen((prev) => !prev)}
            >
              <span className="font-semibold text-sm">
                Engine Details
              </span>
              <span>{engineAccordionOpen ? "▲" : "▼"}</span>
            </div>
            {engineAccordionOpen && (
              <form className="bg-white px-4 py-4">
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
                {/* Optionally, add a Save button here */}
              </form>
            )}
          </div>
        )}

        {/* Job Order Buttons */}
        <div className="bg-white-50 border border-gray-200 rounded-lg mx-8 mb-6 p-6 shadow-lg shadow-gray-300/40 transition-all duration-200 hover:shadow-xl hover:shadow-gray-400/40 hover:-translate-y-1 cursor-pointer">
          {cdError && (
            <div className="text-red-600 text-sm mb-4">{cdError}</div>
          )}

          <div className="flex items-center gap-4">
            <Button
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
              onClick={handleCreateJobOrder}
              disabled={isTestEngineer}
            >
              {location.state?.isEdit ? "UPDATE JOB ORDER" : "CREATE JOB ORDER"}
            </Button>
            <Button
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
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
            </Button>
          </div>
        </div>

        {/* Coast Down Data (CD) Section */}
        {/* <div className="bg-white-50 border border-gray-200 rounded-lg mx-8 mb-6 p-6 shadow-lg shadow-gray-300/40 transition-all duration-200 hover:shadow-xl hover:shadow-gray-400/40 hover:-translate-y-1 cursor-pointer">

          <div className="mb-6">
            <Label
              htmlFor="cdReportRef"
              className="text-sm text-gray-600 mb-1 block"
            >
              Coast Down Test Report Reference
            </Label>
            <Input
              id="cdReportRef"
              placeholder="Enter Coast Test Report Ref."
              className="w-full h-10 border-gray-300"
              value={form.cdReportRef}
              onChange={(e) =>
                handleCDNumberInput("cdReportRef", e.target.value)
              }
              disabled={formDisabled || isTestEngineer}
            />
            {cdFieldErrors.cdReportRef && (
              <div className="text-red-600 text-sm mt-1">
                {cdFieldErrors.cdReportRef}
              </div>
            )}
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-4">
              CD Values
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label
                  htmlFor="vehicleRefMass"
                  className="text-sm text-gray-600 mb-1 block"
                >
                  Vehicle Reference mass (Kg)
                </Label>
                <Input
                  id="vehicleRefMass"
                  placeholder="Enter Reference Mass"
                  className="w-full h-10 border-gray-300"
                  value={form.vehicleRefMass}
                  onChange={(e) =>
                    handleCDNumberInput("vehicleRefMass", e.target.value)
                  }
                  disabled={formDisabled || isTestEngineer}
                />
                {cdFieldErrors.vehicleRefMass && (
                  <div className="text-red-600 text-sm mt-1">
                    {cdFieldErrors.vehicleRefMass}
                  </div>
                )}
              </div>

              <div>
                <Label
                  htmlFor="aN"
                  className="text-sm text-gray-600 mb-1 block"
                >
                  A (N)
                </Label>
                <Input
                  id="aN"
                  placeholder="Enter A (N)"
                  className="w-full h-10 border-gray-300"
                  value={form.aN}
                  onChange={(e) => handleCDNumberInput("aN", e.target.value)}
                  disabled={formDisabled || isTestEngineer}
                />
                {cdFieldErrors.aN && (
                  <div className="text-red-600 text-sm mt-1">
                    {cdFieldErrors.aN}
                  </div>
                )}
              </div>

              <div>
                <Label
                  htmlFor="bNkmph"
                  className="text-sm text-gray-600 mb-1 block"
                >
                  B (N/kmph)
                </Label>
                <Input
                  id="bNkmph"
                  placeholder="Enter B (N/kmph)"
                  className="w-full h-10 border-gray-300"
                  value={form.bNkmph}
                  onChange={(e) => handleCDNumberInput("bNkmph", e.target.value)}
                  disabled={formDisabled || isTestEngineer}
                />
                {cdFieldErrors.bNkmph && (
                  <div className="text-red-600 text-sm mt-1">
                    {cdFieldErrors.bNkmph}
                  </div>
                )}
              </div>

              <div>
                <Label
                  htmlFor="cNkmph2"
                  className="text-sm text-gray-600 mb-1 block"
                >
                  C (N/kmph^2)
                </Label>
                <Input
                  id="cNkmph2"
                  placeholder="Enter C (N/kmph^2)"
                  className="w-full h-10 border-gray-300"
                  value={form.cNkmph2}
                  onChange={(e) => handleCDNumberInput("cNkmph2", e.target.value)}
                  disabled={formDisabled || isTestEngineer}
                />
                {cdFieldErrors.cNkmph2 && (
                  <div className="text-red-600 text-sm mt-1">
                    {cdFieldErrors.cNkmph2}
                  </div>
                )}
              </div>

              <div>
                <Label
                  htmlFor="f0N"
                  className="text-sm text-gray-600 mb-1 block"
                >
                  F0 (N)
                </Label>
                <Input
                  id="f0N"
                  placeholder="Enter F0 (N)"
                  className="w-full h-10 border-gray-300"
                  value={form.f0N}
                  onChange={(e) => handleCDNumberInput("f0N", e.target.value)}
                  disabled={formDisabled || isTestEngineer}
                />
                {cdFieldErrors.f0N && (
                  <div className="text-red-600 text-sm mt-1">
                    {cdFieldErrors.f0N}
                  </div>
                )}
              </div>

              <div>
                <Label
                  htmlFor="f1Nkmph"
                  className="text-sm text-gray-600 mb-1 block"
                >
                  F1 (N/kmph)
                </Label>
                <Input
                  id="f1Nkmph"
                  placeholder="Enter F1 (N/kmph)"
                  className="w-full h-10 border-gray-300"
                  value={form.f1Nkmph}
                  onChange={(e) => handleCDNumberInput("f1Nkmph", e.target.value)}
                  disabled={formDisabled || isTestEngineer}
                />
                {cdFieldErrors.f1Nkmph && (
                  <div className="text-red-600 text-sm mt-1">
                    {cdFieldErrors.f1Nkmph}
                  </div>
                )}
              </div>

              <div>
                <Label
                  htmlFor="f2Nkmph2"
                  className="text-sm text-gray-600 mb-1 block"
                >
                  F2 (N/kmph^2)
                </Label>
                <Input
                  id="f2Nkmph2"
                  placeholder="Enter F2 (N/kmph^2)"
                  className="w-full h-10 border-gray-300"
                  value={form.f2Nkmph2}
                  onChange={(e) => handleCDNumberInput("f2Nkmph2", e.target.value)}
                  disabled={formDisabled || isTestEngineer}
                />
                {cdError && (
                  <div className="text-red-600 text-sm mt-1">{cdError}</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
              onClick={handleCreateJobOrder}
              disabled={isTestEngineer}
            >
              {location.state?.isEdit ? "UPDATE JOB ORDER" : "CREATE JOB ORDER"}
            </Button>
            {location.state?.isEdit && existingCoastDownId && (
              <Button
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
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
            )}
            <Button
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
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
            </Button>
          </div>
        </div> */}

        {/* Test Actions */}
        <div className="flex items-center mt-4 gap-6 px-8 mb-8">
          <Button
            variant="ghost"
            className="text-xs text-blue-700 px-0"
            onClick={handleAddTest}
            disabled={isTestEngineer || isAdmin}
          >
            + ADD TEST
          </Button>
          <Button
            variant="ghost"
            className="text-xs text-blue-700 px-0"
            onClick={() => {
              setShowCFTPanel((prev) => !prev);
            }}
            disabled={isTestEngineer || isAdmin}
          >
            {showCFTPanel ? "− CFT MEMBERS" : "+ CFT MEMBERS"}
          </Button>
          <div className="flex-1"></div>
        </div>
        {showCFTPanel && !isTestEngineer && (
          <div className="mt-4 mx-8 mb-8 bg-white border rounded-lg">
            <CFTMembers
              jobOrderId={null} // Pass job_order_id if available after creation
              members={cftMembers}
              setMembers={setCftMembers}
              disabled={formDisabled}
            />
          </div>
        )}

        {/* Test Forms */}
        {tests.map((test, idx) => (
          <div
            key={idx}
            className="mx-8 mb-4 border rounded shadow-lg shadow-gray-300/40 px-6 py-4 bg-white transition-all duration-200 hover:shadow-xl hover:shadow-gray-400/40 hover:-translate-y-1 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-lg text-gray-800">
                Test {idx + 1}
              </div>
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
            {/* Inputs above attachments */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
              {/* All test fields disabled for TestEngineer except status actions */}
              <div>
                <Label>Test Type <span className="text-red-500">*</span></Label>
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
                <Label>Vehicle Location <span className="text-red-500">*</span></Label>
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
                <Label>Cycle Gear Shift <span className="text-red-500">*</span></Label>
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
                <Label>Inertia Class <span className="text-red-500">*</span></Label>
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
                <Label>Dataset Name <span className="text-red-500">*</span></Label>
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
                <Label>DPF <span className="text-red-500">*</span></Label>
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
                  <Label>DPF Regen Occurs (g) <span className="text-red-500">*</span></Label>
                  <Input
                    value={test.dpfRegenOccurs || ""}
                    onChange={(e) => handleTestChange(idx, "dpfRegenOccurs", e.target.value)}
                    placeholder="Enter DPF Regen Occurs (g)"
                    disabled={!areTestFieldsEditable(test, idx)}
                  />
                </div>
              )}
              <div>
                <Label>Dataset Refreshed <span className="text-red-500">*</span></Label>
                <div className="flex gap-2 mt-2">
                  <label>
                    <input
                      type="radio"
                      name={`datasetRefreshed${idx}`}
                      value="Yes"
                      checked={test.datasetRefreshed === "Yes"}
                      onChange={() =>
                        handleTestChange(idx, "datasetRefreshed", "Yes")
                      }
                      disabled={!areTestFieldsEditable(test, idx)}
                    />{" "}
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`datasetRefreshed${idx}`}
                      value="No"
                      checked={test.datasetRefreshed === "No"}
                      onChange={() =>
                        handleTestChange(idx, "datasetRefreshed", "No")
                      }
                      disabled={!areTestFieldsEditable(test, idx)}
                    />{" "}
                    No
                  </label>
                </div>
              </div>
              <div>
                <Label>ESS <span className="text-red-500">*</span></Label>
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
                <Label>Mode <span className="text-red-500">*</span></Label>
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
                <Label>Hardware Change <span className="text-red-500">*</span></Label>
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
                <Label>Shift <span className="text-red-500">*</span></Label>
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
                <Label>Fuel Type <span className="text-red-500">*</span></Label>
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
                <Label>Equipment Required <span className="text-red-500">*</span></Label>
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
                <Label>Preferred Date <span className="text-red-500">*</span></Label>
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
                <Label>Emission Check Date <span className="text-red-500">*</span></Label>
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
                <Label>Specific Instruction <span className="text-red-500">*</span></Label>
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
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mt-4 mb-2 shadow-inner">
              <div className="font-semibold text-sm text-gray-700 mb-2">
                Attachments
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Emission Check Attachment</Label>
                  <DropzoneFileList
                    buttonText="Emission Check Attachment"
                    name="Emission_check"
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
                    openModal={!!emissionCheckModals[idx]}
                    handleOpenModal={() =>
                      setEmissionCheckModals((prev) => ({ ...prev, [idx]: true }))
                    }
                    handleCloseModal={() =>
                      setEmissionCheckModals((prev) => ({ ...prev, [idx]: false }))
                    }
                    disabled={false}
                    originalJobOrderId={location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""}
                  />
                </div>
                <div>
                  <Label>Dataset Attachment <span className="text-red-500">*</span></Label>
                  <DropzoneFileList
                    buttonText="Dataset Attachment"
                    name="Dataset_attachment"
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
                    disabled={false}
                    originalJobOrderId={location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""}
                  />
                </div>
                <div>
                  <Label>A2L Attachment</Label>
                  <DropzoneFileList
                    buttonText="A2L Attachment"
                    name="A2L"
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
                    disabled={false}
                    originalJobOrderId={location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""}
                  />
                </div>
                <div>
                  <Label>Experiment Attachment <span className="text-red-500">*</span></Label>
                  <DropzoneFileList
                    buttonText="Experiment Attachment"
                    name="Experiment_attachment"
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
                    disabled={false}
                    originalJobOrderId={location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""}
                  />
                </div>
                <div>
                  <Label>DBC Attachment</Label>
                  <DropzoneFileList
                    buttonText="DBC Attachment"
                    name="DBC_attachment"
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
                    disabled={false}
                    originalJobOrderId={location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""}
                  />
                </div>
                <div>
                  <Label>WLTP Input Sheet</Label>
                  <DropzoneFileList
                    buttonText="WLTP Input Sheet"
                    name="WLTP_input_sheet"
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
                    disabled={false}
                    originalJobOrderId={location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""}
                  />
                </div>
              </div>
            </div>

            {/* Testbed Engineers Attachments Card */}
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mt-4 mb-2 shadow-inner">
              <div className="font-semibold text-sm text-gray-700 mb-2">
                Test Engineers Attachments
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>PDF Reprt</Label>
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
                    disabled={false}
                    originalJobOrderId={location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""}
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
                    disabled={false}
                    originalJobOrderId={location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""}
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
                    disabled={false}
                    originalJobOrderId={location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""}
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
                    disabled={false}
                    originalJobOrderId={location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""}
                  />
                </div>
              </div>
            </div>

            {/* Coast Down Data Section for Test */}
            <div className="mt-6 border rounded shadow-lg shadow-gray-300/40 px-4 py-3 bg-blue-50 transition-all duration-200 hover:shadow-xl hover:shadow-gray-400/40 hover:-translate-y-1 cursor-pointer">
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
                  disabled={formDisabled || isTestEngineer}
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
                    />
                  </div>

                  <div className="mb-2 font-semibold text-xs">CD Valuessss</div>
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
                      />
                    </div>
                  </div>


                </div>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <Button
                className="bg-red-600 text-white text-xs px-6 py-2 rounded"
                onClick={() => handleCreateTestOrder(idx)}
                disabled={editingTestOrderIdx === idx || isTestEngineer || isAdmin || !isTestValid(test)}
              >
                CREATE TEST ORDER
              </Button>
              {editingTestOrderIdx === idx && (
                <Button
                  className="bg-blue-600 text-white text-xs px-6 py-2 rounded ml-2"
                  onClick={() => handleUpdateTestOrder(idx)}
                  disabled={isTestEngineer || isAdmin}
                >
                  UPDATE TEST ORDER
                </Button>
              )}
              {test.testOrderId && (
                <div className="flex items-center gap-2 ml-4">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Start</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Finish</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Close</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Show all test orders in a table */}
        <div className="mx-8 my-8 bg-white border border-gray-200 rounded-lg shadow-lg shadow-gray-300/40 p-6 transition-all duration-200 hover:shadow-xl hover:shadow-gray-400/40 hover:-translate-y-1 cursor-pointer">
          <div className="font-semibold mb-4 text-lg text-gray-800">All Test Orders</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-2 py-1">Test Order ID</th>
                  <th className="border px-2 py-1">Test Type</th>
                  <th className="border px-2 py-1">Objective</th>
                  <th className="border px-2 py-1">Status</th>
                  <th className="border px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(allTestOrders[location.state?.originalJobOrderId] || []).map(
                  (to) => (
                    <tr key={to.test_order_id}>
                      <td className="border px-2 py-1">{to.test_order_id}</td>
                      <td className="border px-2 py-1">{to.test_type}</td>
                      <td className="border px-2 py-1">{to.test_objective}</td>
                      <td className="border px-2 py-1">{to.status}</td>
                      <td className="border px-2 py-1">
                        <Button
                          className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
                          onClick={() => handleEditTestOrder(to, 0)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  )
                )}
                {(allTestOrders[location.state?.originalJobOrderId] || [])
                  .length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-2 text-gray-500">
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
      <RemarkModal
        open={!!remarkModalOpen}
        onClose={() => { setRemarkModalOpen(false); setRemarkInput(""); }}
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
