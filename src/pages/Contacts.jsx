import "../styles/Contacts.css"
import React, { useState, useEffect, useRef } from "react";
import ContactsList from "../components/ContactsList";
import Pageheader from "../components/Pageheader";
const Contacts = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSeachQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("CreatedAt");
  const contacts = [
    {
      id: 1,
      first_name: "John",
      last_name: "Smith",
      role: "Sales Manager",
      email: "john@gmail.com",
      phone: "9876543210",
      organization: "Google",
    },
    {
      id: 2,
      first_name: "Emma",
      last_name: "Watson",
      role: "Marketing Head",
      email: "emma@gmail.com",
      phone: "9999999999",
      organization: "Microsoft",
    },
  ];
  return (
    <>
      <Pageheader
        searchQuery={searchQuery}
        onSearchChange={setSeachQuery}
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
        onAddClick={() => setShowAddModal(true)}
        placeholder="search Leads by name,company,email..."
        buttonText="+ Add Contacts"
      />
      <div>Contacts</div>
      <ContactsList contacts={contacts} />
    </>

  )
}

export default Contacts