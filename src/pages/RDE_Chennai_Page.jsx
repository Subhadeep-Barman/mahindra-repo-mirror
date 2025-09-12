"use client";

import { ArrowBack, Add, Search as SearchIcon } from "@mui/icons-material";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/table";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/UI/card";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Navbar1 from "@/components/UI/navbar";
import showSnackbar from "@/utils/showSnackbar";
import useStore from "../store/useStore";
import * as XLSX from "xlsx";

const apiURL = import.meta.env.VITE_BACKEND_URL;

export default function RDEChennaiPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Job Order");
  const rowsPerPage = 8;

  // Backend job orders state
  const [jobOrders, setJobOrders] = useState([]);
  const [selectedJobOrder, setSelectedJobOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [jobOrderEdit, setJobOrderEdit] = useState(null);
  const { userRole, userId, userName } = useAuth();
  const [filteredJobOrders, setFilteredJobOrders] = useState([]);
  const [showSearchCard, setShowSearchCard] = useState(false);
  const [search, setSearch] = useState({
    job_order_id: "",
    project_code: "",
    vehicle_serial_number: "",
    vehicle_body_number: "",
    engine_serial_number: "",
    domain: "",
    test_status: "",
    completed_test_count: "",
    name_of_creator: "",
    created_on: "",
    updated_on: "",
    objective: "", // Added new field for searching test objectives
  });
  
  const [testOrders, setTestOrders] = useState([]);
  const [filteredTestOrders, setFilteredTestOrders] = useState([]);

  const userCookies = useStore.getState().getUserCookieData();
    const userEmail = userCookies.userEmail;
    const userEmployeeId = userCookies.userId;
    console.log("User Cookies:", userCookies);
    console.log("employeeId:", userEmployeeId);

  useEffect(() => {
    fetchJobOrders();
  }, []);

  useEffect(() => {
    setFilteredJobOrders(jobOrders);
  }, [jobOrders]);

  const fetchJobOrders = () => {
    if (!userEmployeeId) {
      showSnackbar("User ID not found. Please login again.", "error");
      return;
    }
    // Validate userEmployeeId (assume it's numeric; adjust regex if needed)
    if (!/^\d+$/.test(userEmployeeId)) {
      showSnackbar("Invalid user ID format", "error");
      return;
    }
    
    // Validate userRole against allowed values
    const allowedRoles = ["ProjectTeam", "TestEngineer", "Admin"]; // Adjust based on your app's roles
    if (!allowedRoles.includes(userRole)) {
      showSnackbar("Invalid user role", "error");
      return;
    }
    
    // First fetch the job orders
    axios
      .get(`${apiURL}/rde_joborders`,{ params:{ user_id: userEmployeeId, role: userRole } })
      .then((res) => {
        // Defensive normalization to satisfy SAST: ensure we only accept arrays of plain objects
        const raw = res && typeof res === 'object' ? res.data : [];
        let jobOrdersData = Array.isArray(raw)
          ? raw.filter((item) => item && typeof item === 'object' && !Array.isArray(item))
          : (raw && typeof raw === 'object' && raw.data && Array.isArray(raw.data)
              ? raw.data.filter((item) => item && typeof item === 'object' && !Array.isArray(item))
              : []);
        // Prevent prototype pollution / unexpected keys by shallow cloning
        jobOrdersData = jobOrdersData.map(o => ({ ...o }));
        jobOrdersData = jobOrdersData.slice().sort((a, b) => {
          const aTime = a.created_on ? new Date(a.created_on).getTime() : null;
          const bTime = b.created_on ? new Date(b.created_on).getTime() : null;
          if (aTime && bTime) return bTime - aTime;
          if (aTime) return -1;
          if (bTime) return 1;
          const aId = Number(String(a.job_order_id || "").replace(/\D/g, "")) || 0;
          const bId = Number(String(b.job_order_id || "").replace(/\D/g, "")) || 0;
          return bId - aId;
        });
        setJobOrders(jobOrdersData);
        setFilteredJobOrders(jobOrdersData);
        
        // Then fetch test orders to enable objective-based filtering
        console.log("Fetching test orders...");
        axios
          .get(`${apiURL}/testorders`)
          .then((testRes) => {
            console.log("Test orders API response:", testRes);
            // Check if response data is nested in a 'data' property or other structure
            let testOrdersData;
            if (Array.isArray(testRes.data)) {
              testOrdersData = testRes.data;
            } else if (testRes.data && testRes.data.data && Array.isArray(testRes.data.data)) {
              // Handle case where data is nested in a 'data' property
              testOrdersData = testRes.data.data;
            } else if (testRes.data && typeof testRes.data === 'object') {
              // Handle case where data is an object with values we need to extract
              testOrdersData = Object.values(testRes.data);
            } else {
              testOrdersData = [];
            }
            
            console.log("Processed test orders data:", testOrdersData);
            setTestOrders(testOrdersData);
            
            // Check if test orders have the expected structure
            if (testOrdersData.length > 0) {
              console.log("Sample test order:", testOrdersData[0]);
            }
          })
          .catch((err) => {
            console.error("Failed to fetch test orders:", err);
            setTestOrders([]);
          });
      })
      .catch((err) => {
        console.error("Failed to fetch job orders:", err);
        setJobOrders([]);
        setFilteredJobOrders([]);
        setTestOrders([]);
      });
  };

  const applySearch = () => {
    let filtered = jobOrders;
    let filteredTestOrders = [];

    // Standard job order filtering
    filtered = filtered.filter((order) => {
      return (
        (search.job_order_id === "" ||
          String(order.job_order_id || "")
            .toLowerCase()
            .includes(search.job_order_id.toLowerCase())) &&
        (search.project_code === "" ||
          String(order.project_code || "")
            .toLowerCase()
            .includes(search.project_code.toLowerCase())) &&
        (search.vehicle_serial_number === "" ||
          String(order.vehicle_serial_number || "")
            .toLowerCase()
            .includes(search.vehicle_serial_number.toLowerCase())) &&
        (search.vehicle_body_number === "" ||
          String(order.vehicle_body_number || "")
            .toLowerCase()
            .includes(search.vehicle_body_number.toLowerCase())) &&
        (search.engine_serial_number === "" ||
          String(order.engine_serial_number || "")
            .toLowerCase()
            .includes(search.engine_serial_number.toLowerCase())) &&
        (search.domain === "" ||
          String(order.domain || "")
            .toLowerCase()
            .includes(search.domain.toLowerCase())) &&
        (search.test_status === "" ||
          String(order.test_status || "")
            .toLowerCase()
            .includes(search.test_status.toLowerCase())) &&
        (search.completed_test_count === "" ||
          String(order.completed_test_count || "")
            .toLowerCase()
            .includes(search.completed_test_count.toLowerCase())) &&
        (search.name_of_creator === "" ||
          String(order.name_of_creator || "")
            .toLowerCase()
            .includes(search.name_of_creator.toLowerCase())) &&
        (search.created_on === "" ||
          (order.created_on &&
            new Date(order.created_on)
              .toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour12: true,
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
              .toLowerCase()
              .includes(search.created_on.toLowerCase()))) &&
        (search.updated_on === "" ||
          (order.updated_on &&
            new Date(order.updated_on)
              .toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour12: true,
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
              .toLowerCase()
              .includes(search.updated_on.toLowerCase())))
      );
    });
    
    // If test objective filter is applied, show test orders directly and filter by job order department
    if (search.objective && search.objective.trim() !== "") {
      // Get job order IDs for this department
      const validJobOrderIds = jobOrders
        .filter(order => order.department === "RDE JO")
        .map(order => order.job_order_id);

      filteredTestOrders = testOrders.filter(testOrder => {
        const objective = testOrder.objective || testOrder.test_objective ||
          (testOrder.test_details ? testOrder.test_details.objective : null);
        return (
          objective &&
          objective.toLowerCase().includes(search.objective.toLowerCase()) &&
          validJobOrderIds.includes(testOrder.job_order_id)
        );
      });

      setFilteredJobOrders([]);
      setFilteredTestOrders(filteredTestOrders);
      setCurrentPage(1);
      return;
    }

    setFilteredJobOrders(filtered);
    setFilteredTestOrders([]);
    setCurrentPage(1);
  };

  const handleDownload = () => {
    if (!filteredJobOrders.length) return;
    const headers = [
      "Job Order ID",
      "Project Code",
      "Vehicle Number",
      "Body Number",
      "Engine Number",
      "Domain",
      "Test Status",
      "Completed Tests",
      "Created By",
      "Created On",
      "Updated On",
      "Test Objectives"
    ];
    const rows = filteredJobOrders.map((order) => {
      // Find all test orders for this job order
      const relatedTestOrders = testOrders.filter(
        testOrder => {
          const testOrderId = testOrder.job_order_id || testOrder.jobOrderId || testOrder.job_id || 
                            testOrder.orderId || testOrder.order_id;
          const orderId = order.job_order_id || order.jobOrderId || order.job_id || order.id;
          return String(testOrderId) === String(orderId);
        }
      );
      
      // Get all unique objectives from related test orders
      const objectives = [...new Set(
        relatedTestOrders
          .filter(to => {
            const objective = to.objective || to.test_objective || 
                           (to.test_details ? to.test_details.objective : null);
            return objective;
          })
          .map(to => {
            return to.objective || to.test_objective || 
                 (to.test_details ? to.test_details.objective : null);
          })
      )].join(', ');
      
      return [
        order.job_order_id,
        order.project_code,
        order.vehicle_serial_number,
        order.vehicle_body_number,
        order.engine_serial_number || "N/A",
        order.domain,
        order.test_status,
        order.completed_test_count == 0
          ? "0"
          : `${order.completed_test_count}/${order.test_status}`,
        order.name_of_creator,
        order.created_on
          ? new Date(order.created_on).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour12: true,
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
          : "",
        order.updated_on
          ? new Date(order.updated_on).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour12: true,
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
          : "N/A",
        objectives || "N/A"
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Job Orders");
    XLSX.writeFile(workbook, "job_orders.xlsx");
  };

  // Calculate pagination values
  const totalPages = filteredTestOrders.length > 0
    ? Math.ceil(filteredTestOrders.length / rowsPerPage)
    : Math.ceil(filteredJobOrders.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = filteredTestOrders.length > 0
    ? filteredTestOrders.slice(startIndex, endIndex)
    : filteredJobOrders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  const handleCreateJobOrder = () => {
    navigate("/RDECreateJobOrder");
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "Job Order") navigate("/rde-chennai");
    else if (tab === "Vehicle") navigate("/rde/vehicle");
    else if (tab === "Engine") navigate("/rde/engine");
  };

  // Handler for clicking job order number
  const handleJobOrderClick = (job_order_id) => {
    // Validate job_order_id to ensure it's a valid format (alphanumeric with potential dashes/underscores)
    if (!job_order_id || typeof job_order_id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(job_order_id)) {
      showSnackbar("Invalid job order ID format", "error");
      return;
    }
    
    // Fetch job order details from backend and redirect to /createJobOrder with all data
    axios
      .get(`${apiURL}/rde_joborders-single/${encodeURIComponent(job_order_id)}`)
      .then((res) => {
        // Defensive normalization to satisfy SAST
        const rawData = res && typeof res === 'object' ? res.data : null;
        const jobOrderData = Array.isArray(rawData) ? rawData[0] : 
          (rawData && typeof rawData === 'object' ? rawData : null);
        
        // Pass the complete job order data to create job order page
        // This will allow the form to be pre-filled with existing values
        navigate("/createJobOrder", {
          state: {
            jobOrder: jobOrderData,
            isEdit: true, // Flag to indicate this is for editing/creating test orders
            originalJobOrderId: job_order_id, // Keep reference to original job order
          },
        });
      })
      .catch((error) => {
        console.error("Failed to fetch job order details:", error);
        // Still navigate but without pre-filled data
        navigate("/createJobOrder");
      });
  };

  // Handler for editing fields in the modal
  const handleEditChange = (field, value) => {
    setJobOrderEdit((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handler for saving the updated job order
  const handleSaveJobOrder = async () => {
    if (!jobOrderEdit?.job_order_id) return;
    try {
      showSnackbar("Updating job order...", "info");

      await axios.put(
        `${apiURL}/rde_joborders/${jobOrderEdit.job_order_id}`,
        jobOrderEdit
      );

      setModalOpen(false);
      fetchJobOrders();
      showSnackbar(
        `Job order ${jobOrderEdit.job_order_id} updated successfully!`,
        "success"
      );
    } catch (err) {
      console.error("Error updating job order:", err);
      showSnackbar(
        "Failed to update job order: " + (err.response?.data?.detail || err.message),
        "error"
      );
    }
  };

  return (
    <>
      <Navbar1 />
      <div className=" dark:bg-gray-900">
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
                  <h1 className="text-sm font-medium text-black-600 dark:text-red-500 ">
                    RDE CHENNAI
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  size="sm"
                  onClick={() => setShowSearchCard(!showSearchCard)}
                  className="border border-red-500 bg-red-50 text-red-500 hover:text-white hover:bg-red-500 flex items-center justify-center"
                >
                  <SearchIcon className="h-5 w-5" />
                </Button>
                {/* Tab Buttons */}
                {userRole !== "TestEngineer" && userRole !== "Admin" &&
                  ["Job Order", "Vehicle", "Engine"].map((tab) => (
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

        {/* Search Card */}
        {showSearchCard && (
          <div className="bg-white dark:bg-gray-900 py-4 px-6 border border-gray-300 rounded-lg mx-4 mt-4 shadow">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input placeholder="Job Order Number" className="border px-2 py-1 rounded text-sm" value={search.job_order_id} onChange={e => setSearch(s => ({ ...s, job_order_id: e.target.value }))} />
              <input placeholder="Project" className="border px-2 py-1 rounded text-sm" value={search.project_code} onChange={e => setSearch(s => ({ ...s, project_code: e.target.value }))} />
              <input placeholder="Vehicle Number" className="border px-2 py-1 rounded text-sm" value={search.vehicle_serial_number} onChange={e => setSearch(s => ({ ...s, vehicle_serial_number: e.target.value }))} />
              <input placeholder="Body Number" className="border px-2 py-1 rounded text-sm" value={search.vehicle_body_number} onChange={e => setSearch(s => ({ ...s, vehicle_body_number: e.target.value }))} />
              <input placeholder="Engine Number" className="border px-2 py-1 rounded text-sm" value={search.engine_serial_number} onChange={e => setSearch(s => ({ ...s, engine_serial_number: e.target.value }))} />
              <input placeholder="Domain" className="border px-2 py-1 rounded text-sm" value={search.domain} onChange={e => setSearch(s => ({ ...s, domain: e.target.value }))} />
              <input placeholder="Test Status" className="border px-2 py-1 rounded text-sm" value={search.test_status} onChange={e => setSearch(s => ({ ...s, test_status: e.target.value }))} />
              <input placeholder="Completed Tests" className="border px-2 py-1 rounded text-sm" value={search.completed_test_count} onChange={e => setSearch(s => ({ ...s, completed_test_count: e.target.value }))} />
              <input placeholder="Created By" className="border px-2 py-1 rounded text-sm" value={search.name_of_creator} onChange={e => setSearch(s => ({ ...s, name_of_creator: e.target.value }))} />
              <input placeholder="Created On" className="border px-2 py-1 rounded text-sm" value={search.created_on} onChange={e => setSearch(s => ({ ...s, created_on: e.target.value }))} />
              <input placeholder="Updated On" className="border px-2 py-1 rounded text-sm" value={search.updated_on} onChange={e => setSearch(s => ({ ...s, updated_on: e.target.value }))} />
              <input placeholder="Test Objective" className="border px-2 py-1 rounded text-sm" value={search.objective} onChange={e => setSearch(s => ({ ...s, objective: e.target.value }))} />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                onClick={() => {
                  setSearch({
                    job_order_id: "",
                    project_code: "",
                    vehicle_serial_number: "",
                    vehicle_body_number: "",
                    engine_serial_number: "",
                    domain: "",
                    test_status: "",
                    completed_test_count: "",
                    name_of_creator: "",
                    created_on: "",
                    updated_on: "",
                    objective: "",
                  });
                  setFilteredJobOrders(jobOrders);
                  setFilteredTestOrders([]); // <-- clear test order filter
                  setCurrentPage(1);
                }}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Clear
              </Button>
              <Button
                onClick={applySearch}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Apply
              </Button>
              <Button
                onClick={handleDownload}
                className="bg-yellow-500 text-black hover:bg-yellow-600"
              >
                Download
              </Button>
            </div>
          </div>
        )}


        {/* Current Job Orders Badge */}
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center bg-white dark:bg-black">
          <Badge className="bg-yellow-400 text-black hover:bg-yellow-500 px-3 py-1">
            Current Job Orders
          </Badge>
          {/* Hide CREATE JOB ORDER button for TEST ENGINEER */}
          {userRole !== "TestEngineer" && userRole !== "Admin" && (
            <Button
              onClick={handleCreateJobOrder}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
            >
              <Add className="h-4 w-4 mr-1" />
              CREATE JOB ORDER
            </Button>
          )}
        </div>

        {/* Main Content */}
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 bg-white dark:bg-black">
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {filteredTestOrders.length > 0 ? (
                      <>
                        <TableHead className="font-semibold text-gray-700 text-xs">Test Order ID</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">Job Order ID</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">Objective</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">Test Status</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">Created by</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">Created on</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">Updated by</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">Updated on</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="font-semibold text-gray-700 text-xs">
                          Job Order Number
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">
                          Project Code
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">
                          Vehicle Number
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">
                          Body No
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">
                          Engine Number
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">
                          Domain
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">
                          Test Status
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs px-4 py-2">
                          Completed Tests
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">
                          Created By
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">
                          Created on
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">
                          Last updated By
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">
                          Last updated on
                        </TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTestOrders.length > 0 ? (
                    currentRows.map((testOrder, index) => (
                      <TableRow key={testOrder.test_order_id || testOrder.id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                        <TableCell className="text-xs text-blue-600 underline cursor-pointer">
                          {testOrder.test_order_id || testOrder.id}
                        </TableCell>
                        <TableCell className="text-xs text-gray-900">
                          {testOrder.job_order_id || testOrder.jobOrderId}
                        </TableCell>
                        <TableCell className="text-xs text-gray-900">
                          {testOrder.objective || testOrder.test_objective || (testOrder.test_details ? testOrder.test_details.objective : "")}
                        </TableCell>
                        <TableCell className="text-xs text-gray-900">
                          {testOrder.test_status}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {testOrder.name_of_creator}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {testOrder.created_on
                            ? new Date(testOrder.created_on).toLocaleString("en-IN", {
                                timeZone: "Asia/Kolkata",
                                hour12: true,
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {testOrder.name_of_updater}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {testOrder.updated_on
                            ? new Date(testOrder.updated_on).toLocaleString("en-IN", {
                                timeZone: "Asia/Kolkata",
                                hour12: true,
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    currentRows.map((order, index) => (
                      <TableRow
                        key={order.job_order_id || index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                      >
                        <TableCell className="text-xs">
                          <span
                            className="text-blue-600 hover:text-blue-800 cursor-pointer underline dark:text-green-500 dark:hover:text-green-400"
                            onClick={() => handleJobOrderClick(order.job_order_id)}
                          >
                            {order.job_order_id}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-gray-900">
                          {order.project_code}
                        </TableCell>

                        <TableCell className="text-xs text-gray-600">
                          {order.vehicle_serial_number}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {order.vehicle_body_number}
                        </TableCell>
                        <TableCell className="text-xs text-gray-900">
                          {order.engine_serial_number}
                        </TableCell>
                        <TableCell className="text-xs text-gray-900">
                          {order.domain}
                        </TableCell>
                        <TableCell className="text-xs text-gray-900">
                          {order.test_status}
                        </TableCell>
                        <TableCell className="text-xs text-gray-900 px-4 py-2">
                          {order.completed_test_count == 0
                            ? "0"
                            : `${order.completed_test_count}/${order.test_status}`}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {order.name_of_creator}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 px-4 py-2">
                          {new Date(order.created_on).toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            hour12: true,
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {order.last_updated_by}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {order.updated_on?.slice(0, 10)}
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
            <div className="text-sm text-gray-600 dark:text-white">
              Showing {startIndex + 1} to {Math.min(endIndex, jobOrders.length)}{" "}
              of {jobOrders.length}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
                className="text-gray-400 dark:text-white dark:border-gray-600"
              >
                {"<<"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="text-gray-400 dark:text-white dark:border-gray-600"
              >
                {"<"}
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={
                      currentPage === page
                        ? "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black"
                        : "text-gray-600 dark:text-white dark:border-gray-600"
                    }
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="text-gray-400 dark:text-white dark:border-gray-600"
              >
                {">"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(totalPages)}
                className="text-gray-400 dark:text-white dark:border-gray-600"
              >
                {">>"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal for viewing/editing job order */}
      {modalOpen && jobOrderEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Job Order Details</h2>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Close
              </Button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveJobOrder();
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(jobOrderEdit).map(([key, value]) => (
                  <div key={key} className="flex flex-col mb-2">
                    <label className="font-semibold text-xs capitalize mb-1">
                      {key.replace(/_/g, " ")}
                    </label>
                    <input
                      className="border px-2 py-1 rounded text-xs"
                      value={value ?? ""}
                      onChange={(e) => handleEditChange(key, e.target.value)}
                      disabled={key === "job_order_id"}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-red-600 text-white">
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
