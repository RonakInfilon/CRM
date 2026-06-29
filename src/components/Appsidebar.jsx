import "../styles/sidebar.css";
import {
  GridIcon,
  ListIcon,
  PieChartIcon,
  UserCircleIcon,
  GroupIcon,
  CalenderIcon,
  TaskIcon,
} from "../icons/index.js";
import { useNavigate } from "react-router-dom";
import { useRole } from "../context/RoleContext";

function AppsideBar({ isOpen, onMouseEnter, onMouseLeave }) {
  const navigate = useNavigate();
  const { isEmployee } = useRole();

  const handleLeadsClick = async () => {
    navigate("/leads");
  };
  const handleDashboardClick = () => {
    navigate("/dashboard");
  };
  const handleOrganizationClick = () => {
    navigate("/organization");
  };

  const handleContactClick = () => {
    navigate("/contacts");
  };
  const handleOpportunityClick = () => {
    navigate("/pipeline");
  };
  const handleActivityonClick = () => {
    navigate("/activity");
  };
  const handleDragAnddrop = () => {
    navigate("/drag");
  };
  return (
    <div
      className={`sidebar ${isOpen ? "open" : "closed"}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <ul>
        <li>
          <span>
            <img
              src="/crm-logo-design-inspiration-for-a-unique-identity-modern-elegance-and-creative-design-watermark-your-success-with-the-striking-this-logo-vector.jpg"
              alt="Logo"
            />
          </span>
          {isOpen && <span>CRM</span>}
        </li>

        <li onClick={handleDashboardClick} style={{ cursor: "pointer" }}>
          <span>
            <GridIcon />
          </span>{" "}
          {isOpen && <span>Dashboard</span>}
        </li>

        <li onClick={handleLeadsClick} style={{ cursor: "pointer" }}>
          <span>
            <ListIcon />
          </span>{" "}
          {isOpen && <span>Leads</span>}
        </li>

        {!isEmployee && (
          <li onClick={handleOpportunityClick} style={{ cursor: "pointer" }}>
            <span>
              <PieChartIcon />
            </span>
            {isOpen && <span>Pipeline</span>}
          </li>
        )}

        <li onClick={handleContactClick} style={{ cursor: "pointer" }}>
          <span>
            <UserCircleIcon />
          </span>
          {isOpen && <span>Contacts</span>}
        </li>

        {!isEmployee && (
          <li onClick={handleOrganizationClick} style={{ cursor: "pointer" }}>
            <span>
              <GroupIcon />
            </span>
            {isOpen && <span>Companies</span>}
          </li>
        )}

        <li onClick={handleActivityonClick} style={{ cursor: "pointer" }}>
          <span>
            <CalenderIcon />
          </span>
          {isOpen && <span>Activity</span>}
        </li>

        {!isEmployee && (
          <li onClick={handleDragAnddrop} style={{ cursor: "pointer" }}>
            <span>
              <TaskIcon />
            </span>
            {isOpen && <span>Drag & Drop</span>}
          </li>
        )}
      </ul>
    </div>
  );
}

export default AppsideBar;