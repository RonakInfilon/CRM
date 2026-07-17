import { useState, useEffect } from "react";
import { useRole } from "../../context/RoleContext";
import { updateProfile as updateProfileService } from "./profileService";

export const useProfile = () => {
  const {
    role,
    company,
    profile,
    switchPersona,
    updateProfile,
    companyModules,
    rolePermissions,
    isSuperAdmin,
    isCompanyAdmin,
    isManager,
    isEmployee,
    hasPageAccess
  } = useRole();

  // Local state for profile details form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [switchSuccess, setSwitchSuccess] = useState(false);
  const [switchedName, setSwitchedName] = useState("");

  // Sync state when profile changes in context
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        bio: profile.bio || "No bio added yet. Manage details here."
      });
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await updateProfileService(formData);
      console.log(response);
      updateProfile(formData);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    catch (error) {
      console.log(error);
      alert(error.message || "failed to update profile");
    }
  };

  const handleSwitch = (targetRole, targetCompany) => {
    switchPersona(targetRole, targetCompany);
    setSwitchedName(`${targetCompany === "All" ? "" : targetCompany + " "}${targetRole}`);
    setSwitchSuccess(true);
    setTimeout(() => setSwitchSuccess(false), 3000);
  };

  // Helper to determine why a module is blocked/enabled
  const getModuleStatus = (moduleId, path) => {
    if (isSuperAdmin) {
      return {
        allowed: true,
        reason: "Granted: Master Administrator full system bypass."
      };
    }

    // Check Company Level
    const allowedCompanyModules = companyModules[company] || [];
    if (!allowedCompanyModules.includes(moduleId)) {
      return {
        allowed: false,
        reason: "Blocked: Company subscription license does not include this module."
      };
    }

    // Check Role Level for Company Admin
    if (isCompanyAdmin) {
      return {
        allowed: true,
        reason: "Granted: Company Administrator full access."
      };
    }

    // Check Role Level for Manager/Employee
    const roleKey = `${company}_${role}`;
    const allowedRoleModules = rolePermissions[roleKey] || [];
    if (allowedRoleModules.includes(moduleId)) {
      return {
        allowed: true,
        reason: `Granted: Enabled by your Company Admin for ${role} role.`
      };
    }

    return {
      allowed: false,
      reason: `Blocked: Disabled by your Company Admin for ${role} role.`
    };
  };

  const getRoleBadgeClass = () => {
    switch (role) {
      case "Super Admin": return "badge-superadmin";
      case "Company Admin": return "badge-compadmin";
      case "Manager": return "badge-manager";
      case "Company Employee": return "badge-employee";
      default: return "badge-default";
    }
  };

  return {
    role,
    company,
    profile,
    formData,
    isEditing,
    setIsEditing,
    saveSuccess,
    switchSuccess,
    switchedName,
    handleInputChange,
    handleSaveProfile,
    handleSwitch,
    getModuleStatus,
    getRoleBadgeClass,
  };
};
