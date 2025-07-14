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
const apiURL = import.meta.env.VITE_BACKEND_URL

const departments = ["VTC_JO Chennai", "RDE JO", "VTC_JO Nashik"];

export default function CreateJobOrder() {
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
  });

  const [vehicleFormData, setVehicleFormData] = useState(null);
  const [engineFormData, setEngineFormData] = useState(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(true);
  const [showEngineDetails, setShowEngineDetails] = useState(true);

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

  // State for fuel types from API
  const [fuelTypes, setFuelTypes] = useState([]);

  // Handler to add a new test
  const handleAddTest = () => {
    setTests((prev) => [
      ...prev,
      {
        testType: "",
        objective: "",
        vehicleLocation: "",
        cycleGearShift: "",
        datasetName: "",
        inertiaClass: "",
        dpf: "",
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
        specificInstruction: "",
        uploadDocuments: null,
        testOrderId: null, // Track created test order ID
        job_order_id: null, // Track job order ID for this test
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

  // New: State for fetched vehicles and engines
  const [vehicleList, setVehicleList] = useState([]);
  const [engineList, setEngineList] = useState([]);
  // New: State for vehicle body numbers
  const [vehicleBodyNumbers, setVehicleBodyNumbers] = useState([]);
  // New: State for engine numbers from API
  const [engineNumbers, setEngineNumbers] = useState([]);

  // Fetch vehicle and engine lists from API on mount
  useEffect(() => {
    // Replace with your actual API endpoints
    fetch("/api/vehicles")
      .then((res) => res.json())
      .then((data) => setVehicleList(data || []));
    fetch("/api/engines")
      .then((res) => res.json())
      .then((data) => setEngineList(data || []));
    // Fetch vehicle body numbers (now returns both body number and vehicle_serial_number)
    (async () => {
      try {
        const res = await axios.get(`${apiURL}/vehicle-body-numbers`);
        setVehicleBodyNumbers(res.data || []);
      } catch (err) {
        setVehicleBodyNumbers([]);
      }
    })();
    // Fetch engine numbers from FastAPI endpoint
    (async () => {
      try {
        const res = await axios.get(`${apiURL}/engine-numbers`);
        setEngineNumbers(res.data || []);
      } catch (err) {
        setEngineNumbers([]);
      }
    })();
  }, []);

  // Accordion state for vehicle details
  const [vehicleAccordionOpen, setVehicleAccordionOpen] = useState(false);

  // Editable vehicle form state
  const [vehicleEditable, setVehicleEditable] = useState(null);
  const [vehicleEditMode, setVehicleEditMode] = useState(false); // New state for vehicle edit mode

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
          console.log("Could not fetch vehicle details:", error);
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
  const [engineEditMode, setEngineEditMode] = useState(false); // New state for engine edit mode

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
          console.log("Could not fetch engine details:", error);
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

  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, userId, userName } = useAuth();

  // Prefill form if jobOrder is passed via navigation state
  useEffect(() => {
    // Only run once when component mounts and we have job order data
    if (location.state?.jobOrder && !hasPreFilledRef.current) {
      const jobOrder = location.state.jobOrder;
      console.log("Pre-filling form with job order data:", jobOrder);

      // Mark that we've started pre-filling to prevent multiple executions
      hasPreFilledRef.current = true;

      // Set pre-filling state to prevent other useEffects from interfering
      setIsPreFilling(true);
      setIsLoading(true);

      // Show success message if this is for creating test orders
      if (location.state.isEdit) {
        console.log(
          "Loading job order for creating test orders based on:",
          location.state.originalJobOrderId
        );
      }

      // Function to fetch and pre-fill coast down data
      const fetchAndFillCoastDownData = async (coastDownDataId) => {
        if (coastDownDataId) {
          try {
            const response = await axios.get(
              `${apiURL}/coastdown/${coastDownDataId}`
            );
            const coastDownData = response.data;
            console.log("Fetched coast down data:", coastDownData);

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
          vehicleSerialNumber:jobOrder.vehicle_serial_number || "",
          transmissionType:
            jobOrder.transmission_type || jobOrder.transmissionType || "",
          finalDriveAxleRatio:
            jobOrder.final_drive_axle_ratio ||
            jobOrder.finalDriveAxleRatio ||
            "",
          engineSerialNumber:jobOrder.engine_serial_number || "",
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

        console.log("Setting form data to:", newFormData);
        setForm(newFormData);

        // Prefill vehicleEditable and engineEditable if present
        if (jobOrder.vehicleDetails)
          setVehicleEditable(jobOrder.vehicleDetails);
        if (jobOrder.engineDetails) setEngineEditable(jobOrder.engineDetails);

        // Use setTimeout to allow form state to settle before enabling other useEffects
        setTimeout(() => {
          console.log("Pre-filling completed, enabling other useEffects");
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

      alert("Job Order Created! ID: " + jobOrderRes.data.job_order_id);
      // Optionally, reset form or navigate
    } catch (err) {
      console.error("Error creating job order:", err);
      alert(
        "Failed to create job order: " +
          (err.response?.data?.detail || err.message)
      );
    }
  };

  // Handler for creating test order
  const handleCreateTestOrder = async (testIndex) => {
    const test = tests[testIndex];

    // Validate required fields
    if (!test.objective) {
      alert(
        "Please fill in the objective of the test before creating test order."
      );
      return;
    }

    // Generate test_order_id based on timestamp
    const test_order_id = "TO" + Date.now();

    // Get job_order_id from location state or create a new one if not available
    // Ensure job_order_id is a string (not null)
    const job_order_id = location.state?.jobOrder?.job_order_id || location.state?.originalJobOrderId || "";

    // Create or update coast down data for this specific test
    let CoastDownData_id =
      location.state?.jobOrder?.CoastDownData_id || existingCoastDownId || "";

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
        id_of_creator: userId || "",
        created_on: formattedISTTime, // Send created_on in ISO 8601 format
        id_of_updater: "",
        // updated_on: null, // Do not send updated_on during creation
      };

      try {
        await axios.post(`${apiURL}/coastdown`, testCoastDownPayload);
        console.log("Test-specific coast down data created:", CoastDownData_id);
      } catch (err) {
        console.error("Error creating test-specific coast down data:", err);
        alert(
          "Failed to create coast down data for test: " +
            (err.response?.data?.detail || err.message)
        );
        return;
      }
    }

    // Create test order payload matching the API schema
    const testOrderPayload = {
      test_order_id,
      job_order_id: job_order_id || "",
      CoastDownData_id: CoastDownData_id || "",
      test_type: test.testType || "",
      test_objective: test.objective || "",
      vehicle_location: test.vehicleLocation || "",
      cycle_gear_shift: test.cycleGearShift || "",
      inertia_class: test.inertiaClass || "",
      dataset_name: test.datasetName || "",
      dpf: test.dpf || "",
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
      specific_instruction: test.specificInstruction || "",
      status: "Created",
      id_of_creator: userId || "",
      name_of_creator: userName || "",
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

      alert(
        "Test Order Created! ID: " +
          response.data.test_order_id +
          (hasTestSpecificCoastDownData
            ? "\nCoast Down Data ID: " + CoastDownData_id
            : "")
      );
      navigate("/vtc-chennai");
    } catch (err) {
      console.error("Error creating test order:", err);
      alert(
        "Failed to create test order: " +
          (err.response?.data?.detail || err.message)
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
      console.log("Coast down data updated successfully");
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
    console.log("Form state updated:", form);
    console.log("Pre-filling state:", isPreFilling);
    console.log("Loading state:", isLoading);
    console.log("Has pre-filled:", hasPreFilledRef.current);

    // Check if form is being reset unexpectedly
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
      console.log("Fetched all test orders:", grouped);
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
        testType: testOrder.test_type || "",
        objective: testOrder.test_objective || "",
        vehicleLocation: testOrder.vehicle_location || "",
        cycleGearShift: testOrder.cycle_gear_shift || "",
        datasetName: testOrder.dataset_name || "",
        inertiaClass: testOrder.inertia_class || "",
        dpf: testOrder.dpf || "",
        datasetflashed:
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
        fuelType: testOrder.fuel_type || "",
        preferredDate: testOrder.preferred_date || "",
        emissionCheckDate: testOrder.emission_check_date || "",
        emissionCheckAttachment: testOrder.emission_check_attachment || "",
        specificInstruction: testOrder.specific_instruction || "",
        testOrderId: testOrder.test_order_id,
        status: testOrder.status || "Created", // Use current status if present
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
      alert("No test order selected for update.");
      return;
    }
    // Prepare payload matching API schema
    const testOrderPayload = {
      test_order_id: test.testOrderId,
      job_order_id: location.state?.jobOrder?.job_order_id || null,
      CoastDownData_id:
        location.state?.jobOrder?.CoastDownData_id || existingCoastDownId,
      test_type: test.testType || "",
      test_objective: test.objective || "",
      vehicle_location: test.vehicleLocation || "",
      cycle_gear_shift: test.cycleGearShift || "",
      inertia_class: test.inertiaClass || "",
      dataset_name: test.datasetName || "",
      dpf: test.dpf || "",
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
      specific_instruction: test.specificInstruction || "",
      status: test.status || "Created", // <-- Use current status if present
      id_of_creator: "",
      name_of_creator: "",
      created_on: new Date().toISOString(),
      id_of_updater: "",
      name_of_updater: "",
      updated_on: new Date().toISOString(),
    };
    try {
      await updateTestOrder(test.testOrderId, testOrderPayload);
      alert("Test Order updated successfully!");
      fetchAllTestOrders();
      setEditingTestOrderIdx(null);
    } catch (err) {
      alert(
        "Failed to update test order: " +
          (err.response?.data?.detail || err.message)
      );
    }
  };

  // Add state for remark modal
  // Add these two lines to define the modal state for each test row
  const [emissionCheckModals, setEmissionCheckModals] = useState({});
  const [datasetModals, setDatasetModals] = useState({});
  const [a2lModals, setA2LModals] = useState({});
  const [experimentModals, setExperimentModals] = useState({});
  const [dbcModals, setDBCModals] = useState({});
  const [wltpModals, setWLTPModals] = useState({});

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
    } catch (err) {
      alert("Failed to submit re-edit remarks: " + err.message);
    }
  };

  // Add handler to submit rejection remarks
  const handleSubmitRejectionRemarks = async (idx) => {
    const testOrderId = tests[idx]?.testOrderId;
    try {
      await handleStatusUpdate("Rejected", rejectionRemarks[idx], testOrderId, idx);
      setRejectionModalOpen(false);
    } catch (err) {
      alert("Failed to submit rejection remarks: " + err.message);
    }
  };

  // Add handler to submit mail remarks
  const handleSubmitMailRemarks = async (idx) => {
    const testOrderId = tests[idx]?.testOrderId;
    try {
      await updateTestOrder(testOrderId, { ...tests[idx], mailRemarks });
      setMailRemarksModalOpen(false);
      alert("Test order updated successfully!");
    } catch (err) {
      alert("Failed to submit mail remarks: " + err.message);
    }
  };

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
      alert("Failed to update status: " + (err.response?.data?.detail || err.message));
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
            <Label htmlFor="projectCode">
              Project <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.projectCode}
              onValueChange={(value) => handleChange("projectCode", value)}
              required
              disabled={formDisabled}
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
            <Label htmlFor="vehicleBodyNumber">
              Vehicle Body No. <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.vehicleBodyNumber}
              onValueChange={handleVehicleBodyChange}
              required
              disabled={formDisabled}
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
            <Label htmlFor="vehicleSerialNumber">
              Vehicle Serial Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vehicleSerialNumber"
              value={form.vehicleSerialNumber}
              readOnly
              className="w-full"
              placeholder="Auto-fetched"
              required
              disabled={!formDisabled}
            />
          </div>
          {/* Engine Number (dropdown) */}
                <div className="flex flex-col">
                <Label htmlFor="engineSerialNumber">
                  Engine Serial Number <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.engineSerialNumber}
                  onValueChange={handleEngineNumberChange}
                  required
                  // Disable if a test order exists for this job order
                  disabled={
                  formDisabled ||
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
            <Label htmlFor="engineType">
              Type of Engine <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.engineType}
              onValueChange={(value) => handleChange("engineType", value)}
              required
              disabled={formDisabled}
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
            <Label htmlFor="domain">
              Domain <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.domain}
              onValueChange={(value) => handleChange("domain", value)}
              required
              disabled={formDisabled}
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
            <Label htmlFor="department">
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

        {/* Editable Vehicle Details Accordion */}
        {vehicleEditable && (
          <div className="mx-8 mt-2 mb-4 border rounded shadow">
            <div
              className="flex items-center justify-between bg-gray-100 border-t-4 border-red-600 px-4 py-2 cursor-pointer"
              onClick={() => setVehicleAccordionOpen((prev) => !prev)}
            >
              <span className="font-semibold text-sm">
                Vehicle Details
              </span>
              <span>{vehicleAccordionOpen ? "▲" : "▼"}</span>
              {/* <div className="flex items-center gap-2">
                {!vehicleEditMode ? (
                  <Button
                    className="bg-blue-600 text-white text-xs px-3 py-1 rounded"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVehicleEditMode(true);
                    }}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    className="bg-green-600 text-white text-xs px-3 py-1 rounded"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVehicleEditMode(false);
                      // Optionally, send updated vehicleEditable to backend here
                    }}
                  >
                    Save
                  </Button>
                )}
                <span>{vehicleAccordionOpen ? "▲" : "▼"}</span>
              </div> */}
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
                        disabled={!vehicleEditMode}
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
              className="flex items-center justify-between bg-gray-100 border-t-4 border-blue-600 px-4 py-2 cursor-pointer"
              onClick={() => setEngineAccordionOpen((prev) => !prev)}
            >
              <span className="font-semibold text-sm">
                Engine Details
              </span>
              <span>{engineAccordionOpen ? "▲" : "▼"}</span>
              {/* <div className="flex items-center gap-2">
                {!engineEditMode ? (
                  <Button
                    className="bg-blue-600 text-white text-xs px-3 py-1 rounded"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEngineEditMode(true);
                    }}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    className="bg-green-600 text-white text-xs px-3 py-1 rounded"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEngineEditMode(false);
                      // Optionally, send updated engineEditable to backend here
                    }}
                  >
                    Save
                  </Button>
                )}
                <span>{engineAccordionOpen ? "▲" : "▼"}</span>
              </div> */}
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
                        disabled={!engineEditMode}
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
              <Label htmlFor="cdReportRef">
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
            onChange={(e) =>
              setForm((prev) => ({ ...prev, cdReportRef: e.target.value }))
            }
            disabled={formDisabled}
          />
          <div className="mb-2 font-semibold text-xs mt-4">CD Values</div>
          <div className="grid grid-cols-7 gap-4">
            <div>
              <Label htmlFor="vehicleRefMass" className="text-xs">
                Vehicle Reference mass (Kg)
              </Label>
              <Input
                id="vehicleRefMass"
                placeholder="Enter Vehicle Reference mass (Kg)"
                className="mt-1"
                value={form.vehicleRefMass}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    vehicleRefMass: e.target.value,
                  }))
                }
                disabled={formDisabled}
              />
            </div>
            <div>
              <Label htmlFor="aN" className="text-xs">
                A (N)
              </Label>
              <Input
                id="aN"
                placeholder="Enter A (N)"
                className="mt-1"
                value={form.aN}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, aN: e.target.value }))
                }
                disabled={formDisabled}
              />
            </div>
            <div>
              <Label htmlFor="bNkmph" className="text-xs">
                B (N/kmph)
              </Label>
              <Input
                id="bNkmph"
                placeholder="Enter B (N/kmph)"
                className="mt-1"
                value={form.bNkmph}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, bNkmph: e.target.value }))
                }
                disabled={formDisabled}
              />
            </div>
            <div>
              <Label htmlFor="cNkmph2" className="text-xs">
                C (N/kmph^2)
              </Label>
              <Input
                id="cNkmph2"
                placeholder="Enter C (N/kmph^2)"
                className="mt-1"
                value={form.cNkmph2}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, cNkmph2: e.target.value }))
                }
                disabled={formDisabled}
              />
            </div>
            <div>
              <Label htmlFor="f0N" className="text-xs">
                F0 (N)
              </Label>
              <Input
                id="f0N"
                placeholder="Enter F0 (N)"
                className="mt-1"
                value={form.f0N}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, f0N: e.target.value }))
                }
                disabled={formDisabled}
              />
            </div>
            <div>
              <Label htmlFor="f1Nkmph" className="text-xs">
                F1 (N/kmph)
              </Label>
              <Input
                id="f1Nkmph"
                placeholder="Enter F1 (N/kmph)"
                className="mt-1"
                value={form.f1Nkmph}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, f1Nkmph: e.target.value }))
                }
                disabled={formDisabled}
              />
            </div>
            <div>
              <Label htmlFor="f2Nkmph2" className="text-xs">
                F2 (N/kmph^2)
              </Label>
              <Input
                id="f2Nkmph2"
                placeholder="Enter F2 (N/kmph^2)"
                className="mt-1"
                value={form.f2Nkmph2}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, f2Nkmph2: e.target.value }))
                }
                disabled={formDisabled}
              />
            </div>
          </div>
          <div className="flex items-center mt-4 gap-6">
            <Button
              className="bg-white text-red-900 border border-red-900 text-xs px-6 py-2 rounded"
              onClick={handleCreateJobOrder}
            >
              {location.state?.isEdit ? "UPDATE JOB ORDER" : "CREATE JOB ORDER"}
            </Button>
            {location.state?.isEdit && existingCoastDownId && (
              <Button
                className="bg-blue-600 text-white text-xs px-6 py-2 rounded"
                onClick={async () => {
                  try {
                    await handleUpdateCoastDownData(existingCoastDownId);
                    alert("Coast Down Data updated successfully!");
                  } catch (err) {
                    alert(
                      "Failed to update coast down data: " +
                        (err.response?.data?.detail || err.message)
                    );
                  }
                }}
              >
                UPDATE COAST DOWN DATA
              </Button>
            )}
            <Button
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
            </Button>
          </div>
        </div>

        {/* Test Actions */}
        <div className="flex items-center mt-4 gap-6 px-8">
          <Button
            variant="ghost"
            className="text-xs text-blue-700 px-0"
            onClick={handleAddTest}
          >
            + ADD TEST
          </Button>
          <Button variant="ghost" className="text-xs text-blue-700 px-0">
            + CFT MEMBERS
          </Button>
          <div className="flex-1"></div>
        </div>

        {/* Test Forms */}
        {tests.map((test, idx) => (
          <div
            key={idx}
            className="mx-8 mb-8 border rounded-lg shadow-lg px-8 py-6 bg-white"
            style={{ borderColor: "#e5e7eb", background: "#f9fafb" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-base text-blue-900">Test {idx + 1}</span>
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
                {userRole === "TestEngineer" && (!test?.status || test?.status === "Created") && (
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
                {userRole === "Project Team" && test?.status === "Started" && (
                  <Button
                    className="bg-blue-600 text-white text-xs px-3 py-1 rounded"
                    type="button"
                    onClick={async () => {
                      await handleStatusUpdate("Re-edit", "", test.testOrderId, idx);
                    }}
                  >
                    Re-edit
                  </Button>
                )}
                {/* Buttons for TestEngineer */}
                {userRole === "TestEngineer" && (test?.status === "Started" || test?.status === "Rejected" || test?.status === "Re-edit") && (
                  <>
                    <Button
                      className="bg-blue-600 text-white text-xs px-3 py-1 rounded"
                      type="button"
                      onClick={async () => {
                        await handleStatusUpdate("Re-edit", "", test.testOrderId, idx);
                      }}
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
                {/* Close button always available */}
                <button
                  type="button"
                  onClick={() => handleDeleteTest(idx)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 hover:bg-red-200 transition-colors border border-gray-300 text-gray-600 hover:text-red-600 focus:outline-none"
                  title="Close"
                  style={{ minWidth: 0, padding: 0 }}
                >
                  <CloseIcon fontSize="small" />
                </button>
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
            {/* Inputs above attachments */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
              <div>
                <Label>Test Type</Label>
                <Select
                  value={test.testType}
                  onValueChange={(v) => handleTestChange(idx, "testType", v)}
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
                />
              </div>
              <div>
                <Label>Inertia Class</Label>
                <Select
                  value={test.inertiaClass}
                  onValueChange={(v) =>
                    handleTestChange(idx, "inertiaClass", v)
                  }
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
                />
              </div>
              <div>
                <Label>Shift</Label>
                <Select
                  value={test.shift}
                  onValueChange={(v) => handleTestChange(idx, "shift", v)}
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
                <Label>Fuel Type</Label>
                <Select
                  value={test.fuelType}
                  onValueChange={(v) => handleTestChange(idx, "fuelType", v)}
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
                  className="w-full border rounded p-2 min-h-[60px] max-h-[120px] resize-vertical"
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
                    setSubmitted={() => {}}
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
                  <Label>Dataset Attachment</Label>
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
                    setSubmitted={() => {}}
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
                    setSubmitted={() => {}}
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
                  <Label>Experiment Attachment</Label>
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
                    setSubmitted={() => {}}
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
                    setSubmitted={() => {}}
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
                    setSubmitted={() => {}}
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
                  <div className="flex justify-end mt-3">
                    <Button
                      type="button"
                      className="bg-blue-600 text-white text-xs px-4 py-1 rounded"
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
                className="bg-red-600 text-white text-xs px-6 py-2 rounded"
                onClick={() => handleCreateTestOrder(idx)}
              >
                ✓ CREATE TEST ORDER
              </Button>
              {editingTestOrderIdx === idx && (
                <Button
                  className="bg-blue-600 text-white text-xs px-6 py-2 rounded ml-2"
                  onClick={() => handleOpenMailRemarksModal()}
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
        ))}

        {/* Show all test orders in a table */}
        <div className="mx-8 my-8">
          <div className="font-semibold mb-2">All Test Orders</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border">
              <thead>
                <tr className="bg-gray-200">
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
                {(allTestOrders[location.state?.originalJobOrderId] || []).map((to) => (
                  <tr key={to.test_order_id}>
                    <td className="border px-2 py-1">{to.job_order_id}</td> {/* New data */}
                    <td className="border px-2 py-1">{to.test_order_id}</td>
                    <td className="border px-2 py-1">{to.test_type}</td>
                    <td className="border px-2 py-1">{to.test_objective}</td>
                    <td className="border px-2 py-1">{to.fuel_type}</td>
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