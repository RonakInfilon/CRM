import "../../styles/sidebar.css";
import { BoxCubeIcon } from "../../icons";
import { GridIcon } from "../../icons";
function AppsideBar({ isOpen,onMouseEnter,
  onMouseLeave, }) {
  return (
   <div
  className={`sidebar ${isOpen ? "open" : "closed"}`}
  onMouseEnter={onMouseEnter}
  onMouseLeave={onMouseLeave}
>
      <ul>
         <li>
          <span><GridIcon/></span>
          {isOpen && <span>CRM</span>}
        </li>
        {/* <li>Menu</li> */}
        <li>
          <span><GridIcon/></span>
          {isOpen && <span>Dashboard</span>}
        </li>

        <li>
          <span><GridIcon/></span> {isOpen && <span>Leads</span>}
        </li>

        <li>
          <span><GridIcon/></span>{isOpen && <span>Opporunity</span>}
          
        </li>
        <li>
          <span><GridIcon/></span>
          {isOpen && <span>Customer</span>}
        </li>
      </ul>
    </div>
  );
}

export default AppsideBar;