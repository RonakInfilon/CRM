import { useState } from "react";
// import { createLead, updateLead } from "../services/leadService";
import "../styles/LeadModel.css";
import { createLead, updateLead } from "../services/leadService";
import { CirclePoundSterling } from "lucide-react";
const initialState = {
  firstName: "",
  lastName: "",
  salutation: "",
  organization: "",
  website: "",
  territory: "",
  industry: "",
  jobTitle: "",
  source: "",
  status: "New",
  notes: "",
  email: "",
  phone: "",
};

function LeadModal({ isOpen, onClose, lead, onLeadSaved }) {
  // console.log(isOpen);
  // console.log(onClose);
  console.log("here i m checkinh lead is present or not" + lead);
  // console.log(onLeadSaved);
  const isEditMode = !!lead;
  const [formData, setFormData] = useState(
    lead
      ? {
        firstName: lead.FirstName || "",
        lastName: lead.LastName || "",
        salutation: lead.Salutation || "",
        organization: lead.Organization || "",
        website: lead.Website || "",
        territory: lead.Territory || "",
        industry: lead.Industry || "",
        jobTitle: lead.JobTitle || "",
        source: lead.Source || "",
        status: lead.Status || "New",
        notes: lead.Notes || "",
        email: lead.Email || "",
        phone: lead.Phone || "",
      }
      : initialState
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting");
    console.log("Lead:", lead);

    try {
      if (isEditMode) {
        await updateLead(lead.LeadID || lead.lead_id, formData);
      } else {
        await createLead(formData);
      }

      onLeadSaved?.();
      onClose?.();

    } catch (err) {
      console.error("Failed to save lead:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{isEditMode ? "Edit Lead" : "Add New Lead"}</h2>
          <button className="close-btn" type="button" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Section 1: Person Information */}
          <div className="form-section">
            <h3>Person Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Salutation</label>
                <input
                  name="salutation"
                  placeholder="e.g. Mr., Ms."
                  value={formData.salutation}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>
                  First Name <span className="required">*</span>
                </label>
                <input
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="e.g. +1 (555) 019-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Job Title</label>
              <input
                name="jobTitle"
                placeholder="Add Job Title..."
                value={formData.jobTitle}
                onChange={handleChange}
              />
            </div>
          </div>

          <hr className="section-divider" />

          {/* Section 2: Organization / Business Details */}
          <div className="form-section">
            <h3>Organization Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Organization</label>
                <input
                  name="organization"
                  placeholder="Infilon Technology"
                  value={formData.organization}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input
                  name="website"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Territory</label>
                <input
                  name="territory"
                  placeholder="Ahmedabad"
                  value={formData.territory}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Industry</label>
                <input
                  name="industry"
                  placeholder="Computer"
                  value={formData.industry}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <hr className="section-divider" />

          {/* Section 3: Metadata & Notes */}
          <div className="form-section">
            <h3>Additional Info</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Source</label>
                <input
                  name="source"
                  placeholder="Add Source..."
                  value={formData.source}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                placeholder="Write background information or updates..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              {isEditMode ? "Update Lead" : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeadModal;