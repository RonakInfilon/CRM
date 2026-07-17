import { useState } from "react";
import { createLead, updateLead } from "../../pages/leads/leadService";

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

export function useLeadModal({ lead, onClose, onLeadSaved }) {
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

  const isContacted = formData.status === "Contacted";

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

  return {
    isEditMode,
    formData,
    isContacted,
    handleChange,
    handleSubmit,
  };
}
