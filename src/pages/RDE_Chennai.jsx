"use client";

import { ArrowBack, Add } from "@mui/icons-material";
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
import { Card } from "@/components/UI/card";
import { useState } from "react";
import Navbar2 from "@/components/UI/navbar2";
const jobOrders = [
  {
    weekNo: 51,
    jobOrderNumber: "VTC-21-6615",
    project: "U952",
    vehicleNumber: "VEHICLE NO-123",
    bodyNo: "VEHICLE NO-123",
    engineNumber: "ENGINE NO-123",
    domain: "BOE",
    testStatus: "1/2",
    createdBy: "SANKAR SURESH (SANKSU-CONT)",
    createdOn: "13-12-2021 11:50 AM",
    lastUpdatedBy: "SANKAR SURESH (SANKSU-CONT)",
    lastUpdatedOn: "13-12-2021 04:39 PM",
  },
  {
    weekNo: 50,
    jobOrderNumber: "VTC-21-6615",
    project: "U952",
    vehicleNumber: "VEHICLE NO-123",
    bodyNo: "VEHICLE NO-123",
    engineNumber: "ENGINE NO-123",
    domain: "BOE",
    testStatus: "1/2",
    createdBy: "SANKAR SURESH (SANKSU-CONT)",
    createdOn: "10-12-2021 11:50 AM",
    lastUpdatedBy: "SANKAR SURESH (SANKSU-CONT)",
    lastUpdatedOn: "13-12-2021 04:39 PM",
  },
  {
    weekNo: 50,
    jobOrderNumber: "VTC-21-6634",
    project: "U952",
    vehicleNumber: "V.S.NO-123456",
    bodyNo: "V.B.NO-123456",
    engineNumber: "E.S.NO-123456",
    domain: "OBD",
    testStatus: "0/1",
    createdBy: "SANKAR SURESH (SANKSU-CONT)",
    createdOn: "13-12-2021 09:33 PM",
    lastUpdatedBy: "SANKAR SURESH (SANKSU-CONT)",
    lastUpdatedOn: "13-12-2021 04:40 PM",
  },
  {
    weekNo: 50,
    jobOrderNumber: "VTC-21-6633",
    project: "U952",
    vehicleNumber: "VEHICLE NO-123",
    bodyNo: "VEHICLE NO-123",
    engineNumber: "ENGINE NO-123",
    domain: "OBD",
    testStatus: "1/7",
    createdBy: "SANKAR SURESH (SANKSU-CONT)",
    createdOn: "13-12-2021 09:31 AM",
    lastUpdatedBy: "SANKAR SURESH (SANKSU-CONT)",
    lastUpdatedOn: "13-12-2021 04:40 PM",
  },
  {
    weekNo: 50,
    jobOrderNumber: "VTC-21-6632",
    project: "U952",
    vehicleNumber: "11111111",
    bodyNo: "23423654",
    engineNumber: "242343545",
    domain: "OBD",
    testStatus: "2/3",
    createdBy: "SANKAR SURESH (SANKSU-CONT)",
    createdOn: "06-12-2021",
    lastUpdatedBy: "SANKAR SURESH (SANKSU-CONT)",
    lastUpdatedOn: "13-12-2021 04:41 PM",
  },
  {
    weekNo: 48,
    jobOrderNumber: "VTC-21-6631",
    project: "U952",
    vehicleNumber: "11111111",
    bodyNo: "23423654",
    engineNumber: "242343545",
    domain: "AIR SYSTEM",
    testStatus: "0/2",
    createdBy: "SANKAR SURESH(SANKSU-CONT)",
    createdOn: "29-11-2021",
    lastUpdatedBy: "SANKAR SURESH(SANKSU-CONT)",
    lastUpdatedOn: "29-11-2021",
  },
  {
    weekNo: 47,
    jobOrderNumber: "VTC-21-6630",
    project: "U952",
    vehicleNumber: "11111111",
    bodyNo: "23423654",
    engineNumber: "242343545",
    domain: "SCR",
    testStatus: "0/1",
    createdBy: "SANKAR SURESH(SANKSU-CONT)",
    createdOn: "26-11-2021",
    lastUpdatedBy: "SANKAR SURESH(SANKSU-CONT)",
    lastUpdatedOn: "26-11-2021",
  },
  {
    weekNo: 47,
    jobOrderNumber: "VTC-21-6629",
    project: "U952",
    vehicleNumber: "11111111",
    bodyNo: "23423654",
    engineNumber: "242343545",
    domain: "ENGINE TEAM",
    testStatus: "0/1",
    createdBy: "",
    createdOn: "22-11-2021",
    lastUpdatedBy: "SANKAR SURESH(SANKSU-CONT)",
    lastUpdatedOn: "26-11-2021",
  },
  {
    weekNo: 47,
    jobOrderNumber: "VTC-21-6628",
    project: "U952",
    vehicleNumber: "11111111",
    bodyNo: "23423654",
    engineNumber: "242343545",
    domain: "GENERAL",
    testStatus: "1/1",
    createdBy: "",
    createdOn: "22-11-2021",
    lastUpdatedBy: "",
    lastUpdatedOn: "22-11-2021",
  },
  {
    weekNo: "",
    jobOrderNumber: "VTC-21-6627",
    project: "U952",
    vehicleNumber: "11111111",
    bodyNo: "23423654",
    engineNumber: "242343545",
    domain: "DPF",
    testStatus: "0/1",
    createdBy: "SANKAR SURESH(SANKSU-CONT)",
    createdOn: "22-11-2021",
    lastUpdatedBy: "",
    lastUpdatedOn: "",
  },
];

export default function VTCChennaiPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Job Order");
  const rowsPerPage = 8;

  // Calculate pagination values
  const totalPages = Math.ceil(jobOrders.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = jobOrders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    console.log("Navigate back");
  };

  const handleCreateJobOrder = () => {
    console.log("Create new job order");
  };

  const navigate = useNavigate();

const handleTabClick = (tab) => {
  setActiveTab(tab);
  if (tab === "Job Order") navigate("/rde/joborder");
  else if (tab === "Vehicle") navigate("/rde/vehicle");
  else if (tab === "Engine") navigate("/rde/engine");
};

  return (
    <>
      <Navbar2 />
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
                  <TableRow className>
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
