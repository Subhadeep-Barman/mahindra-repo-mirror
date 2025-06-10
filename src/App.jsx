import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import HomePage from "./pages/home";
import AdminPortal from "./pages/adminPortal";
import VTCChennaiPage from "./pages/vtcChennai";
import VTCNashikPage from "./pages/vtcnashik";
import VTCCVehiclePage from "./pages/vtcCVehicle";
import CJobOrder from "./pages/chenniJobOrder";
import EngineForm from "./pages/cEngine";

function App() {
  return (
    <Router>
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/home" element={<HomePage/>} />
          <Route path="/admin" element={<AdminPortal/>} />
          <Route path="/vtc" element={<VTCChennaiPage/>} />
          <Route path="/vtcnashik" element={<VTCNashikPage/>} />
          <Route path="/vtccvehicle" element={<VTCCVehiclePage/>} />
          <Route path="/cjoborder" element={<CJobOrder/>} />
          <Route path="/engineform" element={<EngineForm/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
