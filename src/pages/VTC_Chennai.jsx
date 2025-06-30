"use client";

import { ArrowBack, Add } from "@mui/icons-material";
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
import { useState, useEffect } from "react";
import Navbar1 from "@/components/UI/navbar";
import axios from "axios";
const apiURL = import.meta.env.VITE_BACKEND_URL;

export default function VTCChennaiPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  // Add: State for job orders fetched from backend
  const [jobOrders, setJobOrders] = useState([]);

  // State for selected job order and modal
  const [selectedJobOrder, setSelectedJobOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [jobOrderEdit, setJobOrderEdit] = useState(null);

  // Fetch job orders from backend on mount
  useEffect(() => {
    fetchJobOrders();
  }, []);

  const fetchJobOrders = () => {
    axios
      .get(`${apiURL}/joborders`)
      .then((res) => setJobOrders(res.data || []))
      .catch(() => setJobOrders([]));
  };

  // Calculate pagination values
  const totalPages = Math.ceil(jobOrders.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = jobOrders.slice(startIndex, endIndex);

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

  const handleCreateJobOrder = () => {
    navigate("/createJobOrder");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handler for clicking job order number
  const handleJobOrderClick = (job_order_id) => {
    // Fetch job order details from backend and redirect to /createJobOrder with all data
    axios
      .get(`${apiURL}/joborders/${job_order_id}`)
      .then((res) => {
        // Pass the complete job order data to create job order page
        // This will allow the form to be pre-filled with existing values
        navigate("/createJobOrder", {
          state: {
            jobOrder: res.data,
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
      await axios.put(
        `${apiURL}/joborders/${jobOrderEdit.job_order_id}`,
        jobOrderEdit
      );
      setModalOpen(false);
      fetchJobOrders();
    } catch (err) {
      alert("Failed to update job order");
    }
  };

  return (
    <>
      <Navbar1 />
      <div className="dark:bg-gray-900">
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

        {/* Current Job Orders Badge */}
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center bg-white dark:bg-black">
          <Badge className="bg-yellow-400 text-black hover:bg-yellow-500 px-3 py-1">
            Current Job Orders
          </Badge>
          <Button
            onClick={handleCreateJobOrder}
            className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
          >
            <Add className="h-4 w-4 mr-1" />
            CREATE JOB ORDER
          </Button>
        </div>

        {/* Main Content */}
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 bg-white dark:bg-black">
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700 text-xs">
                      Job Order Number
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs">
                      Project
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
                      Job Order Status
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRows.map((order, index) => (
                    <TableRow
                      key={order.job_order_id || index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                    >
                      <TableCell
                        className="text-xs text-blue-600 underline cursor-pointer"
                        onClick={() => handleJobOrderClick(order.job_order_id)}
                      >
                        {order.job_order_id}
                      </TableCell>
                      <TableCell className="text-xs text-gray-900">
                        {order.project_id}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {order.vehicle_id}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {order.vehicle_body_number}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {order.engine_id}
                      </TableCell>
                      <TableCell className="text-xs text-gray-900">
                        {order.domain}
                      </TableCell>
                      <TableCell className="text-xs text-gray-900">
                        {order.job_order_status}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {order.name_of_creator}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {order.created_on?.slice(0, 10)}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {order.name_of_updater}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {order.updated_on?.slice(0, 10)}
                      </TableCell>
                    </TableRow>
                  ))}
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
