import { Mail, Phone, Building2 } from "lucide-react";
import "../styles/ContactsList.css";

const ContactsList = ({ contacts, onContactClick }) => {
  const getAvatarGradient = (company) => {
    switch (company) {
      case "Google":
        return "linear-gradient(135deg, #4285F4, #34A853)";
      case "Microsoft":
        return "linear-gradient(135deg, #00A4EF, #FFB900)";
      case "Apple":
        return "linear-gradient(135deg, #555555, #000000)";
      case "Amazon":
        return "linear-gradient(135deg, #FF9900, #146EB4)";
      default:
        return "linear-gradient(135deg, #6366f1, #a855f7)";
    }
  };

  return (
    <div className="contacts-grid">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="contact-card"
          onClick={() => onContactClick(contact)}
        >
          <div className="contact-card-header">
            <span className="company-badge">
              <Building2 size={12} style={{ marginRight: 4 }} />
              {contact.organization}
            </span>
          </div>

          <div className="contact-card-profile">
            <div
              className="contact-avatar"
              style={{ background: getAvatarGradient(contact.organization) }}
            >
              {contact.first_name[0]}{contact.last_name[0]}
            </div>
            <h3 className="contact-name">
              {contact.first_name} {contact.last_name}
            </h3>
            <p className="contact-role">{contact.role}</p>
          </div>

          <div className="contact-card-footer">
            <div className="contact-meta-item">
              <Mail size={14} className="meta-icon" />
              <span>{contact.email}</span>
            </div>
            <div className="contact-meta-item">
              <Phone size={14} className="meta-icon" />
              <span>{contact.phone}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactsList;