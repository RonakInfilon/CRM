import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppsideBar from "../components/layout/Appsidebar";
import Navbar from "../components/layout/navbar";
import "../styles/dashboard.css"
// import { SidebarOpen } from "lucide-react";
function Dashboard() {
  const navigate = useNavigate();
  const [SidebarOpen, setSidebarOpen] = useState(false);
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
        className={`main-content ${sidebarExpanded ? "sidebar-open" : "sidebar-closed"
          }`}
      >
        <Navbar
          toggleSidebar={toggleSidebar}
          logout={logout}
        />

        <div className="content">
          <h1>Dashboard Content</h1>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;