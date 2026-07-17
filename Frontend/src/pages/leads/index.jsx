import LeadTable from "../../components/LeadTable";
import LeadModal from "../../components/LeadModel";
import Pageheader from "../../components/Pageheader";
import { useLeads } from "./useLeads";
import "./leads.styles.css";

function Leads() {
  const {
    showAddModal,
    setShowAddModal,
    searchQuery,
    setSeachQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    tableRef,
    handleLeadSaved,
  } = useLeads();

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