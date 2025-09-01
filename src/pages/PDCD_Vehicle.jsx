import { ArrowBack, Add } from "@mui/icons-material";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/UI/card";
import { useState, useEffect } from "react";
import Navbar1 from "@/components/UI/navbar";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import showSnackbar from "@/utils/showSnackbar";
import { DataGrid } from "@mui/x-data-grid"; // Import DataGrid

const apiURL = import.meta.env.VITE_BACKEND_URL;

export default function PDCDVehicle() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiUserRole, userId, userName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch vehicles from API on mount
  useEffect(() => {
    async function fetchVehicles() {
      setLoading(true);
      try {
        const response = await axios.get(`${apiURL}/vehicles`);
        const minimalVehicles = (response.data || []).map((v) => ({
          id: v.vehicle_serial_number, // DataGrid requires a unique 'id' field
          vehicle_serial_number: v.vehicle_serial_number,
          vehicle_body_number: v.vehicle_body_number,
          vehicle_model: v.vehicle_model,
          name_of_creator: v.name_of_creator || "NA",
          created_on: new Date(v.created_on).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour12: true,
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          name_of_updater: v.name_of_updater || "NA",
          updated_on: new Date(v.updated_on).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour12: true,
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        setVehicles(minimalVehicles);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
  }, []);

  const handleAddNewVehicle = () => {
    navigate("/vtcvehicle/new?department=PDCD_JO%20Chennai");
  };

  const handleEditClick = (vehicle) => {
    navigate(`/vtcvehicle/new?department=PDCD_JO%20Chennai&edit=true`, {
      state: { vehicleData: vehicle, isEdit: true },
    });
  };

  // Define columns for DataGrid
  const columns = [
    {
      field: "vehicle_serial_number",
      headerName: "Vehicle Serial Number",
      flex: 1,
      renderCell: (params) => (
        <span
          className="text-blue-600 hover:text-blue-800 cursor-pointer underline"
          onClick={() => handleEditClick(params.row)}
        >
          {params.value}
        </span>
      ),
    },
    { field: "vehicle_body_number", headerName: "Vehicle Body Number", flex: 1 },
    { field: "vehicle_model", headerName: "Vehicle Model", flex: 1 },
    { field: "name_of_creator", headerName: "Created By", flex: 1 },
    { field: "created_on", headerName: "Created On", flex: 1 },
    { field: "name_of_updater", headerName: "Last Updated By", flex: 1 },
    { field: "updated_on", headerName: "Last Updated On", flex: 1 },
  ];

  // Determine active tab from the current route
  let activeTab = "Job Order";
  if (location.pathname.toLowerCase().includes("vehicle"))
    activeTab = "Vehicle";
  else if (location.pathname.toLowerCase().includes("engine"))
    activeTab = "Engine";

  const handleTabClick = (tab) => {
    if (tab === "Job Order") navigate("/pdcd-lab");
    else if (tab === "Vehicle") navigate("/pdcd/vehicle");
    else if (tab === "Engine") navigate("/pdcd/engine");
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
                onClick={() => navigate(-1)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:border-red-500 dark:hover:bg-red-950 rounded-full border border-red-500"
              >
                <ArrowBack className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-sm font-medium text-black-600 dark:text-red-500">
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
          <div style={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={vehicles}
              columns={columns}
              pageSize={8}
              rowsPerPageOptions={[8]}
              loading={loading}
              autoHeight
              disableSelectionOnClick
            />
          </div>
        </Card>
      </div>
    </>
  );
}