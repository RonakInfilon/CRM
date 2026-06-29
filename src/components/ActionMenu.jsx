import { useState, useEffect, useRef } from "react";
import { useRole } from "../context/RoleContext";
import "../styles/ActionMenu.css";

const ActionMenu = ({ onEdit, onDelete, data, dataId }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const { canDelete } = useRole();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="action-wrapper"
      ref={menuRef}
      style={{ position: "relative", display: "inline-block" }}
    >
      <button
        className="menu-btn"
        onClick={() => setOpenMenu(!openMenu)}
        aria-label="Options menu"
      >
        ⋮
      </button>

      {openMenu && (
        <div className="dropdown-menu">
          <button
            onClick={() => {
              onEdit(data);
              setOpenMenu(false);
            }}
          >
            Edit
          </button>
          
          {canDelete && (
            <button
              className="delete-action-btn"
              onClick={() => {
                onDelete(dataId);
                setOpenMenu(false);
              }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;