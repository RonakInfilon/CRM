import "./sidebar.styles.css";
import { useAppSidebar } from "./useAppSidebar";

function AppsideBar({ isOpen, onMouseEnter, onMouseLeave }) {
  const { navigate, location, filteredNavItems } = useAppSidebar();

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