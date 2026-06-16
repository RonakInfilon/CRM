import React, { useEffect, useState } from "react";
import { updateLead } from "../../services/leadService";
import "../../styles/LeadModel.css";

function EditLeadModal({
  isOpen,
  onClose,
  lead,
  onLeadUpdated,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "",
    status: "New",
    notes: "",
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.Name || "",
        email: lead.Email || "",
        phone: lead.Phone || "",
        company: lead.Company || "",
        source: lead.Source || "",
        status: lead.Status || "New",
        notes: lead.Notes || "",
      });
    }
  }, [lead]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateLead(lead.LeadID, {
        Name: formData.name,
        Email: formData.email,
        Phone: formData.phone,
        Company: formData.company,
        Source: formData.source,
        Status: formData.status,
        Notes: formData.notes,
      });

      onLeadUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Lead</h2>

        <form onSubmit={handleSubmit}>

          <label>Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <label>Email</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <label>Phone</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <label>Company</label>
          <input
            name="company"
            value={formData.company}
            onChange={handleChange}
          />

          <label>Source</label>
          <input
            name="source"
            value={formData.source}
            onChange={handleChange}
          />

          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />

          <div className="modal-actions">
            <button type="submit">Update</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default EditLeadModal;