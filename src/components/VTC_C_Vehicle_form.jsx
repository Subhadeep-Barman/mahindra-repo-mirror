import { useState, useEffect, useId } from "react";
import axios from "axios";
import { Button } from "@/components/UI/button";
import { ArrowBack, DirectionsCar, Settings, Engineering, Build, Speed, CameraAlt } from "@mui/icons-material";
import Navbar1 from "@/components/UI/navbar";
import { useNavigate, useLocation } from "react-router-dom";
import useStore from "@/store/useStore";
import { useAuth } from "@/context/AuthContext";
import showSnackbar from "@/utils/showSnackbar";
import { styled } from "@mui/material/styles";
import { Box, Paper, Typography, Grid, Divider, Chip, alpha } from "@mui/material";

const apiURL = import.meta.env.VITE_BACKEND_URL;

const departments = ["VTC_JO Chennai", "RDE JO", "VTC_JO Nashik"];

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)`,
  color: "#ffffff",
  padding: "10px 6px", // Reduced horizontal padding
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  padding: "10px 16px",
  textTransform: "none",
  fontWeight: 600,
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
  },
}));

const StyledInput = styled("input")(({ theme }) => ({
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  padding: "10px 12px",
  width: "100%",
  fontSize: "16px",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  "&:focus": {
    outline: "none",
    borderColor: "#3b82f6",
    boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.2)",
  },
  "&:disabled": {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
    cursor: "not-allowed",
  },
}));

const StyledSelect = styled("select")(({ theme }) => ({
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  padding: "10px 12px",
  width: "100%",
  fontSize: "16px",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  "&:focus": {
    outline: "none",
    borderColor: "#3b82f6",
    boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.2)",
  },
  "&:disabled": {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
    cursor: "not-allowed",
  },
}));

const FormLabel = styled("label")(({ theme }) => ({
  display: "block",
  fontSize: "14px",
  fontWeight: 500,
  marginBottom: "8px",
  color: "#374151",
}));

const RadioGroup = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: "16px",
  alignItems: "center",
}));

const RadioLabel = styled("label")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "14px",
  cursor: "pointer",
  userSelect: "none",
}));

export default function VehicleEngineForm({ onSubmit, onClear }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const department = queryParams.get("department") || "VTC_JO Chennai";
  const isEditMode = queryParams.get("edit") === "true";

  // Check if we have vehicle data from navigation state
  const vehicleData = location.state?.vehicleData;
  const originalVehicleData = location.state?.originalVehicleData;

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

  const { apiUserRole, userId, userName } = useAuth();

  // Helper function to parse ratio strings like "3.42:1" into {numerator: "3.42", denominator: "1"}
  const parseRatio = (ratioString) => {
    if (!ratioString) return { numerator: "", denominator: "" };
    const parts = ratioString.split(":");
    return {
      numerator: parts[0] || "",
      denominator: parts[1] || ""
    };
  };

  // Initialize form with empty values or vehicle data if editing
  const [form, setForm] = useState({
    project: "",
    vehicleBuildLevel: "",
    vehicleModel: "",
    vehicleBodyNumber: "",
    vehicleSerialNumber: "",
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
    department: department,
    vehicleKerbWeight: "",
    vehicleGVW: "",
    kerbFAW: "",
    kerbRAW: "",
    awdRwdFwd: "",
  });

  // Populate form with existing vehicle data when editing
  useEffect(() => {
    if (isEditMode && vehicleData) {
      
      setForm({
        project: vehicleData.project_code || "",
        vehicleBuildLevel: vehicleData.vehicle_build_level || "",
        vehicleModel: vehicleData.vehicle_model || "",
        vehicleBodyNumber: vehicleData.vehicle_body_number || "",
        vehicleSerialNumber: vehicleData.vehicle_serial_number || "",
        transmissionType: vehicleData.transmission_type || "",
        finalDriveAxleRatio: parseRatio(vehicleData.final_drive_axle_ratio),
        domain: vehicleData.domain || "",
        tyreMake: vehicleData.tyre_make || "",
        tyreSize: vehicleData.tyre_size || "",
        tyrePressureFront: vehicleData.tyre_pressure_front || "",
        tyrePressureRear: vehicleData.tyre_pressure_rear || "",
        tyreRunIn: vehicleData.tyre_run_in || "",
        engineRunIn: vehicleData.engine_run_in || "",
        gearBoxRunIn: vehicleData.gearbox_run_in || "",
        axleRunIn: vehicleData.axle_run_in || "",
        engineOilSpecification: vehicleData.engine_oil_specification || "",
        axleOilSpecification: vehicleData.axle_oil_specification || "",
        transmissionOilSpecification: vehicleData.transmission_oil_specification || "",
        driveType: vehicleData.wd_type || "",
        drivenWheel: vehicleData.driven_wheel || "",
        intercoolerLocation: vehicleData.intercooler_location || "",
        gearRatio1: parseRatio(vehicleData.gear_ratio_1),
        gearRatio2: parseRatio(vehicleData.gear_ratio_2),
        gearRatio3: parseRatio(vehicleData.gear_ratio_3),
        gearRatio4: parseRatio(vehicleData.gear_ratio_4),
        gearRatio5: parseRatio(vehicleData.gear_ratio_5),
        reverseGearRatio: parseRatio(vehicleData.reverse_gear_ratio),
        department: vehicleData.department || department,
        vehicleKerbWeight: vehicleData.vehicle_kerb_weight || "",
        vehicleGVW: vehicleData.vehicle_gvw || "",
        kerbFAW: vehicleData.kerb_faw || "",
        kerbRAW: vehicleData.kerb_raw || "",
        awdRwdFwd: vehicleData.awd_rwd_fwd || "",
      });
    }
  }, [isEditMode, vehicleData, department]);

  const isEV = form.domain === "EV";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    if (name === "driveType") {
      setForm({
        ...form,
        [name]: value,
        drivenWheel: ""
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleRatioChange = (e, field, part) => {
    setForm({
      ...form,
      [field]: { ...form[field], [part]: e.target.value },
    });
  };

  // Convert current time to IST and format as ISO 8601
  const currentISTTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  const formattedISTTime = new Date(currentISTTime).toISOString();

  // Map form state to API schema
  function mapFormToApi(form) {
    return {
      project_code: form.project,
      vehicle_body_number: form.vehicleBodyNumber,
      vehicle_model: form.vehicleModel,
      vehicle_serial_number: form.vehicleSerialNumber,
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
      engine_oil_specification: isEV ? "" : form.engineOilSpecification,
      axle_oil_specification: isEV ? "" : form.axleOilSpecification,
      transmission_oil_specification: isEV ? "" : form.transmissionOilSpecification,
      wd_type: form.driveType,
      driven_wheel: form.drivenWheel,
      intercooler_location: isEV ? "NA" : form.intercoolerLocation,
      gear_ratio_1: isEV ? "" : (form.gearRatio1.numerator && form.gearRatio1.denominator
        ? `${form.gearRatio1.numerator}:${form.gearRatio1.denominator}` : ""),
      gear_ratio_2: isEV ? "" : (form.gearRatio2.numerator && form.gearRatio2.denominator
        ? `${form.gearRatio2.numerator}:${form.gearRatio2.denominator}` : ""),
      gear_ratio_3: isEV ? "" : (form.gearRatio3.numerator && form.gearRatio3.denominator
        ? `${form.gearRatio3.numerator}:${form.gearRatio3.denominator}` : ""),
      gear_ratio_4: isEV ? "" : (form.gearRatio4.numerator && form.gearRatio4.denominator
        ? `${form.gearRatio4.numerator}:${form.gearRatio4.denominator}` : ""),
      gear_ratio_5: isEV ? "" : (form.gearRatio5.numerator && form.gearRatio5.denominator
        ? `${form.gearRatio5.numerator}:${form.gearRatio5.denominator}` : ""),
      reverse_gear_ratio: isEV ? "" : (form.reverseGearRatio.numerator && form.reverseGearRatio.denominator
        ? `${form.reverseGearRatio.numerator}:${form.reverseGearRatio.denominator}` : ""),
      department: form.department,
      vehicle_kerb_weight: form.vehicleKerbWeight ? parseFloat(form.vehicleKerbWeight) : null,
      vehicle_gvw: form.vehicleGVW ? parseFloat(form.vehicleGVW) : null,
      kerb_faw: form.kerbFAW ? parseFloat(form.kerbFAW) : null,
      kerb_raw: form.kerbRAW ? parseFloat(form.kerbRAW) : null,
      awd_rwd_fwd: form.awdRwdFwd,
      // final_drive_ratio: form.finalDriveRatio.numerator && form.finalDriveRatio.denominator
      //   ? `${form.finalDriveRatio.numerator}:${form.finalDriveRatio.denominator}`
      //   : "",
      // Add tracking fields
      ...(isEditMode ? {
        id_of_updater: userId || "",
        name_of_updater: userName || "",
        updated_on: formattedISTTime
      } : {
        id_of_creator: userId || "",
        name_of_creator: userName || "",
        created_on: formattedISTTime,
        updated_on: formattedISTTime
      })
    };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Field validation logic (same as before)
    const fieldNames = {
      project: "Project",
      vehicleBuildLevel: "Vehicle Build Level",
      vehicleModel: "Vehicle Model",
      vehicleBodyNumber: "Vehicle Body Number",
      vehicleSerialNumber: "Vehicle Serial Number",
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
      department: "Department",
      vehicleKerbWeight: "Vehicle Kerb Weight",
      vehicleGVW: "Vehicle GVW",
      kerbFAW: "Kerb FAW",
      kerbRAW: "Kerb RAW",
      awdRwdFwd: "AWD/RWD/FWD",
    };

    // Check for missing fields
    const missingFields = [];
    for (let key in form) {
      // Skip certain fields if EV
      if (isEV) {
        if (
          [
            "engineOilSpecification",
            "axleOilSpecification",
            "transmissionOilSpecification",
            "intercoolerLocation",
            "gearRatio1",
            "gearRatio2",
            "gearRatio3",
            "gearRatio4",
            "gearRatio5",
            "reverseGearRatio",
          ].includes(key)
        ) {
          continue;
        }
      }
      if (
        typeof form[key] === "object" &&
        form[key] !== null &&
        ("numerator" in form[key] || "denominator" in form[key])
      ) {
        // For ratio fields
        if (!isEV && (!form[key].numerator || !form[key].denominator)) {
          missingFields.push(fieldNames[key]);
        }
      } else if (!form[key]) {
        missingFields.push(fieldNames[key]);
      }
    }
    if (missingFields.length > 0) {
      showSnackbar(
        "Please fill all fields. Missing: " + missingFields.join(", "),
        "warning"
      );
      return;
    }

    const payload = mapFormToApi(form);

    try {
      let response;
      if (isEditMode) {
        // Update existing vehicle
        response = await axios.put(
          `${apiURL}/vehicles/${form.vehicleSerialNumber}`,
          payload,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        if (onSubmit) onSubmit(response.data);
        else showSnackbar("Vehicle updated successfully!", "success");
      } else {
        // Create new vehicle
        response = await axios.post(`${apiURL}/vehicles`, payload, {
          headers: { "Content-Type": "application/json" },
        });
        if (onSubmit) onSubmit(response.data);
        else showSnackbar("Vehicle added successfully!", "success");
      }
      navigate(-1);
    } catch (err) {
      showSnackbar(
        `Error ${isEditMode ? 'updating' : 'adding'} vehicle: ` +
        (err.response?.data?.detail || err.message),
        "error"
      );
    }
  };

  const handleClear = () => {
    setForm({
      project: "",
      vehicleBuildLevel: "",
      vehicleModel: "",
      vehicleBodyNumber: "",
      vehicleSerialNumber: "",
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
      intercoolerLocation: isEV ? "NA" : "",
      gearRatio: { numerator: "", denominator: "" },
      gearRatio1: { numerator: "", denominator: "" },
      gearRatio2: { numerator: "", denominator: "" },
      gearRatio3: { numerator: "", denominator: "" },
      gearRatio4: { numerator: "", denominator: "" },
      gearRatio5: { numerator: "", denominator: "" },
      reverseGearRatio: { numerator: "", denominator: "" },
      department: department,
      vehicleKerbWeight: "",
      vehicleGVW: "",
      kerbFAW: "",
      kerbRAW: "",
      awdRwdFwd: "",
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
      <Box sx={{ py: 2, borderBottom: "1px solid #e5e7eb" }}>
        <Box sx={{ maxWidth: "1600px", mx: "auto", px: 2 }}> {/* Reduced horizontal padding */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              sx={{
                color: "#3b82f6",
                borderColor: "#3b82f6",
                borderWidth: "1px",
                borderStyle: "solid",
                borderRadius: "50%",
                p: 1,
                minWidth: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  backgroundColor: "rgba(59, 130, 246, 0.05)",
                },
              }}
            >
              <ArrowBack sx={{ fontSize: 20 }} />
            </Button>
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  color: "#111827",
                  ".dark &": { color: "#3b82f6" } 
                }}
              >
                {isEditMode ? `EDIT VEHICLE: ${form.vehicleSerialNumber}` : `NEW VEHICLE - ${department}`}
              </Typography>
              {isEditMode && (
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  Editing vehicle: {vehicleData?.vehicle_serial_number} | Department: {department}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Form */}
      <Box sx={{ maxWidth: "1600px", mx: "auto", px: 2, py: 3 }}> {/* Reduced horizontal padding */}
        <StyledPaper>
          <form onSubmit={handleSubmit}>
            {/* Vehicle Information Section */}
            <SectionHeader>
              <DirectionsCar fontSize="medium" />
              <Typography variant="h6" fontWeight="bold">
                Vehicle Information
              </Typography>
            </SectionHeader>

            <Box sx={{ p: 2 }}> {/* Reduced padding */}
              <Grid container spacing={2}> {/* Reduced grid spacing */}
                {/* Vehicle Serial Number */}
                {/* Project */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Project <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <StyledSelect
                    name="project"
                    value={form.project}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Project</option>
                    {projectOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </StyledSelect>
                </Grid>
                {/* Vehicle Serial Number */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Vehicle Serial Number <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <StyledInput
                    name="vehicleSerialNumber"
                    value={form.vehicleSerialNumber}
                    onChange={handleChange}
                    required
                    disabled={isEditMode}
                    placeholder="Enter Vehicle Serial Number"
                    style={isEditMode ? { backgroundColor: "#f3f4f6", color: "#6b7280" } : {}}
                  />
                </Grid>

                {/* Vehicle Build Level */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Vehicle Build Level <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <StyledInput
                    name="vehicleBuildLevel"
                    value={form.vehicleBuildLevel}
                    onChange={handleChange}
                    required
                    placeholder="Enter Vehicle Build Level"
                  />
                </Grid>

                {/* Vehicle Model */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Vehicle Model <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <StyledSelect
                    name="vehicleModel"
                    value={form.vehicleModel}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Model</option>
                    {vehicleModelOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </StyledSelect>
                </Grid>

                {/* Vehicle Body Number */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Vehicle Body Number <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <StyledInput
                    name="vehicleBodyNumber"
                    value={form.vehicleBodyNumber}
                    onChange={handleChange}
                    required
                    placeholder="Enter Vehicle Body Number"
                  />
                </Grid>

                {/* Transmission Type */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Transmission Type <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <RadioGroup>
                    <RadioLabel>
                      <input
                        type="radio"
                        name="transmissionType"
                        value="AT"
                        checked={form.transmissionType === "AT"}
                        onChange={handleRadioChange}
                        required
                      />
                      AT
                    </RadioLabel>
                    <RadioLabel>
                      <input
                        type="radio"
                        name="transmissionType"
                        value="MT"
                        checked={form.transmissionType === "MT"}
                        onChange={handleRadioChange}
                        required
                      />
                      MT
                    </RadioLabel>
                    <RadioLabel>
                      <input
                        type="radio"
                        name="transmissionType"
                        value="AMT"
                        checked={form.transmissionType === "AMT"}
                        onChange={handleRadioChange}
                        required
                      />
                      AMT
                    </RadioLabel>
                  </RadioGroup>
                </Grid>

                {/* Domain */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Domain <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <StyledSelect
                    name="domain"
                    value={form.domain}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Domain</option>
                    {domainOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </StyledSelect>
                </Grid>

                {/* Department */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Department <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <StyledInput
                    name="department"
                    value={form.department}
                    readOnly
                    style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Vehicle Weight Information */}
            <SectionHeader>
              <Speed fontSize="medium" />
              <Typography variant="h6" fontWeight="bold">
                Vehicle Weight Information
              </Typography>
            </SectionHeader>

            <Box sx={{ p: 2 }}> {/* Reduced padding */}
              <Grid container spacing={2}> {/* Reduced grid spacing */}
                {/* Vehicle Kerb Weight */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Vehicle Kerb Weight (kg) <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <StyledInput
                    name="vehicleKerbWeight"
                    value={form.vehicleKerbWeight}
                    onChange={handleChange}
                    required
                    type="number"
                    placeholder="Enter Vehicle Kerb Weight"
                  />
                </Grid>

                {/* Vehicle GVW */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Vehicle GVW (kg) <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <StyledInput
                    name="vehicleGVW"
                    value={form.vehicleGVW}
                    onChange={handleChange}
                    required
                    type="number"
                    placeholder="Enter Vehicle GVW"
                  />
                </Grid>

                {/* Kerb FAW */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Kerb FAW (kg) <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <StyledInput
                    name="kerbFAW"
                    value={form.kerbFAW}
                    onChange={handleChange}
                    required
                    type="number"
                    placeholder="Enter Kerb FAW"
                  />
                </Grid>

                {/* Kerb RAW */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Kerb RAW (kg) <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <StyledInput
                    name="kerbRAW"
                    value={form.kerbRAW}
                    onChange={handleChange}
                    required
                    type="number"
                    placeholder="Enter Kerb RAW"
                  />
                </Grid>

                {/* AWD/RWD/FWD */}
                <Grid item xs={12} sm={6} md={6}>
                  <FormLabel>
                    AWD/RWD/FWD <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <RadioGroup>
                    <RadioLabel>
                      <input
                        type="radio"
                        name="awdRwdFwd"
                        value="AWD"
                        checked={form.awdRwdFwd === "AWD"}
                        onChange={handleRadioChange}
                        required
                      />
                      AWD
                    </RadioLabel>
                    <RadioLabel>
                      <input
                        type="radio"
                        name="awdRwdFwd"
                        value="RWD"
                        checked={form.awdRwdFwd === "RWD"}
                        onChange={handleRadioChange}
                        required
                      />
                      RWD
                    </RadioLabel>
                    <RadioLabel>
                      <input
                        type="radio"
                        name="awdRwdFwd"
                        value="FWD"
                        checked={form.awdRwdFwd === "FWD"}
                        onChange={handleRadioChange}
                        required
                      />
                      FWD
                    </RadioLabel>
                  </RadioGroup>
                </Grid>

                {/* Drive Type */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    2WD / 4WD <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <RadioGroup>
                    <RadioLabel>
                      <input
                        type="radio"
                        name="driveType"
                        value="2WD"
                        checked={form.driveType === "2WD"}
                        onChange={handleRadioChange}
                        required
                      />
                      2WD
                    </RadioLabel>
                    <RadioLabel>
                      <input
                        type="radio"
                        name="driveType"
                        value="4WD"
                        checked={form.driveType === "4WD"}
                        onChange={handleRadioChange}
                        required
                      />
                      4WD
                    </RadioLabel>
                  </RadioGroup>
                </Grid>

                {/* Driven Wheel */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Driven Wheel <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <RadioGroup>
                    {form.driveType === "2WD" ? (
                      <>
                        <RadioLabel>
                          <input
                            type="radio"
                            name="drivenWheel"
                            value="Front"
                            checked={form.drivenWheel === "Front"}
                            onChange={handleRadioChange}
                            required
                          />
                          Front
                        </RadioLabel>
                        <RadioLabel>
                          <input
                            type="radio"
                            name="drivenWheel"
                            value="Rear"
                            checked={form.drivenWheel === "Rear"}
                            onChange={handleRadioChange}
                            required
                          />
                          Rear
                        </RadioLabel>
                      </>
                    ) : form.driveType === "4WD" ? (
                      <>
                        <RadioLabel>
                          <input
                            type="checkbox"
                            name="drivenWheel"
                            value="Front"
                            checked={form.drivenWheel.includes("Front")}
                            onChange={(e) => {
                              const { value, checked } = e.target;
                              let newValue = form.drivenWheel || "";
                              if (checked) {
                                newValue = newValue ? `${newValue}, ${value}` : value;
                              } else {
                                newValue = newValue.split(", ").filter(item => item !== value).join(", ");
                              }
                              setForm({ ...form, drivenWheel: newValue });
                            }}
                          />
                          Front
                        </RadioLabel>
                        <RadioLabel>
                          <input
                            type="checkbox"
                            name="drivenWheel"
                            value="Rear"
                            checked={form.drivenWheel.includes("Rear")}
                            onChange={(e) => {
                              const { value, checked } = e.target;
                              let newValue = form.drivenWheel || "";
                              if (checked) {
                                newValue = newValue ? `${newValue}, ${value}` : value;
                              } else {
                                newValue = newValue.split(", ").filter(item => item !== value).join(", ");
                              }
                              setForm({ ...form, drivenWheel: newValue });
                            }}
                          />
                          Rear
                        </RadioLabel>
                      </>
                    ) : (
                      <>
                        <RadioLabel>
                          <input
                            type="radio"
                            name="drivenWheel"
                            value="Front"
                            checked={form.drivenWheel === "Front"}
                            onChange={handleRadioChange}
                            required
                          />
                          Front
                        </RadioLabel>
                        <RadioLabel>
                          <input
                            type="radio"
                            name="drivenWheel"
                            value="Rear"
                            checked={form.drivenWheel === "Rear"}
                            onChange={handleRadioChange}
                            required
                          />
                          Rear
                        </RadioLabel>
                      </>
                    )}
                  </RadioGroup>
                </Grid>
              </Grid>
            </Box>

            {/* Tyre Information */}
            <SectionHeader>
              <Build fontSize="medium" />
              <Typography variant="h6" fontWeight="bold">
                Tyre Information
              </Typography>
            </SectionHeader>

            <Box sx={{ p: 2 }}> {/* Reduced padding */}
              <Grid container spacing={2}> {/* Reduced grid spacing */}
                {/* Tyre Make */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Tyre Make <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <StyledInput
                    name="tyreMake"
                    value={form.tyreMake}
                    onChange={handleChange}
                    required
                    placeholder="Enter Tyre Make"
                  />
                </Grid>

                {/* Tyre Size */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Tyre Size <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <StyledInput
                    name="tyreSize"
                    value={form.tyreSize}
                    onChange={handleChange}
                    required
                    placeholder="Enter Tyre Size"
                  />
                </Grid>

                {/* Tyre Pressure Front */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Tyre Pressure Front (psi) <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <StyledInput
                    name="tyrePressureFront"
                    value={form.tyrePressureFront}
                    onChange={handleChange}
                    required
                    type="number"
                    placeholder="Enter Front Tyre Pressure"
                  />
                </Grid>

                {/* Tyre Pressure Rear */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Tyre Pressure Rear (psi) <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <StyledInput
                    name="tyrePressureRear"
                    value={form.tyrePressureRear}
                    onChange={handleChange}
                    required
                    type="number"
                    placeholder="Enter Rear Tyre Pressure"
                  />
                </Grid>

                {/* Tyre Run-in */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Tyre Run-in (Kms) <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <StyledInput
                    name="tyreRunIn"
                    value={form.tyreRunIn}
                    onChange={handleChange}
                    required
                    type="number"
                    placeholder="Enter Tyre Run-in"
                  />
                </Grid>

                {/* Engine Run-in */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Engine Run-in (Kms) <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <StyledInput
                    name="engineRunIn"
                    value={form.engineRunIn}
                    onChange={handleChange}
                    required
                    type="number"
                    placeholder="Enter Engine Run-in"
                  />
                </Grid>

                {/* Gear Box Run-in */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Gear Box Run-in (Kms) <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <StyledInput
                    name="gearBoxRunIn"
                    value={form.gearBoxRunIn}
                    onChange={handleChange}
                    required
                    type="number"
                    placeholder="Enter Gear Box Run-in"
                  />
                </Grid>

                {/* Axle Run-in */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Axle Run-in (Kms) <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <StyledInput
                    name="axleRunIn"
                    value={form.axleRunIn}
                    onChange={handleChange}
                    required
                    type="number"
                    placeholder="Enter Axle Run-in"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Transmission Information */}
            <SectionHeader>
              <Settings fontSize="medium" />
              <Typography variant="h6" fontWeight="bold">
                Transmission Information
              </Typography>
            </SectionHeader>

            <Box sx={{ p: 2 }}> {/* Reduced padding */}
              <Grid container spacing={2}> {/* Reduced grid spacing */}
                {/* Final Drive Ratio */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormLabel>
                    Final Drive Axle Ratio <span style={{ color: "#3b82f6" }}>*</span>
                  </FormLabel>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <StyledInput
                      type="number"
                      value={form.finalDriveAxleRatio.numerator}
                      onChange={(e) => handleRatioChange(e, "finalDriveAxleRatio", "numerator")}
                      required
                      placeholder="Numerator"
                      style={{ width: "calc(50% - 8px)" }}
                    />
                    <Typography variant="body1" sx={{ color: "#6b7280" }}>:</Typography>
                    <StyledInput
                      type="number"
                      value={form.finalDriveAxleRatio.denominator}
                      onChange={(e) => handleRatioChange(e, "finalDriveAxleRatio", "denominator")}
                      required
                      placeholder="Denominator"
                      style={{ width: "calc(50% - 8px)" }}
                    />
                  </Box>
                </Grid>

                {!isEV && (
                  <>
                    {/* Engine Oil Specification */}
                    <Grid item xs={12} sm={6} md={3}>
                      <FormLabel>
                        Engine Oil Specification <span style={{ color: "#3b82f6" }}>*</span>
                      </FormLabel>
                      <StyledInput
                        name="engineOilSpecification"
                        value={form.engineOilSpecification}
                        onChange={handleChange}
                        required={!isEV}
                        placeholder="Enter Engine Oil Specification"
                      />
                    </Grid>

                    {/* Axle Oil Specification */}
                    <Grid item xs={12} sm={6} md={3}>
                      <FormLabel>
                        Axle Oil Specification <span style={{ color: "#3b82f6" }}>*</span>
                      </FormLabel>
                      <StyledInput
                        name="axleOilSpecification"
                        value={form.axleOilSpecification}
                        onChange={handleChange}
                        required={!isEV}
                        placeholder="Enter Axle Oil Specification"
                      />
                    </Grid>

                    {/* Transmission Oil Specification */}
                    <Grid item xs={12} sm={6} md={3}>
                      <FormLabel>
                        Transmission Oil Specification <span style={{ color: "#3b82f6" }}>*</span>
                      </FormLabel>
                      <StyledInput
                        name="transmissionOilSpecification"
                        value={form.transmissionOilSpecification}
                        onChange={handleChange}
                        required={!isEV}
                        placeholder="Enter Transmission Oil Specification"
                      />
                    </Grid>
                  </>
                )}

                {/* Intercooler Location - Only for non-EV */}
                {!isEV && (
                  <Grid item xs={12} sm={6} md={3}>
                    <FormLabel>
                      Intercooler Location <span style={{ color: "#3b82f6" }}>*</span>
                    </FormLabel>
                    <RadioGroup>
                      <RadioLabel>
                        <input
                          type="radio"
                          name="intercoolerLocation"
                          value="Front"
                          checked={form.intercoolerLocation === "Front"}
                          onChange={handleRadioChange}
                          required
                        />
                        Front
                      </RadioLabel>
                      <RadioLabel>
                        <input
                          type="radio"
                          name="intercoolerLocation"
                          value="Rear"
                          checked={form.intercoolerLocation === "Rear"}
                          onChange={handleRadioChange}
                          required
                        />
                        Rear
                      </RadioLabel>
                      <RadioLabel>
                        <input
                          type="radio"
                          name="intercoolerLocation"
                          value="Top"
                          checked={form.intercoolerLocation === "Top"}
                          onChange={handleRadioChange}
                          required
                        />
                        Top
                      </RadioLabel>
                    </RadioGroup>
                  </Grid>
                )}

                {/* Gear Ratios - Only for non-EV */}
                {!isEV && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }}>
                        <Chip label="Gear Ratios" color="primary" />
                      </Divider>
                    </Grid>

                    {/* 1st Gear Ratio */}
                    <Grid item xs={12} sm={6} md={4}>
                      <FormLabel>
                        1st Gear Ratio <span style={{ color: "#3b82f6" }}>*</span>
                      </FormLabel>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <StyledInput
                          type="number"
                          value={form.gearRatio1.numerator}
                          onChange={(e) => handleRatioChange(e, "gearRatio1", "numerator")}
                          required
                          placeholder="Numerator"
                          style={{ width: "calc(50% - 8px)" }}
                        />
                        <Typography variant="body1" sx={{ color: "#6b7280" }}>:</Typography>
                        <StyledInput
                          type="number"
                          value={form.gearRatio1.denominator}
                          onChange={(e) => handleRatioChange(e, "gearRatio1", "denominator")}
                          required
                          placeholder="Denominator"
                          style={{ width: "calc(50% - 8px)" }}
                        />
                      </Box>
                    </Grid>

                    {/* 2nd Gear Ratio */}
                    <Grid item xs={12} sm={6} md={4}>
                      <FormLabel>
                        2nd Gear Ratio <span style={{ color: "#3b82f6" }}>*</span>
                      </FormLabel>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <StyledInput
                          type="number"
                          value={form.gearRatio2.numerator}
                          onChange={(e) => handleRatioChange(e, "gearRatio2", "numerator")}
                          required
                          placeholder="Numerator"
                          style={{ width: "calc(50% - 8px)" }}
                        />
                        <Typography variant="body1" sx={{ color: "#6b7280" }}>:</Typography>
                        <StyledInput
                          type="number"
                          value={form.gearRatio2.denominator}
                          onChange={(e) => handleRatioChange(e, "gearRatio2", "denominator")}
                          required
                          placeholder="Denominator"
                          style={{ width: "calc(50% - 8px)" }}
                        />
                      </Box>
                    </Grid>

                    {/* 3rd Gear Ratio */}
                    <Grid item xs={12} sm={6} md={4}>
                      <FormLabel>
                        3rd Gear Ratio <span style={{ color: "#3b82f6" }}>*</span>
                      </FormLabel>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <StyledInput
                          type="number"
                          value={form.gearRatio3.numerator}
                          onChange={(e) => handleRatioChange(e, "gearRatio3", "numerator")}
                          required
                          placeholder="Numerator"
                          style={{ width: "calc(50% - 8px)" }}
                        />
                        <Typography variant="body1" sx={{ color: "#6b7280" }}>:</Typography>
                        <StyledInput
                          type="number"
                          value={form.gearRatio3.denominator}
                          onChange={(e) => handleRatioChange(e, "gearRatio3", "denominator")}
                          required
                          placeholder="Denominator"
                          style={{ width: "calc(50% - 8px)" }}
                        />
                      </Box>
                    </Grid>

                    {/* 4th Gear Ratio */}
                    <Grid item xs={12} sm={6} md={4}>
                      <FormLabel>
                        4th Gear Ratio <span style={{ color: "#3b82f6" }}>*</span>
                      </FormLabel>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <StyledInput
                          type="number"
                          value={form.gearRatio4.numerator}
                          onChange={(e) => handleRatioChange(e, "gearRatio4", "numerator")}
                          required
                          placeholder="Numerator"
                          style={{ width: "calc(50% - 8px)" }}
                        />
                        <Typography variant="body1" sx={{ color: "#6b7280" }}>:</Typography>
                        <StyledInput
                          type="number"
                          value={form.gearRatio4.denominator}
                          onChange={(e) => handleRatioChange(e, "gearRatio4", "denominator")}
                          required
                          placeholder="Denominator"
                          style={{ width: "calc(50% - 8px)" }}
                        />
                      </Box>
                    </Grid>

                    {/* 5th Gear Ratio */}
                    <Grid item xs={12} sm={6} md={4}>
                      <FormLabel>
                        5th Gear Ratio <span style={{ color: "#3b82f6" }}>*</span>
                      </FormLabel>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <StyledInput
                          type="number"
                          value={form.gearRatio5.numerator}
                          onChange={(e) => handleRatioChange(e, "gearRatio5", "numerator")}
                          required
                          placeholder="Numerator"
                          style={{ width: "calc(50% - 8px)" }}
                        />
                        <Typography variant="body1" sx={{ color: "#6b7280" }}>:</Typography>
                        <StyledInput
                          type="number"
                          value={form.gearRatio5.denominator}
                          onChange={(e) => handleRatioChange(e, "gearRatio5", "denominator")}
                          required
                          placeholder="Denominator"
                          style={{ width: "calc(50% - 8px)" }}
                        />
                      </Box>
                    </Grid>

                    {/* Reverse Gear Ratio */}
                    <Grid item xs={12} sm={6} md={4}>
                      <FormLabel>
                        Reverse Gear Ratio <span style={{ color: "#3b82f6" }}>*</span>
                      </FormLabel>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <StyledInput
                          type="number"
                          value={form.reverseGearRatio.numerator}
                          onChange={(e) => handleRatioChange(e, "reverseGearRatio", "numerator")}
                          required
                          placeholder="Numerator"
                          style={{ width: "calc(50% - 8px)" }}
                        />
                        <Typography variant="body1" sx={{ color: "#6b7280" }}>:</Typography>
                        <StyledInput
                          type="number"
                          value={form.reverseGearRatio.denominator}
                          onChange={(e) => handleRatioChange(e, "reverseGearRatio", "denominator")}
                          required
                          placeholder="Denominator"
                          style={{ width: "calc(50% - 8px)" }}
                        />
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 2, backgroundColor: "#f9fafb" }}> {/* Reduced padding */}
              <ActionButton
                type="button"
                onClick={handleClear}
                sx={{
                  backgroundColor: "white",
                  color: "#3b82f6",
                  border: "1px solid #3b82f6",
                  "&:hover": {
                    backgroundColor: "rgba(59, 130, 246, 0.04)",
                  },
                }}
              >
                CLEAR
              </ActionButton>
              <ActionButton
                type="submit"
                sx={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#1e40af",
                  },
                }}
              >
                {isEditMode ? "UPDATE VEHICLE" : "ADD VEHICLE"}
              </ActionButton>
            </Box>
          </form>
        </StyledPaper>
      </Box>
    </>
  );
}