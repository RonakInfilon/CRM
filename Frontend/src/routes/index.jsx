import { Routes, Route } from "react-router-dom";

import {
  Login,
  Signup,
  Dashboard,
  Leads,
  Pipeline,
  Notes,
  Permission,
  Profile,
  Users,
  Company,
  AuditLogs,
} from "../pages";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../components/DashboardLayout";
import ActivityLog from "../components/ActivityLog";
import RoleGuard from "../components/RoleGuard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/companies" element={<RoleGuard><Company /></RoleGuard>} />
        <Route path="/pipeline" element={<RoleGuard><Pipeline /></RoleGuard>} />
        <Route path="/activity" element={<Notes />} />
        <Route path="/drag" element={<RoleGuard><ActivityLog /></RoleGuard>} />
        <Route path="/permission" element={<RoleGuard><Permission /></RoleGuard>} />
        <Route path="/users" element={<RoleGuard><Users /></RoleGuard>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/audit-logs" element={<RoleGuard><AuditLogs /></RoleGuard>} />
      </Route>
    </Routes>
  );
}
