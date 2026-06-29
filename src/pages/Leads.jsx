import { useState, useRef } from "react";
import LeadTable from "../components/LeadTable";
import LeadModal from "../components/LeadModel";
import Pageheader from "../components/Pageheader";
import "../styles/Leads.css";

function Leads() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSeachQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy] = useState("CreatedAt");
  const tableRef = useRef();

  const handleLeadSaved = () => {
    if (tableRef.current && tableRef.current.refreshTable) {
      tableRef.current.refreshTable();
    }
  };

  return (
    <>
      <Pageheader
        searchQuery={searchQuery}
        onSearchChange={setSeachQuery}
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
        onAddClick={() => setShowAddModal(true)}
        placeholder="Search leads by name, company, industry..."
        buttonText="+ Add Lead"
      />
      <LeadTable
        ref={tableRef}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        sortBy={sortBy}
      />
      <LeadModal
        key={showAddModal ? "add" : "none"}
        isOpen={showAddModal}
        lead={null}
        onClose={() => setShowAddModal(false)}
        onLeadSaved={handleLeadSaved}
      />
    </>
  );
}

export default Leads;