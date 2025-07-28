"use client";

import { ArrowBack, Add, Edit as EditIcon } from "@mui/icons-material";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/table";
import { Card } from "@/components/UI/card";
import { useEffect, useState } from "react";
import Navbar1 from "@/components/UI/navbar";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
const apiURL = import.meta.env.VITE_BACKEND_URL;

export default function VTCEnginePage() {
  const [currentPage] = useState(1);
  const [engines, setEngines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from the current route
  let activeTab = "Job Order";
  if (location.pathname.toLowerCase().includes("vehicle"))
    activeTab = "Vehicle";
  else if (location.pathname.toLowerCase().includes("engine"))
    activeTab = "Engine";

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddNewEngine = () => {
    navigate("/chennai/engine/new?department=RDE%20JO");
  };

  const handleTabClick = (tab) => {
    if (tab === "Job Order") {
      navigate("/rde-chennai");
    } else if (tab === "Vehicle") {
      navigate("/rde/vehicle");
    } else if (tab === "Engine") {
      navigate("/rde/engine");
    }
  };

  useEffect(() => {
    const fetchEngines = async () => {
      setLoading(true);
      setError(null);
      try {
        // Add department param for RDE JO
        const res = await axios.get(`${apiURL}/engines`);
        // Only pick required fields for table
        setEngines(
          (res.data || []).map((e) => ({
            engineSerialNumber: e.engine_serial_number || "",
            engineBuildLevel: e.engine_build_level || "",
            engineCapacity: e.engine_capacity || "",
            engineType: e.engine_type || "",
            lastUpdatedOn: e.updated_on
              ? new Date(e.updated_on).toLocaleDateString()
              : "",
          }))
        );
      } catch (err) {
        setError(
          err?.response?.data?.detail ||
            err?.message ||
            "Failed to fetch engines"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchEngines();
  }, []);

  // Open edit modal and fetch engine details
  const handleEdit = async (engineSerialNumber) => {
    setEditOpen(true);
    setEditLoading(true);
    setEditError(null);
    setEditForm(null);
    setEditId(engineSerialNumber);
    try {
      const res = await axios.get(`${apiURL}/engines/${engineSerialNumber}`);
      setEditForm({
        engineBuildLevel: res.data.engine_build_level || "",
        engineSerialNumber: res.data.engine_serial_number || "",
        engineType: res.data.engine_type || "",
        engineCapacity: res.data.engine_capacity || "",
        numberOfCylinders: res.data.number_of_cylinders || "",
        compressionRatio: res.data.compression_ratio || "",
        bore: res.data.bore_mm || "",
        stroke: res.data.stroke_mm || "",
        vacuumModulatorMake: res.data.vacuum_modulator_make || "",
        vacuumModulatorDetails: res.data.vacuum_modulator_details || "",
        ecuMake: res.data.ecu_make || "",
        ecuIdNumber: res.data.ecu_id_number || "",
        ecuDatasetNumber: res.data.ecu_dataset_number || "",
        ecuDatasetDetails: res.data.ecu_dataset_details || "",
        injectorType: res.data.injector_type || "",
        turboChargerType: res.data.turbo_charger_type || "",
        blowByRecirculation:
          res.data.blow_by_recirculation === true
            ? "Yes"
            : res.data.blow_by_recirculation === false
            ? "No"
            : "",
        nozzleNumberOfHoles: res.data.nozzle_hole_count || "",
        nozzleThroughFlow: res.data.nozzle_through_flow || "",
        egrValveMake: res.data.egr_valve_make || "",
        egrValveType: res.data.egr_valve_type || "",
        egrValveDiameter: res.data.egr_valve_diameter_mm || "",
        egrCoolerMake: res.data.egr_cooler_make || "",
        egrCoolerCapacity: res.data.egr_cooler_capacity_kw || "",
        catconMake: res.data.catcon_make || "",
        catconType: res.data.catcon_type || "",
        catconLoading: res.data.catcon_loading || "",
        dpfMake: res.data.dpf_make || "",
        dpfCapacity: res.data.dpf_capacity || "",
        scrMake: res.data.scr_make || "",
        scrCapacity: res.data.scr_capacity || "",
        accCompressor:
          res.data.acc_compressor === true
            ? "Yes"
            : res.data.acc_compressor === false
            ? "No"
            : "",
        accCompressorDetails: res.data.acc_compressor_details || "",
        powerSteeringPump: res.data.ps_pump || "",
        powerSteeringDetails: res.data.ps_details || "",
        waterByPass: res.data.water_bypass || "",
        kerbWeightFAW: res.data.kerb_weight_faw_kg || "",
        kerbWeightRAW: res.data.kerb_weight_raw_kg || "",
        emissionStatus: res.data.emission_status || "",
        thermostatDetails: res.data.thermostat_details || "",
        vehicleSerialNumber: res.data.vehicle_serial_number || "",
        engineFamily: res.data.engine_family || "",
        hvBatteryMake: res.data.hv_battery_make || "",
        hvBatteryCapacity: res.data.hv_battery_capacity || "",
        hvBatteryVoltage: res.data.hv_battery_voltage || "",
        hvBatteryCurrent: res.data.hv_battery_current || "",
        evMotorPower: res.data.ev_motor_power_kw || "",
      });
    } catch (err) {
      setEditError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to fetch engine details"
      );
    } finally {
      setEditLoading(false);
    }
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save changes (update API)
  const handleEditSave = async () => {
    setEditLoading(true);
    setEditError(null);
    try {
      const payload = {
        engine_serial_number: editForm.engineSerialNumber || null,
        engine_build_level: editForm.engineBuildLevel || null,
        engine_capacity: editForm.engineCapacity
          ? parseFloat(editForm.engineCapacity)
          : null,
        engine_type: editForm.engineType || null,
        number_of_cylinders: editForm.numberOfCylinders || null,
        compression_ratio: editForm.compressionRatio
          ? parseFloat(editForm.compressionRatio)
          : null,
        bore_mm: editForm.bore ? parseFloat(editForm.bore) : null,
        stroke_mm: editForm.stroke ? parseFloat(editForm.stroke) : null,
        vacuum_modulator_make: editForm.vacuumModulatorMake || null,
        vacuum_modulator_details: editForm.vacuumModulatorDetails || null,
        ecu_make: editForm.ecuMake || null,
        ecu_id_number: editForm.ecuIdNumber || null,
        ecu_dataset_number: editForm.ecuDatasetNumber || null,
        ecu_dataset_details: editForm.ecuDatasetDetails || null,
        injector_type: editForm.injectorType || null,
        turbo_charger_type: editForm.turboChargerType || null,
        blow_by_recirculation:
          editForm.blowByRecirculation === "Yes"
            ? true
            : editForm.blowByRecirculation === "No"
            ? false
            : null,
        nozzle_hole_count: editForm.nozzleNumberOfHoles || null,
        nozzle_through_flow: editForm.nozzleThroughFlow
          ? parseFloat(editForm.nozzleThroughFlow)
          : null,
        egr_valve_make: editForm.egrValveMake || null,
        egr_valve_type: editForm.egrValveType || null,
        egr_valve_diameter_mm: editForm.egrValveDiameter
          ? parseFloat(editForm.egrValveDiameter)
          : null,
        egr_cooler_make: editForm.egrCoolerMake || null,
        egr_cooler_capacity_kw: editForm.egrCoolerCapacity
          ? parseFloat(editForm.egrCoolerCapacity)
          : null,
        catcon_make: editForm.catconMake || null,
        catcon_type: editForm.catconType || null,
        catcon_loading: editForm.catconLoading || null,
        dpf_make: editForm.dpfMake || null,
        dpf_capacity: editForm.dpfCapacity || null,
        scr_make: editForm.scrMake || null,
        scr_capacity: editForm.scrCapacity || null,
        acc_compressor:
          editForm.accCompressor === "Yes"
            ? true
            : editForm.accCompressor === "No"
            ? false
            : null,
        acc_compressor_details: editForm.accCompressorDetails || null,
        ps_pump: editForm.powerSteeringPump || null,
        ps_details: editForm.powerSteeringDetails || null,
        water_bypass: editForm.waterByPass || null,
        kerb_weight_faw_kg: editForm.kerbWeightFAW
          ? parseFloat(editForm.kerbWeightFAW)
          : null,
        kerb_weight_raw_kg: editForm.kerbWeightRAW
          ? parseFloat(editForm.kerbWeightRAW)
          : null,
        emission_status: editForm.emissionStatus || null,
        thermostat_details: editForm.thermostatDetails || null,
        vehicle_serial_number: editForm.vehicleSerialNumber || null,
        engine_family: editForm.engineFamily || null,
        hv_battery_make: editForm.hvBatteryMake || null,
        hv_battery_capacity: editForm.hvBatteryCapacity
          ? parseFloat(editForm.hvBatteryCapacity)
          : null,
        hv_battery_voltage: editForm.hvBatteryVoltage
          ? parseFloat(editForm.hvBatteryVoltage)
          : null,
        hv_battery_current: editForm.hvBatteryCurrent
          ? parseFloat(editForm.hvBatteryCurrent)
          : null,
        ev_motor_power_kw: editForm.evMotorPower
          ? parseFloat(editForm.evMotorPower)
          : null,
      };
      await axios.put(`${apiURL}/engines/${editId}`, payload);
      setEditOpen(false);
      // Refresh engine list
      const res = await axios.get(`${apiURL}/engines`);
      setEngines(
        (res.data || []).map((e) => ({
          engineSerialNumber: e.engine_serial_number || "",
          engineBuildLevel: e.engine_build_level || "",
          engineCapacity: e.engine_capacity || "",
          engineType: e.engine_type || "",
          lastUpdatedOn: e.updated_on
            ? new Date(e.updated_on).toLocaleDateString()
            : "",
        }))
      );
    } catch (err) {
      if (
        err?.response?.data?.detail &&
        Array.isArray(err.response.data.detail) &&
        err.response.data.detail.some(
          (d) =>
            d.loc &&
            d.loc.includes("engine_serial_number") &&
            d.msg &&
            d.msg.toLowerCase().includes("field required")
        )
      ) {
        setEditOpen(false);
      } else {
        setEditError(
          err?.response?.data?.detail ||
            err?.message ||
            "Failed to update engine"
        );
      }
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <>
      <Navbar1 />
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        {/* Header */}
        <div className="bg-white border-b dark:bg-black">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:border-red-500 dark:hover:bg-red-950 rounded-full border border-red-500"
                >
                  <ArrowBack className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-sm font-medium text-gray-600 dark:text-red-500 ">
                    RDE CHENNAI
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* Tab Buttons */}
                {["Job Order", "Vehicle", "Engine"].map((tab) => (
                  <Button
                    key={tab}
                    onClick={() => handleTabClick(tab)}
                    className={`rounded-xl px-4 py-2 font-semibold border
                      ${
                        activeTab === tab
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-white text-red-500 border-red-500 hover:bg-red-50"
                      }
                    `}
                  >
                    {tab}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Engine List Badge */}
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Badge className="bg-yellow-400 text-black hover:bg-yellow-500 px-3 py-1">
              Engine List
            </Badge>
            <Button
              onClick={handleAddNewEngine}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Add className="h-4 w-4 mr-1" />
              ADD NEW ENGINE
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <Card>
            <div className="overflow-x-auto">
              {error && (
                <div className="text-red-500 text-sm mb-2">{error}</div>
              )}
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700 text-sm">
                      Engine Serial Number
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">
                      Engine Build Level
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">
                      Engine Capacity (cc)
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">
                      Engine Type
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">
                      Last Updated on
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">
                      Edit
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-gray-500"
                      >
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : engines.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-gray-500"
                      >
                        No engines found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    engines.map((engine, index) => (
                      <TableRow
                        key={index}
                        className={
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }
                      >
                        <TableCell className="text-sm text-gray-900 font-medium">
                          {engine.engineSerialNumber}
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          {engine.engineBuildLevel}
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          {engine.engineCapacity}
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          {engine.engineType}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {engine.lastUpdatedOn}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            aria-label="edit"
                            size="small"
                            onClick={() =>
                              handleEdit(engine.engineSerialNumber)
                            }
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              {`Showing ${engines.length} of ${engines.length}`}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-gray-400"
              >
                {"<<"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-gray-400"
              >
                {"<"}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-black text-white hover:bg-gray-800"
              >
                1
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-gray-400"
              >
                {">"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-gray-400"
              >
                {">>"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Engine Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Engine</DialogTitle>
        <DialogContent dividers>
          {editLoading ? (
            <div style={{ padding: 24 }}>Loading...</div>
          ) : editError ? (
            <div className="text-red-500 text-sm mb-2">{editError}</div>
          ) : editForm ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {/* Engine ID (read-only) */}
              <TextField
                label="Engine ID"
                name="engineId"
                value={editForm.engineId}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Engine Serial Number"
                name="engineSerialNumber"
                value={editForm.engineSerialNumber}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
                disabled
              />
              <TextField
                label="Engine Build Level"
                name="engineBuildLevel"
                value={editForm.engineBuildLevel}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="Engine Type"
                name="engineType"
                value={editForm.engineType}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="Engine Capacity"
                name="engineCapacity"
                value={editForm.engineCapacity}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="Number of Cylinders"
                name="numberOfCylinders"
                value={editForm.numberOfCylinders}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="Compression Ratio"
                name="compressionRatio"
                value={editForm.compressionRatio}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="Bore (mm)"
                name="bore"
                value={editForm.bore}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="Stroke (mm)"
                name="stroke"
                value={editForm.stroke}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="Vacuum Modulator Make"
                name="vacuumModulatorMake"
                value={editForm.vacuumModulatorMake}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="Vacuum Modulator Details"
                name="vacuumModulatorDetails"
                value={editForm.vacuumModulatorDetails}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="ECU Make"
                name="ecuMake"
                value={editForm.ecuMake}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="ECU ID Number"
                name="ecuIdNumber"
                value={editForm.ecuIdNumber}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="ECU Dataset Number"
                name="ecuDatasetNumber"
                value={editForm.ecuDatasetNumber}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="ECU Dataset Details"
                name="ecuDatasetDetails"
                value={editForm.ecuDatasetDetails}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="Injector Type"
                name="injectorType"
                value={editForm.injectorType}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="Turbo charger Type"
                name="turboChargerType"
                value={editForm.turboChargerType}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                select
                label="Blow by Recirculation"
                name="blowByRecirculation"
                value={editForm.blowByRecirculation}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
              <TextField
                label="Nozzle Number of Holes"
                name="nozzleNumberOfHoles"
                value={editForm.nozzleNumberOfHoles}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="Nozzle Through Flow"
                name="nozzleThroughFlow"
                value={editForm.nozzleThroughFlow}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="EGR Valve Make"
                name="egrValveMake"
                value={editForm.egrValveMake}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="EGR Valve Type"
                name="egrValveType"
                value={editForm.egrValveType}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="EGR Valve Diameter (mm)"
                name="egrValveDiameter"
                value={editForm.egrValveDiameter}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="EGR Cooler Make"
                name="egrCoolerMake"
                value={editForm.egrCoolerMake}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="EGR Cooler Capacity (KW)"
                name="egrCoolerCapacity"
                value={editForm.egrCoolerCapacity}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="CATCON Make"
                name="catconMake"
                value={editForm.catconMake}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="CATCON Type"
                name="catconType"
                value={editForm.catconType}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="CATCON Loading"
                name="catconLoading"
                value={editForm.catconLoading}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="DPF Make"
                name="dpfMake"
                value={editForm.dpfMake}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="DPF Capacity"
                name="dpfCapacity"
                value={editForm.dpfCapacity}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="SCR Make"
                name="scrMake"
                value={editForm.scrMake}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="SCR Capacity"
                name="scrCapacity"
                value={editForm.scrCapacity}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                select
                label="ACC.Compressor"
                name="accCompressor"
                value={editForm.accCompressor}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
              <TextField
                select
                label="ACC.Compressor Details"
                name="accCompressorDetails"
                value={editForm.accCompressorDetails}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="Front">Front</MenuItem>
                <MenuItem value="Rear">Rear</MenuItem>
              </TextField>
              <TextField
                select
                label="Power Steering Pump"
                name="powerSteeringPump"
                value={editForm.powerSteeringPump}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="Front">Front</MenuItem>
                <MenuItem value="Rear">Rear</MenuItem>
                <MenuItem value="Top">Top</MenuItem>
              </TextField>
              <TextField
                label="Power Steering Details"
                name="powerSteeringDetails"
                value={editForm.powerSteeringDetails}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="Water by pass"
                name="waterByPass"
                value={editForm.waterByPass}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="Kerb Weight FAW (Kg) *"
                name="kerbWeightFAW"
                value={editForm.kerbWeightFAW}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="Kerb Weight RAW (Kg) *"
                name="kerbWeightRAW"
                value={editForm.kerbWeightRAW}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="Emission Status of the Vehicle"
                name="emissionStatus"
                value={editForm.emissionStatus}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="Thermostat Details"
                name="thermostatDetails"
                value={editForm.thermostatDetails}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="Vehicle Serial Number"
                name="vehicleSerialNumber"
                value={editForm.vehicleSerialNumber}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="Engine Family"
                name="engineFamily"
                value={editForm.engineFamily}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="HV Battery Make"
                name="hvBatteryMake"
                value={editForm.hvBatteryMake}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="HV Battery Capacity"
                name="hvBatteryCapacity"
                value={editForm.hvBatteryCapacity}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="HV Battery Voltage (V)"
                name="hvBatteryVoltage"
                value={editForm.hvBatteryVoltage}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="HV Battery Current (A)"
                name="hvBatteryCurrent"
                value={editForm.hvBatteryCurrent}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
              <TextField
                label="EV Motor Power (KW)"
                name="evMotorPower"
                value={editForm.evMotorPower}
                onChange={handleEditChange}
                fullWidth
                size="small"
                sx={{ flex: "1 1 250px" }}
              />
            </div>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditOpen(false)}
            variant="outline"
            disabled={editLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            variant="default"
            disabled={editLoading || !editForm}
          >
            {editLoading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
