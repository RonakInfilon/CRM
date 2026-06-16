import "../../styles/sidebar.css";
import { BoxCubeIcon } from "../../icons";
import { GridIcon } from "../../icons";
import API from "../../api.js"
import { useNavigate } from "react-router-dom";
function AppsideBar({ isOpen, onMouseEnter,
  onMouseLeave, }) {
  const navigate = useNavigate();
  const handleLeadsClick = async () => {
    navigate("/leads")
  }
  const handleDashboardClick = () => {
    navigate("/dashboard");
  };
  return (
    <div
      className={`sidebar ${isOpen ? "open" : "closed"}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <ul>
        <li>
          <span><GridIcon /></span>
          {isOpen && <span>CRM</span>}
        </li>
        {/* <li>Menu</li> */}
        <li onClick={handleDashboardClick} style={{ cursor: 'pointer' }}> 
          <span><GridIcon /></span> {isOpen && <span>Dashboard</span>} 
        </li> 

        <li onClick={handleLeadsClick} style={{ cursor: 'pointer' }}>
          <span><GridIcon /></span> {isOpen && <span>Leads</span>}
        </li>

        <li>
          <span><GridIcon /></span>{isOpen && <span>Opporunity</span>}

        </li>
        <li>
          <span><GridIcon /></span>
          {isOpen && <span>Customer</span>}
        </li>
      </ul>
    </div>
  );
}

export default AppsideBar;