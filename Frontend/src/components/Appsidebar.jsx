import "../styles/sidebar.css";
import {
  GridIcon,
  ListIcon,
  PieChartIcon,
  UserCircleIcon,
  GroupIcon,
  CalenderIcon,
  TaskIcon,
  LockIcon,
} from "../icons/index.js";
import { useNavigate, useLocation } from "react-router-dom";
import { useRole } from "../context/RoleContext";

function AppsideBar({ isOpen, onMouseEnter, onMouseLeave }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPageAccess } = useRole();

  const allNavItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <GridIcon />,
    },
    {
      name: "Leads",
      path: "/leads",
      icon: <ListIcon />,
    },
    {
      name: "Pipeline",
      path: "/pipeline",
      icon: <PieChartIcon />,
    },
    {
      name: "Companies",
      path: "/companies",
      icon: <GroupIcon />,
    },
    {
      name: "Manage Users",
      path: "/users",
      icon: <UserCircleIcon />,
    },
    {
      name: "Permissions",
      path: "/permission",
      icon: <LockIcon />,
    },
    {
      name: "Audit Logs",
      path: "/audit-logs",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <UserCircleIcon />,
    },
  ];

  const filteredNavItems = allNavItems.filter((item) => hasPageAccess(item.path));

  return (
    <div
      className={`sidebar ${isOpen ? "open" : "closed"}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="sidebar-logo-container">
        <img
          src="/crm-logo-design-inspiration-for-a-unique-identity-modern-elegance-and-creative-design-watermark-your-success-with-the-striking-this-logo-vector.jpg"
          alt="Logo"
        />
        {isOpen && <span className="logo-text">CRM</span>}
      </div>

      <ul>

        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li
              key={item.name}
              onClick={() => navigate(item.path)}
              className={isActive ? "active" : ""}
              style={{ cursor: "pointer" }}
            >
              <span>{item.icon}</span>
              {isOpen && <span>{item.name}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default AppsideBar;