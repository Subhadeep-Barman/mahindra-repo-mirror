"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar2 from "@/components/UI/navbar2"
import {
  Typography,
  Grid,
  Button,
  TextField,
  MenuItem,
  Paper,
  Box,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import axios from "axios"
const apiURL = import.meta.env.VITE_BACKEND_URL;

// Custom styled Paper for the form card
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  padding: theme.spacing(4),
  background: theme.palette.mode === "dark" ? theme.palette.grey[900] : "#fff",
  maxWidth: 1100,
  width: "100%",
  margin: "auto",
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
}

const vehicleOptions = [
  { value: "", label: "Select Vehicle" },
  { value: "VEHICLE1", label: "Vehicle 1" },
  { value: "VEHICLE2", label: "Vehicle 2" },
  // ...add more as needed
]

const engineFamilyOptions = [
  { value: "", label: "Select Engine Family" },
  { value: "FAMILY1", label: "Family 1" },
  { value: "FAMILY2", label: "Family 2" },
  // ...add more as needed
]

export default function VTCCEngineForm() {
  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleClear = () => {
    setForm(initialState)
  }

  // Helper to map frontend form to backend schema
  const mapFormToApi = (form) => ({
    engine_id: form.engineSerialNumber, // Assuming engine_id is same as serial number
    engine_serial_number: form.engineSerialNumber || null,
    engine_build_level: form.engineBuildLevel || null,
    engine_capacity: form.engineCapacity ? parseFloat(form.engineCapacity) : null,
    engine_type: form.engineType || null,
    number_of_cylinders: form.numberOfCylinders || null,
    compression_ratio: form.compressionRatio ? parseFloat(form.compressionRatio) : null,
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
    blow_by_recirculation: form.blowByRecirculation === "Yes" ? true : form.blowByRecirculation === "No" ? false : null,
    nozzle_hole_count: form.nozzleNumberOfHoles || null,
    nozzle_through_flow: form.nozzleThroughFlow ? parseFloat(form.nozzleThroughFlow) : null,
    egr_valve_make: form.egrValveMake || null,
    egr_valve_type: form.egrValveType || null,
    egr_valve_diameter_mm: form.egrValveDiameter ? parseFloat(form.egrValveDiameter) : null,
    egr_cooler_make: form.egrCoolerMake || null,
    egr_cooler_capacity_kw: form.egrCoolerCapacity ? parseFloat(form.egrCoolerCapacity) : null,
    catcon_make: form.catconMake || null,
    catcon_type: form.catconType || null,
    catcon_loading: form.catconLoading || null,
    dpf_make: form.dpfMake || null,
    dpf_capacity: form.dpfCapacity || null,
    scr_make: form.scrMake || null,
    scr_capacity: form.scrCapacity || null,
    acc_compressor: form.accCompressor === "Yes" ? true : form.accCompressor === "No" ? false : null,
    acc_compressor_details: form.accCompressorDetails || null,
    ps_pump: form.powerSteeringPump || null,
    ps_details: form.powerSteeringDetails || null,
    water_bypass: form.waterByPass || null,
    kerb_weight_faw_kg: form.kerbWeightFAW ? parseFloat(form.kerbWeightFAW) : null,
    kerb_weight_raw_kg: form.kerbWeightRAW ? parseFloat(form.kerbWeightRAW) : null,
    emission_status: form.emissionStatus || null,
    thermostat_details: form.thermostatDetails || null,
    vehicle_serial_number: form.vehicleSerialNumber || null,
    engine_family: form.engineFamily || null,
    hv_battery_make: form.hvBatteryMake || null,
    hv_battery_capacity: form.hvBatteryCapacity ? parseFloat(form.hvBatteryCapacity) : null,
    hv_battery_voltage: form.hvBatteryVoltage ? parseFloat(form.hvBatteryVoltage) : null,
    hv_battery_current: form.hvBatteryCurrent ? parseFloat(form.hvBatteryCurrent) : null,
    ev_motor_power_kw: form.evMotorPower ? parseFloat(form.evMotorPower) : null,
    // id_of_creator, created_on, etc. can be set by backend
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = mapFormToApi(form)
      const response = await axios.post(`${apiURL}/engines`, payload)
      navigate("/vtcchennaiengine")
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to create engine"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar2 />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 6,
        }}
      >
        <StyledPaper elevation={3}>
          <Typography
            variant="h4"
            align="center"
            color="error"
            fontWeight={700}
            gutterBottom
            sx={{ letterSpacing: 1, mb: 4 }}
          >
            Add New Engine
          </Typography>
          {error && (
          <Box sx={{ mb: 2 }}>
            <Typography color="error" variant="body2">{error}</Typography>
          </Box>
        )}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Use 2 columns on md+, 1 column on xs/sm for better label visibility */}
              {/* Add sx to TextField for label font size and weight */}
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Engine Build Level"
                  name="engineBuildLevel"
                  value={form.engineBuildLevel}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter engine build level"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Engine Serial Number"
                  name="engineSerialNumber"
                  value={form.engineSerialNumber}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter engine serial number"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Engine Type"
                  name="engineType"
                  value={form.engineType}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter engine type"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Engine Capacity (cc)"
                  name="engineCapacity"
                  value={form.engineCapacity}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter engine capacity"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Number of Cylinders"
                  name="numberOfCylinders"
                  value={form.numberOfCylinders}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter number of cylinders"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Compression Ratio"
                  name="compressionRatio"
                  value={form.compressionRatio}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter compression ratio"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Bore (mm)"
                  name="bore"
                  value={form.bore}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter bore (mm)"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Stroke (mm)"
                  name="stroke"
                  value={form.stroke}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter stroke (mm)"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Vacuum Modulator Make"
                  name="vacuumModulatorMake"
                  value={form.vacuumModulatorMake}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter vacuum modulator make"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Vacuum Modulator Details"
                  name="vacuumModulatorDetails"
                  value={form.vacuumModulatorDetails}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter vacuum modulator details"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="ECU Make"
                  name="ecuMake"
                  value={form.ecuMake}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter ECU make"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="ECU ID Number"
                  name="ecuIdNumber"
                  value={form.ecuIdNumber}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter ECU ID number"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="ECU Dataset Number"
                  name="ecuDatasetNumber"
                  value={form.ecuDatasetNumber}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter ECU dataset number"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="ECU Dataset Details"
                  name="ecuDatasetDetails"
                  value={form.ecuDatasetDetails}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter ECU dataset details"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Injector Type"
                  name="injectorType"
                  value={form.injectorType}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter injector type"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Turbo charger Type"
                  name="turboChargerType"
                  value={form.turboChargerType}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter turbo charger type"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  select
                  label="Blow by Recirculation"
                  name="blowByRecirculation"
                  value={form.blowByRecirculation}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Nozzle Number of Holes"
                  name="nozzleNumberOfHoles"
                  value={form.nozzleNumberOfHoles}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter nozzle number of holes"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Nozzle Through Flow"
                  name="nozzleThroughFlow"
                  value={form.nozzleThroughFlow}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter nozzle through flow"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="EGR Valve Make"
                  name="egrValveMake"
                  value={form.egrValveMake}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter EGR valve make"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="EGR Valve Type"
                  name="egrValveType"
                  value={form.egrValveType}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter EGR valve type"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="EGR Valve Diameter (mm)"
                  name="egrValveDiameter"
                  value={form.egrValveDiameter}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter EGR valve diameter"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="EGR Cooler Make"
                  name="egrCoolerMake"
                  value={form.egrCoolerMake}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter EGR cooler make"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="EGR Cooler Capacity (KW)"
                  name="egrCoolerCapacity"
                  value={form.egrCoolerCapacity}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter EGR cooler capacity"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="CATCON Make"
                  name="catconMake"
                  value={form.catconMake}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter CATCON make"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="CATCON Type"
                  name="catconType"
                  value={form.catconType}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter CATCON type"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="CATCON Loading"
                  name="catconLoading"
                  value={form.catconLoading}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter CATCON loading"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="DPF Make"
                  name="dpfMake"
                  value={form.dpfMake}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter DPF make"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="DPF Capacity"
                  name="dpfCapacity"
                  value={form.dpfCapacity}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter DPF capacity"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="SCR Make"
                  name="scrMake"
                  value={form.scrMake}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter SCR make"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="SCR Capacity"
                  name="scrCapacity"
                  value={form.scrCapacity}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter SCR capacity"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  select
                  label="ACC.Compressor"
                  name="accCompressor"
                  value={form.accCompressor}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  select
                  label="ACC.Compressor Details"
                  name="accCompressorDetails"
                  value={form.accCompressorDetails}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Front">Front</MenuItem>
                  <MenuItem value="Rear">Rear</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  select
                  label="Power Steering Pump"
                  name="powerSteeringPump"
                  value={form.powerSteeringPump}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Front">Front</MenuItem>
                  <MenuItem value="Rear">Rear</MenuItem>
                  <MenuItem value="Top">Top</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Power Steering Details"
                  name="powerSteeringDetails"
                  value={form.powerSteeringDetails}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter power steering details"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Water by pass"
                  name="waterByPass"
                  value={form.waterByPass}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter water by pass"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Kerb Weight FAW (Kg) *"
                  name="kerbWeightFAW"
                  value={form.kerbWeightFAW}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter kerb weight FAW"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Kerb Weight RAW (Kg) *"
                  name="kerbWeightRAW"
                  value={form.kerbWeightRAW}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter kerb weight RAW"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Emission Status of the Vehicle"
                  name="emissionStatus"
                  value={form.emissionStatus}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter emission status"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Thermostat Details"
                  name="thermostatDetails"
                  value={form.thermostatDetails}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter thermostat details"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  select
                  label="Vehicle Serial Number"
                  name="vehicleSerialNumber"
                  value={form.vehicleSerialNumber}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                >
                  {vehicleOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  select
                  label="Engine Family"
                  name="engineFamily"
                  value={form.engineFamily}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                >
                  {engineFamilyOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="HV Battery Make"
                  name="hvBatteryMake"
                  value={form.hvBatteryMake}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter HV battery make"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="HV Battery Capacity"
                  name="hvBatteryCapacity"
                  value={form.hvBatteryCapacity}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter HV battery capacity"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="HV Battery Voltage (V)"
                  name="hvBatteryVoltage"
                  value={form.hvBatteryVoltage}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter HV battery voltage"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="HV Battery Current (A)"
                  name="hvBatteryCurrent"
                  value={form.hvBatteryCurrent}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter HV battery current"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="EV Motor Power (KW)"
                  name="evMotorPower"
                  value={form.evMotorPower}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter EV motor power"
                  InputLabelProps={{ sx: { fontSize: 15, fontWeight: 500 } }}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleClear}
                sx={{ borderRadius: 2, minWidth: 120 }}
                disabled={loading}
              >
                Clear
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="error"
                sx={{ borderRadius: 2, minWidth: 150, fontWeight: 600 }}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Engine"}
              </Button>
            </Box>
          </form>
        </StyledPaper>
      </Box>
    </>
  )
}
