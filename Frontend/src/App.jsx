import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Leads from "./pages/Leads";
import DashboardLayout from "./components/DashboardLayout";
import Pipeline from "./pages/Pipeline";
import Notes from "./pages/Activity";
import ActivityLog from "./components/ActivityLog";
import { RoleProvider } from "./context/RoleContext";
import RoleGuard from "./components/RoleGuard";
import Permission from "./pages/Permission";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import Company from "./pages/Company";
import AuditLogs from "./pages/AuditLogs";
function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <Routes>

          <Route
            path="/"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route
              path="/companies"
              element={
                <RoleGuard>
                  <Company />
                </RoleGuard>
              }
            />
            <Route
              path="/pipeline"
              element={
                <RoleGuard>
                  <Pipeline />
                </RoleGuard>
              }
            />
            <Route path="/activity" element={<Notes />} />
            <Route
              path="/drag"
              element={
                <RoleGuard>
                  <ActivityLog />
                </RoleGuard>
              }
            />
            <Route
              path="/permission"
              element={
                <RoleGuard>
                  <Permission />
                </RoleGuard>
              }
            />
            <Route
              path="/users"
              element={
                <RoleGuard>
                  <Users />
                </RoleGuard>
              }
            />
            <Route path="/profile" element={<Profile />} />

            <Route
              path="/audit-logs"
              element={
                <RoleGuard>
                  <AuditLogs />
                </RoleGuard>
              }
            />

          </Route>
        </Routes>
      </BrowserRouter>
    </RoleProvider>
  );
}

export default App;