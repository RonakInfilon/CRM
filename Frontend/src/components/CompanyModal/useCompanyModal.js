import { useState, useEffect } from "react";
import { useRole } from "../../context/RoleContext.jsx";
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact
} from "../ContactModal/contactService";
import { getLeads } from "../../pages/leads/leadService";

export const useCompanyModal = ({ company, mode = "view", isOpen, onSave, onClose, onDelete }) => {
  const [currentMode, setCurrentMode] = useState(mode);
  const [formData, setFormData] = useState({ ...company });
  const [contacts, setContacts] = useState([]);
  const [wonLeads, setWonLeads] = useState([]);
  const { canDelete } = useRole();
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    setFormData({ ...company });
    setCurrentMode(mode);
  }, [company, mode, isOpen]);

  const fetchContacts = async () => {
    try {
      const res = await getContacts(1, 1000);
      if (res.data?.success) {
        setContacts(res.data.data);
      }
    } catch (err) {
      console.warn("Failed to load contacts from API, trying local storage", err);
      let localContacts = JSON.parse(localStorage.getItem("contacts"));
      if (!localContacts) {
        localContacts = [
          {
            contact_id: 1,
            first_name: "John",
            last_name: "Doe",
            email: "john.doe@google.com",
            phone: "+1 (555) 019-2834",
            job_title: "Product Manager",
            role: "Manager",
            contact_status: "Active",
            company_id: 1,
            Company_name: "Google",
            lifecycle_stage: "Customer"
          },
          {
            contact_id: 2,
            first_name: "Satya",
            last_name: "Nadella",
            email: "satya.n@microsoft.com",
            phone: "+1 (555) 043-9821",
            job_title: "CEO",
            role: "CEO",
            contact_status: "Active",
            company_id: 2,
            Company_name: "Microsoft",
            lifecycle_stage: "Customer"
          },
          {
            contact_id: 3,
            first_name: "Tim",
            last_name: "Cook",
            email: "tcook@apple.com",
            phone: "+1 (555) 098-7654",
            job_title: "CEO",
            role: "CEO",
            contact_status: "Active",
            company_id: 3,
            Company_name: "Apple",
            lifecycle_stage: "Customer"
          },
          {
            contact_id: 4,
            first_name: "Jeff",
            last_name: "Bezos",
            email: "jeff@amazon.com",
            phone: "+1 (555) 012-3456",
            job_title: "Founder",
            role: "Founder",
            contact_status: "Active",
            company_id: 4,
            Company_name: "Amazon",
            lifecycle_stage: "Customer"
          }
        ];
        localStorage.setItem("contacts", JSON.stringify(localContacts));
      }
      setContacts(localContacts);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
    }
  }, [isOpen]);

  const handleContactSave = async (contactFormData) => {
    try {
      if (selectedContact) {
        await updateContact(selectedContact.contact_id || selectedContact.id, contactFormData);
      } else {
        const payload = {
          ...contactFormData,
          company_id: company.org_id,
          organization: company.organization_name
        };
        await createContact(payload);
      }
      setContactModalOpen(false);
      setSelectedContact(null);
      fetchContacts();
    } catch (err) {
      console.warn("Failed to save contact via API, falling back to local storage", err);
      let localContacts = JSON.parse(localStorage.getItem("contacts")) || [];
      if (selectedContact) {
        const contactId = selectedContact.contact_id || selectedContact.id;
        localContacts = localContacts.map(c =>
          (c.contact_id || c.id) === contactId ? { ...c, ...contactFormData } : c
        );
      } else {
        const newContact = {
          ...contactFormData,
          contact_id: Date.now(),
          company_id: company.org_id,
          Company_name: company.organization_name
        };
        localContacts.unshift(newContact);
      }
      localStorage.setItem("contacts", JSON.stringify(localContacts));
      setContactModalOpen(false);
      setSelectedContact(null);
      fetchContacts();
    }
  };

  const handleContactEdit = (contact) => {
    setSelectedContact(contact);
    setContactModalOpen(true);
  };

  const handleContactAdd = () => {
    setSelectedContact(null);
    setContactModalOpen(true);
  };

  const handleContactDelete = async (contactId) => {
    const confirmed = window.confirm("Are you sure you want to delete this contact?");
    if (!confirmed) return;
    try {
      await deleteContact(contactId);
      fetchContacts();
    } catch (err) {
      console.warn("Failed to delete contact via API, falling back to local storage", err);
      let localContacts = JSON.parse(localStorage.getItem("contacts")) || [];
      localContacts = localContacts.filter(c => (c.contact_id || c.id) !== contactId);
      localStorage.setItem("contacts", JSON.stringify(localContacts));
      fetchContacts();
    }
  };

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return {
    currentMode,
    setCurrentMode,
    formData,
    setFormData,
    contacts,
    wonLeads,
    canDelete,
    contactModalOpen,
    setContactModalOpen,
    selectedContact,
    setSelectedContact,
    fetchContacts,
    handleContactSave,
    handleContactEdit,
    handleContactAdd,
    handleContactDelete,
    handleChange,
    handleSubmit,
  };
};
