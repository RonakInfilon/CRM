import { createContext, useContext, useState } from "react";
//its like create a notice board and any component can able to see that
const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  //this is for strong role in local storage
  const [role, setRoleState] = useState(() => {
    return localStorage.getItem("userRole") || "Super Admin";
  });
  
  const setRole = (newRole) => {
    setRoleState(newRole);
    localStorage.setItem("userRole", newRole);
    // Dispatch a custom event to notify other components/listeners
    window.dispatchEvent(new Event("roleChanged"));
  };

  // Helper permissions
  const isSuperAdmin = role === "Super Admin";
  const isManager = role === "Manager";
  const isEmployee = role === "Company Employee";

  const canDelete = isSuperAdmin;
  const canModify = isSuperAdmin || isManager; // Manager and Admin can add/edit

  const hasPageAccess = (pathname) => {
    if (isEmployee) {
      // Employees cannot access Pipeline or Companies (organization)
      if (pathname.includes("/pipeline") || pathname.includes("/organization") || pathname.includes("/drag")) {
        return false;
      }
    }
    return true;
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isSuperAdmin,
        isManager,
        isEmployee,
        canDelete,
        canModify,
        hasPageAccess,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
