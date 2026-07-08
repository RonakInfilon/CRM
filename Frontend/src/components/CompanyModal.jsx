import { useState, useEffect } from "react";
import { useRole } from "../context/RoleContext.jsx";
import { getContacts } from "../services/contactService";
import { getLeads } from "../services/leadService";
import "../styles/CompanyModal.css";

const CompanyModal = ({ isOpen, mode = "view", company = {}, onClose, onSave, onDelete }) => {
  const [currentMode, setCurrentMode] = useState(mode);
  const [formData, setFormData] = useState({ ...company });
  const [contacts, setContacts] = useState([]);
  const [wonLeads, setWonLeads] = useState([]);
  const { canDelete } = useRole();

  useEffect(() => {
    setFormData({ ...company });
    setCurrentMode(mode);
  }, [company, mode, isOpen]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await getContacts(1, 1000);
        if (res.data?.success) {
          setContacts(res.data.data);
        }
      } catch (err) {
        console.warn("Failed to load contacts for datalist suggestion", err);
      }
    };
    if (isOpen) {
      fetchContacts();
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

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fullscreen-modal-overlay">
      <div className="fullscreen-modal-container">
        <div className="modal-header-bar">
          <h2>
            {currentMode === "edit"
              ? `Edit ${company.organization_name || "Organization"}`
              : currentMode === "add"
              ? "Add New Organization"
              : "Organization Details"}
          </h2>
          <button className="close-large-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content-scroll">
          {currentMode === "view" ? (
            <div className="details-view-layout">
              <div className="details-card-hero">
                <div className="hero-avatar">
                  {company.organization_name
                    ? company.organization_name.charAt(0).toUpperCase()
                    : "?"}
                </div>
                <div>
                  <h1>{company.organization_name || "N/A"}</h1>
                  <p className="hero-subtext">
                    {company.industry || "No Industry Listed"}
                  </p>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <strong>Website:</strong>{" "}
                  <a href={company.website} target="_blank" rel="noreferrer">
                    {company.website || "-"}
                  </a>
                </div>
                <div className="detail-item">
                  <strong>Associated Contact:</strong>{" "}
                  <span>{company.associated_contact || "-"}</span>
                </div>
                <div className="detail-item">
                  <strong>Company Size:</strong>{" "}
                  <span>{company.company_size || "-"} employees</span>
                </div>
                <div className="detail-item">
                  <strong>Annual Revenue:</strong>{" "}
                  <span>
                    {company.annual_revenue
                      ? `$${Number(company.annual_revenue).toLocaleString()}`
                      : "-"}
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Phone Number:</strong>{" "}
                  <span>{company.phone || "-"}</span>
                </div>
                <div className="detail-item">
                  <strong>City:</strong> <span>{company.city || "-"}</span>
                </div>
                <div className="detail-item">
                  <strong>Country:</strong> <span>{company.country || "-"}</span>
                </div>
                <div className="detail-item full-width">
                  <strong>Billing Address:</strong>{" "}
                  <span>{company.billing_address || "-"}</span>
                </div>
                <div className="detail-item">
                  <strong>Status:</strong>{" "}
                  <span>{company.isPresent ? "Active" : "Inactive"}</span>
                </div>
                <div className="detail-item">
                  <strong>Tenant ID:</strong>{" "}
                  <span>{company.tenant_id || "-"}</span>
                </div>
                <div className="detail-item">
                  <strong>Created At:</strong>{" "}
                  <span>
                    {company.created_at
                      ? new Date(company.created_at).toLocaleString()
                      : "-"}
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Last Updated:</strong>{" "}
                  <span>
                    {company.updated_at
                      ? new Date(company.updated_at).toLocaleString()
                      : "-"}
                  </span>
                </div>
              </div>

              <div className="modal-footer-actions">
                <button
                  className="modal-btn edit-btn-main"
                  onClick={() => setCurrentMode("edit")}
                >
                  Edit Details
                </button>
                {canDelete && (
                  <button
                    className="modal-btn delete-btn-main"
                    onClick={() => {
                      onDelete(company.org_id);
                      onClose();
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="edit-form-layout">
              <div className="form-grid">
                {currentMode === "add" && wonLeads.length > 0 && (
                  <div className="form-group full-width" style={{ marginBottom: "20px", background: "rgba(59, 130, 246, 0.1)", padding: "12px", borderRadius: "6px" }}>
                    <label style={{ fontWeight: "600", color: "#3b82f6" }}>Import from Won Lead:</label>
                    <select
                      onChange={(e) => {
                        const leadId = e.target.value;
                        if (!leadId) return;
                        const matched = wonLeads.find(l => String(l.LeadID) === String(leadId));
                        if (matched) {
                          setFormData(prev => ({
                            ...prev,
                            organization_name: matched.Organization,
                            phone: matched.Phone,
                            website: matched.Website || "",
                            industry: matched.Industry || "",
                            associated_contact: `${matched.FirstName} ${matched.LastName}`
                          }));
                        }
                      }}
                      style={{ marginTop: "6px", width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #3b82f6", background: "#1f2937", color: "#fff" }}
                    >
                      <option value="">-- Select a Won Lead to autofill --</option>
                      {wonLeads.map(lead => (
                        <option key={lead.LeadID} value={lead.LeadID}>
                          {lead.Organization} (Lead: {lead.FirstName} {lead.LastName})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Organization Name *</label>
                  <input
                    type="text"
                    name="organization_name"
                    value={formData.organization_name || ""}
                    onChange={handleChange}
                    required
                    maxLength="255"
                  />
                </div>

                <div className="form-group">
                  <label>Associated Contact Person</label>
                  <input
                    list="company-contacts-datalist"
                    name="associated_contact"
                    value={formData.associated_contact || ""}
                    onChange={handleChange}
                    placeholder="Select or type contact name..."
                  />
                  <datalist id="company-contacts-datalist">
                    {contacts.map(c => (
                      <option key={c.contact_id || c.id} value={`${c.first_name} ${c.last_name}`} />
                    ))}
                  </datalist>
                </div>

                <div className="form-group">
                  <label>Website URL</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website || ""}
                    onChange={handleChange}
                    maxLength="255"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Industry</label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry || ""}
                    onChange={handleChange}
                    maxLength="100"
                  />
                </div>

                <div className="form-group">
                  <label>Company Size (Range)</label>
                  <select
                    name="company_size"
                    value={formData.company_size || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select Size...</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501+">501+ employees</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Annual Revenue ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="annual_revenue"
                    value={formData.annual_revenue || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    maxLength="20"
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city || ""}
                    onChange={handleChange}
                    maxLength="100"
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country || ""}
                    onChange={handleChange}
                    maxLength="100"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Billing Address</label>
                  <textarea
                    name="billing_address"
                    value={formData.billing_address || ""}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isPresent"
                      checked={Boolean(Number(formData.isPresent))}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isPresent: e.target.checked ? 1 : 0,
                        }))
                      }
                    />
                    Is Present Active Status
                  </label>
                </div>

                <div className="form-group">
                  <label>Tenant ID (Read-only)</label>
                  <input
                    type="number"
                    name="tenant_id"
                    value={formData.tenant_id || ""}
                    disabled
                  />
                </div>
                <div className="modal-footer-actions">
                  <button
                    type="button"
                    className="modal-btn cancel-btn"
                    onClick={() =>
                      currentMode === "add" ? onClose() : setCurrentMode("view")
                    }
                  >
                    Cancel
                  </button>
                  <button type="submit" className="modal-btn save-btn">
                    {currentMode === "add" ? "Create Organization" : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyModal;
