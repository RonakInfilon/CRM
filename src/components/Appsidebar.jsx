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
      name: "Contacts",
      path: "/contacts",
      icon: <UserCircleIcon />,
    },
    {
      name: "Companies",
      path: "/organization",
      icon: <GroupIcon />,
    },
    // {
    //   name: "Activity",
    //   path: "/activity",
    //   icon: <CalenderIcon />,
    // },
    // {
    //   name: "Drag & Drop",
    //   path: "/drag",
    //   icon: <TaskIcon />,
    // },
    {
      name: "Permissions",
      path: "/permission",
      icon: <LockIcon />,
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