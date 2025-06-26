"use client"

import { useState } from "react"
import { Button } from "@/components/UI/button"
import { Input } from "@/components/UI/input"
import { Label } from "@/components/UI/label"
import { Textarea } from "@/components/UI/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select"
import { RadioGroup, RadioGroupItem } from "@/components/UI/radio-group"
import { Switch } from "@/components/UI/switch"
import { Badge } from "@/components/UI/badge"
import { Card, CardContent } from "@/components/UI/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/UI/dialog"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import UploadIcon from "@mui/icons-material/Upload"
import EyeIcon from "@mui/icons-material/Visibility"
import AddIcon from "@mui/icons-material/Add"
import FileCopyIcon from "@mui/icons-material/FileCopy"
import GroupIcon from "@mui/icons-material/Group"
import DeleteIcon from "@mui/icons-material/Delete"
import PersonIcon from "@mui/icons-material/Person"
import GroupAddIcon from "@mui/icons-material/GroupAdd"
import { ArrowBack, Add } from "@mui/icons-material"
import { Calendar } from "@/components/UI/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/UI/popover"
import { format } from "date-fns"
import Navbar2 from "@/components/UI/navbar2"
import { useNavigate } from "react-router-dom"

export default function CJobOrder() {
  const [showFiles, setShowFiles] = useState(false)
  const [showCFTModal, setShowCFTModal] = useState(false)
  const [cftMode, setCftMode] = useState("SINGLE")
  const [cftMembers, setCftMembers] = useState([{ id: 1, value: '' }])
  const [newCftMember, setNewCftMember] = useState("")
  const [formData, setFormData] = useState({
    projectCode: "",
    vehicleBodyNumber: "",
    vehicleNumber: "",
    engineNumber: "",
    engineType: "",
    domain: "",
    department: "",
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
    cdReference: "",
    vehicleRefMass: "",
    aN: "",
    bN: "",
    cN: "",
    f0N: "",
    f1N: "",
    f2N: "",
  })
  const [activeTab, setActiveTab] = useState("Job Order")
  const [preferredDate, setPreferredDate] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState([])

  const navigate = useNavigate()

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    if (tab === "Job Order") navigate("/cJobOrder")
    else if (tab === "Vehicle") navigate("/vtccvehicle")
    else if (tab === "Engine") navigate("/vtcchennaiengine")
  }

  const handleAddTest = () => {
    console.log("Add Test:", formData)
  }

  const handleCloneTest = () => {
    console.log("Clone Test:", formData)
  }

  const handleCFTMembers = () => setShowCFTModal(true)

  const handleAddCftMember = () => {
    if (newCftMember.trim()) {
      setCftMembers([...cftMembers, { id: Date.now(), value: newCftMember }])
      setNewCftMember("")
    }
  }

  const handleRemoveCftMember = (id) => {
    setCftMembers(cftMembers.filter(member => member.id !== id))
  }

  const handleCftMemberChange = (id, value) => {
    setCftMembers(cftMembers.map(member =>
      member.id === id ? { ...member, value } : member
    ))
  }

  const handleApplyCFT = () => {
    console.log("Applied CFT Members:", cftMembers, "Mode:", cftMode)
    setShowCFTModal(false)
  }

  const handleCFTModeChange = (mode) => {
    setCftMode(mode)
    if (mode === "SINGLE" && cftMembers.length > 1) {
      setCftMembers([cftMembers[0]])
    }
  }

  const handleCreateJobOrder = () => {
    navigate("/Chennai_create_joborder")
  }

  const handleClear = () => {
    setFormData({
      projectCode: "",
      vehicleBodyNumber: "",
      vehicleNumber: "",
      engineNumber: "",
      engineType: "",
      domain: "",
      department: "",
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
      cdReference: "",
      vehicleRefMass: "",
      aN: "",
      bN: "",
      cN: "",
      f0N: "",
      f1N: "",
      f2N: "",
    })
  }

  const handleBack = () => navigate(-1)
  const handleUploadDocument = () => console.log("Upload Document")
  const handleViewFiles = () => setShowFiles(!showFiles)

  return (
    <>
      <Navbar2 />
      <div className="dark:bg-black">
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
                  <h1 className="text-sm font-medium text-gray-600 dark:text-red-500">VTC CHENNAI</h1>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-red-500">NEW JOB ORDER</h2>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {["Job Order", "Vehicle", "Engine"].map((tab) => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? "default" : "outline"}
                    onClick={() => handleTabClick(tab)}
                    className={`rounded-xl ${
                      activeTab === tab
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
                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* ...form fields as before... */}
                    {/* (Omitted for brevity, keep your form fields here) */}
                  </div>
                  {/* Instructions */}
                  <div className="mt-2 space-y-2">
                    <Label htmlFor="instructions">Any Specific Instruction to VTC Team</Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => handleInputChange("instructions", e.target.value)}
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
                        onCheckedChange={(checked) => handleInputChange("coastDownData", checked)}
                      />
                      <Label htmlFor="coastDownData">Coast Down Data(CD)</Label>
                    </div>
                    {formData.coastDownData && (
                      <div className="space-y-4 p-4 border rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* ...coast down fields as before... */}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Test Header */}
                  <div className="mb-2 mt-4">
                    <Badge className="bg-yellow-400 text-black hover:bg-yellow-500 mb-2">Test 1</Badge>
                    <div className="text-sm text-gray-600 dark:text-red-500">
                      <p>Test Created By: SANKAR SURESH (SANKSU-CONT)</p>
                      <p>Test Created On: 10-12-2021 11:50 AM</p>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="mt-2 flex flex-wrap gap-3">
                    <Button onClick={handleAddTest} className="bg-red-500 hover:bg-red-600 text-white rounded-xl">
                      <AddIcon className="mr-2 h-4 w-4" />
                      ADD TEST
                    </Button>
                    <Button onClick={handleCloneTest} className="bg-red-500 hover:bg-red-600 text-white rounded-xl">
                      <FileCopyIcon className="mr-2 h-4 w-4" />
                      CLONE TEST
                    </Button>
                    <Button onClick={handleCFTMembers} className="bg-red-500 hover:bg-red-600 text-white rounded-xl">
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
                    <h3 className="font-semibold text-gray-900 dark:text-red-500">Label</h3>
                    {/* Upload Document */}
                    <Button onClick={handleUploadDocument} variant="outline" className="w-full justify-start">
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Upload Document
                    </Button>
                    {/* Upload Status */}
                    <div className="text-sm text-green-600">✓ Files uploaded successfully</div>
                    {/* View Files */}
                    <Button variant="link" className="p-0 h-auto text-blue-600" onClick={handleViewFiles}>
                      <EyeIcon className="mr-1 h-4 w-4" />
                      View File Uploaded
                    </Button>
                    {/* File List */}
                    <div className={`flex flex-wrap gap-2 ${showFiles ? "" : "hidden"}`}>
                      {uploadedFiles.map((file, index) => (
                        <Badge key={index} variant="outline" className="text-xs dark:border-white border-gray-200">
                          {file}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Buttons directly below the card */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleCreateJobOrder}
                  type="button"
                  className="flex-1 bg-red-600 text-white hover:bg-red-700 rounded-xl font-bold px-6 py-3"
                >
                  ✓ CREATE JOB ORDER
                </button>
                <button
                  onClick={handleClear}
                  type="button"
                  className="flex-1 border border-red-600 text-red-600 hover:bg-red-50 rounded-xl font-bold px-6 py-3 bg-white"
                >
                  ✕ CLEAR
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* CFT Members Modal */}
        <Dialog open={showCFTModal} onOpenChange={setShowCFTModal}>
          <DialogContent className="max-w-md">
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle className="text-lg font-semibold">ADD CFT MEMBERS</DialogTitle>
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
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <span className="text-sm font-medium">PERSON {index + 1}</span>
                    <Input
                      value={member.value}
                      onChange={e => handleCftMemberChange(member.id, e.target.value)}
                      placeholder="Enter member name"
                      className="flex-1 mx-2"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCftMember(member.id)}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                    >
                      <DeleteIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(cftMode === "GROUP" || cftMembers.length === 0) && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter member name"
                        value={newCftMember}
                        onChange={(e) => setNewCftMember(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleAddCftMember()
                        }}
                        className="flex-1"
                      />
                      <Button onClick={handleAddCftMember} size="sm" variant="outline" className="px-3">
                        <Add className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {/* Apply Button */}
              <div className="flex justify-end pt-4">
                <Button onClick={handleApplyCFT} className="bg-red-500 text-white hover:bg-red-600 rounded-xl">
                  APPLY
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}