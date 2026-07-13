import { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import AppsideBar from "../components/Appsidebar";
import Navbar from "./navbar";
import "../styles/dashboard_layout.css";

function DashboardLayout() {
  const navigate = useNavigate();
  const location=useLocation();
  const pathSegment=location.pathname.split("/").filter(Boolean);
  const name = pathSegment[pathSegment.length - 1] || "dashboard";
  const [SidebarOpen, setSidebarOpen] = useState(true);
  const [sideBarHover, setsideBarHover] = useState(false);

  const sidebarExpanded = SidebarOpen || sideBarHover;

  const toggleSidebar = () => {
    setSidebarOpen(!SidebarOpen);
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };
 


  return (
    <div className="dashboard-container">
      <AppsideBar
        isOpen={sidebarExpanded}
        onMouseEnter={() => setsideBarHover(true)}
        onMouseLeave={() => setsideBarHover(false)}
      />

      <div
        className={`main-content ${
          sidebarExpanded ? "sidebar-open" : "sidebar-closed"
        }`}
        data-page={name}
      >
        <Navbar
          toggleSidebar={toggleSidebar}
          logout={logout}
          name={name}
        />

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;