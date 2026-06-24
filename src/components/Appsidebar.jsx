import "../styles/sidebar.css";
import { BoxCubeIcon } from "../icons/index.js";
import { GridIcon } from "../icons/index.js";
import API from "../api.js"
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
  const handleOrganizationClick=()=>{
    navigate("/organization");
  }

  const handleContactClick=()=>{
    navigate("/contacts");
  }
  const handleOpportunityClick=()=>{
    navigate("/pipeline");
  }
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

        <li onClick={handleOpportunityClick} style={{cursor:'pointer'}}>
          <span><GridIcon /></span>{isOpen && <span>PipeLine</span>}

        </li>
        <li onClick={handleContactClick} style={{cursor:'pointer'}}>
          <span><GridIcon /></span>
          {isOpen && <span>Contacts</span>}
        </li>
        <li onClick={handleOrganizationClick} style={{cursor:'pointer'}}><GridIcon/>
          {isOpen && <span>Companies</span>}
        </li>
      </ul>
    </div>
  );
}

export default AppsideBar;