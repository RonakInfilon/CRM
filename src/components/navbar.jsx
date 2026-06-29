import "../styles/navbar.css";
import { useRole } from "../context/RoleContext";

function Navbar({ toggleSidebar, logout, name }) {
  const { role, setRole } = useRole();

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button onClick={toggleSidebar} className="sidebar-toggle-btn">
          ☰
        </button>
        <h2 className="page-title">{name}</h2>
      </div>

      <div className="navbar-right">
        <div className="role-switcher-container">
          <label htmlFor="role-select" className="role-label">
            Active Role:
          </label>
          <select
            id="role-select"
            value={role}
            onChange={handleRoleChange}
            className="role-select"
          >
            <option value="Super Admin"> Super Admin</option>
            <option value="Manager"> Manager</option>
            <option value="Company Employee"> Employee</option>
          </select>
        </div>

        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;