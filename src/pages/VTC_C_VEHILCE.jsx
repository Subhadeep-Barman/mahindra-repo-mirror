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
import { useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import showSnackbar from "@/utils/showSnackbar";

const apiURL = import.meta.env.VITE_BACKEND_URL;

export default function VTCVehiclePage() {
  const [vehicles, setVehicles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const { apiUserRole, userId, userName } = useAuth();

  // Fetch vehicles from API on mount
  useEffect(() => {
    async function fetchVehicles() {
      try {
        // REMOVED: Department filter to get vehicles from all teams
        const response = await axios.get(`${apiURL}/vehicles`);

        console.log("Fetched vehicles:", response.data); // Debug log

        // Only keep necessary fields for each vehicle
        const minimalVehicles = (response.data || []).map((v) => ({
          vehicle_serial_number: v.vehicle_serial_number,
          vehicle_body_number: v.vehicle_body_number,
          vehicle_model: v.vehicle_model,
          name_of_creator: v.name_of_creator || userName || "NA",
          id_of_creator: v.id_of_creator || "",
          created_on: v.created_on,
          id_of_updater: v.id_of_updater,
          name_of_updater: v.name_of_updater || "NA",
          updated_on: v.updated_on,
        }));
        setVehicles(minimalVehicles);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        setVehicles([]);
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

  // FIXED: Update the handleEditClick function to fetch the SPECIFIC vehicle
  const handleEditClick = async (vehicle) => {
    try {
      console.log("Clicking on vehicle with serial number:", vehicle.vehicle_serial_number);

      // FIXED: Use the correct API endpoint format
      const response = await axios.get(
        `${apiURL}/vehicles?vehicle_serial_number=${encodeURIComponent(vehicle.vehicle_serial_number)}`
      );

      console.log("API response for vehicle:", response.data);

      if (response.data && response.data.length > 0) {
        // FIXED: Find the exact vehicle that matches the clicked serial number
        const vehicleData = response.data.find(v =>
          v.vehicle_serial_number === vehicle.vehicle_serial_number
        );

        if (!vehicleData) {
          console.error("Vehicle not found in response:", vehicle.vehicle_serial_number);
          showSnackbar("Selected vehicle not found in response.", "error");
          return;
        }

        console.log("Found matching vehicle:", vehicleData);

        // Navigate to the vehicle form page with complete vehicle data
        navigate(`/vtcvehicle/new?department=VTC_JO%20Chennai&edit=true`, {
          state: {
            vehicleData: vehicleData,
            isEdit: true,
            vehicleSerialNumber: vehicle.vehicle_serial_number,
            // Pass additional context for the form
            editMode: true,
            originalVehicleData: vehicleData
          }
        });
      } else {
        showSnackbar("No vehicle data found for the selected vehicle.", "warning");
      }
    } catch (err) {
      console.error("Error fetching vehicle details:", err);
      showSnackbar(
        "Error fetching vehicle details: " + (err.response?.data?.detail || err.message),
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
          ADD NEW VEHICLE
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((vehicle, index) => (
                  <TableRow
                    key={vehicle.vehicle_serial_number || index}
                    className={`${index %
                      2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100`}
                  >
                    <TableCell
                      className="text-blue-600 hover:text-blue-800 cursor-pointer underline dark:text-green-500 dark:hover:text-green-400 text-xs px-4 py-2"
                      onClick={() => handleEditClick(vehicle)}
                    >
                      {vehicle.vehicle_serial_number}
                    </TableCell>
                    <TableCell className="text-xs text-gray-900 px-4 py-2">
                      {vehicle.vehicle_body_number}
                    </TableCell>
                    <TableCell className="text-xs text-gray-900 px-4 py-2">
                      {vehicle.vehicle_model}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 px-4 py-2">
                      {vehicle.name_of_creator}
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
                      {vehicle.name_of_updater || "NA"}
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
      </div>
    </>
  );
}