import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Snackbar, Alert } from '@mui/material';
import useStore from '@/store/useStore';

// Auth & Home
import Login from "./pages/login";
import HomePage from "./pages/home";

// Admin
import AdminPortal from "./pages/adminPortal";

// VTC Chennai
import VTCChennaiPage from "./pages/VTC_Chennai";
import VTCCVehiclePage from "./pages/VTC_C_VEHILCE";
import VTCEnginePage from "./pages/VTC_C_engine_page";
import EngineForm from "./pages/VTC_C_Engine";
import VehicleForm from "@/components/VTC_C_Vehicle_form";
import VTCCEngineForm from "./pages/vtc_c_engine_form";
import RDEnginePage from "./pages/RDE_C_engine_page";

// VTC Nashik
import VTCNashikPage from "./pages/VTC_Nashik";
import NashikJobOrder from "./pages/Nashik_create_joborder";
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

function App() {
  // Move snackbar state to App component where Snackbar is rendered
  const {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    snackbarDuration,
    setSnackbarOpen
  } = useStore();

  return (
    <Router>
      <div className="px-4">
        <Routes>
          {/* Auth & Home */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/default-login" element={<DefaultLogin />} />

          {/* Admin */}
          <Route path="/admin-portal" element={<AdminPortal />} />

          {/* VTC Chennai */}
          <Route path="/vtc-chennai" element={<VTCChennaiPage />} />
          <Route path="/vtccvehicle" element={<VTCCVehiclePage />} />
          <Route path="/vtcChennaiEngine" element={<VTCEnginePage />} />
          <Route path="/engineform" element={<EngineForm />} />
          <Route path="/vtcvehicle/new" element={<VehicleForm />} />
          <Route path="/chennai/engine/new" element={<VTCCEngineForm />} />

          {/* VTC Nashik */}
          <Route path="/vtc-nashik" element={<VTCNashikPage />} />
          <Route path="/NashikCreateJobOrder" element={<NashikJobOrder />} />
          <Route path="/nashik/vehicle" element={<VTCNashikVehicle />} />
          <Route path="/nashik/engine" element={<RDEnginePage />} />
          <Route path="/nashik/engine/new" element={<NEngine />} />

          {/* RDE */}
          <Route path="/rde-chennai" element={<RDEChennaiPage />} />
          <Route path="/rde/vehicle" element={<RDEVehicle />} />
          <Route path="/rde/engine" element={<RDEEngine />} />

          {/* Misc */}
          <Route path="/RDECreateJobOrder" element={<RDE_JobOrder_Create />} />
          <Route path="/createJobOrder" element={<CreateJobOrder />} />
          <Route path="/editTestOrder" element={<EditTestOrder />} />
          <Route path="/authSuccess" element={<AuthSuccess />} />
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
    </Router>
  );
}

export default App;