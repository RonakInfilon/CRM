import React, { useState, useEffect } from "react";
import { useRole } from "../context/RoleContext";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  Shield,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Edit2
} from "lucide-react";
import "../styles/Profile.css";

const ALL_MODULE_METADATA = [
  { id: "Dashboard", label: "Dashboard", path: "/dashboard" },
  { id: "Leads", label: "Leads", path: "/leads" },
  { id: "Pipeline", label: "Pipeline", path: "/pipeline" },
  { id: "Contacts", label: "Contacts", path: "/contacts" },
  { id: "Activity", label: "Activity", path: "/activity" },
  { id: "Drag & Drop", label: "Drag & Drop", path: "/drag" },
  { id: "Permission", label: "Permission", path: "/permission" }
];

const Profile = () => {
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

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
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

    // 1. Check Company Level
    const allowedCompanyModules = companyModules[company] || [];
    if (!allowedCompanyModules.includes(moduleId)) {
      return {
        allowed: false,
        reason: "Blocked: Company subscription license does not include this module."
      };
    }

    // 2. Check Role Level for Company Admin
    if (isCompanyAdmin) {
      return {
        allowed: true,
        reason: "Granted: Company Administrator full access."
      };
    }

    // 3. Check Role Level for Manager/Employee
    const roleKey = `${company}_${role}`;
    const allowedRoleModules = rolePermissions[roleKey] || []
    //find alternative of includes
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

  return (
    <div className="profile-page">
      {/* Notifications */}
      {saveSuccess && (
        <div className="notification-banner success animate-fade-in">
          <CheckCircle2 size={16} /> Profile details updated successfully!
        </div>
      )}
      {switchSuccess && (
        <div className="notification-banner info animate-fade-in">
          <RefreshCw size={16} className="spin" /> Switched active identity to <strong>{switchedName}</strong>! Modules loaded.
        </div>
      )}

      <div className="profile-card-unified">
        {/* Banner header background */}
        <div className="profile-banner"></div>

        {/* Profile Info Header */}
        <div className="profile-header-info">
          <div className="avatar-section">
            <div className="avatar-large">
              {profile?.name ? profile.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "U"}
            </div>
          </div>
          
          <div className="user-summary">
            <div className="name-row">
              <h2>{profile?.name || "User Name"}</h2>
              {!isEditing && (
                <button className="edit-toggle-btn" onClick={() => setIsEditing(true)}>
                  <Edit2 size={14} style={{ marginRight: 6 }} /> Edit Details
                </button>
              )}
            </div>
            <p className="email-label">{profile?.email}</p>
            
            <div className="badges-meta-row">
              <div className={`role-badge ${getRoleBadgeClass()}`}>
                <Shield size={12} style={{ marginRight: 4 }} />
                {role}
              </div>
              <div className="meta-item">
                <Building size={14} />
                <span>Company: <strong>{role === "Super Admin" ? "Master Admin" : company}</strong></span>
              </div>
              <div className="meta-item">
                <Briefcase size={14} />
                <span>Title: <strong>{role}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="profile-divider"></div>

        {/* Profile Content Body */}
        <div className="profile-body">
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="profile-form">
              <h3 className="section-title">Edit Profile Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-with-icon">
                    <User size={16} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={16} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <div className="input-with-icon">
                    <Phone size={16} />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group bio-group">
                <label>Bio / Description</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-profile-btn">Save Changes</button>
                <button type="button" className="cancel-profile-btn" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div className="profile-details-view">
              <h3 className="section-title">Profile Information</h3>
              <div className="details-view-grid">
                <div className="view-item">
                  <div className="view-icon-label">
                    <User size={16} />
                    <span>Name</span>
                  </div>
                  <p>{profile?.name}</p>
                </div>
                <div className="view-item">
                  <div className="view-icon-label">
                    <Mail size={16} />
                    <span>Email Address</span>
                  </div>
                  <p>{profile?.email}</p>
                </div>
                <div className="view-item">
                  <div className="view-icon-label">
                    <Phone size={16} />
                    <span>Phone Number</span>
                  </div>
                  <p>{profile?.phone || "Not provided"}</p>
                </div>
              </div>
              <div className="view-bio">
                <div className="view-icon-label">
                  <Edit2 size={16} />
                  <span>Bio / Description</span>
                </div>
                <p>{profile?.bio || "No bio added yet."}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
