"use client";

import { ArrowBack, Add } from "@mui/icons-material";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import Navbar2 from "@/components/ui/navbar2";
const jobOrders = [
  // ...your jobOrders data...
];

export default function VTCChennaiPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  // Calculate pagination values
  const totalPages = Math.ceil(jobOrders.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = jobOrders.slice(startIndex, endIndex);

  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from the current route
  let activeTab = "Job Order";
  if (location.pathname.toLowerCase().includes("vehicle")) activeTab = "Vehicle";
  else if (location.pathname.toLowerCase().includes("engine")) activeTab = "Engine";

  const handleTabClick = (tab) => {
    if (tab === "Job Order") navigate("/cJobOrder");
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

  return (
    <>
      <Navbar2 />
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
                      ${activeTab === tab
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-white text-red-500 border-red-500 hover:bg-red-50"}
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
                    <TableHead className="font-semibold text-gray-700 text-xs">Week No</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs">Job Order Number</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs">Project</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs">Vehicle Number</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs">Body No</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs">Engine Number</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs">Domain</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs">Test Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs">Created By</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs">Created on</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs">Last updated By</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs">Last updated on</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRows.map((order, index) => (
                    <TableRow
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                    >
                      <TableCell className="text-xs text-gray-900">{order.weekNo}</TableCell>
                      <TableCell className="text-xs">
                        <span className="text-blue-600 hover:text-blue-800 cursor-pointer underline dark:text-green-500 dark:hover:text-green-400">
                          {order.jobOrderNumber}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-gray-900">{order.project}</TableCell>
                      <TableCell className="text-xs text-gray-600">{order.vehicleNumber}</TableCell>
                      <TableCell className="text-xs text-gray-600">{order.bodyNo}</TableCell>
                      <TableCell className="text-xs text-gray-600">{order.engineNumber}</TableCell>
                      <TableCell className="text-xs text-gray-900">{order.domain}</TableCell>
                      <TableCell className="text-xs text-gray-900">{order.testStatus}</TableCell>
                      <TableCell className="text-xs text-gray-600">{order.createdBy}</TableCell>
                      <TableCell className="text-xs text-gray-600">{order.createdOn}</TableCell>
                      <TableCell className="text-xs text-gray-600">{order.lastUpdatedBy}</TableCell>
                      <TableCell className="text-xs text-gray-600">{order.lastUpdatedOn}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600 dark:text-white">
              Showing {startIndex + 1} to {Math.min(endIndex, jobOrders.length)} of {jobOrders.length}
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={currentPage === page
                    ? "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black"
                    : "text-gray-600 dark:text-white dark:border-gray-600"}
                >
                  {page}
                </Button>
              ))}
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
    </> 
  );
}