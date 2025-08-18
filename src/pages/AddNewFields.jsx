import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Plus, Trash2, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import Spinner from "@/components/UI/spinner";
import showSnackbar from "@/utils/showSnackbar";
import Navbar1 from "@/components/UI/navbar";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import {
    ArrowBack,
} from "@mui/icons-material";

const apiURL = import.meta.env.VITE_BACKEND_URL;

// API functions for data fetching
const fetchProjects = async () => {
  const response = await axios.get(`${apiURL}/project-codes`);
  return response.data;
};

const fetchEngineTypes = async () => {
  const response = await axios.get(`${apiURL}/engine-families`);
  return response.data;
};

const fetchDomains = async () => {
  const response = await axios.get(`${apiURL}/domains`);
  return response.data;
};

const fetchTestTypes = async () => {
  const response = await axios.get(`${apiURL}/test-types`);
  return response.data;
};

const fetchInertiaClasses = async () => {
  const response = await axios.get(`${apiURL}/inertia-classes`);
  return response.data;
};

const fetchModes = async () => {
  const response = await axios.get(`${apiURL}/modes`);
  return response.data;
};

// const fetchShifts = async () => {
//   const response = await axios.get(`${apiURL}/shift`);
//   return response.data;
// };

const fetchFuelTypes = async () => {
  const response = await axios.get(`${apiURL}/fuel-types`);
  return response.data;
};

const fetchVehicleModels = async () => {
  const response = await axios.get(`${apiURL}/vehicle-models`);
  return response.data;
};

const AddNewFields = ({ onClose }) => {
  // State for various data categories
  const [projects, setProjects] = useState([]);
  const [engineTypes, setEngineTypes] = useState([]);
  const [domains, setDomains] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [inertiaClasses, setInertiaClasses] = useState([]);
  const [modes, setModes] = useState([]);
  //   const [shifts, setShifts] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [vehicleModels, setVehicleModels] = useState([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [formData, setFormData] = useState({});
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Search states
  const [searchTerm, setSearchTerm] = useState({});
  const [searchVisible, setSearchVisible] = useState({});
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };
  
  // Field configurations for add dialogs
  const fieldConfigurations = {
    "Projects": [
      { label: "Project Code", type: "text", key: "project_code" },
    ],
    "Engine Types": [
      { label: "Engine Family", type: "text", key: "engine_family" },
    ],
    "Domains": [
      { label: "Domain", type: "text", key: "domain" },
    ],
    "Test Types": [
      { label: "Test Type Name", type: "text", key: "test_type_name" },
    ],
    "Inertia Classes": [
      { label: "Inertia Class Name", type: "text", key: "inertia_class_name" },
    ],
    "Modes": [
      { label: "Mode Name", type: "text", key: "mode_name" },
    ],
    // "Shifts": [
    //   { label: "Shift Name", type: "text", key: "shift_name" },
    // ],
    "Fuel Types": [
      { label: "Fuel Type Name", type: "text", key: "fuel_type_name" },
    ],
    "Vehicle Models": [
      { label: "Model Name", type: "text", key: "model_name" },
    ],
  };
  
  // API endpoints for adding
  const addEndpoints = {
    "Projects": "/api/manual-entry/project",
    "Engine Types": "/api/manual-entry/engine-type",
    "Domains": "/api/manual-entry/domain",
    "Test Types": "/api/manual-entry/test-type",
    "Inertia Classes": "/api/manual-entry/inertia-class",
    "Modes": "/api/manual-entry/mode",
    // "Shifts": "/api/manual-entry/shift",
    "Fuel Types": "/api/manual-entry/fuel-type",
    "Vehicle Models": "/api/manual-entry/vehicle-model",
  };
  
  // API endpoints for deleting
  const deleteEndpoints = {
    "Projects": "/api/manual-entry/project",
    "Engine Types": "/api/manual-entry/engine-type",
    "Domains": "/api/manual-entry/domain",
    "Test Types": "/api/manual-entry/test-type",
    "Inertia Classes": "/api/manual-entry/inertia-class",
    "Modes": "/api/manual-entry/mode",
    // "Shifts": "/api/manual-entry/shift",
    "Fuel Types": "/api/manual-entry/fuel-type",
    "Vehicle Models": "/api/manual-entry/vehicle-model",
  };

  // Load all data initially
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        const [
          projectsData,
          engineTypesData,
          domainsData,
          testTypesData,
          inertiaClassesData,
          modesData,
        //   shiftsData,
          fuelTypesData,
          vehicleModelsData
        ] = await Promise.all([
          fetchProjects(),
          fetchEngineTypes(),
          fetchDomains(),
          fetchTestTypes(),
          fetchInertiaClasses(),
          fetchModes(),
        //   fetchShifts(),
          fetchFuelTypes(),
          fetchVehicleModels()
        ]);
        
        setProjects(projectsData);
        setEngineTypes(engineTypesData);
        setDomains(domainsData);
        setTestTypes(testTypesData);
        setInertiaClasses(inertiaClassesData);
        setModes(modesData);
        // setShifts(shiftsData);
        setFuelTypes(fuelTypesData);
        setVehicleModels(vehicleModelsData);
      } catch (error) {
        console.error("Error loading data:", error);
        showSnackbar("Error loading dropdown options", "error");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAllData();
  }, []);
  
  // Open add dialog
  const handleAddClick = (field) => {
    setSelectedField(field);
    setFormData({});
    setDialogOpen(true);
  };
  
  // Close add dialog
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedField(null);
    setFormData({});
  };
  
  // Handle input change in form
  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  
  // Save new value
  const handleSave = async () => {
    if (!selectedField) return;
    
    setIsAddLoading(true);
    try {
      // Validate required fields
      const fields = fieldConfigurations[selectedField];
      const requiredFields = fields.filter(field => field.required !== false);
      
      for (const field of requiredFields) {
        if (!formData[field.key] || (typeof formData[field.key] === 'string' && !formData[field.key].trim())) {
          showSnackbar(`${field.label} is required`, "error");
          setIsAddLoading(false);
          return;
        }
      }
      
      const endpoint = addEndpoints[selectedField];
      const response = await axios.post(`${apiURL}${endpoint}`, formData);
      
      if (response.data.message?.includes("already exists")) {
        showSnackbar(`Value already exists in ${selectedField}`, "warning");
      } else {
        showSnackbar("Value added successfully", "success");
        
        // Refresh the data for the updated field
        await refreshFieldData(selectedField);
      }
      
      handleDialogClose();
    } catch (error) {
      console.error("Error saving value:", error);
      showSnackbar("Error adding value", "error");
    } finally {
      setIsAddLoading(false);
    }
  };
  
  // Confirm delete
  const confirmDelete = (field, value) => {
    setItemToDelete({ field, value });
    setDeleteDialogOpen(true);
  };
  
  // Handle delete
  const handleDeleteConfirmed = async () => {
    if (!itemToDelete) return;
    
    setIsDeleteLoading(true);
    try {
      const { field, value } = itemToDelete;
      const endpoint = deleteEndpoints[field];
      
      await axios.delete(`${apiURL}${endpoint}`, {
        data: { value }
      });
      
      showSnackbar(`Value deleted successfully`, "success");
      
      // Refresh the data for the updated field
      await refreshFieldData(field);
      
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting value:", error);
      showSnackbar("Error deleting value", "error");
    } finally {
      setIsDeleteLoading(false);
    }
  };
  
  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };
  
  // Refresh data for a specific field
  const refreshFieldData = async (field) => {
    try {
      let data;
      switch (field) {
        case "Projects":
          data = await fetchProjects();
          setProjects(data);
          break;
        case "Engine Types":
          data = await fetchEngineTypes();
          setEngineTypes(data);
          break;
        case "Domains":
          data = await fetchDomains();
          setDomains(data);
          break;
        case "Test Types":
          data = await fetchTestTypes();
          setTestTypes(data);
          break;
        case "Inertia Classes":
          data = await fetchInertiaClasses();
          setInertiaClasses(data);
          break;
        case "Modes":
          data = await fetchModes();
          setModes(data);
          break;
        // case "Shifts":
        //   data = await fetchShifts();
        //   setShifts(data);
        //   break;
        case "Fuel Types":
          data = await fetchFuelTypes();
          setFuelTypes(data);
          break;
        case "Vehicle Models":
          data = await fetchVehicleModels();
          setVehicleModels(data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error refreshing ${field} data:`, error);
    }
  };
  
  // Handle search
  const handleSearchChange = (fieldKey, value) => {
    setSearchTerm((prev) => ({ ...prev, [fieldKey]: value }));
  };
  
  // Toggle search visibility
  const toggleSearchVisibility = (fieldKey) => {
    setSearchVisible((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };
  
  // Render a field card
  const renderFieldCard = (title, values, fieldKey) => {
    const filteredValues = values.filter((value) =>
      String(value).toLowerCase().includes((searchTerm[fieldKey] || "").toLowerCase())
    );
    
    return (
      <div className="col-span-1 md:col-span-1 lg:col-span-1">
        <div className="bg-card rounded-lg border shadow-sm p-4 flex flex-col h-full">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" onClick={() => toggleSearchVisibility(fieldKey)}>
                <Search className="h-4 w-4 text-red-500" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleAddClick(fieldKey)}>
                <Plus className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          
          {searchVisible[fieldKey] && (
            <div className="mt-2">
              <Input
                placeholder="Search..."
                className="w-full"
                value={searchTerm[fieldKey] || ""}
                onChange={(e) => handleSearchChange(fieldKey, e.target.value)}
              />
            </div>
          )}
          
          <div className="mt-2 border-t border-t-red-500 pt-2 h-[200px] overflow-y-auto">
            {filteredValues.length === 0 ? (
              <p className="text-sm text-muted-foreground p-2">No items found</p>
            ) : (
              filteredValues.map((value, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-1 px-2 hover:bg-accent rounded-sm"
                >
                  <span className="text-sm truncate max-w-[220px]">{value}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => confirmDelete(fieldKey, value)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <>
      <Navbar1 />
      <div className="container p-4 mx-auto relative">
        {(isLoading || isAddLoading || isDeleteLoading) && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50">
            <Spinner loading={true} />
          </div>
        )}
        
        <div className="flex items-center mb-6">
            <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 border-2 border-red-500 rounded-full p-2 mr-2"
                >
                <ArrowBack className="h-5 w-5" />
            </Button>
          <h1 className="text-2xl font-bold ml-2">Manage Dropdown Options</h1>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderFieldCard("Projects", projects, "Projects")}
          {renderFieldCard("Engine Types", engineTypes, "Engine Types")}
          {renderFieldCard("Domains", domains, "Domains")}
          {renderFieldCard("Test Types", testTypes, "Test Types")}
          {renderFieldCard("Inertia Classes", inertiaClasses, "Inertia Classes")}
          {renderFieldCard("Modes", modes, "Modes")}
          {/* {renderFieldCard("Shifts", shifts, "Shifts")} */}
          {renderFieldCard("Fuel Types", fuelTypes, "Fuel Types")}
          {renderFieldCard("Vehicle Models", vehicleModels, "Vehicle Models")}
        </div>
        
        {/* Add Dialog */}
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New {selectedField}</DialogTitle>
              <DialogDescription>
                Enter the details for the new {selectedField && selectedField.slice(0, -1)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {selectedField && fieldConfigurations[selectedField].map((field, index) => (
                <div key={index} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={field.key} className="text-right">
                    {field.label} {field.required !== false && <span className="text-destructive">*</span>}
                  </Label>
                  <div className="col-span-3">
                    {field.type === "text" && (
                      <Input
                        id={field.key}
                        value={formData[field.key] || ""}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={field.label}
                      />
                    )}
                    {field.type === "number" && (
                      <Input
                        id={field.key}
                        type="number"
                        value={formData[field.key] || ""}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={field.label}
                      />
                    )}
                    {field.type === "dropdown" && (
                      <Select
                        value={formData[field.key] || ""}
                        onValueChange={(value) => handleInputChange(field.key, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((option, i) => (
                            <SelectItem key={i} value={option.value || option}>
                              {option.label || option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isAddLoading}>
                {isAddLoading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={handleCancelDelete}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <div className="flex items-center space-x-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <DialogTitle>Confirm Deletion</DialogTitle>
              </div>
              <DialogDescription>
                Are you sure you want to delete <strong>{itemToDelete?.value}</strong>?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirmed} disabled={isDeleteLoading}>
                {isDeleteLoading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AddNewFields;
