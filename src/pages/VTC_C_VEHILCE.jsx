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

const vehicles = [
  {
    vehicleSerialNumber: "V.S.NO-123456",
    vehicleBodyNumber: "V.B.NO-123456",
    vehicleModel: "BOLERO_NEO_D_B56",
    createdBy: "SANKAR SURESH (SANKSU-CONT)",
    createdOn: "13-12-2021 01:57 PM",
    lastUpdatedBy: "SANKAR SURESH (SANKSU-CONT)",
    lastUpdatedOn: "13-12-2021 02:05 PM",
  },
  {
    vehicleSerialNumber: "7564321",
    vehicleBodyNumber: "1234567",
    vehicleModel: "BOLERO_NEO_PLUS_D_B56",
    createdBy: "SANKAR SURESH (SANKSU-CONT)",
    createdOn: "09-12-2021 04:33 PM",
    lastUpdatedBy: "SANKAR SURESH (SANKSU-CONT)",
    lastUpdatedOn: "13-12-2021 02:16 PM",
  },
  {
    vehicleSerialNumber: "VEHICLE NO-123",
    vehicleBodyNumber: "VEHICLE NO-123",
    vehicleModel: "",
    createdBy: "SANKAR SURESH (SANKSU-CONT)",
    createdOn: "10-12-2021 11:47 AM",
    lastUpdatedBy: "",
    lastUpdatedOn: "",
  },
  {
    vehicleSerialNumber: "VEHICLE NO-2",
    vehicleBodyNumber: "789",
    vehicleModel: "Not Listed",
    createdBy: "RAVIKANTH (RAVIKANTHRAMAN-CONT)",
    createdOn: "09-12-2021 09:25 PM",
    lastUpdatedBy: "SANKAR SURESH(SANKSU-CONT)",
    lastUpdatedOn: "09-12-2021 09:13 AM",
  },
];

export default function VTCVehiclePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const totalItems = vehicles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = vehicles.slice(indexOfFirstItem, indexOfLastItem);

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

  const handleAddNewVehicle = () => {
    navigate("/vtcvehicle/new");
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <Navbar2 />
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
                <h1 className="text-sm font-medium text-gray-600 dark:text-red-500">
                  VTC CHENNAI
                </h1>
                <h2 className="text-xl font-bold text-gray-900 dark:text-red-500">NEW VEHICLE</h2>
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

      {/* Vehicle List Badge */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center bg-white dark:bg-black">
        <Badge className="bg-yellow-400 text-black hover:bg-yellow-500 px-3 py-1">
          Current Job Orders
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-gray-700 text-sm">Vehicle Serial Number</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm">Vehicle Body Number</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm">Vehicle Model</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm">Created By</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm">Created on</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm">Last Updated By</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm">Last Updated on</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((vehicle, index) => (
                  <TableRow
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                  >
                    <TableCell className="text-sm text-gray-900 font-medium">
                      {vehicle.vehicleSerialNumber}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {vehicle.vehicleBodyNumber}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {vehicle.vehicleModel}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {vehicle.createdBy}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {vehicle.createdOn}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {vehicle.lastUpdatedBy}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {vehicle.lastUpdatedOn}
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
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} Records
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(1)}
              className={currentPage === 1 ? "text-gray-400" : "text-gray-600"}
            >
              {"<<"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className={currentPage === 1 ? "text-gray-400" : "text-gray-600"}
            >
              {"<"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className={currentPage === totalPages ? "text-gray-400" : "text-gray-600"}
            >
              {">"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(totalPages)}
              className={currentPage === totalPages ? "text-gray-400" : "text-gray-600"}
            >
              {">>"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}