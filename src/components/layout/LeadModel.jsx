import React, { useEffect, useState } from "react";
import { createLead, updateLead } from "../../services/leadService";
import "../../styles/LeadModel.css";

const initialState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  source: "",
  status: "New",
  notes: "",
};

function LeadModal({ isOpen, onClose, lead, onLeadSaved }) {
  const [formData, setFormData] = useState(initialState);
  
  const isEditMode = !!lead; 

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setFormData({
          name: lead.Name || "",
          email: lead.Email || "",
          phone: lead.Phone || "",
          company: lead.Company || "",
          source: lead.Source || "",
          status: lead.Status || "New",
          notes: lead.Notes || "",
        });
      } else {
        setFormData(initialState);
      }
    }
  }, [isOpen, lead, isEditMode]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        await updateLead(lead.LeadID, formData);
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
      <div className="modal">
        <h2>{isEditMode ? "Edit Lead" : "Add Lead"}</h2>

        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <label>Phone</label>
          <input
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <label>Company</label>
          <input
            name="company"
            placeholder="Company"
            value={formData.company}
            onChange={handleChange}
          />

          <label>Source</label>
          <input
            name="source"
            placeholder="Source"
            value={formData.source}
            onChange={handleChange}
          />

          <label>Notes</label>
          <textarea
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleChange}
          />

          <div className="modal-actions">
            <button type="submit">{isEditMode ? "Update" : "Save"}</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeadModal;