import "./navbar.styles.css";
import { useNavbar } from "./useNavbar";

function Navbar({ toggleSidebar, logout, name }) {
  const {
    role,
    company,
    profile,
    navigate,
    handleRoleChange,
    handleCompanyChange,
    getInitials,
  } = useNavbar();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button onClick={toggleSidebar} className="sidebar-toggle-btn">
          ☰
        </button>
        <h2 className="page-title">{name}</h2>
      </div>

      <div className="navbar-right">
        {role !== "Super Admin" && (
          <div className="role-switcher-container">
            {/* <label htmlFor="company-select" className="role-label">
              Company:
            </label> */}
            {/* <select
              id="company-select"
              value={company}
              onChange={handleCompanyChange}
              className="role-select"
            >
              <option value="Google">Google</option>
              <option value="Microsoft">Microsoft</option>
              <option value="Apple">Apple</option>
              <option value="Amazon">Amazon</option>
            </select> */}
          </div>
        )}
        
        {/* <div className="role-switcher-container">
          <label htmlFor="role-select" className="role-label">
            Active Role:
          </label>
          <select
            id="role-select"
            value={role}
            onChange={handleRoleChange}
            className="role-select"
          >
            <option value="Super Admin">Super Admin</option>
            <option value="Company Admin">Company Admin</option>
            <option value="Manager">Manager</option>
            <option value="Company Employee">Employee</option>
          </select>
        </div> */}

        <div
          className="navbar-profile-avatar"
          onClick={() => navigate("/profile")}
          title="View Profile"
          style={{
            cursor: "pointer",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "#111827",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "600",
            fontSize: "14px",
            marginLeft: "12px",
            border: "2px solid #e2e8f0",
            transition: "all 0.2s ease"
          }}
        >
          {getInitials(profile?.name)}
        </div>

        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;