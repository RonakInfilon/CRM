import { createContext, useContext, useState, useEffect } from "react";

const RoleContext = createContext();

const defaultCompanyModules = {
  "Google": ["Dashboard", "Leads", "Pipeline", "Contacts", "Activity", "Drag & Drop", "Permission"],
  "Microsoft": ["Dashboard", "Leads", "Contacts", "Permission"],
  "Apple": ["Dashboard", "Leads", "Pipeline", "Contacts", "Activity"],
  "Amazon": ["Dashboard", "Leads", "Contacts"]
};

const defaultRolePermissions = {
  // Google
  "Google_Manager": ["Dashboard", "Leads", "Pipeline", "Contacts", "Activity", "Drag & Drop"],
  "Google_Company Employee": ["Dashboard", "Leads", "Contacts"],
  // Microsoft
  "Microsoft_Manager": ["Dashboard", "Leads", "Contacts"],
  "Microsoft_Company Employee": ["Dashboard", "Contacts"],
  // Apple
  "Apple_Manager": ["Dashboard", "Leads", "Pipeline", "Contacts", "Activity"],
  "Apple_Company Employee": ["Dashboard", "Leads"],
  // Amazon
  "Amazon_Manager": ["Dashboard", "Leads", "Contacts"],
  "Amazon_Company Employee": ["Dashboard"]
};

export const RoleProvider = ({ children }) => {
  // Load and sync permissions
  const [companyModules, setCompanyModulesState] = useState(() => {
    const saved = localStorage.getItem("companyModules");
    if (saved) return JSON.parse(saved);
    localStorage.setItem("companyModules", JSON.stringify(defaultCompanyModules));
    return defaultCompanyModules;
  });

  const [rolePermissions, setRolePermissionsState] = useState(() => {
    const saved = localStorage.getItem("rolePermissions");
    if (saved) return JSON.parse(saved);
    localStorage.setItem("rolePermissions", JSON.stringify(defaultRolePermissions));
    return defaultRolePermissions;
  });

  // User details states
  const [role, setRoleState] = useState(() => {
    return localStorage.getItem("userRole") || "Super Admin";
  });

  const [company, setCompanyState] = useState(() => {
    return localStorage.getItem("userCompany") || "Google";
  });

  const [profile, setProfileState] = useState(() => {
    const saved = localStorage.getItem("userProfile");
    if (saved) return JSON.parse(saved);
    
    // Default initial profile
    const initialProfile = {
      name: "Master Admin",
      email: "admin@crm.com",
      phone: "+1 (555) 019-0000",
      avatar: "",
      role: "Super Admin",
      company: "All"
    };
    localStorage.setItem("userProfile", JSON.stringify(initialProfile));
    return initialProfile;
  });

  // Sync role and profile updates
  const setRole = (newRole) => {
    setRoleState(newRole);
    localStorage.setItem("userRole", newRole);
    
    const updatedProfile = { ...profile, role: newRole };
    if (newRole === "Super Admin") {
      updatedProfile.company = "All";
      updatedProfile.name = "Master Admin";
      updatedProfile.email = "admin@crm.com";
    } else {
      updatedProfile.company = company;
      updatedProfile.name = `${company} ${newRole}`;
      updatedProfile.email = `${newRole.toLowerCase().replace(" ", ".")}@${company.toLowerCase()}.com`;
    }
    setProfileState(updatedProfile);
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
    
    window.dispatchEvent(new Event("roleChanged"));
  };

  const setCompany = (newCompany) => {
    setCompanyState(newCompany);
    localStorage.setItem("userCompany", newCompany);
    
    if (role !== "Super Admin") {
      const updatedProfile = { 
        ...profile, 
        company: newCompany,
        name: `${newCompany} ${role}`,
        email: `${role.toLowerCase().replace(" ", ".")}@${newCompany.toLowerCase()}.com`
      };
      setProfileState(updatedProfile);
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
    }
    
    window.dispatchEvent(new Event("roleChanged"));
  };

  const switchPersona = (newRole, newCompany) => {
    setRoleState(newRole);
    setCompanyState(newCompany);
    localStorage.setItem("userRole", newRole);
    localStorage.setItem("userCompany", newCompany);
    
    const updatedProfile = {
      ...profile,
      role: newRole,
      company: newRole === "Super Admin" ? "All" : newCompany,
      name: newRole === "Super Admin" ? "Master Admin" : `${newCompany} ${newRole}`,
      email: newRole === "Super Admin" ? "admin@crm.com" : `${newRole.toLowerCase().replace(" ", ".")}@${newCompany.toLowerCase()}.com`
    };
    setProfileState(updatedProfile);
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
    
    window.dispatchEvent(new Event("roleChanged"));
  };

  const updateProfile = (updatedDetails) => {
    const updated = { ...profile, ...updatedDetails };
    setProfileState(updated);
    localStorage.setItem("userProfile", JSON.stringify(updated));
  };

  const updateCompanyModules = (compName, modules) => {
    const updated = { ...companyModules, [compName]: modules };
    setCompanyModulesState(updated);
    localStorage.setItem("companyModules", JSON.stringify(updated));
    window.dispatchEvent(new Event("roleChanged"));
  };

  const updateRolePermissions = (compName, roleName, modules) => {
    const key = `${compName}_${roleName}`;
    const updated = { ...rolePermissions, [key]: modules };
    setRolePermissionsState(updated);
    localStorage.setItem("rolePermissions", JSON.stringify(updated));
    window.dispatchEvent(new Event("roleChanged"));
  };

  // Helper flags
  const isSuperAdmin = role === "Super Admin";
  const isCompanyAdmin = role === "Company Admin";
  const isManager = role === "Manager";
  const isEmployee = role === "Company Employee";

  const canDelete = isSuperAdmin;
  const canModify = isSuperAdmin || isCompanyAdmin || isManager;

  const hasPageAccess = (pathname) => {
    const path = pathname.toLowerCase();
    
    // Base pages that are always accessible
    if (path === "/" || path === "/signup" || path === "/profile") {
      return true;
    }

    // Only Super Admin and Company Admin can manage Users
    if (path.includes("/users")) {
      return isSuperAdmin || isCompanyAdmin;
    }

    // Super Admin has access to everything
    if (isSuperAdmin) {
      return true;
    }

    // All other roles must check active company module availability
    const userCompany = company || "Google";
    
    // Only Super Admin can manage Companies (organizations)
    if (path.includes("/organization")) {
      return false;
    }

    // Map path segments to Module Names
    let requiredModule = "";
    if (path.includes("/dashboard")) requiredModule = "Dashboard";
    else if (path.includes("/leads")) requiredModule = "Leads";
    else if (path.includes("/pipeline")) requiredModule = "Pipeline";
    else if (path.includes("/contacts")) requiredModule = "Contacts";
    else if (path.includes("/activity")) requiredModule = "Activity";
    else if (path.includes("/drag")) requiredModule = "Drag & Drop";
    else if (path.includes("/permission")) requiredModule = "Permission";

    if (!requiredModule) return true;

    // Check 1: Does the Company have this module enabled by Master Admin?
    const allowedCompanyModules = companyModules[userCompany] || [];
    if (!allowedCompanyModules.includes(requiredModule)) {
      return false;
    }

    // Check 2: If Company Admin, they get full access to all company-enabled modules
    if (isCompanyAdmin) {
      return true;
    }

    // Check 3: For Manager and Employee, check the role-based settings for this company
    const roleKey = `${userCompany}_${role}`;
    const allowedRoleModules = rolePermissions[roleKey] || [];
    return allowedRoleModules.includes(requiredModule);
  };

  // Listen to other components changing role/profile
  useEffect(() => {
    const handleRoleChanged = () => {
      setRoleState(localStorage.getItem("userRole") || "Super Admin");
      setCompanyState(localStorage.getItem("userCompany") || "Google");
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        setProfileState(JSON.parse(savedProfile));
      }
      const savedCompMods = localStorage.getItem("companyModules");
      if (savedCompMods) {
        setCompanyModulesState(JSON.parse(savedCompMods));
      }
      const savedRolePerms = localStorage.getItem("rolePermissions");
      if (savedRolePerms) {
        setRolePermissionsState(JSON.parse(savedRolePerms));
      }
    };
    window.addEventListener("roleChanged", handleRoleChanged);
    return () => window.removeEventListener("roleChanged", handleRoleChanged);
  }, []);

  return (
    <RoleContext.Provider
      value={{
        role,
        company,
        profile,
        setRole,
        setCompany,
        switchPersona,
        updateProfile,
        companyModules,
        rolePermissions,
        updateCompanyModules,
        updateRolePermissions,
        isSuperAdmin,
        isCompanyAdmin,
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

