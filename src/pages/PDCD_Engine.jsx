"use client";

import { ArrowBack, Add } from "@mui/icons-material";
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
import { useAuth } from "@/context/AuthContext";
import showSnackbar from "@/utils/showSnackbar";

const apiURL = import.meta.env.VITE_BACKEND_URL;

export default function PDCDEnginePage() {
  const [engines, setEngines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const { apiUserRole, userId, userName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from the current route
  let activeTab = "Job Order";
  if (location.pathname.toLowerCase().includes("vehicle"))
    activeTab = "Vehicle";
  else if (location.pathname.toLowerCase().includes("engine"))
    activeTab = "Engine";

  // Fetch engines from API on mount
  useEffect(() => {
    const fetchEngines = async () => {
      setLoading(true);
      setError(null);
      try {
        // REMOVED: Department filter to get engines from all teams
        const response = await axios.get(`${apiURL}/engines`);

        console.log("Fetched all engines:", response.data); // Debug log

        // Only keep necessary fields for each engine
        const minimalEngines = (response.data || []).map((e) => ({
          engine_serial_number: e.engine_serial_number || "",
          engine_build_level: e.engine_build_level || "",
          engine_capacity: e.engine_capacity || "",
          engine_type: e.engine_type || "",
          name_of_creator: e.name_of_creator || "NA", // Use userName if not available
          id_of_creator: e.id_of_creator || "",
          created_on: e.created_on,
          id_of_updater: e.id_of_updater || "",
          name_of_updater: e.name_of_updater || "NA", // Use userName if not available
          updated_on: e.updated_on,
        }));
        setEngines(minimalEngines);
      } catch (err) {
        console.error("Error fetching engines:", err);
        setError(
          err?.response?.data?.detail ||
          err?.message ||
          "Failed to fetch engines"
        );
        setEngines([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEngines();
  }, []);

  // Pagination calculations
  const totalItems = engines.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = engines.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddNewEngine = () => {
    navigate("/nashik/engine/new?department=VTC_JO%20Nashik");
  };

  const handleTabClick = (tab) => {
    if (tab === "Job Order") {
      navigate("/pdcd-lab");
    } else if (tab === "Vehicle") {
      navigate("/pdcd/vehicle");
    } else if (tab === "Engine") {
      navigate("/pdcd/engine");
    }
  };

  // FIXED: Update the handleEditClick function to fetch the SPECIFIC engine data
  const handleEditClick = async (engine) => {
    try {
      console.log("Clicking on Nashik engine:", engine.engine_serial_number); // Debug log

      // Fetch full engine details using the specific engine serial number
      const response = await axios.get(
        `${apiURL}/engines?engine_serial_number=${encodeURIComponent(engine.engine_serial_number)}`
      );

      console.log("Nashik Engine API Response:", response.data); // Debug log

      if (response.data && response.data.length > 0) {
        // Find the exact engine that matches the clicked serial number
        const engineData = response.data.find(e =>
          e.engine_serial_number === engine.engine_serial_number
        );

        if (!engineData) {
          console.error("Engine not found in response:", engine.engine_serial_number);
          showSnackbar("Selected engine not found in response.", "error");
          return;
        }

        console.log("Found matching Nashik engine:", engineData); // Debug log

        // Navigate to the engine form page with complete engine data
        navigate(`/nashik/engine/new?department=VTC_JO%20Nashik&edit=true`, {
          state: {
            engineData: engineData,
            isEdit: true,
            engineSerialNumber: engine.engine_serial_number,
            // Pass additional context for the form
            editMode: true,
            originalEngineData: engineData
          }
        });
      } else {
        showSnackbar("No engine data found for the selected engine.", "warning");
      }
    } catch (err) {
      console.error("Error fetching engine details:", err);
      showSnackbar(
        "Error fetching engine details: " + (err.response?.data?.detail || err.message),
        "error"
      );
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
                    PDCD Chennai
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

        {/* Engine List Badge */}
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Badge className="bg-yellow-400 text-black hover:bg-yellow-500 px-3 py-1">
              Engine List
            </Badge>
            <Button
              onClick={handleAddNewEngine}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
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
              <Table className="min-w-full border-collapse border border-gray-200">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="font-semibold text-gray-700 text-xs px-4 py-2">
                      Engine Serial Number
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs px-4 py-2">
                      Engine Build Level
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs px-4 py-2">
                      Engine Capacity (cc)
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs px-4 py-2">
                      Engine Type
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
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-gray-500"
                      >
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : engines.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-gray-500"
                      >
                        No engines found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map((engine, index) => (
                      <TableRow
                        key={engine.engine_serial_number || index}
                        className={`${index %
                          2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-gray-100`}
                      >
                        <TableCell
                          className="text-blue-600 hover:text-blue-800 cursor-pointer underline dark:text-green-500 dark:hover:text-green-400 text-xs px-4 py-2"
                          onClick={() => handleEditClick(engine)}
                        >
                          {engine.engine_serial_number}
                        </TableCell>
                        <TableCell className="text-xs text-gray-900 px-4 py-2">
                          {engine.engine_build_level}
                        </TableCell>
                        <TableCell className="text-xs text-gray-900 px-4 py-2">
                          {engine.engine_capacity}
                        </TableCell>
                        <TableCell className="text-xs text-gray-900 px-4 py-2">
                          {engine.engine_type}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 px-4 py-2">
                          {engine.name_of_creator}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 px-4 py-2">
                          {new Date(engine.created_on).toLocaleString("en-IN", {
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
                          {engine.name_of_updater}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 px-4 py-2">
                          {new Date(engine.updated_on).toLocaleString("en-IN", {
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
                    ))
                  )}
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
      </div>
    </>
  );
}