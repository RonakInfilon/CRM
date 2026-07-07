import { useState, useEffect, useCallback } from "react";
import ContactsList from "../components/ContactsList";
import Pageheader from "../components/Pageheader";
import ContactDetailDrawer from "../components/ContactDetailDrawer";
import ContactModal from "../components/ContactModal";
import { getContacts, createContact, updateContact, deleteContact } from "../services/contactService";
import "../styles/Contacts.css";

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // Fetch contacts list
  const fetchContactsList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getContacts(1, 100, searchQuery);
      if (res.data && res.data.success) {
        const mapped = res.data.data.map(c => ({
          id: c.contact_id,
          first_name: c.first_name,
          last_name: c.last_name,
          role: c.job_title || "N/A",
          email: c.email,
          phone: c.phone || "—",
          organization: c.Company_name || "—",
          org_id: c.org_id,
          lifecycle_stage: c.lifecycle_stage || "Customer",
          contact_status: c.contact_status || "Active"
        }));
        setContacts(mapped);
      }
    } catch (err) {
      console.warn("Failed to load contacts from API:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchContactsList();
  }, [fetchContactsList]);

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedContact(null);
  };

  const handleAddClick = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleEditClick = (contact) => {
    setDrawerOpen(false);
    setEditTarget(contact);
    setModalOpen(true);
  };

  const handleModalSave = async (formData) => {
    try {
      if (editTarget) {
        await updateContact(editTarget.id, formData);
      } else {
        await createContact(formData);
      }
      setModalOpen(false);
      fetchContactsList();
    } catch (err) {
      console.error("Failed to save contact:", err);
      alert(err.response?.data?.message || "Error saving contact details.");
    }
  };

  return (
    <>
      <Pageheader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={handleAddClick}
        placeholder="Search contacts by name, company, email..."
        buttonText="+ Add Contact"
      />
      <div className="crm-page-container">
        {loading ? (
          <p style={{ color: "#9ca3af", textAlign: "center", padding: 32 }}>Loading contacts directory...</p>
        ) : contacts.length === 0 ? (
          <p style={{ color: "#9ca3af", textAlign: "center", padding: 32 }}>No contacts found.</p>
        ) : (
          <ContactsList contacts={contacts} onContactClick={handleContactClick} />
        )}
      </div>

      <ContactDetailDrawer
        isOpen={drawerOpen}
        contact={selectedContact}
        onClose={handleCloseDrawer}
        onEdit={handleEditClick}
      />

      <ContactModal
        isOpen={modalOpen}
        contact={editTarget}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
      />
    </>
  );
};

export default Contacts;