import "../styles/LeadCard.css";

const LeadCard = ({ lead, onClose }) => {
  if (!lead) return null;

  return (
    <div className="lead-card-overlay" onClick={onClose}>
      <div className="lead-card-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Section */}
        <div className="lead-card-header">
          <div className="lead-card-title-group">
            <span className="lead-salutation">{lead.Salutation}</span>
            <h2>{lead.FirstName} {lead.LastName}</h2>
          </div>
          <button className="lead-card-close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* Content Body */}
        <div className="lead-card-body">
          
          <div className="lead-card-section">
            <h3>Company Information</h3>
            <div className="lead-grid">
              <div className="lead-field">
                <label>Organization</label>
                <p>{lead.Organization || "—"}</p>
              </div>
              <div className="lead-field">
                <label>Website</label>
                <p>
                  {lead.Website ? (
                    <a href={lead.Website} target="_blank" rel="noopener noreferrer">
                      {lead.Website}
                    </a>
                  ) : "—"}
                </p>
              </div>
              <div className="lead-field">
                <label>Job Title</label>
                <p>{lead.JobTitle || "—"}</p>
              </div>
              <div className="lead-field">
                <label>Industry</label>
                <p>{lead.Industry || "—"}</p>
              </div>
            </div>
          </div>

          <div className="lead-card-section">
            <h3>Assignment & Context</h3>
            <div className="lead-grid">
              <div className="lead-field">
                <label>Territory</label>
                <p>{lead.Territory || "—"}</p>
              </div>
              <div className="lead-field">
                <label>Source</label>
                <p>{lead.Source || "—"}</p>
              </div>
              <div className="lead-field">
                <label>Current Status</label>
                <p><span className={`status-tag status-${lead.Status?.toLowerCase()}`}>{lead.Status}</span></p>
              </div>
              <div className="lead-field">
                <label>Lead ID</label>
                <p>#{lead.LeadID}</p>
              </div>
            </div>
          </div>

          <div className="lead-card-section full-width">
            <h3>Internal Notes</h3>
            <div className="lead-notes-box">
              <p>{lead.Notes || "No notes available for this lead."}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LeadCard;
