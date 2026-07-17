import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  Shield,
  CheckCircle2,
  RefreshCw,
  Edit2
} from "lucide-react";
import { useProfile } from "./useProfile";
import "./profile.styles.css";

const Profile = () => {
  const {
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
    getRoleBadgeClass,
  } = useProfile();

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
