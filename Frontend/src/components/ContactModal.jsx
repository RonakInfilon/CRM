import React, { useState, useEffect } from "react";
import { getOrganization } from "../services/organizationService";
import { getLeads } from "../services/leadService";
import "../styles/LeadModel.css"; 

const ContactModal = ({ isOpen, onClose, contact, onSave, defaultCompany, isInline = false }) => {
  const isEditMode = !!contact;
  const [organizations, setOrganizations] = useState([]);
  const [wonLeads, setWonLeads] = useState([]);
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
    organization: "",
    company_id: "",
    lifecycle_stage: "Customer",
    contact_status: "Active"
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        first_name: contact.first_name || "",
        last_name: contact.last_name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        job_title: contact.role || contact.job_title || "",
        organization: contact.organization || contact.Company_name || "",
        company_id: contact.company_id || "",
        lifecycle_stage: contact.lifecycle_stage || "Customer",
        contact_status: contact.contact_status || "Active"
      });
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        job_title: "",
        organization: defaultCompany?.organization_name || "",
        company_id: defaultCompany?.org_id || "",
        lifecycle_stage: "Customer",
        contact_status: "Active"
      });
    }
  }, [contact, isOpen, defaultCompany]);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await getOrganization(1, 1000);
        if (res.data?.data?.organizations) {
          setOrganizations(res.data.data.organizations);
        }
      } catch (err) {
        console.warn("Failed to fetch organizations list for datalist suggestions", err);
      }
    };
    if (isOpen) {
      fetchOrgs();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchWonLeads = async () => {
      try {
        const res = await getLeads(1, 100, "Won");
        if (res.data?.data?.leads) {
          setWonLeads(res.data.data.leads);
        }
      } catch (err) {
        console.warn("Failed to fetch won leads:", err);
      }
    };
    if (isOpen) {
      fetchWonLeads();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOrgChange = (e) => {
    const val = e.target.value;
    const matched = organizations.find(o => o.organization_name === val);
    setFormData(prev => ({
      ...prev,
      organization: val,
      company_id: matched ? matched.org_id : ""
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.email) {
      alert("Please fill in all required fields (First Name, Last Name, Email)");
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  if (isInline) {
    return (
      <div className="inline-contact-form-container">
        <div className="inline-contact-form-header">
          <h3>{isEditMode ? "Edit Contact" : "Add New Contact"}</h3>
          <button type="button" className="close-inline-form-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="inline-contact-form">
          {!isEditMode && wonLeads.length > 0 && (
            <div className="form-group" style={{ marginBottom: "20px", background: "rgba(59, 130, 246, 0.1)", padding: "12px", borderRadius: "6px" }}>
              <label style={{ fontWeight: "600", color: "#3b82f6" }}>Import from Won Lead:</label>
              <select 
                onChange={(e) => {
                  const leadId = e.target.value;
                  if (!leadId) return;
                  const matched = wonLeads.find(l => String(l.LeadID) === String(leadId));
                  if (matched) {
                    setFormData(prev => ({
                      ...prev,
                      first_name: matched.FirstName,
                      last_name: matched.LastName,
                      email: matched.Email,
                      phone: matched.Phone,
                      organization: matched.Organization,
                      job_title: matched.JobTitle
                    }));
                  }
                }}
                style={{ marginTop: "6px", width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #3b82f6", background: "#1f2937", color: "#fff" }}
              >
                <option value="">-- Select a Won Lead to autofill --</option>
                {wonLeads.map(lead => (
                  <option key={lead.LeadID} value={lead.LeadID}>
                    {lead.FirstName} {lead.LastName} ({lead.Organization})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-section">
            <h4 className="section-title-small">Contact Identity</h4>
            <div className="form-grid-2col">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2col">
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <hr className="section-divider-small" />

          <div className="form-section">
            <h4 className="section-title-small">Professional Context</h4>
            <div className="form-grid-2col">
              <div className="form-group">
                <label>Job Title / Role</label>
                <input
                  type="text"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  placeholder="e.g. Project Manager"
                />
              </div>
              <div className="form-group">
                <label>Company / Organization</label>
                <input
                  list="contacts-org-datalist"
                  name="organization"
                  value={formData.organization}
                  onChange={handleOrgChange}
                  placeholder="Select or type custom company..."
                  disabled={!!defaultCompany}
                  style={defaultCompany ? { backgroundColor: "#f3f4f6", color: "#9ca3af", cursor: "not-allowed" } : {}}
                />
                {!defaultCompany && (
                  <datalist id="contacts-org-datalist">
                    {organizations.map(o => (
                      <option key={o.org_id} value={o.organization_name} />
                    ))}
                  </datalist>
                )}
              </div>
            </div>

            <div className="form-grid-2col">
              <div className="form-group">
                <label>Lifecycle Stage</label>
                <select name="lifecycle_stage" value={formData.lifecycle_stage} onChange={handleChange}>
                  <option value="Lead">Lead</option>
                  <option value="Marketing Qualified Lead">MQL</option>
                  <option value="Sales Qualified Lead">SQL</option>
                  <option value="Opportunity">Opportunity</option>
                  <option value="Customer">Customer</option>
                  <option value="Evangelist">Evangelist</option>
                </select>
              </div>
              <div className="form-group">
                <label>Contact Status</label>
                <select name="contact_status" value={formData.contact_status} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Do Not Contact">Do Not Contact</option>
                  <option value="Bounced">Bounced</option>
                </select>
              </div>
            </div>
          </div>

          <div className="inline-form-actions">
            <button type="button" className="btn-cancel-inline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit-inline">
              {isEditMode ? "Update Contact" : "Create Contact"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{isEditMode ? "Edit Contact" : "Add New Contact"}</h2>
                   <button className="close-large-btn" onClick={onClose}>✕</button>

        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {!isEditMode && wonLeads.length > 0 && (
            <div className="form-group" style={{ marginBottom: "20px", background: "rgba(59, 130, 246, 0.1)", padding: "12px", borderRadius: "6px" }}>
              <label style={{ fontWeight: "600", color: "#3b82f6" }}>Import from Won Lead:</label>
              <select 
                onChange={(e) => {
                  const leadId = e.target.value;
                  if (!leadId) return;
                  const matched = wonLeads.find(l => String(l.LeadID) === String(leadId));
                  if (matched) {
                    setFormData(prev => ({
                      ...prev,
                      first_name: matched.FirstName,
                      last_name: matched.LastName,
                      email: matched.Email,
                      phone: matched.Phone,
                      organization: matched.Organization,
                      job_title: matched.JobTitle
                    }));
                  }
                }}
                style={{ marginTop: "6px", width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #3b82f6", background: "#1f2937", color: "#fff" }}
              >
                <option value="">-- Select a Won Lead to autofill --</option>
                {wonLeads.map(lead => (
                  <option key={lead.LeadID} value={lead.LeadID}>
                    {lead.FirstName} {lead.LastName} ({lead.Organization})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-section">
            <h3>Contact Identity</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <hr className="section-divider" />

          <div className="form-section">
            <h3>Professional Context</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Job Title / Role</label>
                <input
                  type="text"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  placeholder="e.g. Project Manager"
                />
              </div>
              <div className="form-group">
                <label>Company / Organization</label>
                <input
                  list="contacts-org-datalist"
                  name="organization"
                  value={formData.organization}
                  onChange={handleOrgChange}
                  placeholder="Select or type custom company..."
                  disabled={!!defaultCompany}
                  style={defaultCompany ? { backgroundColor: "#f3f4f6", color: "#9ca3af", cursor: "not-allowed" } : {}}
                />
                {!defaultCompany && (
                  <datalist id="contacts-org-datalist">
                    {organizations.map(o => (
                      <option key={o.org_id} value={o.organization_name} />
                    ))}
                  </datalist>
                )}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Lifecycle Stage</label>
                <select name="lifecycle_stage" value={formData.lifecycle_stage} onChange={handleChange}>
                  <option value="Lead">Lead</option>
                  <option value="Marketing Qualified Lead">MQL</option>
                  <option value="Sales Qualified Lead">SQL</option>
                  <option value="Opportunity">Opportunity</option>
                  <option value="Customer">Customer</option>
                  <option value="Evangelist">Evangelist</option>
                </select>
              </div>
              <div className="form-group">
                <label>Contact Status</label>
                <select name="contact_status" value={formData.contact_status} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Do Not Contact">Do Not Contact</option>
                  <option value="Bounced">Bounced</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              {isEditMode ? "Update Contact" : "Create Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
