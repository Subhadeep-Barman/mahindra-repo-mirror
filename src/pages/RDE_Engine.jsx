import { ArrowBack, Add } from "@mui/icons-material";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { Card } from "@/components/UI/card";
import { useEffect, useState } from "react";
import Navbar1 from "@/components/UI/navbar";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import showSnackbar from "@/utils/showSnackbar";
import { DataGrid } from "@mui/x-data-grid"; // Import DataGrid

const apiURL = import.meta.env.VITE_BACKEND_URL;

export default function RDEEnginePage() {
  const [engines, setEngines] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiUserRole, userId, userName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch engines from API on mount
  useEffect(() => {
    const fetchEngines = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiURL}/engines`);
        const minimalEngines = (response.data || []).map((e, index) => ({
          id: e.engine_serial_number || `temp-id-${index}`, // Ensure unique id
          engine_serial_number: e.engine_serial_number || "",
          engine_build_level: e.engine_build_level || "",
          engine_capacity: e.engine_capacity || "",
          engine_type: e.engine_type || "",
          name_of_creator: e.name_of_creator || "NA",
          created_on: new Date(e.created_on).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour12: true,
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          name_of_updater: e.name_of_updater || "NA",
          updated_on: new Date(e.updated_on).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour12: true,
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        setEngines(minimalEngines);
      } catch (err) {
        console.error("Error fetching engines:", err);
        setEngines([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEngines();
  }, []);

  const handleAddNewEngine = () => {
    navigate("/rde/engine/new?department=RDE");
  };

  const handleEditClick = (engine) => {
    navigate(`/rde/engine/new?department=RDE&edit=true`, {
      state: { engineData: engine, isEdit: true },
    });
  };

  // Define columns for DataGrid
  const columns = [
    {
      field: "engine_serial_number",
      headerName: "Engine Serial Number",
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
    { field: "engine_build_level", headerName: "Engine Build Level", flex: 1 },
    { field: "engine_capacity", headerName: "Engine Capacity (cc)", flex: 1 },
    { field: "engine_type", headerName: "Engine Type", flex: 1 },
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
    if (tab === "Job Order") navigate("/rde-chennai");
    else if (tab === "Vehicle") navigate("/rde/vehicle");
    else if (tab === "Engine") navigate("/rde/engine");
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
                  onClick={() => navigate(-1)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:border-red-500 dark:hover:bg-red-950 rounded-full border border-red-500"
                >
                  <ArrowBack className="h-5 w-5" />
                </Button>
                <h1 className="text-sm font-medium text-gray-600 dark:text-red-500">
                  RDE Chennai
                </h1>
              </div>
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
        </div>

        {/* Main Content */}
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <Card>
            <div style={{ height: 600, width: "100%" }}>
              <DataGrid
                rows={engines}
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
      </div>
    </>
  );
}