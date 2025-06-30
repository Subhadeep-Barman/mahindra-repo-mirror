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

const vehicles = [];

export default function VTCNashikVehicle() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [activeTab, setActiveTab] = useState("Vehicle");

  // Pagination calculations
  const totalItems = vehicles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = vehicles.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleTabClick = (tab) => {
  setActiveTab(tab);
  if (tab === "Job Order") navigate("/nashik/joborder");
  else if (tab === "Vehicle") navigate("/nashik/vehicle");
  else if (tab === "Engine") navigate("/nashik/engine");
};

  const handleAddNewVehicle = () => {
    navigate("/nashik/vehicle/new");
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
                  VTC Nashik
                </h1>
                <h2 className="text-xl font-bold text-gray-900 dark:text-red-500">NEW VEHICLE</h2>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Tab Buttons */}
              {["Job Order", "Vehicle", "Engine"].map((tab) => (
                <Button
                  key={tab}
                  variant="default"
                  onClick={() => handleTabClick(tab)}
                  className={`bg-red-500 hover:bg-red-600 text-white ${activeTab === tab ? "ring-2 ring-red-300" : ""}`}
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
            {/* Add page numbers here if needed */}
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