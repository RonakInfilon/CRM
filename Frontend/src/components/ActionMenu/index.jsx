import { useActionMenu } from "./useActionMenu";
import "./ActionMenu.styles.css";

const ActionMenu = ({ onEdit, onDelete, data, dataId }) => {
  const { openMenu, setOpenMenu, canDelete, menuRef } = useActionMenu();

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