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
import useStore from "@/store/useStore";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import CFTMembers from "@/components/CFTMembers";
import showSnackbar from "@/utils/showSnackbar";
import { GrClone } from "react-icons/gr";
import { MdPeopleAlt } from "react-icons/md";
import { is } from "date-fns/locale";

const apiURL = import.meta.env.VITE_BACKEND_URL

const departments = ["VTC_JO Chennai", "RDE JO", "VTC_JO Nashik", "PDCD_JO Chennai"];

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

  // Add state for tracking missing fields for each test
  const [testMissingFields, setTestMissingFields] = useState({});
  // Modal state to display missing fields when user attempts to create a test
  const [missingFieldsModalOpen, setMissingFieldsModalOpen] = useState(false);
  const [missingFieldsForModal, setMissingFieldsForModal] = useState([]);

  const handleAddTest = () => {
    const existingTestOrdersCount = (allTestOrders[location.state?.originalJobOrderId] || []).length;
    const currentTestsCount = tests.length;
    const nextTestNumber = existingTestOrdersCount + currentTestsCount + 1;

    setTests((prev) => [
      ...prev,
      {
        testNumber: nextTestNumber, // Add test number
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
        emission_check_attachment: "",
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

        // copy all attachments as well
        emission_check_attachment: testOrderData.emission_check_attachment || [],
        dataset_attachment: testOrderData.dataset_attachment || [],
        a2l_attachment: testOrderData.a2l_attachment || [],
        experiment_attachment: testOrderData.experiment_attachment || [],
        dbc_attachment: testOrderData.dbc_attachment || [],
        wltp_attachment: testOrderData.wltp_attachment || [],
        pdf_report: [],
        excel_report: [],
        dat_file_attachment: [],
        others_attachment: [],

        // Reset fields for new test order
        testOrderId: null,
        job_order_id: null,
        status: null,

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

      const job_order_id = location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || "";
      const target_test_order_id = `test0`; 
      console.log("Cloning files from test order:", testOrderId, "to new test order:", target_test_order_id);
      try {
        await axios.post(`${apiURL}/clone-testorder-files`, {
          job_order_id,
          source_test_order_id: testOrderId,
          target_test_order_id,
        });
        showSnackbar(`Files cloned successfully from Test Order: ${testOrderId}`, "success");
      } catch (err) {
        showSnackbar("Failed to clone files: " + (err.response?.data?.detail || err.message), "error");
      }

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
    setTests((prev) => {
      const updated = prev.map((test, i) => (i === idx ? { ...test, [field]: value } : test));
      // Trigger validation for the updated test after state update
      setTimeout(() => {
        validateTestFields(updated[idx], idx);
      }, 0);
      return updated;
    });
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

  // New: State for fetched vehicles by project
    const [projectVehicles, setProjectVehicles] = useState([]);
    // New: State for selected vehicle's engine numbers
    const [vehicleEngineNumbers, setVehicleEngineNumbers] = useState([]);
  
    useEffect(() => {
      // if(!location.state?.jobOrder) {
      // When project code changes, fetch vehicles for that project
      if (form.projectCode) {
        // Validate project code format before using in URL
        if (typeof form.projectCode !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(form.projectCode)) {
          console.error("Invalid project code format:", form.projectCode);
          setProjectVehicles([]);
          return;
        }
        
        axios
          .get(`${apiURL}/vehicles/by-project/${encodeURIComponent(form.projectCode)}`)
          .then((res) => {
            setProjectVehicles(res.data.vehicles || []);
          })
          .catch(() => {
            setProjectVehicles([]);
          });

        // Reset vehicle and engine selections
        // setForm((prev) => ({
        //   ...prev,
        //   vehicleBodyNumber: "",
        //   vehicleSerialNumber: "",
        //   engineNumber: "",
        //   engineType: "",
        // }));

        // setVehicleEngineNumbers([]);
      } else {
        // setProjectVehicles([]);
        // setVehicleEngineNumbers([]);
        // setForm((prev) => ({
        //   ...prev,
        //   vehicleBodyNumber: "",
        //   vehicleSerialNumber: "",
        //   engineNumber: "",
        //   engineType: "",
        // }));
      }
    
      // eslint-disable-next-line
    }, [form.projectCode]);

  // Fetch vehicle details using the new API when body number changes
  const handleVehicleBodyChange = (value) => {
    // Don't interfere if we're currently pre-filling
    // if (isPreFilling){
    //   console.log("exit"); return;
    // }
    // console.log("still")
    const found = projectVehicles.find((v) => v.vehicle_body_number === value);
    setVehicleEngineNumbers(found?.engine_numbers || []);
    console.log("found", found);
    if( !location.state?.jobOrder) {
    setForm((prev) => ({
      ...prev,
      vehicleBodyNumber: value,
      vehicleSerialNumber: found?.vehicle_serial_number || "",
      engineSerialNumber: "",
      engineType: "",
    }));
  }
    // Use the new API endpoint
    if (value) {
      // Validate vehicle body number format before using in URL
      if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(value)) {
        console.error("Invalid vehicle body number format:", value);
        setVehicleEditable(null);
        return;
      }
      
      axios
        .get(`${apiURL}/vehicles/by-body-number/${encodeURIComponent(value)}`)
        .then((res) => {
          // Filter out empty fields before setting to state
          const filteredData = Object.fromEntries(
            Object.entries(res.data || {}).filter(([_, value]) => 
              value !== null && value !== undefined && value !== ""
            )
          );
          setVehicleEditable(filteredData);
        })
        .catch((error) => {
          setVehicleEditable(null);
        });
    }
  };

  // Keep vehicleEditable in sync with API response
  useEffect(() => {
    if (form.vehicleBodyNumber && !isPreFilling && !location.state?.jobOrder) {
      axios
        .get(
          `${apiURL}/vehicles/by-body-number/${encodeURIComponent(
            form.vehicleBodyNumber
          )}`
        )
        .then((res) => {
          // Filter out empty fields before setting to state
          const filteredData = Object.fromEntries(
            Object.entries(res.data || {}).filter(([_, value]) => 
              value !== null && value !== undefined && value !== ""
            )
          );
          setVehicleEditable(filteredData);
        })
        .catch(() => setVehicleEditable(null));

    } else if (!form.vehicleBodyNumber && !isPreFilling && !location.state?.jobOrder) {
      setVehicleEditable(null);
                  console.log("satyanash")

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
    if (isPreFilling && location.state?.jobOrder) {
      console.log("exit");
      return;
    }
    console.log("handleEngineNumberChange with value:", value);
    setForm((prev) => ({
      ...prev,
      engineSerialNumber: value,
    }));
    // Use the new API endpoint
    if (value) {
      // Validate engine serial number format before using in URL
      if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(value)) {
        console.error("Invalid engine serial number format:", value);
        setEngineEditable(null);
        return;
      }
      
      axios
        .get(`${apiURL}/engines/by-engine-number/${encodeURIComponent(value)}`)
        .then((res) => {
          // Filter out empty fields before setting to state
          const filteredData = Object.fromEntries(
            Object.entries(res.data || {}).filter(([_, value]) => 
              value !== null && value !== undefined && value !== ""
            )
          );
          setEngineEditable(filteredData);
          setForm((prev) => ({
            ...prev,
            engineType: filteredData?.engineType || prev.engineType,
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

  // Prefill form if jobOrder is passed via navigation state
  // In the useEffect that handles pre-filling (around line 490-600), update this part:

  useEffect(() => {
    // Only run once when component mounts and we have job order data
    // Initialize jobOrderId if opening an existing job order
    if (location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id) {
      setJobOrderId(location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id);
    }

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
            axios.get(`${apiURL}/vehicle-body-numbers`),
            axios.get(`${apiURL}/engine-numbers`)
          ]);

          setVehicleBodyNumbers(vehicleBodyRes.data || []);
          setEngineNumbers(engineNumberRes.data || []);
          
          // Fetch engine numbers associated with the vehicle body number
          if (jobOrder.vehicle_body_number) {
            // Validate vehicle body number from job order before using in URL
            if (typeof jobOrder.vehicle_body_number !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(jobOrder.vehicle_body_number)) {
              console.error("Invalid job order vehicle body number format:", jobOrder.vehicle_body_number);
            } else {
              try {
                console.log("Fetching engine numbers for vehicle body:", jobOrder.vehicle_body_number);
                const vehicleEngineRes = await axios.get(`${apiURL}/vehicles/by-body-number/${encodeURIComponent(jobOrder.vehicle_body_number)}`);
                
                console.log("Vehicle engine response:", vehicleEngineRes.data);
                
                if (vehicleEngineRes.data && vehicleEngineRes.data.engine_numbers) {
                  setVehicleEngineNumbers(vehicleEngineRes.data.engine_numbers);
                }
                
                // If the job order's engine serial number is not in the list, add it
                if (jobOrder.engine_serial_number) {
                  console.log("Job order engine serial number:", jobOrder.engine_serial_number);
                  
                  if (vehicleEngineRes.data && 
                      (!vehicleEngineRes.data.engine_numbers || 
                      !vehicleEngineRes.data.engine_numbers.includes(jobOrder.engine_serial_number))) {
                    console.log("Adding job order engine serial number to vehicleEngineNumbers");
                    setVehicleEngineNumbers(prev => {
                      const updatedList = [...prev, jobOrder.engine_serial_number];
                      console.log("Updated vehicleEngineNumbers:", updatedList);
                      return updatedList;
                    });
                  }
                }
              } catch (error) {
                console.error("Error fetching vehicle engine numbers:", error);
                // If we can't get the vehicle's engine numbers, at least include the job order's engine number
                if (jobOrder.engine_serial_number) {
                  setVehicleEngineNumbers([jobOrder.engine_serial_number]);
                }
              }
            }
          }
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
        
        // Debug logging for requested payload functionality
        console.log("Job Order Data - Vehicle Test Payload Criteria:", jobOrder.vehicle_test_payload_criteria);
        console.log("Job Order Data - Requested Payload:", jobOrder.requested_payload);
        console.log("Form Data - Vehicle Test Payload Criteria:", newFormData.vehicleTestPayloadCriteria);
        console.log("Form Data - Requested Payload Kg:", newFormData.requestedPayloadKg);
        
        setForm(newFormData);
        // Prefill vehicleEditable and engineEditable if present
        if (jobOrder.vehicleDetails)
          setVehicleEditable(jobOrder.vehicleDetails);
        else if (jobOrder.vehicle_body_number) {
          // Validate vehicle body number from job order before using in URL
          if (typeof jobOrder.vehicle_body_number !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(jobOrder.vehicle_body_number)) {
            console.error("Invalid job order vehicle body number format:", jobOrder.vehicle_body_number);
            setVehicleEditable(null);
          } else {
            // Fetch vehicle details if not present
            try {
              const res = await axios.get(`${apiURL}/vehicles/by-body-number/${encodeURIComponent(jobOrder.vehicle_body_number)}`);
              setVehicleEditable(res.data);
            } catch (e) {
              setVehicleEditable(null);
            }
          }
        }

        if (jobOrder.engineDetails)
          setEngineEditable(jobOrder.engineDetails);
        else if (jobOrder.engine_serial_number) {
          // Validate engine serial number from job order before using in URL
          if (typeof jobOrder.engine_serial_number !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(jobOrder.engine_serial_number)) {
            console.error("Invalid job order engine serial number format:", jobOrder.engine_serial_number);
            setEngineEditable(null);
          } else {
            // Fetch engine details if not present
            try {
              const res = await axios.get(`${apiURL}/engines/by-engine-number/${encodeURIComponent(jobOrder.engine_serial_number)}`);
              setEngineEditable(res.data);
            } catch (e) {
              setEngineEditable(null);
            }
          }
        }

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

  // Function to check if job order with same vehicle body number, engine serial number and domain exists
  const checkForDuplicateJobOrder = async (vehicleBodyNumber, engineSerialNumber, domain) => {
    try {
      // job order read api call
      const department = form.department || "VTC_JO Chennai"; // Default to Chennai if not set
      const response = await axios.get(`${apiURL}/joborders`, { params: { department, user_id: userId, role: userRole } });
      const jobOrders = response.data;
      
      // Find if there's already a job order with same vehicle body number, engine serial number, and domain
      const duplicate = jobOrders.find(
        (jobOrder) => 
          jobOrder.vehicle_body_number === vehicleBodyNumber && 
          jobOrder.engine_serial_number === engineSerialNumber &&
          jobOrder.domain === domain
      );
      
      return duplicate;
    } catch (error) {
      console.error("Error checking for duplicate job orders:", error);
      return null;
    }
  };
  
  // Function to suggest a new vehicle body number
  const suggestNewVehicleBodyNumber = (currentBodyNumber) => {
    // Check if the current body number ends with 'E' followed by a number
    const match = currentBodyNumber.match(/(.+)E(\d+)$/);
    
    if (match) {
      // If it does, increment the number
      const prefix = match[1];
      const number = parseInt(match[2]) + 1;
      return `${prefix}E${number}`;
    } else {
      // If not, append 'E1' to the current body number
      return `${currentBodyNumber}E1`;
    }
  };


  const checkJobOrderLimit = async () => {
    try {
      const department = form.department || "VTC_JO Chennai";
      const response = await axios.get(`${apiURL}/joborders`, { params: { department, user_id: userId, role: userRole } });
      const userJobOrders = response.data.filter(order => order.id_of_creator === userId);
      
      // If user has less than 5 job orders, they can create more
      if (userJobOrders.length < 5) {
        return { limitReached: false };
      }
      
      // Check if any completed job orders are missing ratings
      const unratedCompletedOrders = [];
      for (const jobOrder of userJobOrders) {
        // Get test orders for this job order
        const testOrdersResponse = await axios.get(`${apiURL}/testorders`, { 
          params: { job_order_id: jobOrder.job_order_id } 
        });
        const testOrders = testOrdersResponse.data || [];
        
        // Find completed test orders without ratings
        const unratedOrders = testOrders.filter(order => 
          order.status === "Completed" && !order.rating
        );
        
        if (unratedOrders.length > 0) {
          unratedCompletedOrders.push(...unratedOrders);
        }
      }
      
      return { 
        limitReached: unratedCompletedOrders.length > 0,
        unratedOrders: unratedCompletedOrders
      };
    } catch (error) {
      console.error("Error checking job order limit:", error);
      return { limitReached: false }; // Default to allowing creation if check fails
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

     // Check if user has reached the limit of 5 job orders without providing ratings
    const { limitReached, unratedOrders } = await checkJobOrderLimit();
    if (limitReached) {
      showSnackbar(
        `You have reached the maximum limit of 5 job orders. Please provide ratings for your completed test orders before creating a new job order. Unrated test order ID(s): ${unratedOrders.map(o => o.test_order_id).join(', ')}`,
        "error"
      );
      return;
    }
    
    // Check for duplicate job orders with the same vehicle body number, engine serial number, and domain
    const duplicate = await checkForDuplicateJobOrder(form.vehicleBodyNumber, form.engineSerialNumber, form.domain);
    
    if (duplicate) {
      const suggestedNumber = suggestNewVehicleBodyNumber(form.vehicleBodyNumber);
      showSnackbar(
        `A job order already exists with the same combination of body number (${form.vehicleBodyNumber}), engine number (${form.engineSerialNumber}), and domain (${form.domain}). `, 
        "error"
      );
      return;
    }

    // Generate job_order_id and CoastDownData_id based on timestamp
    const job_order_id = "JO" + Date.now();
    const CoastDownData_id = "CD" + Date.now();

    // Get current time in IST timezone
    const now = new Date();
    const formattedISTTime = now.toLocaleString("sv-SE", {
      timeZone: "Asia/Kolkata",
    }).replace(" ", "T") + ".000Z";

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
      // await handleSendMail(1, createdJobOrderId, null);

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

  // Validation helper function
  const handleCreateTestOrder = async (testIndex) => {
    const test = tests[testIndex];
    const jobOrderId = location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || "";

    // Check if there are any existing test orders for the same job order
    const existingTestOrders = allTestOrders[jobOrderId] || [];
    const unratedTestOrders = existingTestOrders.filter(
      (order) => order.status !== "Completed" || !order.rating
    );

    // Enforce the 5 unrated Test Order condition
    if (unratedTestOrders.length >= 5) {
      showSnackbar(
        `Cannot create a new test order. Please complete and rate at least one of the existing test orders before creating more.`,
        "error"
      );
      return;
    }

    // Use centralized validator to get missing fields; if any, open modal listing them
    const missing = validateTestFields(test, testIndex);

    if (missing && missing.length > 0) {
      // Populate modal and open
      setMissingFieldsForModal(missing);
      setMissingFieldsModalOpen(true);
      return;
    }
    // const test_order_id = "TO" + Date.now();
    const job_order_id = location.state?.jobOrder?.job_order_id || location.state?.originalJobOrderId || "";
    const test_order_id = `${job_order_id}/${test.testNumber}`;

    const currentISTTime = new Date().toLocaleString("sv-SE", {
      timeZone: "Asia/Kolkata",
    }).replace(" ", "T") + ".000Z";
    const formattedISTTime = currentISTTime;

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

    // Include coast down data from the main job order form if not filled in the test
    const testCoastDownPayload = {
      CoastDownData_id,
      job_order_id,
      coast_down_reference: test.cdReportRef || form.cdReportRef || null,
      vehicle_reference_mass: test.vehicleRefMass || form.vehicleRefMass
        ? parseFloat(test.vehicleRefMass || form.vehicleRefMass)
        : null,
      a_value: test.aN || form.aN ? parseFloat(test.aN || form.aN) : null,
      b_value: test.bNkmph || form.bNkmph
        ? parseFloat(test.bNkmph || form.bNkmph)
        : null,
      c_value: test.cNkmph2 || form.cNkmph2
        ? parseFloat(test.cNkmph2 || form.cNkmph2)
        : null,
      f0_value: test.f0N || form.f0N ? parseFloat(test.f0N || form.f0N) : null,
      f1_value: test.f1Nkmph || form.f1Nkmph
        ? parseFloat(test.f1Nkmph || form.f1Nkmph)
        : null,
      f2_value: test.f2Nkmph2 || form.f2Nkmph2
        ? parseFloat(test.f2Nkmph2 || form.f2Nkmph2)
        : null,
      id_of_creator: userId || "",
      created_on: formattedISTTime,
      id_of_updater: "",
    };

    const testOrderPayload = {
      test_order_id,
      job_order_id: job_order_id || "",
      CoastDownData_id: CoastDownData_id || "",
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
      emission_check_attachment: test.Emission_check || test.emission_check_attachment || [],
      dataset_attachment: test.Dataset_attachment || test.dataset_attachment || [],
      a2l_attachment: test.A2L || test.a2l_attachment || [],
      experiment_attachment: test.Experiment_attachment || test.experiment_attachment || [],
      dbc_attachment: test.DBC_attachment || test.dbc_attachment || [],
      wltp_attachment: test.WLTP_input_sheet || test.wltp_attachment || [],
      pdf_report: test.PDF_report || test.pdf_report || [],
      excel_report: test.Excel_report || test.excel_report || [],
      dat_file_attachment: test.DAT_file_attachment || test.dat_file_attachment || [],
      others_attachement: test.Others_attachment || test.others_attachement || [],
      // Include coast down data in the payload
      coast_down_data: testCoastDownPayload,
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
      const res = await axios.get(`${apiURL}/testorders-single`, {
        params: { test_order_id }
      });
      console.log("Fetched test order:", res.data);
      // If your API returns an array, return the first item; else return as is
      return Array.isArray(res.data) ? res.data[0] : res.data;
    } catch (err) {
      console.error("Failed to fetch test order:", err);
      return null;
    }
  };
   // Fetch single test order endpoint (testorder-single) and open the edit page with fetched data
  const fetchAndOpenTestOrder = async (testOrderId) => {
    try {
      const resp = await fetch(`${apiURL}/testorders-single?test_order_id=${encodeURIComponent(testOrderId)}`);
      if (!resp.ok) throw new Error('Failed to fetch test order');
      console.log("Response from testorders-single:", resp);
      const data = await resp.json();
      navigate('/editTestOrder', {
        state: {
          testOrder: data,
          jobOrderId: location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id,
          returnPath: location.pathname,
          returnState: location.state,
        }
      });
      console.log("Navigated to editTestOrder with data:", data);
    } catch (err) {
      console.error('Error fetching testorder-single:', err);
      showSnackbar('Failed to load test order details', 'error');
    }
  };

  // Update a test order by ID
  const updateTestOrder = async (test_order_id, updatedData) => {
    try {
      const res = await axios.put(
        `${apiURL}/testorders-single/${test_order_id}`,
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
        emission_check_attachment: parseAttachment(testOrder.emission_check_attachment),
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
    const currentISTTime = new Date().toLocaleString("sv-SE", {
      timeZone: "Asia/Kolkata",
    }).replace(" ", "T") + ".000Z";
    const formattedISTTime = currentISTTime;
    // If ProjectTeam is updating a test in Re-edit status, set status to 'Started' (under progress)
    let newStatus = test.status;
    if (isProjectTeam && test.status === "Re-edit") {
      newStatus = "Started";
    }

    // Check if only attachments are updated
    const attachmentFields = [
      "emission_check_attachment",
      "dataset_attachment",
      "a2l_attachment",
      "experiment_attachment",
      "dbc_attachment",
      "wltp_attachment",
      "pdf_report",
      "excel_report",
      "dat_file_attachment",
      "others_attachement",
    ];
    const hasAttachmentChanges = attachmentFields.some((field) => {
      const original = test[field];
      const updated = parseAttachment(test[field]);
      return JSON.stringify(original) !== JSON.stringify(updated);
    });

    // If only attachments are updated, set status to "Created"
    if (hasAttachmentChanges && !remarkInput.trim()) {
      setRemarkModalOpen(true);
      setRemarkType("Update");
      setRemarkInput("");
      return;
    }

    const testOrderPayload = {
      test_order_id: test.testOrderId,
      job_order_id: location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || "",
      CoastDownData_id: test.CoastDownData_id || "",
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
      status: hasAttachmentChanges ? "Created" : newStatus,
      id_of_updater: userId || "",
      name_of_updater: userName || "",
      updated_on: formattedISTTime,
      // Attachment fields
      emission_check_attachment: JSON.stringify(test.emission_check_attachment || []),
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
        console.log("PATCH URL:", `${apiURL}/joborders/${encodeURIComponent(jobOrderId)}`);
        await axios.patch(`${apiURL}/joborders/${encodeURIComponent(jobOrderId)}`, jobOrderUpdatePayload);
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
      const currentISTTime = new Date().toLocaleString("sv-SE", {
        timeZone: "Asia/Kolkata",
      }).replace(" ", "T") + ".000Z";
      const formattedISTTime = currentISTTime;

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
        console.log("PATCH URL:", `${apiURL}/joborders/${encodeURIComponent(jobOrderId)}`);
        await axios.patch(`${apiURL}/joborders/${encodeURIComponent(jobOrderId)}`, jobOrderUpdatePayload);
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
    
    // Special handling for cdReportRef - allow any text
    if (field === "cdReportRef") {
      setCdFieldErrors((prev) => ({ ...prev, [field]: "" }));
      setForm((prev) => ({ ...prev, [field]: value }));
      return;
    }
    
    // Allow only numbers (including decimals) for other fields
    if (/^-?\d*\.?\d*$/.test(value)) {
      setCdFieldErrors((prev) => ({ ...prev, [field]: "" }));
      setForm((prev) => ({ ...prev, [field]: value }));
    } else {
      setCdFieldErrors((prev) => ({ ...prev, [field]: "Please enter valid numbers" }));
    }
  };

  // Validation function for Coast Down Data fields
  const validateCoastDownData = (test) => {
    const requiredFields = [
      { field: 'cdReportRef', label: 'Coast Down Test Report Reference' },
      { field: 'vehicleRefMass', label: 'Vehicle Reference Mass' },
      { field: 'aN', label: 'A (N)' },
      { field: 'bNkmph', label: 'B (N/kmph)' },
      { field: 'cNkmph2', label: 'C (N/kmph^2)' },
      { field: 'f0N', label: 'F0 (N)' },
      { field: 'f1Nkmph', label: 'F1 (N/kmph)' },
      { field: 'f2Nkmph2', label: 'F2 (N/kmph^2)' }
    ];

    const missingFields = [];

    for (const { field, label } of requiredFields) {
      const testValue = test[field];
      const formValue = form[field];
      if (!testValue && !formValue) {
        missingFields.push(label);
      }
    }

    return missingFields;
  };

  // Function to validate test fields and return missing fields
  const validateTestFields = (test, testIndex) => {
    const requiredFields = [
      { key: 'testType', label: 'Test Type' },
      { key: 'objective', label: 'Objective of the Test' },
      { key: 'vehicleLocation', label: 'Vehicle Location' },
      { key: 'cycleGearShift', label: 'Cycle Gear Shift' },
      { key: 'inertiaClass', label: 'Inertia Class' },
      { key: 'datasetName', label: 'Dataset Name' },
      { key: 'mode', label: 'Mode' },
      { key: 'shift', label: 'Shift' },
      { key: 'fuelType', label: 'Fuel Type' },
      { key: 'hardwareChange', label: 'Hardware Change' },
      { key: 'equipmentRequired', label: 'Equipment Required' },
      { key: 'dpf', label: 'DPF' },
      { key: 'ess', label: 'ESS' },
      { key: 'preferredDate', label: 'Preferred Date' },
      { key: 'emissionCheckDate', label: 'Emission Checklist Date' },
      { key: 'specificInstruction', label: 'Specific Instruction' }
    ];

    const missing = [];

    // Check required fields
    requiredFields.forEach(f => {
      const value = test[f.key];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missing.push(f.label);
      }
    });

    // Special-case: dataset flashed
    const datasetFlashedVal = (test.datasetflashed || '').toString().trim();
    if (!datasetFlashedVal) {
      missing.push('Dataset flashed');
    }

    // If DPF is Yes, require DPF Regen Occurs
    const dpfRegenVal = (test.dpfRegenOccurs || '').toString().trim();
    if (test.dpf === 'Yes' && !dpfRegenVal) {
      missing.push('DPF Regen Occurs (g)');
    }

    // Check attachments
    // if department is PDCD_JO Chennai then don't make attachments mandatory
    const hasDataset = Array.isArray(test.Dataset_attachment || test.dataset_attachment) && (test.Dataset_attachment || test.dataset_attachment).length > 0;
    const hasExperiment = Array.isArray(test.Experiment_attachment || test.experiment_attachment) && (test.Experiment_attachment || test.experiment_attachment).length > 0;
    const hasEmissionCheck = Array.isArray(test.emission_check_attachment || test.emissionCheckAttachment) && (test.emission_check_attachment || test.emissionCheckAttachment).length > 0;
    const hasA2L = Array.isArray(test.A2L || test.a2l_attachment) && (test.A2L || test.a2l_attachment).length > 0;

    const dept = form.department || (location.state?.jobOrder?.department) || "";
    if (dept !== "PDCD_JO Chennai") {
      if (!hasDataset) missing.push('Dataset Attachment');
      if (!hasExperiment) missing.push('Experiment Attachment');
      if (!hasEmissionCheck) missing.push('Emission Check Attachment');
      if (!hasA2L) missing.push('A2L Attachment');
    }

    // Validate Coast Down Data if inertia class is Coastdown Loading
    if (test.inertiaClass === "Coastdown Loading") {
      const missingCoastDown = validateCoastDownData(test);
      missing.push(...missingCoastDown);
    }

    // Update the missing fields state
    setTestMissingFields(prev => ({
      ...prev,
      [testIndex]: missing
    }));

    return missing;
  };

  // Helper function for DropzoneFileList setFormData callback
  const handleAttachmentUpdate = (idx) => (updatedTest) => {
    setTests((prev) => {
      const updated = prev.map((t, i) => (i === idx ? { ...t, ...updatedTest } : t));
      // Trigger validation for attachment update
      setTimeout(() => {
        validateTestFields(updated[idx], idx);
      }, 0);
      return updated;
    });
  };

  // Helper function to validate if test is ready for submission
  const isTestValid = (test) => {
    if (!test) return false;

    const requiredKeys = [
      'testType',
      'objective',
      'vehicleLocation',
      'cycleGearShift',
      'inertiaClass',
      'datasetName',
      'mode',
      'shift',
      'fuelType',
      'hardwareChange',
      'equipmentRequired',
      'dpf',
      'ess',
      'preferredDate',
      'emissionCheckDate',
      'specificInstruction'
    ];

    for (const key of requiredKeys) {
      const val = test[key];
      if (val === undefined || val === null) return false;
      if (typeof val === 'string' && val.trim() === '') return false;
    }

    // dataset flashed may be stored as datasetflashed or datasetRefreshed
    const datasetFlashed = (test.datasetflashed || test.datasetRefreshed || '').toString().trim();
    if (!datasetFlashed) return false;

    // If DPF is Yes, require regen value
    if (test.dpf === 'Yes') {
      const regen = test.dpfRegenOccurs;
      if (regen === undefined || regen === null || (typeof regen === 'string' && regen.trim() === '')) return false;
    }

    // Require attachments
    const hasDataset = Array.isArray(test.Dataset_attachment || test.dataset_attachment) && (test.Dataset_attachment || test.dataset_attachment).length > 0;
    const hasExperiment = Array.isArray(test.Experiment_attachment || test.experiment_attachment) && (test.Experiment_attachment || test.experiment_attachment).length > 0;
    const hasEmissionCheck = Array.isArray(test.emission_check_attachment || test.emission_check_attachment) && (test.emission_check_attachment || test.emission_check_attachment).length > 0;
    const hasA2L = Array.isArray(test.A2L || test.a2l_attachment) && (test.A2L || test.a2l_attachment).length > 0;
    if (!hasDataset || !hasExperiment || !hasEmissionCheck || !hasA2L) return false;

    // Validate Coast Down Data if inertia class is "Coastdown Loading"
    if (test.inertiaClass === "Coastdown Loading") {
      const coastDownFields = [
        'cdReportRef',
        'vehicleRefMass',
        'aN',
        'bNkmph',
        'cNkmph2',
        'f0N',
        'f1Nkmph',
        'f2Nkmph2'
      ];

      for (const field of coastDownFields) {

        const testValue = test[field];
        const formValue = form[field];
        const value = testValue || formValue;
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return false;
        }
      }
    }

    return true;
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
  const isAdmin = userRole === "Admin";

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
              className="bg-red-600 text-white px-3 py-1 rounded-full"
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
              disabled={formDisabled || isTestEngineer || isAdmin}
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
              disabled={formDisabled || isTestEngineer || isAdmin || !form.projectCode}
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
          
          {/* Vehicle Serial Number */}
          <div>
            <Label
              htmlFor="vehicleSerialNumber"
              className="text-sm text-gray-600 mb-1 block"
            >
              Vehicle Serial Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vehicleSerialNumber"
              value={form.vehicleSerialNumber}
              readOnly
              className="w-full h-10 border-gray-300 bg-gray-50"
              placeholder="Auto-fetched"
              required
              disabled={formDisabled}
            />
          </div>
          
          {/* Engine Serial Number */}
          <div>
            <Label
              htmlFor="engineNumber"
              className="text-sm text-gray-600 mb-1 block"
            >
              Engine Serial Number <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.engineSerialNumber}
              onValueChange={handleEngineNumberChange}
              required
              disabled={
                formDisabled ||
                isTestEngineer || isAdmin ||
                !!(location.state?.originalJobOrderId &&
                  (allTestOrders[location.state?.originalJobOrderId] || []).length > 0 || !form.vehicleBodyNumber)
              }
            >
              <SelectTrigger className="w-full h-10 border-gray-300">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              {console.log("Vehicle Engine Numbers:", vehicleEngineNumbers)}
              <SelectContent>
                {vehicleEngineNumbers.length > 0 ? (
                  vehicleEngineNumbers.map((engineSerialNumber) => (
                    <SelectItem key={engineSerialNumber} value={engineSerialNumber}>
                      {engineSerialNumber}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-2 text-sm text-gray-500">
                    No engine numbers available
                  </div>
                )}
                {/* Add the current value as an option if not in the list */}
                {form.engineSerialNumber && 
                 !vehicleEngineNumbers.includes(form.engineSerialNumber) && (
                  <SelectItem key={form.engineSerialNumber} value={form.engineSerialNumber}>
                    {form.engineSerialNumber} (Current)
                  </SelectItem>
                )}
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
              disabled={formDisabled || isTestEngineer || isAdmin}
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
              disabled={formDisabled || isTestEngineer || isAdmin}
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
              disabled={true} // Always disabled for Chennai
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

        {/* Extra fields for RDE JO */}
        {form.department === "RDE JO" && (
          <div className="bg-blue-50 border border-gray-200 rounded-lg mx-8 mb-6 p-6 shadow-lg shadow-gray-300/40 transition-all duration-200 hover:shadow-xl hover:shadow-gray-400/40 hover:-translate-y-1 cursor-pointer">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* WBS Code */}
              <div>
                <Label
                  htmlFor="wbsCode"
                  className="text-sm text-gray-600 mb-1 block"
                >
                  WBS Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="wbsCode"
                  value={form.wbsCode}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, wbsCode: e.target.value }))
                  }
                  className="w-full h-10 border-gray-300"
                  required
                  disabled={formDisabled}
                  placeholder="Enter WBS Code"
                />
              </div>
              
              {/* Vehicle GVW */}
              <div>
                <Label
                  htmlFor="vehicleGVW"
                  className="text-sm text-gray-600 mb-1 block"
                >
                  Vehicle GVW (Kg) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="vehicleGVW"
                  value={form.vehicleGVW}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, vehicleGVW: e.target.value }))
                  }
                  className="w-full h-10 border-gray-300"
                  required
                  disabled={formDisabled}
                  placeholder="Enter GVW"
                  type="number"
                  min="0"
                />
              </div>

              {/* Vehicle Kerb Weight */}
              <div>
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
                id="vehicleTestPayloadCriteria"
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
                  <SelectItem value="Manual Entry">Customized Payload</SelectItem>
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
          </div>
        )}

        {/* Editable Vehicle Details Accordion */}
        {vehicleEditable && (
          <div className="mx-8 mt-2 mb-4 border rounded shadow-lg shadow-gray-300/40 transition-all duration-200 hover:shadow-xl hover:shadow-gray-400/40 hover:-translate-y-1 cursor-pointer">
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
                  {Object.entries(vehicleEditable).map(([label, value]) => 
                    // Only render fields with non-empty values
                    value !== null && value !== undefined && value !== "" ? (
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
                          disabled={!vehicleEditMode || isTestEngineer || isAdmin}
                        />
                      </div>
                    ) : null
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* Editable Engine Details Accordion */}
        {engineEditable && (
          <div className="mx-8 mt-2 mb-4 border rounded shadow-lg shadow-gray-300/40 transition-all duration-200 hover:shadow-xl hover:shadow-gray-400/40 hover:-translate-y-1 cursor-pointer">
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
                  {Object.entries(engineEditable).map(([label, value]) => 
                    // Only render fields with non-empty values
                    value !== null && value !== undefined && value !== "" ? (
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
                          disabled={!engineEditMode || isTestEngineer || isAdmin}
                        />
                      </div>
                    ) : null
                  )}
                </div>
              </form>
            )}
          </div>
        )}
        

        {/* Coast Down Data (CD) Section was here */}

        {/* Job Order Buttons */}
        <div className="bg-white-50 border border-gray-200 rounded-lg mx-8 mb-6 p-6 shadow-lg shadow-gray-300/40 transition-all duration-200 hover:shadow-xl hover:shadow-gray-400/40 hover:-translate-y-1 cursor-pointer">
          {cdError && (
            <div className="text-red-600 text-sm mb-4">{cdError}</div>
          )}

          <div className="flex items-center gap-4">
            <Button
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
              onClick={handleCreateJobOrder}
              disabled={isTestEngineer || isAdmin || (location.state?.isEdit && isProjectTeam)}
            >
              {location.state?.isEdit ? "UPDATE JOB ORDER" : "CREATE JOB ORDER"}
            </Button>
            <Button
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
              type="button"
              disabled={location.state?.isEdit && isProjectTeam}
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
        <div className="flex items-center mt-4 gap-6 px-8 mb-8">
          <Button
            variant="ghost"
            className="text-xs text-blue-700 px-0"
            onClick={handleAddTest}
            disabled={
              isTestEngineer || 
              isAdmin || 
              (!location.state?.originalJobOrderId && !location.state?.jobOrder?.job_order_id && !jobOrderId)
            }
          >
            + ADD TEST
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              className="text-xs text-blue-700 px-0"
              onClick={handleCloneTest}
              disabled={isTestEngineer || isAdmin}
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
                      {(() => {
                        const raw = (allTestOrders[location.state?.originalJobOrderId] || []);
                        // attach numeric serial if possible, fallback to index+1
                        const withSerial = raw.map((t, idx) => {
                          const serialStr = t?.test_order_id ? t.test_order_id.split("/").pop() : null;
                          const serialNum = serialStr && !isNaN(Number(serialStr)) ? Number(serialStr) : idx + 1;
                          return { t, serialNum };
                        });
                        // sort ascending by numeric serial
                        const sorted = withSerial.slice().sort((a, b) => a.serialNum - b.serialNum);
                        return sorted.map(({ t, serialNum }, idx) => (
                          <button
                            key={t.test_order_id || idx}
                            onClick={() => {
                              handleCloneSpecificTestOrder(t.test_order_id);
                              setCloneDropdownOpen(false);
                            }}
                            className="w-full text-left px-2 py-2 my-1 hover:bg-gray-400 bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-black text-sm">Test {serialNum}</span>
                            </div>
                          </button>
                        ));
                      })()}
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
              disabled={false}
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
              className="mx-8 mb-8 border rounded-lg shadow-lg shadow-gray-300/40 px-8 py-6 bg-white dark:bg-black transition-all duration-200 hover:shadow-xl hover:shadow-gray-400/40 hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-lg text-gray-800">Test {displayNumber}</span>
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
                  {(isTestEngineer || isAdmin) && (!test?.status || test?.status === "Created" || test?.status === "Rejected") && (
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
                  {isTestEngineer && isAdmin && (test?.status === "Started" || test?.status === "Re-edit") && (
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
                  {isProjectTeam && (
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
                    value={test.remark}
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
                    {test.remark || "No re-edit remarks provided"}
                  </div>
                </div>
              )}
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
                    onValueChange={(v) => {
                      // Update inertia class and handle coast down data in a single state update
                      setTests((prevTests) => {
                        const updatedTests = prevTests.map((test, i) => {
                          if (i === idx) {
                            const updatedTest = { ...test, inertiaClass: v };
                            // Pre-fill coast down data if "Coastdown Loading" is selected
                            if (v === "Coastdown Loading") {
                              updatedTest.cdReportRef = updatedTest.cdReportRef || form.cdReportRef;
                              updatedTest.vehicleRefMass = updatedTest.vehicleRefMass || form.vehicleRefMass;
                              updatedTest.aN = updatedTest.aN || form.aN;
                              updatedTest.bNkmph = updatedTest.bNkmph || form.bNkmph;
                              updatedTest.cNkmph2 = updatedTest.cNkmph2 || form.cNkmph2;
                              updatedTest.f0N = updatedTest.f0N || form.f0N;
                              updatedTest.f1Nkmph = updatedTest.f1Nkmph || form.f1Nkmph;
                              updatedTest.f2Nkmph2 = updatedTest.f2Nkmph2 || form.f2Nkmph2;
                            }
                            return updatedTest;
                          }
                          return test;
                        });
                        return updatedTests;
                      });
                    }}
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
                  <Label>Dataset flashed <span className="text-red-500">*</span></Label>
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
                    min={new Date().toISOString().split('T')[0]} // Block previous dates
                          />
                        </div>
                        <div>
                          <Label>Emission Checklist Date <span className="text-red-500">*</span></Label>
                          <Input
                          type="date"
                          value={test.emissionCheckDate}
                          onChange={(e) =>
                            handleTestChange(idx, "emissionCheckDate", e.target.value)
                          }
                          disabled={!areTestFieldsEditable(test, idx)}
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

                        {/* Coast Down Data Section for Test */}
                      {test.inertiaClass === "Coastdown Loading" && (
                      <div className="mt-6 border rounded shadow-lg shadow-gray-300/40 px-4 py-3 bg-blue-50 dark:bg-inherit transition-all duration-200 hover:shadow-xl hover:shadow-gray-400/40 hover:-translate-y-1 cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                        <span className="font-semibold text-sm text-blue-700">
                          Coast Down Data (CD) - Required for Coastdown Loading
                        </span>
                        </div>
                        <div>
                        <div className="mb-3">
                          <Label className="text-xs">
                          Coast Down Test Report Reference <span className="text-red-500">*</span>
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
                            Vehicle Reference mass (Kg) <span className="text-red-500">*</span>
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
                          <Label className="text-xs">A (N) <span className="text-red-500">*</span></Label>
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
                          <Label className="text-xs">B (N/kmph) <span className="text-red-500">*</span></Label>
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
                          <Label className="text-xs">C (N/kmph^2) <span className="text-red-500">*</span></Label>
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
                          <Label className="text-xs">F0 (N) <span className="text-red-500">*</span></Label>
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
                          <Label className="text-xs">F1 (N/kmph) <span className="text-red-500">*</span></Label>
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
                          <Label className="text-xs">F2 (N/kmph^2) <span className="text-red-500">*</span></Label>
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
                        </div>
                      </div>
                      )}

                      {/* Attachments Card */}
                      <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 rounded-lg p-4 mt-4 mb-2 shadow-inner">
                      <div className="font-semibold text-sm text-gray-700 dark:text-white mb-2">
                        Attachments
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                        <Label>
                          {form.department === "RDE JO" 
                          ? "Emission Checklist Attachment / Type-1 Report" 
                          : "Emission Checklist Attachment"
                          }{form.department !== "PDCD_JO Chennai" && <span className="text-red-500">*</span>}
                          {test.emission_check_attachment && test.emission_check_attachment.length > 0 && (
                          <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            {Array.isArray(test.emission_check_attachment) ? test.emission_check_attachment.length : 1}
                          </span>
                          )}
                        </Label>
                        <DropzoneFileList
                          buttonText={form.department === "RDE JO" 
                          ? "Emission Checklist Attachment / Type-1 Report" 
                          : "Emission Checklist Attachment"
                          }
                          name="emission_check_attachment"
                          maxFiles={5}
                          formData={{
                          ...test,
                          job_order_id: location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || "",
                          test_order_id: test.testOrderId || "",
                          originalJobOrderId: location.state?.originalJobOrderId || location.state?.jobOrder?.job_order_id || ""
                          }}
                          setFormData={handleAttachmentUpdate(idx)}
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
                          backgroundColor: getAttachmentColor(getAttachmentFileCount(test, 'emission_check_attachment')),
                          borderColor: getAttachmentColor(getAttachmentFileCount(test, 'emission_check_attachment')),
                          color: 'white'
                          }}
                          customContainerStyle={{
                          backgroundColor: getAttachmentBackgroundColor(getAttachmentFileCount(test, 'emission_check_attachment'))
                          }}
                        />
                        </div>

                        <div>
                        <Label>
                          Dataset Attachment{form.department !== "PDCD_JO Chennai" && <span className="text-red-500">*</span>}
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
                          setFormData={handleAttachmentUpdate(idx)}
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
                          A2L Attachment{form.department !== "PDCD_JO Chennai" && <span className="text-red-500">*</span>}
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
                          setFormData={handleAttachmentUpdate(idx)}
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
                      Experiment Attachment {form.department !== "PDCD_JO Chennai" && <span className="text-red-500">*</span>}
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
                      setFormData={handleAttachmentUpdate(idx)}
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
                      setFormData={handleAttachmentUpdate(idx)}
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
                      setFormData={handleAttachmentUpdate(idx)}
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
                      setFormData={handleAttachmentUpdate(idx)}
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
                      setFormData={handleAttachmentUpdate(idx)}
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
                      setFormData={handleAttachmentUpdate(idx)}
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
        <div className="mx-8 my-8 bg-white border border-gray-200 rounded-lg shadow-lg shadow-gray-300/40 p-6 transition-all duration-200 hover:shadow-xl hover:shadow-gray-400/40 hover:-translate-y-1 cursor-pointer">
          <div className="font-semibold mb-4 text-lg text-gray-800">All Test Orders</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border ">
              <thead>
                <tr className="bg-gray-200 dark:bg-black">
                  <th className="border px-2 py-1">Test</th>
                  <th className="border px-2 py-1">Test Order ID</th>
                  <th className="border px-2 py-1">Test Type</th>
                  <th className="border px-2 py-1" style={{minWidth:'200px'}}>Objective</th>
                  <th className="border px-2 py-1">Fuel Type</th>
                  <th className="border px-2 py-1">Status</th>
                  <th className="border px-2 py-1">Rating</th>
                  <th className="border px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(allTestOrders[location.state?.originalJobOrderId] || [])
                  .sort((a, b) => {
                    // Extract test numbers from test_order_id (e.g., "JO123/1" -> 1)
                    const testNumA = parseInt(a.test_order_id.split('/').pop()) || 0;
                    const testNumB = parseInt(b.test_order_id.split('/').pop()) || 0;
                    // Sort in descending order (newest test numbers first)
                    return testNumB - testNumA;
                  })
                  .map((to, index) => (
                  <tr key={to.test_order_id}>
                    <td className="border px-2 py-1">{to.test_order_id.split('/').pop() || (index + 1)}</td>
                    <td className="border px-2 py-1">{to.test_order_id}</td>
                    <td className="border px-2 py-1">{to.test_type}</td>
                    <td className="border px-2 py-1" style={{minWidth:'200px'}}>{to.test_objective}</td>
                    <td className="border px-2 py-1">{to.fuel_type}</td>
                    <td className="border px-2 py-1">{to.status}</td>
                    <td className="border px-2 py-1">
                      {to.status === "Completed" ? (
                        <div className="flex items-center justify-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`h-4 w-4 ${
                                star <= (to.rating || 0)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="border px-2 py-1 flex justify-center items-center gap-2">
                      {/* Show Edit button based on user role and test status */}
                      {(() => {
                        // For ProjectTeam: Show edit button when status is "Re-edit" 
                        if (isProjectTeam && to.status === "Re-edit") {
                          return (
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full border-0 flex items-center justify-center cursor-pointer transition-colors duration-200"
                              onClick={() => fetchAndOpenTestOrder(to.test_order_id)}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          );
                        }
                        // For other roles (but not TestEngineer & Admin when status is "Re-edit"): Show edit button
                        else if (!isTestEngineer || !isAdmin || ((isTestEngineer || isAdmin) && to.status !== "Re-edit")) {
                          return (
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full border-0 flex items-center justify-center cursor-pointer transition-colors duration-200"
                              onClick={() => fetchAndOpenTestOrder(to.test_order_id)}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
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

      {/* Missing Fields Modal */}
      {missingFieldsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-96">
            <div className="font-semibold mb-2">Required Fields Missing</div>
            <div className="text-sm mb-4">
              Please fill the following required fields before creating the test order:
            </div>
            <ul className="list-disc list-inside mb-4 text-sm">
              {missingFieldsForModal.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
            <div className="flex justify-end gap-2">
              <Button
                className="bg-gray-300 text-black px-4 py-1 rounded"
                type="button"
                onClick={() => setMissingFieldsModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      
    </>
  );
}