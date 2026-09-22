import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Vehicles from "../pages/Vehicles";
import Trips from "../pages/Trips";
import Maintenance from "../pages/Maintenance";
import Drivers from "../pages/Drivers";
import Alerts from "../pages/Alerts";
import Analytics from "../pages/Analytics";
import LiveFleet from "../pages/LiveFleet";
import TripFormBuilder from "../pages/TripFormBuilder";
import DashboardLayout from "../layouts/DashboardLayout";
import Login from "../pages/Login";
import DriverDashboard from "../pages/DriverDashboard";
import { getSession } from "../utils/auth";

function ProtectedLayout() {
  return getSession() ? <DashboardLayout /> : <Navigate to="/login" replace />;
}

function RoleDashboard() {
  return getSession()?.role === "driver" ? <DriverDashboard /> : <Dashboard />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<RoleDashboard />} />
          <Route path="/live-fleet" element={<LiveFleet />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trip-form-builder" element={<TripFormBuilder />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/fuel" element={<Analytics />} />
          <Route path="*" element={<Dashboard />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;