import { createContext, useContext, useState, useEffect } from "react";
import API from "../api";
//context is used to access data from anywhere
const RoleContext = createContext();
//this is default companies and there modules for static data
const defaultCompanyModules = {
  "Google": ["Dashboard", "Leads", "Pipeline", "Companies", "Activity", "Drag & Drop", "Permission"],
  "Microsoft": ["Dashboard", "Leads", "Companies", "Permission"],
  "Apple": ["Dashboard", "Leads", "Pipeline", "Companies", "Activity"],
  "Amazon": ["Dashboard", "Leads", "Companies"]
};

const defaultRolePermissions = {
  // Google
  "Google_Manager": ["Dashboard", "Leads", "Pipeline", "Companies", "Activity", "Drag & Drop"],
  "Google_Company Employee": ["Dashboard", "Leads", "Companies"],
  // Microsoft
  "Microsoft_Manager": ["Dashboard", "Leads", "Companies"],
  "Microsoft_Company Employee": ["Dashboard", "Companies"],
  // Apple
  "Apple_Manager": ["Dashboard", "Leads", "Pipeline", "Companies", "Activity"],
  "Apple_Company Employee": ["Dashboard", "Leads", "Companies"],
  // Amazon
  "Amazon_Manager": ["Dashboard", "Leads", "Companies"],
  "Amazon_Company Employee": ["Dashboard", "Companies"]
};
//from here we can share data across all the inputs
export const RoleProvider = ({ children }) => {
  //here we provide degault company module
  const [companyModules, setCompanyModulesState] = useState(defaultCompanyModules);
  const [rolePermissions, setRolePermissionsState] = useState(defaultRolePermissions);
  const [role, setRoleState] = useState("");
  const [company, setCompanyState] = useState("");
  const [profile, setProfileState] = useState(null);
  const [loading, setLoading] = useState(() => {
    return !!localStorage.getItem("token");
  });

  // Sync role and profile updates
  // Helper to sync persona changes with backend
  const syncPersonaToDB = async (newRole, newCompany) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await API.post("/users/switch-persona", {
        role: newRole,
        company: newCompany
      });
      if (res.data && res.data.success) {
        localStorage.setItem("token", res.data.token);
        if (res.data.user) {
          const updatedProfile = {
            name: res.data.user.name,
            email: res.data.user.email,
            phone: res.data.user.phone || "",
            bio: res.data.user.bio || "",
            avatar: "",
            role: res.data.user.role,
            company: res.data.user.company
          };
          setProfileState(updatedProfile);
        }
      }
    } catch (err) {
      console.error("Failed to sync personal+ switcher with database:", err);
    }
  };

  const fetchPermissionsFromAPI = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await API.get("/permissions");
      if (res.data && res.data.success) {
        const { companyModules: apiCompanyModules, rolePermissions: apiRolePermissions } = res.data;
        setCompanyModulesState(apiCompanyModules);
        setRolePermissionsState(apiRolePermissions);
      }
    } catch (err) {
      console.warn("Failed to load permissions from API:", err);
    }
  };

  // Sync role and profile updates
  const setRole = async (newRole) => {
    setRoleState(newRole);
    
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
    
    window.dispatchEvent(new Event("roleChanged"));
    await syncPersonaToDB(newRole, company);
  };

  const setCompany = async (newCompany) => {
    setCompanyState(newCompany);
    
    if (role !== "Super Admin") {
      const updatedProfile = { 
        ...profile, 
        company: newCompany,
        name: `${newCompany} ${role}`,
        email: `${role.toLowerCase().replace(" ", ".")}@${newCompany.toLowerCase()}.com`
      };
      setProfileState(updatedProfile);
    }
    
    window.dispatchEvent(new Event("roleChanged"));
    await syncPersonaToDB(role, newCompany);
  };

  const switchPersona = async (newRole, newCompany) => {
    setRoleState(newRole);
    setCompanyState(newCompany);
    
    const updatedProfile = {
      ...profile,
      role: newRole,
      company: newRole === "Super Admin" ? "All" : newCompany,
      name: newRole === "Super Admin" ? "Master Admin" : `${newCompany} ${newRole}`,
      email: newRole === "Super Admin" ? "admin@crm.com" : `${newRole.toLowerCase().replace(" ", ".")}@${newCompany.toLowerCase()}.com`
    };
    setProfileState(updatedProfile);
    
    window.dispatchEvent(new Event("roleChanged"));
    await syncPersonaToDB(newRole, newCompany);
  };

  // Consolidate mount initialization
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        // Fetch Profile
        const profileRes = await API.get("/users/profile");
        if (profileRes.data && profileRes.data.success) {
          const userData = profileRes.data.data;
          setRoleState(userData.role);
          setCompanyState(userData.company || "Google");
          setProfileState({
            name: userData.name,
            email: userData.email,
            phone: userData.phone || "",
            bio: userData.bio || "",
            avatar: "",
            role: userData.role,
            company: userData.company || "Google"
          });
        }
        
        // Fetch Permissions
        const permissionsRes = await API.get("/permissions");
        if (permissionsRes.data && permissionsRes.data.success) {
          const { companyModules: apiCompanyModules, rolePermissions: apiRolePermissions } = permissionsRes.data;
          setCompanyModulesState(apiCompanyModules);
          setRolePermissionsState(apiRolePermissions);
        }
      } catch (err) {
        console.error("Initialization failed:", err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem("token");
          window.location.href = "/";
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    // Re-fetch permissions if role or company switches post-load
    const token = localStorage.getItem("token");
    if (token && !loading) {
      fetchPermissionsFromAPI();
    }
  }, [role, company]);

  const updateProfile = async (updatedDetails) => {
    const updated = { ...profile, ...updatedDetails };
    setProfileState(updated);

    const token = localStorage.getItem("token");
    if (token) {
      try {
        await API.put("/users/profile", {
          name: updatedDetails.name,
          phone: updatedDetails.phone,
          bio: updatedDetails.bio
        });
      } catch (err) {
        console.error("Failed to sync profile changes to database:", err);
      }
    }
  };

  const updateCompanyModules = async (compName, modules) => {
    const updated = { ...companyModules, [compName]: modules };
    setCompanyModulesState(updated);
    window.dispatchEvent(new Event("roleChanged"));

    const token = localStorage.getItem("token");
    if (token) {
      try {
        await API.post("/permissions", {
          companyName: compName,
          role: "company_level",
          modules
        });
      } catch (err) {
        console.error("Failed to sync company modules to API:", err);
      }
    }
  };

  const updateRolePermissions = async (compName, roleName, modules) => {
    const key = `${compName}_${roleName}`;
    const updated = { ...rolePermissions, [key]: modules };
    setRolePermissionsState(updated);
    window.dispatchEvent(new Event("roleChanged"));

    const token = localStorage.getItem("token");
    if (token) {
      try {
        await API.post("/permissions", {
          companyName: compName,
          role: roleName,
          modules
        });
      } catch (err) {
        console.error("Failed to sync role permissions to API:", err);
      }
    }
  };

  // Listen to other components changing role/profile
  useEffect(() => {
    const handleRoleChanged = () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const init = async () => {
        try {
          const profileRes = await API.get("/users/profile");
          if (profileRes.data && profileRes.data.success) {
            const userData = profileRes.data.data;
            setRoleState(userData.role);
            setCompanyState(userData.company || "Google");
            setProfileState({
              name: userData.name,
              email: userData.email,
              phone: userData.phone || "",
              bio: userData.bio || "",
              avatar: "",
              role: userData.role,
              company: userData.company || "Google"
            });
          }
          const permissionsRes = await API.get("/permissions");
          if (permissionsRes.data && permissionsRes.data.success) {
            setCompanyModulesState(permissionsRes.data.companyModules);
            setRolePermissionsState(permissionsRes.data.rolePermissions);
          }
        } catch (err) {
          console.warn("Sync on role change failed:", err);
        }
      };
      init();
    };
    window.addEventListener("roleChanged", handleRoleChanged);
    return () => window.removeEventListener("roleChanged", handleRoleChanged);
  }, [loading]);

  if (loading) {
    return (
      <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" style={{ border: '4px solid rgba(0,0,0,0.1)', width: '36px', height: '36px', borderRadius: '50%', borderLeftColor: '#09f', animation: 'spin 1s linear infinite' }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

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

    // Super Admin has access to everything
    if (isSuperAdmin) {
      return true;
    }

    // Audit Logs: only Super Admin (above) and Company Admin
    if (path.includes("/audit-logs")) {
      return isCompanyAdmin;
    }

    // Only Super Admin and Company Admin can manage Users
    if (path.includes("/users")) {
      return isCompanyAdmin;
    }

    // All other roles must check active company module availability
    const userCompany = company || "Google";
    
    // Only Super Admin can view all accounts across tenants;
    // Tenant users (Company Admin, Manager, Employee) see their own accounts
    if (path.includes("/account")) {
      return true; // Access controlled at backend level per tenant_id
    }

    // Map path segments to Module Names
    let requiredModule = "";
    if (path.includes("/dashboard")) requiredModule = "Dashboard";
    else if (path.includes("/leads")) requiredModule = "Leads";
    else if (path.includes("/pipeline")) requiredModule = "Pipeline";
    else if (path.includes("/companies")) requiredModule = "Companies";
    else if (path.includes("/activity")) requiredModule = "Activity";
    else if (path.includes("/drag")) requiredModule = "Drag & Drop";
    else if (path.includes("/permission")) requiredModule = "Permission";

    if (!requiredModule) return true;

    // Check 1: Does the Company have this module enabled by Master Admin?
    const allowedCompanyModules = companyModules[userCompany] || ["Dashboard", "Leads", "Pipeline", "Companies", "Activity", "Drag & Drop", "Permission"];
    if (!allowedCompanyModules.includes(requiredModule)) {
      return false;
    }

    //  If Company Admin, they get full access to all company-enabled modules
    if (isCompanyAdmin) {
      return true;
    }

    //  For Manager and Employee, check the role-based settings for this company
    const roleKey = `${userCompany}_${role}`;
    const allowedRoleModules = rolePermissions[roleKey] || (role === "Manager" 
      ? ["Dashboard", "Leads", "Pipeline", "Companies", "Activity", "Drag & Drop"]
      : ["Dashboard", "Leads", "Companies"]);
    return allowedRoleModules.includes(requiredModule);
  };


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

