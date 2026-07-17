import { useState, useEffect } from "react";
import { defaultCompanyModules, defaultRolePermissions } from "./constants";
import { checkPageAccess } from "./pageAccess";
import {
  fetchProfileAPI,
  fetchPermissionsAPI,
  switchPersonaAPI,
  updateProfileAPI,
  updatePermissionsAPI,
} from "./roleApi";

export const useRoleState = () => {
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
      const data = await switchPersonaAPI(newRole, newCompany);
      if (data && data.success) {
        localStorage.setItem("token", data.token);
        if (data.user) {
          const updatedProfile = {
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone || "",
            bio: data.user.bio || "",
            avatar: "",
            role: data.user.role,
            company: data.user.company
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
      const data = await fetchPermissionsAPI();
      if (data && data.success) {
        const { companyModules: apiCompanyModules, rolePermissions: apiRolePermissions } = data;
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
        const profileData = await fetchProfileAPI();
        if (profileData && profileData.success) {
          const userData = profileData.data;
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
        const permissionsData = await fetchPermissionsAPI();
        if (permissionsData && permissionsData.success) {
          const { companyModules: apiCompanyModules, rolePermissions: apiRolePermissions } = permissionsData;
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
        await updateProfileAPI(updatedDetails.name, updatedDetails.phone, updatedDetails.bio);
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
        await updatePermissionsAPI(compName, "company_level", modules);
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
        await updatePermissionsAPI(compName, roleName, modules);
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
          const profileData = await fetchProfileAPI();
          if (profileData && profileData.success) {
            const userData = profileData.data;
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
          const permissionsData = await fetchPermissionsAPI();
          if (permissionsData && permissionsData.success) {
            setCompanyModulesState(permissionsData.companyModules);
            setRolePermissionsState(permissionsData.rolePermissions);
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

  // Helper flags
  const isSuperAdmin = role === "Super Admin";
  const isCompanyAdmin = role === "Company Admin";
  const isManager = role === "Manager";
  const isEmployee = role === "Company Employee";

  const canDelete = isSuperAdmin;
  const canModify = isSuperAdmin || isCompanyAdmin || isManager;

  const hasPageAccess = (pathname) => {
    return checkPageAccess(pathname, role, company, companyModules, rolePermissions);
  };

  return {
    role,
    company,
    profile,
    loading,
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
  };
};
