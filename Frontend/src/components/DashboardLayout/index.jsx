import { Outlet } from "react-router-dom";
import AppsideBar from "../Appsidebar";
import Navbar from "../Navbar";
import { useDashboardLayout } from "./useDashboardLayout";
import "./dashboard_layout.styles.css";

function DashboardLayout() {
  const {
    name,
    sidebarExpanded,
    setsideBarHover,
    toggleSidebar,
    logout,
  } = useDashboardLayout();



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