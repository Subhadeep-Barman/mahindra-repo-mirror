import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import HomePage from "./pages/home";
import AdminPortal from "./pages/adminPortal";
import VTCChennaiPage from "./pages/vtcChennai";
import VTCNashikPage from "./pages/vtcnashik";
import VTCCVehiclePage from "./pages/vtcCVehicle";
import CJobOrder from "./pages/chenniJobOrder";
import EngineForm from "./pages/cEngine";
import NashikJobOrder from "./pages/nashikJobOrder";
import VTCNashikVehicle from "./pages/vtcNashik"; 
import NEngine from "./pages/nEngine";
import RDEJobOrder from "./pages/rjoborder";
import RDEVehicle from "./pages/rvehicle";
import RDEEngine from "./pages/rEngine";
import VehicleForm from "@/components/VehicleForm";
import VTCEnginePage from "./pages/vtcchennaiengine";

function App() {
  return (
    <Router>
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/admin-portal" element={<AdminPortal />} />
          <Route path="/vtc-chennai" element={<VTCChennaiPage />} />
          <Route path="/vtc-nashik" element={<VTCNashikPage />} />
          <Route path="/rde-chennai" element={<VTCCVehiclePage />} />
          <Route path="/cjoborder" element={<CJobOrder />} />
          <Route path="/vtccvehicle" element={<VTCCVehiclePage />} /> 
          <Route path="/engineform" element={<EngineForm />} />
          <Route path="/nashik/joborder" element={<NashikJobOrder />} />
          <Route path="/nashik/vehicle" element={<VTCNashikVehicle />} />
          <Route path="/nashik/engine" element={<NEngine />} />
          <Route path="/rde/joborder" element={<RDEJobOrder />} />
          <Route path="/rde/vehicle" element={<RDEVehicle />} />
          <Route path="/rde/engine" element={<RDEEngine />} />
          <Route path="/vtcvehicle/new" element={<VehicleForm />} />
          <Route path="/vtcChennaiEngine" element={<VTCEnginePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;