import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Leads from "./pages/Leads";
import DashboardLayout from "./components/DashboardLayout";
import Organization from "./pages/Organization";
import Contacts from "./pages/Contacts";
import Pipeline from "./pages/Pipeline";
import Notes from "./pages/Activity";
import ActivityLog from "./components/ActivityLog";
import { RoleProvider } from "./context/RoleContext";
import RoleGuard from "./components/RoleGuard";
import Permission from "./pages/Permission";
import Profile from "./pages/Profile";
import Users from "./pages/Users";

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
              path="/organization"
              element={
                <RoleGuard>
                  <Organization />
                </RoleGuard>
              }
            />
            <Route path="/contacts" element={<Contacts />} />
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

          </Route>
        </Routes>
      </BrowserRouter>
    </RoleProvider>
  );
}

export default App;