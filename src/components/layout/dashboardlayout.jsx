import { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import AppsideBar from "../layout/Appsidebar";
import Navbar from "../layout/navbar";
import "../../styles/dashboard_layout.css";

function DashboardLayout() {
  const navigate = useNavigate();

  const [SidebarOpen, setSidebarOpen] = useState(true);
  const [sideBarHover, setsideBarHover] = useState(false);

  const sidebarExpanded = SidebarOpen || sideBarHover;

  const toggleSidebar = () => {
    setSidebarOpen(!SidebarOpen);
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
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
      >
        <Navbar
          toggleSidebar={toggleSidebar}
          logout={logout}
        />

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;