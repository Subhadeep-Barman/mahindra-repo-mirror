"use client";

import { ArrowBack, Add, Edit as EditIcon } from "@mui/icons-material";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/table";
import { Card } from "@/components/UI/card";
import { useState, useEffect, use } from "react";
import Navbar1 from "@/components/UI/navbar";
import axios from "axios";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import { useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import showSnackbar from "@/utils/showSnackbar";

const apiURL = import.meta.env.VITE_BACKEND_URL;

export default function VTCVehiclePage() {
  const [vehicles, setVehicles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [editOpen, setEditOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const { apiUserRole, userId, userName } = useAuth();

  // Fetch vehicles from API on mount
  useEffect(() => {
    async function fetchVehicles() {
      try {
        // Add department as query parameter
        const department = "VTC_JO Chennai";
        const response = await axios.get(
          `${apiURL}/vehicles?department=${encodeURIComponent(department)}`
        );
        // Only keep necessary fields for each vehicle
        const minimalVehicles = (response.data || []).map((v) => ({
          vehicle_serial_number: v.vehicle_serial_number,
          vehicle_body_number: v.vehicle_body_number,
          vehicle_model: v.vehicle_model,
          id_of_creator: userId || "",
          created_on: v.created_on,
          id_of_updater: v.id_of_updater,
          updated_on: v.updated_on,
        }));
        setVehicles(minimalVehicles);
      } catch (err) {
        setVehicles([]);
        // Optionally show error
      }
    }
    fetchVehicles();
  }, []);

  const totalItems = vehicles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = vehicles.slice(indexOfFirstItem, indexOfLastItem);

  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from the current route
  let activeTab = "Job Order";
  if (location.pathname.toLowerCase().includes("vehicle"))
    activeTab = "Vehicle";
  else if (location.pathname.toLowerCase().includes("engine"))
    activeTab = "Engine";

  const handleTabClick = (tab) => {
    if (tab === "Job Order") navigate("/vtc-chennai");
    else if (tab === "Vehicle") navigate("/vtccvehicle");
    else if (tab === "Engine") navigate("/vtcChennaiEngine");
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddNewVehicle = () => {
    navigate("/vtcvehicle/new?department=VTC_JO%20Chennai");
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Open edit modal and fetch full vehicle details
  const handleEditClick = async (vehicle) => {
    try {
      const response = await axios.get(
        `${apiURL}/vehicles/${vehicle.vehicle_serial_number}`
      );
      setEditVehicle(vehicle);
      setEditForm(response.data); // full vehicle data
      setEditOpen(true);
    } catch (err) {
      showSnackbar(
        "Error fetching vehicle details: " + (err.response?.data?.detail || err.message),
        "error"
      );
    }
  };

  // Handle edit form change (for all fields)
  const handleEditFormChange = (e) => {
    const { name, value, type } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  // Save updated vehicle (send all fields)
  const handleEditSave = async () => {
    if (!editVehicle || !editForm) return;
    try {
      await axios.put(
        `${apiURL}/vehicles/${editVehicle.vehicle_serial_number}`,
        { ...editForm, vehicle_serial_number: editVehicle.vehicle_serial_number },
        { headers: { "Content-Type": "application/json" } }
      );
      setEditOpen(false);
      setEditVehicle(null);
      setEditForm(null);
      // Refresh list
      const response = await axios.get(`${apiURL}/vehicles`);
      const minimalVehicles = (response.data || []).map((v) => ({
        vehicle_serial_number: v.vehicle_serial_number,
        vehicle_body_number: v.vehicle_body_number,
        vehicle_model: v.vehicle_model,
        id_of_creator: userId || "",
        created_on: v.created_on,
        id_of_updater: v.id_of_updater,
        updated_on: v.updated_on,
      }));
      setVehicles(minimalVehicles);
    } catch (err) {
      showSnackbar(
        "Error updating vehicle: " + (err.response?.data?.detail || err.message),
        "error"
      );
    }
  };

  return (
    <>
      <Navbar1 />
      {/* Header */}
      <div className="bg-white dark:bg-black ">
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
                <h1 className="text-sm font-medium text-black-600 dark:text-red-500">
                  VTC CHENNAI
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
                    ${activeTab === tab
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

      {/* Vehicle List Badge */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center bg-white dark:bg-black">
        <Badge className="bg-yellow-400 text-black hover:bg-yellow-500 px-3 py-1">
          Vehicles List
        </Badge>
        <Button
          onClick={handleAddNewVehicle}
          className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
        >
          <Add className="h-4 w-4 mr-1" />
          ADD NEW Vehicle
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Card>
          <div className="overflow-x-auto">
            <Table className="min-w-full border-collapse border border-gray-200">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="font-semibold text-gray-700 text-xs px-4 py-2">
                    Vehicle Serial Number
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs px-4 py-2">
                    Vehicle Body Number
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs px-4 py-2">
                    Vehicle Model
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs px-4 py-2">
                    Created By
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs px-4 py-2">
                    Created on
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs px-4 py-2">
                    Last Updated By
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs px-4 py-2">
                    Last Updated on
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs px-4 py-2">
                    Edit
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((vehicle, index) => (
                  <TableRow
                    key={vehicle.vehicle_serial_number || index}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100`}
                  >
                    <TableCell className="text-xs text-gray-900 font-medium px-4 py-2">
                      {vehicle.vehicle_serial_number}
                    </TableCell>
                    <TableCell className="text-xs text-gray-900 px-4 py-2">
                      {vehicle.vehicle_body_number}
                    </TableCell>
                    <TableCell className="text-xs text-gray-900 px-4 py-2">
                      {vehicle.vehicle_model}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 px-4 py-2">
                      {vehicle.id_of_creator}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 px-4 py-2">
                      {new Date(vehicle.created_on).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        hour12: true,
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 px-4 py-2">
                      {vehicle.id_of_updater}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 px-4 py-2">
                      {new Date(vehicle.updated_on).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        hour12: true,
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="px-4 py-2">
                      <button
                        onClick={() => handleEditClick(vehicle)}
                        className="text-gray-500 hover:text-red-500"
                        title="Edit"
                      >
                        <EditIcon fontSize="small" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, totalItems)} of {totalItems} Records
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(1)}
              className="text-gray-400"
            >
              {"<<"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="text-gray-400"
            >
              {"<"}
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={`${currentPage === page
                    ? "bg-black text-white hover:bg-gray-800"
                    : "text-gray-600"
                  } px-3 py-1`}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="text-gray-400"
            >
              {">"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(totalPages)}
              className="text-gray-400"
            >
              {">>"}
            </Button>
          </div>
        </div>

        {/* Edit Modal with full form */}
        <Dialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Vehicle</DialogTitle>
          <DialogContent>
            {editForm && (
              <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Example for some fields, repeat for all fields in VehicleSchema */}
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Project
                  </label>
                  <input
                    name="project_code"
                    value={editForm.project_code || ""}
                    onChange={handleEditFormChange}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Vehicle Build Level
                  </label>
                  <input
                    name="vehicle_build_level"
                    value={editForm.vehicle_build_level || ""}
                    onChange={handleEditFormChange}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Vehicle Model
                  </label>
                  <input
                    name="vehicle_model"
                    value={editForm.vehicle_model || ""}
                    onChange={handleEditFormChange}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Vehicle Body Number
                  </label>
                  <input
                    name="vehicle_body_number"
                    value={editForm.vehicle_body_number || ""}
                    onChange={handleEditFormChange}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>
                {/* ...repeat for all fields in VehicleSchema... */}
              </form>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setEditOpen(false)}
              className="bg-gray-200 text-gray-700"
            >
              Cancel
            </Button>
            <Button onClick={handleEditSave} className="bg-red-500 text-white">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
}
