import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function useDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathSegment = location.pathname.split("/").filter(Boolean);
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

  return {
    name,
    sidebarExpanded,
    setsideBarHover,
    toggleSidebar,
    logout,
  };
}
