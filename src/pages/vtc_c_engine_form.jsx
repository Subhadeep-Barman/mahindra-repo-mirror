"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { RadioGroup, RadioGroupItem } from "@/components/UI/radio-group";
import { Card, CardContent } from "@/components/UI/card";
import { ArrowBack } from "@mui/icons-material";
import Navbar1 from "@/components/UI/navbar";
<<<<<<< HEAD
import axios from "axios";

export default function VTCCEngineForm() {
  const [activeTab, setActiveTab] = useState("Engine");
  const [formData, setFormData] = useState({
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
    turbochargerType: "",
    blowByRecirculation: "",
    blowByRecirculationDetails: "",
    nozzleNumberOfHoles: "",
    nozzleThroughFlow: "",
    egrValveMake: "",
    egrValveType: "",
    egrValveDiameter: "",
    egrCoolerMake: "",
    egrCoolerCapacity: "",
    cafconMass: "",
    cafconType: "",
    cafconLoading: "",
    dpfMake: "",
    dpfCapacity: "",
    scrMake: "",
    scrCapacity: "",
    acCompressor: "",
    acCompressorDetails: "",
    powerSteeringPump: "",
    powerSteeringDetails: "",
    waterByPass: "",
    kerbWeightEmw: "",
    kerbWeightRmw: "",
    emissionStatus: "",
    thermostatDetails: "",
    vehicleSerialNumber: "",
    engineFamily: "",
    hvBatteryMake: "",
    hvBatteryCapacity: "",
    hvBatteryVoltage: "",
    hvBatteryCurrent: "",
    evMotorPower: "",
  });
  const [engineFamilies, setEngineFamilies] = useState([]);
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "Job Order") navigate("/vtc-chennai");
    else if (tab === "Vehicle") navigate("/vtccvehicle");
    else if (tab === "Engine") navigate("/engineform");
=======
import {
  Typography,
  Grid,
  Button,
  TextField,
  MenuItem,
  Paper,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
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
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
>>>>>>> 8b7e59de8e94031cc891e8917d4a53bfec9669bc
  };

  const handleClear = () => {
    setFormData({
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
      turbochargerType: "",
      blowByRecirculation: "",
      blowByRecirculationDetails: "",
      nozzleNumberOfHoles: "",
      nozzleThroughFlow: "",
      egrValveMake: "",
      egrValveType: "",
      egrValveDiameter: "",
      egrCoolerMake: "",
      egrCoolerCapacity: "",
      cafconMass: "",
      cafconType: "",
      cafconLoading: "",
      dpfMake: "",
      dpfCapacity: "",
      scrMake: "",
      scrCapacity: "",
      acCompressor: "",
      acCompressorDetails: "",
      powerSteeringPump: "",
      powerSteeringDetails: "",
      waterByPass: "",
      kerbWeightEmw: "",
      kerbWeightRmw: "",
      emissionStatus: "",
      thermostatDetails: "",
      vehicleSerialNumber: "",
      engineFamily: "",
      hvBatteryMake: "",
      hvBatteryCapacity: "",
      hvBatteryVoltage: "",
      hvBatteryCurrent: "",
      evMotorPower: "",
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddEngine = () => {
    // TODO: Implement actual add logic or API call
    alert("Engine added (stub)");
  };

  useEffect(() => {
    axios
      .get(`${apiUrl}/engine-families`)
      .then((res) => {
        setEngineFamilies(res.data);
      })
      .catch(() => {
        setEngineFamilies([]);
      });
  }, []);

  return (
    <>
      <Navbar1 />
<<<<<<< HEAD
      {/* Header */}
      <div className="bg-white dark:bg-black">
        <div className="bg-white dark:bg-black">
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
                    VTC CHENNAI
                  </h1>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-red-500">
                    NEW ENGINE
                  </h2>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* Tab Buttons */}
                {["Job Order", "Vehicle", "Engine"].map((tab) => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? "default" : "outline"}
                    onClick={() => handleTabClick(tab)}
                    className={`rounded-xl ${
                      tab === "Job Order"
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : tab === "Vehicle" || tab === "Engine"
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "text-red-500 border-red-500 hover:bg-red-50"
                    }`}
                  >
                    {tab}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardContent className="p-6">
            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Engine Build Level */}
              <div className="space-y-2">
                <Label htmlFor="engineBuildLevel">Engine Build Level</Label>
                <Input
                  id="engineBuildLevel"
                  value={formData.engineBuildLevel}
                  onChange={(e) =>
                    handleInputChange("engineBuildLevel", e.target.value)
                  }
                  placeholder="Enter Engine Build Level"
                />
              </div>
              {/* Engine Serial Number */}
              <div className="space-y-2">
                <Label htmlFor="engineSerialNumber">Engine Serial Number <span className="text-red-500">*</span></Label>
                <Input
                  id="engineSerialNumber"
                  value={formData.engineSerialNumber}
                  onChange={(e) =>
                    handleInputChange("engineSerialNumber", e.target.value)
                  }
                  placeholder="Enter Engine Serial Number"
                />
              </div>
              {/* Engine Type */}
              <div className="space-y-2">
                <Label htmlFor="engineType">Engine Type</Label>
                <Input
                  id="engineType"
                  value={formData.engineType}
                  onChange={(e) =>
                    handleInputChange("engineType", e.target.value)
                  }
                  placeholder="Enter Engine Type"
                />
              </div>
              {/* Engine Capacity */}
              <div className="space-y-2">
                <Label htmlFor="engineCapacity">Engine Capacity (cc)</Label>
                <Input
                  id="engineCapacity"
                  value={formData.engineCapacity}
                  onChange={(e) =>
                    handleInputChange("engineCapacity", e.target.value)
                  }
                  placeholder="Enter Engine Capacity (cc)"
                />
              </div>
              {/* Number of Cylinders */}
              <div className="space-y-2">
                <Label htmlFor="numberOfCylinders">Number of Cylinders</Label>
                <Input
                  id="numberOfCylinders"
                  value={formData.numberOfCylinders}
                  onChange={(e) =>
                    handleInputChange("numberOfCylinders", e.target.value)
                  }
                  placeholder="Enter Number of Cylinders"
                />
              </div>
              {/* Compression Ratio */}
              <div className="space-y-2">
                <Label htmlFor="compressionRatio">Compression Ratio</Label>
                <Input
                  id="compressionRatio"
                  value={formData.compressionRatio}
                  onChange={(e) =>
                    handleInputChange("compressionRatio", e.target.value)
                  }
                  placeholder="Enter"
                />
              </div>
              {/* Bore */}
              <div className="space-y-2">
                <Label htmlFor="bore">Bore (mm)</Label>
                <Input
                  id="bore"
                  value={formData.bore}
                  onChange={(e) =>
                    handleInputChange("bore", e.target.value)
                  }
                  placeholder="Enter Bore (mm)"
                />
              </div>
              {/* Stroke */}
              <div className="space-y-2">
                <Label htmlFor="stroke">Stroke (mm)</Label>
                <Input
                  id="stroke"
                  value={formData.stroke}
                  onChange={(e) =>
                    handleInputChange("stroke", e.target.value)
                  }
                  placeholder="Enter Stroke (mm)"
                />
              </div>
              {/* Vacuum Modulator Make */}
              <div className="space-y-2">
                <Label htmlFor="vacuumModulatorMake">Vacuum Modulator Make</Label>
                <Input
                  id="vacuumModulatorMake"
                  value={formData.vacuumModulatorMake}
                  onChange={(e) =>
                    handleInputChange("vacuumModulatorMake", e.target.value)
                  }
                  placeholder="Enter Vacuum Modulator Make"
                />
              </div>
              {/* Vacuum Modulator Details */}
              <div className="space-y-2">
                <Label htmlFor="vacuumModulatorDetails">Vacuum Modulator Details</Label>
                <Input
                  id="vacuumModulatorDetails"
                  value={formData.vacuumModulatorDetails}
                  onChange={(e) =>
                    handleInputChange("vacuumModulatorDetails", e.target.value)
                  }
                  placeholder="Enter Vacuum Modulator Details"
                />
              </div>
              {/* ECU Make */}
              <div className="space-y-2">
                <Label htmlFor="ecuMake">ECU Make</Label>
                <Input
                  id="ecuMake"
                  value={formData.ecuMake}
                  onChange={(e) =>
                    handleInputChange("ecuMake", e.target.value)
                  }
                  placeholder="Enter ECU Make"
                />
              </div>
              {/* ECU ID Number */}
              <div className="space-y-2">
                <Label htmlFor="ecuIdNumber">ECU ID Number</Label>
                <Input
                  id="ecuIdNumber"
                  value={formData.ecuIdNumber}
                  onChange={(e) =>
                    handleInputChange("ecuIdNumber", e.target.value)
                  }
                  placeholder="Enter ECU ID Number"
                />
              </div>
              {/* ECU Dataset Number */}
              <div className="space-y-2">
                <Label htmlFor="ecuDatasetNumber">ECU Dataset Number</Label>
                <Input
                  id="ecuDatasetNumber"
                  value={formData.ecuDatasetNumber}
                  onChange={(e) =>
                    handleInputChange("ecuDatasetNumber", e.target.value)
                  }
                  placeholder="Enter ECU Dataset Number"
                />
              </div>
              {/* ECU Dataset Details */}
              <div className="space-y-2">
                <Label htmlFor="ecuDatasetDetails">ECU Dataset Details</Label>
                <Input
                  id="ecuDatasetDetails"
                  value={formData.ecuDatasetDetails}
                  onChange={(e) =>
                    handleInputChange("ecuDatasetDetails", e.target.value)
                  }
                  placeholder="Enter ECU Dataset Details"
                />
              </div>
              {/* Injector Type */}
              <div className="space-y-2">
                <Label htmlFor="injectorType">Injector Type</Label>
                <Input
                  id="injectorType"
                  value={formData.injectorType}
                  onChange={(e) =>
                    handleInputChange("injectorType", e.target.value)
                  }
                  placeholder="Enter Injector Type"
                />
              </div>
              {/* Turbocharger Type */}
              <div className="space-y-2">
                <Label htmlFor="turbochargerType">Turbocharger Type</Label>
                <Input
                  id="turbochargerType"
                  value={formData.turbochargerType}
                  onChange={(e) =>
                    handleInputChange("turbochargerType", e.target.value)
                  }
                  placeholder="Enter Turbocharger Type"
                />
              </div>
              {/* Blow by Recirculation */}
              <div className="space-y-2">
                <Label>Blow by Recirculation</Label>
                <RadioGroup
                  value={formData.blowByRecirculation}
                  onValueChange={(value) =>
                    handleInputChange("blowByRecirculation", value)
                  }
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="blow-yes" />
                      <Label htmlFor="blow-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="blow-no" />
                      <Label htmlFor="blow-no">No</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              {/* Blow by Recirculation Details */}
              <div className="space-y-2">
                <Label htmlFor="blowByRecirculationDetails">Blow by Recirculation Details</Label>
                <Input
                  id="blowByRecirculationDetails"
                  value={formData.blowByRecirculationDetails}
                  onChange={(e) =>
                    handleInputChange("blowByRecirculationDetails", e.target.value)
                  }
                  placeholder="Enter Blow by Recirculation Details"
                />
              </div>
              {/* Nozzle Number of Holes */}
              <div className="space-y-2">
                <Label htmlFor="nozzleNumberOfHoles">Nozzle Number of Holes</Label>
                <Input
                  id="nozzleNumberOfHoles"
                  value={formData.nozzleNumberOfHoles}
                  onChange={(e) =>
                    handleInputChange("nozzleNumberOfHoles", e.target.value)
                  }
                  placeholder="Enter Nozzle Number of Holes"
                />
              </div>
              {/* Nozzle Through Flow */}
              <div className="space-y-2">
                <Label htmlFor="nozzleThroughFlow">Nozzle Through Flow</Label>
                <Input
                  id="nozzleThroughFlow"
                  value={formData.nozzleThroughFlow}
                  onChange={(e) =>
                    handleInputChange("nozzleThroughFlow", e.target.value)
                  }
                  placeholder="Enter Nozzle Through Flow"
                />
              </div>
              {/* EGR Valve Make */}
              <div className="space-y-2">
                <Label htmlFor="egrValveMake">EGR Valve Make</Label>
                <Input
                  id="egrValveMake"
                  value={formData.egrValveMake}
                  onChange={(e) =>
                    handleInputChange("egrValveMake", e.target.value)
                  }
                  placeholder="Enter EGR Valve Make"
                />
              </div>
              {/* EGR Valve Type */}
              <div className="space-y-2">
                <Label htmlFor="egrValveType">EGR Valve Type</Label>
                <Input
                  id="egrValveType"
                  value={formData.egrValveType}
                  onChange={(e) =>
                    handleInputChange("egrValveType", e.target.value)
                  }
                  placeholder="Enter EGR Valve Type"
                />
              </div>
              {/* EGR Valve Diameter */}
              <div className="space-y-2">
                <Label htmlFor="egrValveDiameter">EGR Valve Diameter (mm)</Label>
                <Input
                  id="egrValveDiameter"
                  value={formData.egrValveDiameter}
                  onChange={(e) =>
                    handleInputChange("egrValveDiameter", e.target.value)
                  }
                  placeholder="Enter EGR Valve Diameter (mm)"
                />
              </div>
              {/* EGR Cooler Make */}
              <div className="space-y-2">
                <Label htmlFor="egrCoolerMake">EGR Cooler Make</Label>
                <Input
                  id="egrCoolerMake"
                  value={formData.egrCoolerMake}
                  onChange={(e) =>
                    handleInputChange("egrCoolerMake", e.target.value)
                  }
                  placeholder="Enter EGR Cooler Make"
                />
              </div>
              {/* EGR Cooler Capacity */}
              <div className="space-y-2">
                <Label htmlFor="egrCoolerCapacity">EGR Cooler Capacity (kW)</Label>
                <Input
                  id="egrCoolerCapacity"
                  value={formData.egrCoolerCapacity}
                  onChange={(e) =>
                    handleInputChange("egrCoolerCapacity", e.target.value)
                  }
                  placeholder="Enter EGR Cooler Capacity (kW)"
                />
              </div>
              {/* CAFCON Mass */}
              <div className="space-y-2">
                <Label htmlFor="cafconMass">CAFCON Mass</Label>
                <Input
                  id="cafconMass"
                  value={formData.cafconMass}
                  onChange={(e) =>
                    handleInputChange("cafconMass", e.target.value)
                  }
                  placeholder="Enter CAFCON Mass"
                />
              </div>
              {/* CAFCON Type */}
              <div className="space-y-2">
                <Label htmlFor="cafconType">CAFCON Type</Label>
                <Input
                  id="cafconType"
                  value={formData.cafconType}
                  onChange={(e) =>
                    handleInputChange("cafconType", e.target.value)
                  }
                  placeholder="Enter CAFCON Type"
                />
              </div>
              {/* CAFCON Loading */}
              <div className="space-y-2">
                <Label htmlFor="cafconLoading">CAFCON Loading</Label>
                <Input
                  id="cafconLoading"
                  value={formData.cafconLoading}
                  onChange={(e) =>
                    handleInputChange("cafconLoading", e.target.value)
                  }
                  placeholder="Enter CAFCON Loading"
                />
              </div>
              {/* DPF Make */}
              <div className="space-y-2">
                <Label htmlFor="dpfMake">DPF Make</Label>
                <Input
                  id="dpfMake"
                  value={formData.dpfMake}
                  onChange={(e) =>
                    handleInputChange("dpfMake", e.target.value)
                  }
                  placeholder="Enter DPF Make"
                />
              </div>
              {/* DPF Capacity */}
              <div className="space-y-2">
                <Label htmlFor="dpfCapacity">DPF Capacity</Label>
                <Input
                  id="dpfCapacity"
                  value={formData.dpfCapacity}
                  onChange={(e) =>
                    handleInputChange("dpfCapacity", e.target.value)
                  }
                  placeholder="Enter DPF Capacity"
                />
              </div>
              {/* SCR Make */}
              <div className="space-y-2">
                <Label htmlFor="scrMake">SCR Make</Label>
                <Input
                  id="scrMake"
                  value={formData.scrMake}
                  onChange={(e) =>
                    handleInputChange("scrMake", e.target.value)
                  }
                  placeholder="Enter SCR Make"
                />
              </div>
              {/* SCR Capacity */}
              <div className="space-y-2">
                <Label htmlFor="scrCapacity">SCR Capacity</Label>
                <Input
                  id="scrCapacity"
                  value={formData.scrCapacity}
                  onChange={(e) =>
                    handleInputChange("scrCapacity", e.target.value)
                  }
                  placeholder="Enter SCR Capacity"
                />
              </div>
              {/* A/C Compressor */}
              <div className="space-y-2">
                <Label>A/C Compressor</Label>
                <RadioGroup
                  value={formData.acCompressor}
                  onValueChange={(value) =>
                    handleInputChange("acCompressor", value)
                  }
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="ac-yes" />
                      <Label htmlFor="ac-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="ac-no" />
                      <Label htmlFor="ac-no">No</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              {/* A/C Compressor Details */}
              <div className="space-y-2">
                <Label htmlFor="acCompressorDetails">A/C Compressor Details</Label>
                <Input
                  id="acCompressorDetails"
                  value={formData.acCompressorDetails}
                  onChange={(e) =>
                    handleInputChange("acCompressorDetails", e.target.value)
                  }
                  placeholder="Enter A/C Compressor Details"
                />
              </div>
              {/* Power Steering Pump */}
              <div className="space-y-2">
                <Label htmlFor="powerSteeringPump">Power Steering Pump</Label>
                <Input
                  id="powerSteeringPump"
                  value={formData.powerSteeringPump}
                  onChange={(e) =>
                    handleInputChange("powerSteeringPump", e.target.value)
                  }
                  placeholder="Enter Power Steering Pump"
                />
              </div>
              {/* Power Steering Details */}
              <div className="space-y-2">
                <Label htmlFor="powerSteeringDetails">Power Steering Details</Label>
                <Input
                  id="powerSteeringDetails"
                  value={formData.powerSteeringDetails}
                  onChange={(e) =>
                    handleInputChange("powerSteeringDetails", e.target.value)
                  }
                  placeholder="Enter Power Steering Details"
                />
              </div>
              {/* Water by pass */}
              <div className="space-y-2">
                <Label htmlFor="waterByPass">Water by pass</Label>
                <Input
                  id="waterByPass"
                  value={formData.waterByPass}
                  onChange={(e) =>
                    handleInputChange("waterByPass", e.target.value)
                  }
                  placeholder="Enter Water by pass"
                />
              </div>
              {/* Kerb Weight EMW */}
              <div className="space-y-2">
                <Label htmlFor="kerbWeightEmw">Kerb Weight EMW (Kg) <span className="text-red-500">*</span></Label>
                <Input
                  id="kerbWeightEmw"
                  value={formData.kerbWeightEmw}
                  onChange={(e) =>
                    handleInputChange("kerbWeightEmw", e.target.value)
                  }
                  placeholder="Enter Kerb Weight EMW (Kg)"
                />
              </div>
              {/* Kerb Weight RMW */}
              <div className="space-y-2">
                <Label htmlFor="kerbWeightRmw">Kerb Weight RMW (Kg) <span className="text-red-500">*</span></Label>
                <Input
                  id="kerbWeightRmw"
                  value={formData.kerbWeightRmw}
                  onChange={(e) =>
                    handleInputChange("kerbWeightRmw", e.target.value)
                  }
                  placeholder="Enter Kerb Weight RMW (Kg)"
                />
              </div>
              {/* Emission Status */}
              <div className="space-y-2">
                <Label htmlFor="emissionStatus">Emission Status of the Vehicle</Label>
                <Input
                  id="emissionStatus"
                  value={formData.emissionStatus}
                  onChange={(e) =>
                    handleInputChange("emissionStatus", e.target.value)
                  }
                  placeholder="Enter Emission Status of the Vehicle"
                />
              </div>
              {/* Thermostat Details */}
              <div className="space-y-2">
                <Label htmlFor="thermostatDetails">Thermostat Details</Label>
                <Textarea
                  id="thermostatDetails"
                  value={formData.thermostatDetails}
                  onChange={(e) =>
                    handleInputChange("thermostatDetails", e.target.value)
                  }
                  placeholder="Enter Thermostat Details"
                  className="min-h-[80px]"
                />
              </div>
              {/* Vehicle Serial Number */}
              <div className="space-y-2">
                <Label htmlFor="vehicleSerialNumber">Vehicle Serial Number <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.vehicleSerialNumber}
                  onValueChange={(value) =>
                    handleInputChange("vehicleSerialNumber", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Vehicle Serial No" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VSN001">VSN001</SelectItem>
                    <SelectItem value="VSN002">VSN002</SelectItem>
                    <SelectItem value="VSN003">VSN003</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Engine Family */}
              <div className="space-y-2">
                <Label htmlFor="engineFamily">Engine Family</Label>
                <Select
                  value={formData.engineFamily}
                  onValueChange={(value) =>
                    handleInputChange("engineFamily", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Engine Family" />
                  </SelectTrigger>
                  <SelectContent>
                    {engineFamilies.length > 0 ? (
                      engineFamilies.map((family) => (
                        <SelectItem
                          key={family.value || family.id || family}
                          value={family}
                        >
                          {family}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem disabled>
                        No Engine Families Available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {/* HV Battery Make */}
              <div className="space-y-2">
                <Label htmlFor="hvBatteryMake">HV Battery Make</Label>
                <Input
                  id="hvBatteryMake"
                  value={formData.hvBatteryMake}
                  onChange={(e) =>
                    handleInputChange("hvBatteryMake", e.target.value)
                  }
                  placeholder="Enter HV Battery Make"
                />
              </div>
              {/* HV Battery Capacity */}
              <div className="space-y-2">
                <Label htmlFor="hvBatteryCapacity">HV Battery Capacity</Label>
                <Input
                  id="hvBatteryCapacity"
                  value={formData.hvBatteryCapacity}
                  onChange={(e) =>
                    handleInputChange("hvBatteryCapacity", e.target.value)
                  }
                  placeholder="Enter HV Battery Capacity"
                />
              </div>
              {/* HV Battery Voltage (V) */}
              <div className="space-y-2">
                <Label htmlFor="hvBatteryVoltage">HV Battery Voltage (V)</Label>
                <Input
                  id="hvBatteryVoltage"
                  value={formData.hvBatteryVoltage}
                  onChange={(e) =>
                    handleInputChange("hvBatteryVoltage", e.target.value)
                  }
                  placeholder="Enter HV Battery Voltage (V)"
                />
              </div>
              {/* HV Battery Current (A) */}
              <div className="space-y-2">
                <Label htmlFor="hvBatteryCurrent">HV Battery Current (A)</Label>
                <Input
                  id="hvBatteryCurrent"
                  value={formData.hvBatteryCurrent}
                  onChange={(e) =>
                    handleInputChange("hvBatteryCurrent", e.target.value)
                  }
                  placeholder="Enter HV Battery Current (A)"
                />
              </div>
              {/* EV Motor Power (KW) */}
              <div className="space-y-2">
                <Label htmlFor="evMotorPower">EV Motor Power (KW)</Label>
                <Input
                  id="evMotorPower"
                  value={formData.evMotorPower}
                  onChange={(e) =>
                    handleInputChange("evMotorPower", e.target.value)
                  }
                  placeholder="Enter EV Motor Power (KW)"
                />
              </div>
            </div>
            {/* Required Field Note */}
            <div className="mt-6">
              <p className="text-sm text-red-500 dark:text-red-500">
                <span className="text-red-500">*</span>required field
              </p>
            </div>
            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={handleAddEngine}
                className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-6"
              >
                ✓ ADD ENGINE
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-6"
              >
                ✕ CLEAR
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
=======
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
              <Typography color="error" variant="body2">
                {error}
              </Typography>
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
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 4,
              }}
            >
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
>>>>>>> 8b7e59de8e94031cc891e8917d4a53bfec9669bc
    </>
  );
}
