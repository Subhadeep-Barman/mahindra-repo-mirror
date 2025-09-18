import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Snackbar, Alert } from '@mui/material';
import useStore from '@/store/useStore';
import { useInactivityHandler } from './hooks/useInactivityHandler';

// Auth & Home
import Login from "./pages/login";
import HomePage from "./pages/home";

// Admin
import AdminPortal from "./pages/adminPortal";

// VTC Chennai
import VTCChennaiPage from "./pages/VTC_Chennai";
import PDCDChennaiPage from "./pages/PDCD_CHENNAI";
import VTCCVehiclePage from "./pages/VTC_C_VEHILCE";
import VTCEnginePage from "./pages/VTC_C_engine_page";
import EngineForm from "./pages/VTC_C_Engine";
import VehicleForm from "@/components/VTC_C_Vehicle_form";
import VTCCEngineForm from "./pages/vtc_c_engine_form";
import RDEnginePage from "./pages/RDE_C_engine_page";

// VTC Nashik
import VTCNashikPage from "./pages/VTC_Nashik";
import NashikJobOrder from "./pages/Nashik_create_joborder";
import PDCDCreateJobOrder from "./pages/PDCD_Create_JobOrder";
import PDCDVehicle from "./pages/PDCD_Vehicle";
import PDCDEnginePage from "./pages/PDCD_Engine";
import VTCNashikVehicle from "./pages/VTC_N_vehicle";
import NEngine from "./pages/VTC_N_Engine";
// import VTCNashikVehicleForm from "./pages/VTC_N_Vehicle_form";

// RDE
import RDEChennaiPage from "./pages/RDE_Chennai_Page";
import RDE_JobOrder_Create from "./pages/RDE_JobOrder_Create";
// import RDEJobOrder from "./pages/RDE_JOBORDER";
import RDEVehicle from "./pages/RDE_C_vehicle";
import RDEEngine from "./pages/RDE_Engine";

// Misc
import CreateJobOrder from "./pages/Chennai_create_joborder";
import AuthSuccess from "./pages/AuthSuccess";
import DefaultLogin from "./pages/defaultlogin";

// Import EditTestOrder component
import EditTestOrder from "./pages/EditTestOrder";

// Import AddNewFields component
import AddNewFields from "./pages/AddNewFields";

// Define which roles can access which routes
const routePermissions = {
  "/home": ["Admin", "ProjectTeam", "TestEngineer"],
  "/admin-portal": ["Admin"],
  "/vtc-chennai": ["Admin", "ProjectTeam", "TestEngineer"], // example: admin not allowed
  "/vtccvehicle": ["ProjectTeam"],
  "/vtcChennaiEngine": ["ProjectTeam"],
  "/engineform": ["ProjectTeam"],
  "/vtcvehicle/new": ["ProjectTeam"],
  "/chennai/engine/new": ["ProjectTeam"],
  "/pdcd-lab": ["Admin", "ProjectTeam", "TestEngineer"],
  "/PDCDCreateJobOrder": ["ProjectTeam"],
  "/pdcd/vehicle": ["ProjectTeam"],
  "/pdcd/engine": ["ProjectTeam"],
  "/pdcd/engine/new": ["ProjectTeam"],
  "/vtc-nashik": ["Admin", "ProjectTeam", "TestEngineer"],
  "/NashikCreateJobOrder": ["ProjectTeam"],
  "/nashik/vehicle": ["ProjectTeam",],
  "/nashik/engine": ["ProjectTeam"],
  "/nashik/engine/new": [ "ProjectTeam"],
  "/rde-chennai": ["Admin", "ProjectTeam", "TestEngineer"],
  "/rde/vehicle": ["ProjectTeam"],
  "/rde/engine": ["ProjectTeam"],
  "/rde/engine/new": ["ProjectTeam"],
  "/RDECreateJobOrder": ["ProjectTeam"],
  "/createJobOrder": ["Admin","ProjectTeam","TestEngineer"],
  "/editTestOrder": ["Admin","ProjectTeam","TestEngineer"],
  "/admin/dropdown-options": ["Admin"],
};

// ProtectedRoute component
const ProtectedRoute = ({ element, path }) => {
  const userCookies = useStore.getState().getUserCookieData?.();
  const userRole = userCookies?.userRole;

  // If not logged in, redirect to login
  if (!userRole) return <Navigate to="/login" replace />;

  // If route has permissions defined, check if userRole is allowed
  if (path && routePermissions[path] && !routePermissions[path].includes(userRole)) {
    console.log(`User with role ${userRole} is not allowed to access ${path}`);
    return <Navigate to="/home" replace />;
  }

  // Otherwise, allow access
  return element;
};

// Component that uses the inactivity handler inside Router context
function AppWithInactivity() {
  // Initialize inactivity handler (now inside Router context)
  useInactivityHandler();

  // Move snackbar state to App component where Snackbar is rendered
  const {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    snackbarDuration,
    setSnackbarOpen
  } = useStore();

  return (
    <div className="px-4">
      <Routes>
        {/* Auth & Home */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/default-login" element={<DefaultLogin />} />
        <Route path="/authSuccess" element={<AuthSuccess />} />

        {/* Protected Routes */}
        <Route path="/home" element={<ProtectedRoute element={<HomePage />} path="/home" />} />
        <Route path="/admin-portal" element={<ProtectedRoute element={<AdminPortal />} path="/admin-portal" />} />

        {/* VTC Chennai */}
        <Route path="/vtc-chennai" element={<ProtectedRoute element={<VTCChennaiPage />} path="/vtc-chennai" />} />
        <Route path="/vtccvehicle" element={<ProtectedRoute element={<VTCCVehiclePage />} path="/vtccvehicle" />} />
        <Route path="/vtcChennaiEngine" element={<ProtectedRoute element={<VTCEnginePage />} path="/vtcChennaiEngine" />} />
        <Route path="/engineform" element={<ProtectedRoute element={<EngineForm />} path="/engineform" />} />
        <Route path="/vtcvehicle/new" element={<ProtectedRoute element={<VehicleForm />} path="/vtcvehicle/new" />} />
        <Route path="/chennai/engine/new" element={<ProtectedRoute element={<VTCCEngineForm />} path="/chennai/engine/new" />} />

        {/* PDCD Chennai */}
        <Route path="/pdcd-lab" element={<ProtectedRoute element={<PDCDChennaiPage />} path="/pdcd-lab" />} />
        <Route path="/PDCDCreateJobOrder" element={<ProtectedRoute element={<PDCDCreateJobOrder />} path="/PDCDCreateJobOrder" />} />
        <Route path="/pdcd/vehicle" element={<ProtectedRoute element={<PDCDVehicle />} path="/pdcd/vehicle" />} />
        <Route path="/pdcd/engine" element={<ProtectedRoute element={<PDCDEnginePage />} path="/pdcd/engine" />} />
        <Route path="/pdcd/engine/new" element={<ProtectedRoute element={<VTCCEngineForm />} path="/pdcd/engine/new" />} />

        {/* VTC Nashik */}
        <Route path="/vtc-nashik" element={<ProtectedRoute element={<VTCNashikPage />} path="/vtc-nashik" />} />
        <Route path="/NashikCreateJobOrder" element={<ProtectedRoute element={<NashikJobOrder />} path="/NashikCreateJobOrder" />} />
        <Route path="/nashik/vehicle" element={<ProtectedRoute element={<VTCNashikVehicle />} path="/nashik/vehicle" />} />
        <Route path="/nashik/engine" element={<ProtectedRoute element={<RDEnginePage />} path="/nashik/engine" />} />
        <Route path="/nashik/engine/new" element={<ProtectedRoute element={<NEngine />} path="/nashik/engine/new" />} />

        {/* RDE */}
        <Route path="/rde-chennai" element={<ProtectedRoute element={<RDEChennaiPage />} path="/rde-chennai" />} />
        <Route path="/rde/vehicle" element={<ProtectedRoute element={<RDEVehicle />} path="/rde/vehicle" />} />
        <Route path="/rde/engine" element={<ProtectedRoute element={<RDEEngine />} path="/rde/engine" />} />
        <Route path="/rde/engine/new" element={<ProtectedRoute element={<NEngine />} path="/rde/engine/new" />} />

        {/* Misc */}
        <Route path="/RDECreateJobOrder" element={<ProtectedRoute element={<RDE_JobOrder_Create />} path="/RDECreateJobOrder" />} />
        <Route path="/createJobOrder" element={<ProtectedRoute element={<CreateJobOrder />} path="/createJobOrder" />} />
        <Route path="/editTestOrder" element={<ProtectedRoute element={<EditTestOrder />} path="/editTestOrder" />} />
        <Route path="/admin/dropdown-options" element={<ProtectedRoute element={<AddNewFields />} path="/admin/dropdown-options" />} />
      </Routes>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={snackbarDuration}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppWithInactivity />
    </Router>
  );
}

export default App;