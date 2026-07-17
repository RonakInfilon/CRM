import { useState, useEffect } from "react";
import { getOrganization } from "../../pages/company/organizationService";
import { getLeads } from "../../pages/leads/leadService";

export const useContactModal = ({ contact, isOpen, defaultCompany, onSave, onClose }) => {
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

  return {
    isEditMode,
    organizations,
    wonLeads,
    formData,
    setFormData,
    handleChange,
    handleOrgChange,
    handleSubmit,
  };
};
