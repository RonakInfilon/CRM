import { useState } from "react";
import ContactsList from "../components/ContactsList";
import Pageheader from "../components/Pageheader";
import ContactDetailDrawer from "../components/ContactDetailDrawer";
import "../styles/Contacts.css";

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const contacts = [
    {
      id: 1,
      first_name: "John",
      last_name: "Smith",
      role: "Sales Manager",
      email: "john.smith@google.com",
      phone: "+1 (555) 019-2834",
      organization: "Google",
    },
    {
      id: 2,
      first_name: "Emma",
      last_name: "Watson",
      role: "Marketing Head",
      email: "emma.watson@microsoft.com",
      phone: "+1 (555) 043-9821",
      organization: "Microsoft",
    },
    {
      id: 3,
      first_name: "Steve",
      last_name: "Jobs",
      role: "Co-founder",
      email: "steve.jobs@apple.com",
      phone: "+1 (555) 098-7654",
      organization: "Apple",
    },
    {
      id: 4,
      first_name: "Jeff",
      last_name: "Bezos",
      role: "Founder",
      email: "jeff.bezos@amazon.com",
      phone: "+1 (555) 012-3456",
      organization: "Amazon",
    },
    {
      id: 5,
      first_name: "Tim",
      last_name: "Cook",
      role: "CEO",
      email: "tim.cook@apple.com",
      phone: "+1 (555) 014-9988",
      organization: "Apple",
    },
    {
      id: 6,
      first_name: "Satya",
      last_name: "Nadella",
      role: "CEO",
      email: "satya.nadella@microsoft.com",
      phone: "+1 (555) 016-7722",
      organization: "Microsoft",
    },
    {
      id: 7,
      first_name: "Sundar",
      last_name: "Pichai",
      role: "CEO",
      email: "sundar.pichai@google.com",
      phone: "+1 (555) 018-6611",
      organization: "Google",
    },
  ];

  // Filter contacts locally
  const filteredContacts = contacts.filter((contact) => {
    const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    return (
      fullName.includes(query) ||
      contact.role.toLowerCase().includes(query) ||
      contact.organization.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.phone.includes(query)
    );
  });

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedContact(null);
  };

  return (
    <>
      <Pageheader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
       
        onAddClick={() => alert("Add Contact feature is currently mocked.")}
        placeholder="Search contacts by name, company, email..."
        buttonText="+ Add Contact"
      />
      <div className="crm-page-container">
        <ContactsList contacts={filteredContacts} onContactClick={handleContactClick} />
      </div>

      <ContactDetailDrawer
        isOpen={drawerOpen}
        contact={selectedContact}
        onClose={handleCloseDrawer}
      />
    </>
  );
};

export default Contacts;