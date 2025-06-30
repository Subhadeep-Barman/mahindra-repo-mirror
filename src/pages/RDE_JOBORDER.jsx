"use client";

import { useState } from "react";
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
import { Switch } from "@/components/UI/switch";
import { Badge } from "@/components/UI/badge";
import { Card, CardContent } from "@/components/UI/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UploadIcon from "@mui/icons-material/Upload";
import EyeIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import GroupIcon from "@mui/icons-material/Group";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import { ArrowBack, Add } from "@mui/icons-material";
import { Calendar } from "@/components/UI/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/UI/popover";
import { format } from "date-fns";
import Navbar1 from "@/components/UI/navbar";

export default function CJobOrder() {
  const [showFiles, setShowFiles] = useState(false);
  const [showCFTModal, setShowCFTModal] = useState(false);
  const [cftMode, setCftMode] = useState("SINGLE"); // "SINGLE" or "GROUP"
  const [cftMembers, setCftMembers] = useState([{ id: 1, value: "" }]);
  const [newCftMember, setNewCftMember] = useState("");
  const [formData, setFormData] = useState({
    testType: "HOT BOLT CYCLE (Dilute Only)",
    objective: "TEST 1",
    vehicleLocation: "",
    cycleGearShift: "",
    inertiaClass: "FA 625 WITHOUT 1.3",
    datasetName: "",
    dpf: "Yes",
    datasetFlashed: "Yes",
    ess: "On",
    mode: "",
    hardwareChange: "",
    instructions: "",
    shift: "",
    coastDownData: false,
    cdReference: "",
    vehicleRefMass: "",
    aN: "",
    bN: "",
    cN: "",
    f0N: "",
    f1N: "",
    f2N: "",
  });
  const [activeTab, setActiveTab] = useState("Job Order");
  const [preferredDate, setPreferredDate] = useState(new Date(2021, 11, 10));
  const [uploadedFiles, setUploadedFiles] = useState([
    "1.pdf",
    "2.pdf",
    "3.pdf",
    "4.pdf",
  ]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleAddTest = () => {
    console.log("Add Test:", formData);
  };

  const handleCloneTest = () => {
    console.log("Clone Test:", formData);
  };

  const handleCFTMembers = () => {
    setShowCFTModal(true);
  };

  const handleAddCftMember = () => {
    setCftMembers([...cftMembers, { id: Date.now(), value: "" }]);
  };

  const handleRemoveCftMember = (id) => {
    setCftMembers(cftMembers.filter((member) => member.id !== id));
  };

  const handleCftMemberChange = (id, value) => {
    setCftMembers(
      cftMembers.map((member) =>
        member.id === id ? { ...member, value } : member
      )
    );
  };

  const handleApplyCFT = () => {
    console.log("Applied CFT Members:", cftMembers, "Mode:", cftMode);
    setShowCFTModal(false);
  };

  const handleCFTModeChange = (mode) => {
    setCftMode(mode);
    if (mode === "SINGLE" && cftMembers.length > 1) {
      setCftMembers([cftMembers[0]]);
    }
  };

  const handleCreateJobOrder = () => {
    console.log("Create Job Order:", formData);
  };

  const handleClear = () => {
    setFormData({
      testType: "",
      objective: "",
      vehicleLocation: "",
      cycleGearShift: "",
      inertiaClass: "",
      datasetName: "",
      dpf: "",
      datasetFlashed: "",
      ess: "",
      mode: "",
      hardwareChange: "",
      instructions: "",
      shift: "",
      coastDownData: false,
    });
  };

  const handleBack = () => {
    console.log("Navigate back");
  };
  const handleUploadDocument = () => {
    console.log("Upload Document");
  };

  const handleViewFiles = () => {
    setShowFiles(!showFiles);
  };

  return (
    <>
      <Navbar1 />
      <div className=" dark:bg-black">
        {/* Header */}
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

        <div className="max-w-8xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-6">
                  {/* Test Header */}
                  <div className="mb-2">
                    <Badge className="bg-yellow-400 text-black hover:bg-yellow-500 mb-2">
                      Test 1
                    </Badge>
                    <div className="text-sm text-gray-600 dark:text-red-500">
                      <p>Test Created By: SANKAR SURESH (SANKSU-CONT)</p>
                      <p>Test Created On: 10-12-2021 11:50 AM</p>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Test Type */}
                    <div className="space-y-2">
                      <Label htmlFor="testType">Test Type</Label>
                      <Select
                        value={formData.testType}
                        onValueChange={(value) =>
                          handleInputChange("testType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Test Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HOT BOLT CYCLE (Dilute Only)">
                            HOT BOLT CYCLE (Dilute Only)
                          </SelectItem>
                          <SelectItem value="COLD BOLT CYCLE">
                            COLD BOLT CYCLE
                          </SelectItem>
                          <SelectItem value="WARM BOLT CYCLE">
                            WARM BOLT CYCLE
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Objective */}
                    <div className="space-y-2">
                      <Label htmlFor="objective">Objective of the Test *</Label>
                      <Input
                        id="objective"
                        value={formData.objective}
                        onChange={(e) =>
                          handleInputChange("objective", e.target.value)
                        }
                        placeholder="Enter objective"
                      />
                    </div>

                    {/* Vehicle Location */}
                    <div className="space-y-2">
                      <Label htmlFor="vehicleLocation">Vehicle Location</Label>
                      <Textarea
                        id="vehicleLocation"
                        value={formData.vehicleLocation}
                        onChange={(e) =>
                          handleInputChange("vehicleLocation", e.target.value)
                        }
                        placeholder="Enter Vehicle Location"
                        className="min-h-[20px]"
                      />
                    </div>

                    {/* Cycle Gear Shift */}
                    <div className="space-y-2">
                      <Label htmlFor="cycleGearShift">Cycle Gear Shift</Label>
                      <Input
                        id="cycleGearShift"
                        value={formData.cycleGearShift}
                        onChange={(e) =>
                          handleInputChange("cycleGearShift", e.target.value)
                        }
                        placeholder="Enter Cycle Gear Shift"
                      />
                    </div>

                    {/* Inertia Class */}
                    <div className="space-y-2">
                      <Label htmlFor="inertiaClass">Inertia Class</Label>
                      <Select
                        value={formData.inertiaClass}
                        onValueChange={(value) =>
                          handleInputChange("inertiaClass", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Inertia Class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FA 625 WITHOUT 1.3">
                            FA 625 WITHOUT 1.3
                          </SelectItem>
                          <SelectItem value="FA 625 WITH 1.3">
                            FA 625 WITH 1.3
                          </SelectItem>
                          <SelectItem value="FA 750">FA 750</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dataset Name */}
                    <div className="space-y-2">
                      <Label htmlFor="datasetName">Dataset Name</Label>
                      <Input
                        id="datasetName"
                        value={formData.datasetName}
                        onChange={(e) =>
                          handleInputChange("datasetName", e.target.value)
                        }
                        placeholder="Enter Dataset Name"
                      />
                    </div>

                    {/* DPF */}
                    <div className="space-y-2">
                      <Label>DPF</Label>
                      <RadioGroup
                        value={formData.dpf}
                        onValueChange={(value) =>
                          handleInputChange("dpf", value)
                        }
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="dpf-yes" />
                            <Label htmlFor="dpf-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="dpf-no" />
                            <Label htmlFor="dpf-no">No</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="NA" id="dpf-na" />
                            <Label htmlFor="dpf-na">NA</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Data-set Flashed */}
                    <div className="space-y-2">
                      <Label>Data-set Flashed</Label>
                      <RadioGroup
                        value={formData.datasetFlashed}
                        onValueChange={(value) =>
                          handleInputChange("datasetFlashed", value)
                        }
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="flashed-yes" />
                            <Label htmlFor="flashed-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="flashed-no" />
                            <Label htmlFor="flashed-no">No</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* ESS */}
                    <div className="space-y-2">
                      <Label>ESS</Label>
                      <RadioGroup
                        value={formData.ess}
                        onValueChange={(value) =>
                          handleInputChange("ess", value)
                        }
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="On" id="ess-on" />
                            <Label htmlFor="ess-on">On</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Off" id="ess-off" />
                            <Label htmlFor="ess-off">Off</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="NA" id="ess-na" />
                            <Label htmlFor="ess-na">NA</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Mode */}
                    <div className="space-y-2">
                      <Label htmlFor="mode">Mode</Label>
                      <Select
                        value={formData.mode}
                        onValueChange={(value) =>
                          handleInputChange("mode", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mode 1">Mode 1</SelectItem>
                          <SelectItem value="Mode 2">Mode 2</SelectItem>
                          <SelectItem value="Mode 3">Mode 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Hardware Change */}
                    <div className="space-y-2">
                      <Label htmlFor="hardwareChange">Hardware Change</Label>
                      <Input
                        id="hardwareChange"
                        value={formData.hardwareChange}
                        onChange={(e) =>
                          handleInputChange("hardwareChange", e.target.value)
                        }
                        placeholder="Enter Hardware Change"
                      />
                    </div>

                    {/* Shift */}
                    <div className="space-y-2">
                      <Label htmlFor="shift">Shift</Label>
                      <Select
                        value={formData.shift}
                        onValueChange={(value) =>
                          handleInputChange("shift", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Day Shift">Day Shift</SelectItem>
                          <SelectItem value="Night Shift">
                            Night Shift
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Preferred Date */}
                    <div className="space-y-2">
                      <Label>Preferred Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarTodayIcon className="mr-2 h-4 w-4" />
                            {preferredDate
                              ? format(preferredDate, "dd-MM-yyyy")
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={preferredDate}
                            onSelect={(date) => date && setPreferredDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mt-2 space-y-2">
                    <Label htmlFor="instructions">
                      Any Specific Instruction to VTC Team
                    </Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) =>
                        handleInputChange("instructions", e.target.value)
                      }
                      placeholder="Enter Instructions"
                      className="min-h-[20px]"
                    />
                  </div>

                  {/* Coast Down Data Toggle and Form */}
                  <div className="mt-2 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="coastDownData"
                        checked={formData.coastDownData}
                        onCheckedChange={(checked) =>
                          handleInputChange("coastDownData", checked)
                        }
                      />
                      <Label htmlFor="coastDownData">Coast Down Data(CD)</Label>
                    </div>

                    {formData.coastDownData && (
                      <div className="space-y-4 p-4 border rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Coast Down Test Report Reference */}
                          <div className="space-y-2">
                            <Label htmlFor="cdReference">
                              Coast Down Test Report Reference *
                            </Label>
                            <Input
                              id="cdReference"
                              value={formData.cdReference}
                              onChange={(e) =>
                                handleInputChange("cdReference", e.target.value)
                              }
                              placeholder="Enter Coast Test Report Ref."
                            />
                          </div>

                          {/* Vehicle Reference mass */}
                          <div className="space-y-2">
                            <Label htmlFor="vehicleRefMass">
                              Vehicle Reference mass (Kg) *
                            </Label>
                            <Input
                              id="vehicleRefMass"
                              value={formData.vehicleRefMass}
                              onChange={(e) =>
                                handleInputChange(
                                  "vehicleRefMass",
                                  e.target.value
                                )
                              }
                              placeholder="Enter Vehicle Reference Mass (Kg)"
                              type="number"
                            />
                          </div>

                          {/* A (N) */}
                          <div className="space-y-2">
                            <Label htmlFor="aN">A (N) *</Label>
                            <Input
                              id="aN"
                              value={formData.aN}
                              onChange={(e) =>
                                handleInputChange("aN", e.target.value)
                              }
                              placeholder="Enter A (N)"
                              type="number"
                            />
                          </div>

                          {/* B (N/kmph) */}
                          <div className="space-y-2">
                            <Label htmlFor="bN">B (N/kmph) *</Label>
                            <Input
                              id="bN"
                              value={formData.bN}
                              onChange={(e) =>
                                handleInputChange("bN", e.target.value)
                              }
                              placeholder="Enter B(N/kmph)"
                              type="number"
                            />
                          </div>

                          {/* C (N/kmph^2) */}
                          <div className="space-y-2">
                            <Label htmlFor="cN">C (N/kmph^2) *</Label>
                            <Input
                              id="cN"
                              value={formData.cN}
                              onChange={(e) =>
                                handleInputChange("cN", e.target.value)
                              }
                              placeholder="Enter C (N/kmph^2)"
                              type="number"
                            />
                          </div>

                          {/* F0 (N) */}
                          <div className="space-y-2">
                            <Label htmlFor="f0N">F0 (N) *</Label>
                            <Input
                              id="f0N"
                              value={formData.f0N}
                              onChange={(e) =>
                                handleInputChange("f0N", e.target.value)
                              }
                              placeholder="Enter F0 (N)"
                              type="number"
                            />
                          </div>

                          {/* F1 (N/(km/h)) */}
                          <div className="space-y-2">
                            <Label htmlFor="f1N">F1 (N/(km/h)) *</Label>
                            <Input
                              id="f1N"
                              value={formData.f1N}
                              onChange={(e) =>
                                handleInputChange("f1N", e.target.value)
                              }
                              placeholder="Enter F1 (N/(km/h))"
                              type="number"
                            />
                          </div>

                          {/* F2 (N/(km/h)^2) */}
                          <div className="space-y-2">
                            <Label htmlFor="f2N">F2 (N/(km/h)^2) *</Label>
                            <Input
                              id="f2N"
                              value={formData.f2N}
                              onChange={(e) =>
                                handleInputChange("f2N", e.target.value)
                              }
                              placeholder="Enter F2 (N/(km/h)^2)"
                              type="number"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - Moved to bottom right */}
                  <div className="mt-8 flex justify-end gap-3">
                    {/* Removed CREATE JOB ORDER and CLEAR buttons */}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-2 flex flex-wrap gap-3">
                    <Button
                      onClick={handleAddTest}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
                    >
                      <AddIcon className="mr-2 h-4 w-4" />
                      ADD TEST
                    </Button>
                    <Button
                      onClick={handleCloneTest}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
                    >
                      <FileCopyIcon className="mr-2 h-4 w-4" />
                      CLONE TEST
                    </Button>
                    <Button
                      onClick={handleCFTMembers}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
                    >
                      <GroupIcon className="mr-2 h-4 w-4" />
                      CFT MEMBERS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-red-500">
                      Label
                    </h3>

                    {/* Upload Document */}
                    <Button
                      onClick={handleUploadDocument}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Upload Document
                    </Button>

                    {/* Upload Status */}
                    <div className="text-sm text-green-600">
                      ✓ Files uploaded successfully
                    </div>
                    {/* View Files */}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-blue-600"
                      onClick={handleViewFiles}
                    >
                      <EyeIcon className="mr-1 h-4 w-4" />
                      View File Uploaded
                    </Button>

                    {/* File List */}
                    <div
                      className={`flex flex-wrap gap-2 ${
                        showFiles ? "" : "hidden"
                      }`}
                    >
                      {uploadedFiles.map((file, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs dark:border-white border-gray-200"
                        >
                          {file}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Buttons directly below the card */}
              <div className="flex justify-between mt-2">
                <Button
                  onClick={handleCreateJobOrder}
                  className="flex-1 bg-red-500 text-white hover:bg-red-500 mr-2 rounded-xl"
                >
                  ✓ CREATE JOB ORDER
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="flex-1 bg-red-500 text-white hover:bg-red-500 mr-2 rounded-xl"
                >
                  ✕ CLEAR
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* CFT Members Modal */}
        <Dialog open={showCFTModal} onOpenChange={setShowCFTModal}>
          <DialogContent className="max-w-md">
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                ADD CFT MEMBERS
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Mode Selection */}
              <div className="flex gap-2">
                <Button
                  variant={cftMode === "SINGLE" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCFTModeChange("SINGLE")}
                  className={`flex items-center gap-2 ${
                    cftMode === "SINGLE"
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "text-red-500 border-red-500 hover:bg-red-50"
                  }`}
                >
                  <PersonIcon className="h-4 w-4" />
                  SINGLE
                </Button>
                <Button
                  variant={cftMode === "GROUP" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCFTModeChange("GROUP")}
                  className={`flex items-center gap-2 ${
                    cftMode === "GROUP"
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "text-red-500 border-red-500 hover:bg-red-50"
                  }`}
                >
                  <GroupAddIcon className="h-4 w-4" />
                  GROUP
                </Button>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                {cftMembers.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                  >
                    <span className="text-sm font-medium">
                      PERSON {index + 1}
                    </span>
                    <span className="text-sm text-gray-600">{member}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCftMember(index)}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                    >
                      <DeleteIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Add Member Input */}
                {(cftMode === "GROUP" || cftMembers.length === 0) && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter member name"
                        value={newCftMember}
                        onChange={(e) => setNewCftMember(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleAddCftMember();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleAddCftMember}
                        size="sm"
                        variant="outline"
                        className="px-3"
                      >
                        <Add className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>ADD CFT</span>
                      <Add className="h-4 w-4 text-red-500 border border-red-500 rounded-full p-1" />
                    </div>
                  </div>
                )}
              </div>

              {/* Apply Button */}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleApplyCFT}
                  className="bg-red-500 text-white hover:bg-red-600 rounded-xl"
                >
                  APPLY
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
