import React, { useState } from "react";
import { createLead } from "../../services/leadService";
import "../../styles/LeadModel.css";

function AddLeadModal({ isOpen, onClose, onLeadAdded }) {
  const initialState = {
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "",
    status: "New",
    assignedTo: "",
    notes: "",
  };

  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createLead(formData);

      onLeadAdded?.();     // refresh table
      onClose?.();         // close modal FIRST

      setFormData(initialState); // reset AFTER closing
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Lead</h2>

        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
          <input name="company" placeholder="Company" value={formData.company} onChange={handleChange} />
          <input name="source" placeholder="Source" value={formData.source} onChange={handleChange} />

          <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange} />

          <div className="modal-actions">
            <button type="submit">Save</button>

            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddLeadModal;