import { X, Mail, Phone, Building2, ExternalLink, Globe, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/ContactDetailDrawer.css";

const ContactDetailDrawer = ({ isOpen, contact, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen || !contact) return null;

  const handleCompanyClick = () => {
    onClose();
    // Redirect to organization page and pre-fill search with company name
    navigate(`/organization?search=${encodeURIComponent(contact.organization)}`);
  };

  const avatarColor = {
    Google: "linear-gradient(135deg, #4285F4, #34A853)",
    Microsoft: "linear-gradient(135deg, #00A4EF, #FFB900)",
    Apple: "linear-gradient(135deg, #555555, #000000)",
    Amazon: "linear-gradient(135deg, #FF9900, #146EB4)",
  }[contact.organization] || "linear-gradient(135deg, #6366f1, #a855f7)";

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>Contact Profile</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Hero Profile Section */}
          <div className="profile-hero">
            <div className="profile-avatar" style={{ background: avatarColor }}>
              {contact.first_name[0]}{contact.last_name[0]}
            </div>
            <h3>{contact.first_name} {contact.last_name}</h3>
            <p className="profile-role">{contact.role}</p>
            <span className="status-badge active">Active</span>
          </div>

          <hr className="divider" />

          {/* Contact Details */}
          <div className="details-section">
            <h4>Contact Details</h4>
            <div className="info-item">
              <Mail size={16} className="info-icon" />
              <div>
                <span className="info-label">Email Address</span>
                <span className="info-value">{contact.email}</span>
              </div>
            </div>
            <div className="info-item">
              <Phone size={16} className="info-icon" />
              <div>
                <span className="info-label">Phone Number</span>
                <span className="info-value">{contact.phone}</span>
              </div>
            </div>
            <div className="info-item">
              <Calendar size={16} className="info-icon" />
              <div>
                <span className="info-label">Date Added</span>
                <span className="info-value">Jun 14, 2026</span>
              </div>
            </div>
          </div>

          <hr className="divider" />

          {/* Associated Company Section */}
          <div className="company-section">
            <h4>Associated Company</h4>
            <div className="linked-company-card">
              <div className="company-card-header">
                <div className="company-icon-badge">
                  <Building2 size={20} className="company-icon" />
                </div>
                <div>
                  <h5>{contact.organization}</h5>
                  <span className="company-type">Corporate Partner</span>
                </div>
              </div>
              
              <div className="company-quick-info">
                <div className="quick-item">
                  <Globe size={14} />
                  <span>{contact.organization.toLowerCase()}.com</span>
                </div>
              </div>

              <button className="redirect-company-btn" onClick={handleCompanyClick}>
                <span>View Company Profile</span>
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetailDrawer;
