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
import { useState } from "react";
import Navbar1 from "@/components/UI/navbar";

const engines = [
  {
    engineSerialNumber: "ENGINE1",
    engineBuildLevel: "L90",
    engineCapacity: "",
    engineType: "DIESEL",
    lastUpdatedOn: "",
  },
  {
    engineSerialNumber: "ENGINE",
    engineBuildLevel: "TEST",
    engineCapacity: "",
    engineType: "",
    lastUpdatedOn: "",
  },
  {
    engineSerialNumber: "DEMO1",
    engineBuildLevel: "",
    engineCapacity: "",
    engineType: "",
    lastUpdatedOn: "",
  },
  {
    engineSerialNumber: "FOR HOT TESTING",
    engineBuildLevel: "",
    engineCapacity: "",
    engineType: "FOR HOT TESTING",
    lastUpdatedOn: "21-09-2021",
  },
  {
    engineSerialNumber: "TESTTEST",
    engineBuildLevel: "",
    engineCapacity: "",
    engineType: "",
    lastUpdatedOn: "",
  },
  {
    engineSerialNumber: "123123123",
    engineBuildLevel: "TEST",
    engineCapacity: "TEST",
    engineType: "TEST",
    lastUpdatedOn: "15-09-2021",
  },
  {
    engineSerialNumber: "NOLINE",
    engineBuildLevel: "",
    engineCapacity: "",
    engineType: "",
    lastUpdatedOn: "15-09-2021",
  },
  {
    engineSerialNumber: "SAMPLE",
    engineBuildLevel: "",
    engineCapacity: "",
    engineType: "",
    lastUpdatedOn: "15-09-2021",
  },
  {
    engineSerialNumber: "123123123",
    engineBuildLevel: "",
    engineCapacity: "",
    engineType: "",
    lastUpdatedOn: "",
  },
  {
    engineSerialNumber: "123456789",
    engineBuildLevel: "",
    engineCapacity: "",
    engineType: "",
    lastUpdatedOn: "",
  },
];

export default function VTCEnginePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Engine");

  const handleBack = () => {
    navigate(-1); 
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
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
                {/* Add New Engine Button */}
                <Button
                  onClick={handleAddNewEngine}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Add className="h-4 w-4 mr-1" />
                  ADD NEW ENGINE
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Engine List Badge */}
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Badge className="bg-yellow-400 text-black hover:bg-yellow-500 px-3 py-1">
            Engine List
          </Badge>
        </div>

        {/* Main Content */}
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700 text-sm">
                      Engine Serial Number
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">
                      Engine Build Level
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">
                      Engine Capacity (cc)
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">
                      Engine Type
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">
                      Last Updated on
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {engines.map((engine, index) => (
                    <TableRow
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                    >
                      <TableCell className="text-sm text-gray-900 font-medium">
                        {engine.engineSerialNumber}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        {engine.engineBuildLevel}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        {engine.engineCapacity}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        {engine.engineType}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {engine.lastUpdatedOn}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">Showing 1 of 10</div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-gray-400"
              >
                {"<<"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-gray-400"
              >
                {"<"}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-black text-white hover:bg-gray-800"
              >
                1
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-gray-400"
              >
                {">"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-gray-400"
              >
                {">>"}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-100 border-t py-4 dark:bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-gray-500">
              © 2022 Brand, Inc • Privacy • Terms • Sitemap
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
