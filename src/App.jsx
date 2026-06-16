import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtecttedRoute";
import Leads from "./pages/Leads";
import DashboardLayout from "./components/layout/DashboardLayout";
// import LeadList from "./pages/leads/LeadList";
function App() {
  return (
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
        </Route>
      </Routes>


    </BrowserRouter>
  );
}

export default App;