import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Auth & Home
import Login from "./pages/login";
import HomePage from "./pages/home";

// Admin
import AdminPortal from "./pages/adminPortal";

// VTC Chennai
import VTCChennaiPage from "./pages/VTC_Chennai";
import VTCCVehiclePage from "./pages/VTC_C_VEHILCE";
import VTCEnginePage from "./pages/VTC_C_engine_page";
import CJobOrder from "./pages/Chennai_joborder";
import EngineForm from "./pages/VTC_C_Engine";
import VehicleForm from "@/components/VTC_C_Vehicle_form";

// VTC Nashik
import VTCNashikPage from "./pages/VTC_Nashik";
import NashikJobOrder from "./pages/Nashik_joborder";
import VTCNashikVehicle from "./pages/VTC_N_vehicle";
import NEngine from "./pages/VTC_N_Engine";
import VTCNashikVehicleForm from "./pages/VTC_N_Vehicle_form";

// RDE
import RDEJobOrder from "./pages/RDE_JOBORDER";
import RDEVehicle from "./pages/RDE_C_vehicle";
import RDEEngine from "./pages/RDE_Engine";

// Misc
import CreateJobOrder from "./pages/Chennai_create_joborder";
import AuthSuccess from "./pages/AuthSuccess";

function App() {
  return (
    <Router>
      <div className="p-4">
        <Routes>
          {/* Auth & Home */}
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<HomePage />} />

          {/* Admin */}
          <Route path="/admin-portal" element={<AdminPortal />} />

          {/* VTC Chennai */}
          <Route path="/vtc-chennai" element={<VTCChennaiPage />} />
          <Route path="/vtccvehicle" element={<VTCCVehiclePage />} />
          <Route path="/vtcChennaiEngine" element={<VTCEnginePage />} />
          <Route path="/cjoborder" element={<CJobOrder />} />
          <Route path="/engineform" element={<EngineForm />} />
          <Route path="/vtcvehicle/new" element={<VehicleForm />} />

          {/* VTC Nashik */}
          <Route path="/vtc-nashik" element={<VTCNashikPage />} />
          <Route path="/nashik/joborder" element={<NashikJobOrder />} />
          <Route path="/nashik/vehicle" element={<VTCNashikVehicle />} />
          <Route path="/nashik/engine" element={<NEngine />} />
          <Route path="/nashik/vehicle/new" element={<VTCNashikVehicleForm />} />
          <Route path="/nashik/engine/new" element={<NEngine />} /> 

          {/* RDE */}
          <Route path="/rde-chennai" element={<VTCCVehiclePage />} />
          <Route path="/rde/joborder" element={<RDEJobOrder />} />
          <Route path="/rde/vehicle" element={<RDEVehicle />} />
          <Route path="/rde/engine" element={<RDEEngine />} />

          {/* Misc */}
          <Route path="/createJobOrder" element={<CreateJobOrder />} />
          <Route path="/authSuccess" element={<AuthSuccess />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;