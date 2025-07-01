"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar1 from "@/components/UI/navbar";
import {
  Typography,
  Grid,
  Button,
  TextField,
  MenuItem,
  Box,
  Card,
  CardContent,
  Divider,
  Container,
  Chip,
  IconButton,
  Collapse,
  Alert,
  LinearProgress,
  Paper,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  ExpandMore as ExpandMoreIcon,
  Build as BuildIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  BatteryChargingFull as BatteryIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
const apiURL = import.meta.env.VITE_BACKEND_URL;

// Custom styled components
const StyledContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  width: "100vw",
  padding: 0,
  background: 'none',
  backgroundColor: '#fff',
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  justifyContent: "flex-start",
}));

const SectionCard = styled(Card)(({ theme }) => ({
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  marginBottom: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  transition: "all 0.2s ease",
  "&:hover": {
    boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.mode === "dark" ? "#2a2a2a" : "#fafafa",
  borderRadius: "8px 8px 0 0",
  cursor: "pointer",
  transition: "background-color 0.2s ease",
  borderBottom: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    backgroundColor: theme.palette.mode === "dark" ? "#333" : "#f0f0f0",
  },
}));

const StyledTextField = styled(TextField)(({ theme, color }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    transition: "all 0.2s ease",
    backgroundColor: theme.palette.mode === "dark" ? "#2a2a2a" : "#fafafa",
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark" ? "#333" : "#f5f5f5",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.divider,
      borderWidth: 2,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: color ? theme.palette[color]?.main : theme.palette.primary.main,
      boxShadow: "none",
    },
    "&.Mui-error .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.error.main,
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: "13px",
    fontWeight: 500,
    color: theme.palette.text.primary,
    "&.Mui-focused": {
      color: color ? theme.palette[color]?.main : theme.palette.primary.main,
    },
    "&.Mui-error": {
      color: theme.palette.error.main,
    },
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  padding: theme.spacing(1.2, 3),
  fontWeight: 600,
  textTransform: "none",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
}));

const initialState = {
  engineBuildLevel: "",
  engineSerialNumber: "",
  engineType: "",
  engineCapacity: "",
  numberOfCylinders: "",
  compressionRatio: "",
  bore: "",
  stroke: "",
  vacuumModulatorMake: "",
  vacuumModulatorDetails: "",
  ecuMake: "",
  ecuIdNumber: "",
  ecuDatasetNumber: "",
  ecuDatasetDetails: "",
  injectorType: "",
  turboChargerType: "",
  blowByRecirculation: "",
  nozzleNumberOfHoles: "",
  nozzleThroughFlow: "",
  egrValveMake: "",
  egrValveType: "",
  egrValveDiameter: "",
  egrCoolerMake: "",
  egrCoolerCapacity: "",
  catconMake: "",
  catconType: "",
  catconLoading: "",
  dpfMake: "",
  dpfCapacity: "",
  scrMake: "",
  scrCapacity: "",
  accCompressor: "",
  accCompressorDetails: "",
  powerSteeringPump: "",
  powerSteeringDetails: "",
  waterByPass: "",
  kerbWeightFAW: "",
  kerbWeightRAW: "",
  emissionStatus: "",
  thermostatDetails: "",
  vehicleSerialNumber: "",
  engineFamily: "",
  hvBatteryMake: "",
  hvBatteryCapacity: "",
  hvBatteryVoltage: "",
  hvBatteryCurrent: "",
  evMotorPower: "",
};

const vehicleOptions = [
  { value: "", label: "Select Vehicle" },
  { value: "VEHICLE1", label: "Vehicle 1" },
  { value: "VEHICLE2", label: "Vehicle 2" },
  // ...add more as needed
];

const engineFamilyOptions = [
  { value: "", label: "Select Engine Family" },
  { value: "FAMILY1", label: "Family 1" },
  { value: "FAMILY2", label: "Family 2" },
  // ...add more as needed
];

export default function VTCCEngineForm() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    engine: true,
    emission: true,
    accessories: true,
    weight: true,
    electric: true,
  });
  const navigate = useNavigate();

  const handleSectionToggle = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setForm(initialState);
  };

  // Helper to map frontend form to backend schema
  const mapFormToApi = (form) => ({
    engine_id: form.engineSerialNumber, // Assuming engine_id is same as serial number
    engine_serial_number: form.engineSerialNumber || null,
    engine_build_level: form.engineBuildLevel || null,
    engine_capacity: form.engineCapacity
      ? parseFloat(form.engineCapacity)
      : null,
    engine_type: form.engineType || null,
    number_of_cylinders: form.numberOfCylinders || null,
    compression_ratio: form.compressionRatio
      ? parseFloat(form.compressionRatio)
      : null,
    bore_mm: form.bore ? parseFloat(form.bore) : null,
    stroke_mm: form.stroke ? parseFloat(form.stroke) : null,
    vacuum_modulator_make: form.vacuumModulatorMake || null,
    vacuum_modulator_details: form.vacuumModulatorDetails || null,
    ecu_make: form.ecuMake || null,
    ecu_id_number: form.ecuIdNumber || null,
    ecu_dataset_number: form.ecuDatasetNumber || null,
    ecu_dataset_details: form.ecuDatasetDetails || null,
    injector_type: form.injectorType || null,
    turbo_charger_type: form.turboChargerType || null,
    blow_by_recirculation:
      form.blowByRecirculation === "Yes"
        ? true
        : form.blowByRecirculation === "No"
        ? false
        : null,
    nozzle_hole_count: form.nozzleNumberOfHoles || null,
    nozzle_through_flow: form.nozzleThroughFlow
      ? parseFloat(form.nozzleThroughFlow)
      : null,
    egr_valve_make: form.egrValveMake || null,
    egr_valve_type: form.egrValveType || null,
    egr_valve_diameter_mm: form.egrValveDiameter
      ? parseFloat(form.egrValveDiameter)
      : null,
    egr_cooler_make: form.egrCoolerMake || null,
    egr_cooler_capacity_kw: form.egrCoolerCapacity
      ? parseFloat(form.egrCoolerCapacity)
      : null,
    catcon_make: form.catconMake || null,
    catcon_type: form.catconType || null,
    catcon_loading: form.catconLoading || null,
    dpf_make: form.dpfMake || null,
    dpf_capacity: form.dpfCapacity || null,
    scr_make: form.scrMake || null,
    scr_capacity: form.scrCapacity || null,
    acc_compressor:
      form.accCompressor === "Yes"
        ? true
        : form.accCompressor === "No"
        ? false
        : null,
    acc_compressor_details: form.accCompressorDetails || null,
    ps_pump: form.powerSteeringPump || null,
    ps_details: form.powerSteeringDetails || null,
    water_bypass: form.waterByPass || null,
    kerb_weight_faw_kg: form.kerbWeightFAW
      ? parseFloat(form.kerbWeightFAW)
      : null,
    kerb_weight_raw_kg: form.kerbWeightRAW
      ? parseFloat(form.kerbWeightRAW)
      : null,
    emission_status: form.emissionStatus || null,
    thermostat_details: form.thermostatDetails || null,
    vehicle_serial_number: form.vehicleSerialNumber || null,
    engine_family: form.engineFamily || null,
    hv_battery_make: form.hvBatteryMake || null,
    hv_battery_capacity: form.hvBatteryCapacity
      ? parseFloat(form.hvBatteryCapacity)
      : null,
    hv_battery_voltage: form.hvBatteryVoltage
      ? parseFloat(form.hvBatteryVoltage)
      : null,
    hv_battery_current: form.hvBatteryCurrent
      ? parseFloat(form.hvBatteryCurrent)
      : null,
    ev_motor_power_kw: form.evMotorPower ? parseFloat(form.evMotorPower) : null,
    // id_of_creator, created_on, etc. can be set by backend
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = mapFormToApi(form);
      const response = await axios.post(`${apiURL}/engines`, payload);
      navigate("/vtcchennaiengine");
    } catch (err) {
      setError(
        err?.response?.data?.detail || err?.message || "Failed to create engine"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar1 />
      <StyledContainer>
        {/* Header Section with Back Button */}
        <Box
          sx={{
            width: '100%',
            px: { xs: 2, md: 6 },
            py: 3,
            mb: 0.5,
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #f0f1f3',
            background: 'none',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              aria-label="Back"
              onClick={() => navigate(-1)}
              sx={{
                mr: 2,
                border: '1.5px solid #e53935',
                color: '#e53935',
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#fff',
                '&:hover': { background: '#f8f8f8', borderColor: '#b71c1c' },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 22 }} />
            </IconButton>
            <Box>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  mb: 0.5,
                }}
              >
                VTC CHENNAI
              </Typography>
              <Typography
                sx={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#181d24',
                  letterSpacing: 0.5,
                }}
              >
                NEW ENGINE
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Paper-wrapped Form */}
        <Paper elevation={2} sx={{ width: "100vw", minHeight: "calc(100vh - 80px)", mx: 0, p: { xs: 1.5, sm: 3, md: 4 }, borderRadius: 0, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", background: "#fff" }}>
          {/* Progress Bar */}
          {loading && (
            <Box sx={{ mb: 2, mx: 1 }}>
              <LinearProgress 
                sx={{ 
                  borderRadius: 1, 
                  height: 4,
                  backgroundColor: "rgba(211, 47, 47, 0.1)",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "error.main",
                  }
                }} 
              />
            </Box>
          )}

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                mx: 1,
                borderRadius: 1,
                "& .MuiAlert-icon": {
                  fontSize: "1.2rem"
                }
              }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ mx: 1, maxWidth: "100%" }}>
            {/* Basic Information Section */}
            <SectionCard>
              <SectionHeader onClick={() => handleSectionToggle("basic")}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <BuildIcon color="error" />
                  <Typography variant="h6" fontWeight={600}>
                    Basic Engine Information
                  </Typography>
                  <Chip 
                    label="Required" 
                    size="small" 
                    color="error" 
                    variant="outlined"
                  />
                </Box>
                <IconButton 
                  sx={{ 
                    transform: expandedSections.basic ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease"
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </SectionHeader>
              <Collapse in={expandedSections.basic}>
                <CardContent sx={{ pt: 1.5, pb: 1.5, px: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="error"
                        label="Engine Build Level"
                        name="engineBuildLevel"
                        value={form.engineBuildLevel}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="e.g., Production, Prototype"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="error"
                        label="Engine Serial Number"
                        name="engineSerialNumber"
                        value={form.engineSerialNumber}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Enter unique serial number"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="error"
                        label="Engine Type"
                        name="engineType"
                        value={form.engineType}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="e.g., Diesel, Petrol, Hybrid"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="error"
                        label="Engine Capacity (cc)"
                        name="engineCapacity"
                        value={form.engineCapacity}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        type="number"
                        placeholder="Engine displacement"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="error"
                        label="Number of Cylinders"
                        name="numberOfCylinders"
                        value={form.numberOfCylinders}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        type="number"
                        placeholder="e.g., 4, 6, 8"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="error"
                        label="Compression Ratio"
                        name="compressionRatio"
                        value={form.compressionRatio}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="e.g., 10:1, 12:1"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Collapse>
            </SectionCard>

            {/* Engine Specifications Section */}
            <SectionCard>
              <SectionHeader onClick={() => handleSectionToggle("engine")}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <SettingsIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Engine Specifications
                  </Typography>
                </Box>
                <IconButton 
                  sx={{ 
                    transform: expandedSections.engine ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease"
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </SectionHeader>
              <Collapse in={expandedSections.engine}>
                <CardContent sx={{ pt: 1.5, pb: 1.5, px: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="primary"
                        label="Bore (mm)"
                        name="bore"
                        value={form.bore}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        type="number"
                        placeholder="Cylinder bore diameter"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="primary"
                        label="Stroke (mm)"
                        name="stroke"
                        value={form.stroke}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        type="number"
                        placeholder="Piston stroke length"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="primary"
                        label="Injector Type"
                        name="injectorType"
                        value={form.injectorType}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="e.g., Common Rail, Direct"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="primary"
                        label="Turbo Charger Type"
                        name="turboChargerType"
                        value={form.turboChargerType}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Turbocharger specifications"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="primary"
                        select
                        label="Blow by Recirculation"
                        name="blowByRecirculation"
                        value={form.blowByRecirculation}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 180 }}
                      >
                        <MenuItem value="">Select Option</MenuItem>
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </StyledTextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="primary"
                        label="Nozzle Number of Holes"
                        name="nozzleNumberOfHoles"
                        value={form.nozzleNumberOfHoles}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        type="number"
                        placeholder="Number of injection holes"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="primary"
                        label="Nozzle Through Flow"
                        name="nozzleThroughFlow"
                        value={form.nozzleThroughFlow}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        type="number"
                        placeholder="Flow rate specification"
                      />
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  {/* ECU Section */}
                  <Typography variant="h6" gutterBottom color="primary" fontWeight={600} sx={{ fontSize: "1rem", mb: 1 }}>
                    ECU Configuration
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="primary"
                        label="ECU Make"
                        name="ecuMake"
                        value={form.ecuMake}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="ECU manufacturer"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="primary"
                        label="ECU ID Number"
                        name="ecuIdNumber"
                        value={form.ecuIdNumber}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="ECU identification number"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="primary"
                        label="ECU Dataset Number"
                        name="ecuDatasetNumber"
                        value={form.ecuDatasetNumber}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Dataset version"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <StyledTextField color="primary"
                        label="ECU Dataset Details"
                        name="ecuDatasetDetails"
                        value={form.ecuDatasetDetails}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        multiline
                        rows={2}
                        placeholder="Detailed ECU dataset information"
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 1.5 }} />
                  
                  {/* Vacuum Modulator Section */}
                  <Typography variant="h6" gutterBottom color="primary" fontWeight={600} sx={{ fontSize: "1rem", mb: 1 }}>
                    Vacuum Modulator
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="primary"
                        label="Vacuum Modulator Make"
                        name="vacuumModulatorMake"
                        value={form.vacuumModulatorMake}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Manufacturer name"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={8}>
                      <StyledTextField color="primary"
                        label="Vacuum Modulator Details"
                        name="vacuumModulatorDetails"
                        value={form.vacuumModulatorDetails}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Specification details"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Collapse>
            </SectionCard>

            {/* Emission Control Section */}
            <SectionCard>
              <SectionHeader onClick={() => handleSectionToggle("emission")}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <SpeedIcon color="success" />
                  <Typography variant="h6" fontWeight={600}>
                    Emission Control Systems
                  </Typography>
                </Box>
                <IconButton 
                  sx={{ 
                    transform: expandedSections.emission ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease"
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </SectionHeader>
              <Collapse in={expandedSections.emission}>
                <CardContent sx={{ pt: 1.5, pb: 1.5, px: 2 }}>
                  {/* EGR Section */}
                  <Typography variant="h6" gutterBottom color="success.main" fontWeight={600} sx={{ fontSize: "1rem", mb: 1 }}>
                    EGR (Exhaust Gas Recirculation)
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 1.5 }}>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="success"
                        label="EGR Valve Make"
                        name="egrValveMake"
                        value={form.egrValveMake}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="EGR valve manufacturer"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="success"
                        label="EGR Valve Type"
                        name="egrValveType"
                        value={form.egrValveType}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Valve type specification"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="success"
                        label="EGR Valve Diameter (mm)"
                        name="egrValveDiameter"
                        value={form.egrValveDiameter}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        type="number"
                        placeholder="Valve diameter"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="success"
                        label="EGR Cooler Make"
                        name="egrCoolerMake"
                        value={form.egrCoolerMake}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="EGR cooler manufacturer"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="success"
                        label="EGR Cooler Capacity (KW)"
                        name="egrCoolerCapacity"
                        value={form.egrCoolerCapacity}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        type="number"
                        placeholder="Cooling capacity"
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Catalytic Converter Section */}
                  <Typography variant="h6" gutterBottom color="success.main" fontWeight={600} sx={{ fontSize: "1rem", mb: 1 }}>
                    Catalytic Converter (CATCON)
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 1.5 }}>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="success"
                        label="CATCON Make"
                        name="catconMake"
                        value={form.catconMake}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Manufacturer name"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="success"
                        label="CATCON Type"
                        name="catconType"
                        value={form.catconType}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Converter type"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="success"
                        label="CATCON Loading"
                        name="catconLoading"
                        value={form.catconLoading}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Loading specification"
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 1.5 }} />

                  {/* DPF & SCR Section */}
                  <Typography variant="h6" gutterBottom color="success.main" fontWeight={600} sx={{ fontSize: "1rem", mb: 1 }}>
                    DPF & SCR Systems
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="success"
                        label="DPF Make"
                        name="dpfMake"
                        value={form.dpfMake}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="DPF manufacturer"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="success"
                        label="DPF Capacity"
                        name="dpfCapacity"
                        value={form.dpfCapacity}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Filter capacity"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="success"
                        label="SCR Make"
                        name="scrMake"
                        value={form.scrMake}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="SCR manufacturer"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="success"
                        label="SCR Capacity"
                        name="scrCapacity"
                        value={form.scrCapacity}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="SCR capacity"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Collapse>
            </SectionCard>

            {/* Accessories Section */}
            <SectionCard>
              <SectionHeader onClick={() => handleSectionToggle("accessories")}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <SettingsIcon color="warning" />
                  <Typography variant="h6" fontWeight={600}>
                    Accessories & Components
                  </Typography>
                </Box>
                <IconButton 
                  sx={{ 
                    transform: expandedSections.accessories ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease"
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </SectionHeader>
              <Collapse in={expandedSections.accessories}>
                <CardContent sx={{ pt: 1.5, pb: 1.5, px: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="warning"
                        select
                        label="AC Compressor"
                        name="accCompressor"
                        value={form.accCompressor}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 140}}
                      >
                        <MenuItem value="">Select</MenuItem>
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </StyledTextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="warning"
                        select
                        label="AC Compressor Position"
                        name="accCompressorDetails"
                        value={form.accCompressorDetails}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        disabled={form.accCompressor !== "Yes"}
                        sx={{ minWidth: 200 }}
                      >
                        <MenuItem value="">Select Position</MenuItem>
                        <MenuItem value="Front">Front</MenuItem>
                        <MenuItem value="Rear">Rear</MenuItem>
                      </StyledTextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="warning"
                        select
                        label="Power Steering Pump"
                        name="powerSteeringPump"
                        value={form.powerSteeringPump}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 200 }}
                      >
                        <MenuItem value="">Select Position</MenuItem>
                        <MenuItem value="Front">Front</MenuItem>
                        <MenuItem value="Rear">Rear</MenuItem>
                        <MenuItem value="Top">Top</MenuItem>
                      </StyledTextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="warning"
                        label="Power Steering Details"
                        name="powerSteeringDetails"
                        value={form.powerSteeringDetails}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Power steering specifications"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="warning"
                        label="Water Bypass"
                        name="waterByPass"
                        value={form.waterByPass}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Water bypass details"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="warning"
                        label="Thermostat Details"
                        name="thermostatDetails"
                        value={form.thermostatDetails}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Thermostat configuration"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Collapse>
            </SectionCard>

            {/* Weight & Vehicle Info Section */}
            <SectionCard color="info">
              <SectionHeader color="info" onClick={() => handleSectionToggle("weight")}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <SpeedIcon color="info" />
                  <Typography variant="h6" fontWeight={600}>
                    Weight & Vehicle Information
                  </Typography>
                  <Chip 
                    label="Important" 
                    size="small" 
                    color="info" 
                    variant="outlined"
                  />
                </Box>
                <IconButton 
                  sx={{ 
                    transform: expandedSections.weight ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease"
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </SectionHeader>
              <Collapse in={expandedSections.weight}>
                <CardContent sx={{ pt: 1.5, pb: 1.5, px: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="info"
                        label="Kerb Weight FAW (Kg) *"
                        name="kerbWeightFAW"
                        value={form.kerbWeightFAW}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        type="number"
                        placeholder="Front Axle Weight"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="info"
                        label="Kerb Weight RAW (Kg) *"
                        name="kerbWeightRAW"
                        value={form.kerbWeightRAW}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        type="number"
                        placeholder="Rear Axle Weight"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="info"
                        label="Emission Status"
                        name="emissionStatus"
                        value={form.emissionStatus}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="e.g., BS6, Euro 6"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="info"
                        select
                        label="Vehicle Serial Number"
                        name="vehicleSerialNumber"
                        value={form.vehicleSerialNumber}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 180 }}
                      >
                        {vehicleOptions.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </StyledTextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="info"
                        select
                        label="Engine Family"
                        name="engineFamily"
                        value={form.engineFamily}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 150 }}
                      >
                        {engineFamilyOptions.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </StyledTextField>
                    </Grid>
                  </Grid>
                </CardContent>
              </Collapse>
            </SectionCard>

            {/* Electric Vehicle Section */}
            <SectionCard color="secondary">
              <SectionHeader color="secondary" onClick={() => handleSectionToggle("electric")}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <BatteryIcon color="secondary" />
                  <Typography variant="h6" fontWeight={600}>
                    Electric Vehicle Components
                  </Typography>
                  <Chip 
                    label="Optional" 
                    size="small" 
                    color="secondary" 
                    variant="outlined"
                  />
                </Box>
                <IconButton 
                  sx={{ 
                    transform: expandedSections.electric ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease"
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </SectionHeader>
              <Collapse in={expandedSections.electric}>
                <CardContent sx={{ pt: 1.5, pb: 1.5, px: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="secondary"
                        label="HV Battery Make"
                        name="hvBatteryMake"
                        value={form.hvBatteryMake}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="High voltage battery manufacturer"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="secondary"
                        label="HV Battery Capacity"
                        name="hvBatteryCapacity"
                        value={form.hvBatteryCapacity}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        type="number"
                        placeholder="Battery capacity (kWh)"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="secondary"
                        label="HV Battery Voltage (V)"
                        name="hvBatteryVoltage"
                        value={form.hvBatteryVoltage}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        type="number"
                        placeholder="Operating voltage"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="secondary"
                        label="HV Battery Current (A)"
                        name="hvBatteryCurrent"
                        value={form.hvBatteryCurrent}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        type="number"
                        placeholder="Maximum current"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField color="secondary"
                        label="EV Motor Power (KW)"
                        name="evMotorPower"
                        value={form.evMotorPower}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        size="small"
                        type="number"
                        placeholder="Motor power output"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Collapse>
            </SectionCard>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1.5,
                mt: 2,
                flexWrap: "wrap",
                pt: 1.5,
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              <ActionButton
                variant="outlined"
                color="secondary"
                onClick={handleClear}
                disabled={loading}
                startIcon={<ClearIcon />}
                sx={{ 
                  minWidth: { xs: "110px", sm: "130px" },
                  borderWidth: 1,
                  "&:hover": {
                    borderWidth: 1,
                  }
                }}
              >
                Clear Form
              </ActionButton>
              <ActionButton
                type="submit"
                variant="contained"
                color="error"
                disabled={loading}
                startIcon={loading ? null : <SaveIcon />}
                sx={{ 
                  minWidth: { xs: "130px", sm: "150px" },
                  background: "linear-gradient(45deg, #d32f2f 30%, #f44336 90%)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #b71c1c 30%, #d32f2f 90%)",
                  }
                }}
              >
                {loading ? "Adding Engine..." : "Add Engine"}
              </ActionButton>
            </Box>
            </Box>
          </form>
        </Paper>
      </StyledContainer>
    </>
  );
}
