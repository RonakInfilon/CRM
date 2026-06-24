import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtecttedRoute";
import Leads from "./pages/Leads";
import DashboardLayout from "./components/DashboardLayout";
import Organization from "./pages/Organization";
import Contacts from "./pages/Contacts";
import Pipeline from "./pages/Pipeline";
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
          <Route path="/organization" element={<Organization/>}/>
          <Route path="/contacts" element={<Contacts/>}/>
          <Route path="/pipeline" element={<Pipeline/>}/>

        </Route>
      </Routes>


    </BrowserRouter>
  );
}

export default App;