import { useState, useEffect, useRef } from "react";
import { useRole } from "../../context/RoleContext";

export const useActionMenu = () => {
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

  return {
    openMenu,
    setOpenMenu,
    canDelete,
    menuRef,
  };
};
