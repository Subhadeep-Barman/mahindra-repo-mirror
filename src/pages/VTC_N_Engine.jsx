"use client";

import { useState } from "react";
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

export default function EngineForm() {
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
  });

  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "Job Order") navigate("/nashik/joborder");
    else if (tab === "Vehicle") navigate("/nashik/vehicle");
    else if (tab === "Engine") navigate("/nashik/engine");
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
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddEngine = async () => {
    try {
      // Replace '/api/engine' with your actual backend endpoint
      const response = await axios.post('/api/engine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Failed to save engine data');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Navbar1 />

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
                    VTC Nashik
                  </h1>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-red-500">
                    NEW JOB ORDER
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
                    className={`rounded-xl ${tab === "Job Order"
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
                <Label htmlFor="engineSerialNumber">
                  Engine Serial Number <span className="text-red-500">*</span>
                </Label>
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
                  onChange={(e) => handleInputChange("bore", e.target.value)}
                  placeholder="Enter Bore (mm)"
                />
              </div>

              {/* Stroke */}
              <div className="space-y-2">
                <Label htmlFor="stroke">Stroke (mm)</Label>
                <Input
                  id="stroke"
                  value={formData.stroke}
                  onChange={(e) => handleInputChange("stroke", e.target.value)}
                  placeholder="Enter Stroke (mm)"
                />
              </div>

              {/* Vacuum Modulator Make */}
              <div className="space-y-2">
                <Label htmlFor="vacuumModulatorMake">
                  Vacuum Modulator Make
                </Label>
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
                <Label htmlFor="vacuumModulatorDetails">
                  Vacuum Modulator Details
                </Label>
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
                  onChange={(e) => handleInputChange("ecuMake", e.target.value)}
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
                <Label htmlFor="blowByRecirculationDetails">
                  Blow by Recirculation Details
                </Label>
                <Input
                  id="blowByRecirculationDetails"
                  value={formData.blowByRecirculationDetails}
                  onChange={(e) =>
                    handleInputChange(
                      "blowByRecirculationDetails",
                      e.target.value
                    )
                  }
                  placeholder="Enter Blow by Recirculation Details"
                />
              </div>

              {/* Nozzle Number of Holes */}
              <div className="space-y-2">
                <Label htmlFor="nozzleNumberOfHoles">
                  Nozzle Number of Holes
                </Label>
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
                <Label htmlFor="egrValveDiameter">
                  EGR Valve Diameter (mm)
                </Label>
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
                <Label htmlFor="egrCoolerCapacity">
                  EGR Cooler Capacity (kW)
                </Label>
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
                  onChange={(e) => handleInputChange("dpfMake", e.target.value)}
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
                  onChange={(e) => handleInputChange("scrMake", e.target.value)}
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
                <Label htmlFor="acCompressorDetails">
                  A/C Compressor Details
                </Label>
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
                <Label htmlFor="powerSteeringDetails">
                  Power Steering Details
                </Label>
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
                <Label htmlFor="kerbWeightEmw">
                  Kerb Weight EMW (Kg) <span className="text-red-500">*</span>
                </Label>
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
                <Label htmlFor="kerbWeightRmw">
                  Kerb Weight RMW (Kg) <span className="text-red-500">*</span>
                </Label>
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
                <Label htmlFor="emissionStatus">
                  Emission Status of the Vehicle
                </Label>
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
                <Label htmlFor="vehicleSerialNumber">
                  Vehicle Serial Number <span className="text-red-500">*</span>
                </Label>
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
                    <SelectItem value="Family1">Engine Family 1</SelectItem>
                    <SelectItem value="Family2">Engine Family 2</SelectItem>
                    <SelectItem value="Family3">Engine Family 3</SelectItem>
                  </SelectContent>
                </Select>
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
    </>
  );
}
