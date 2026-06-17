import LeadTable from "../components/layout/LeadTable";
import LeadModal from "../components/layout/LeadModel";
import "../styles/Leads.css"
import React, { useState, useEffect, useRef } from "react";
import { getLeads } from "../services/leadService";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
function Leads() {
  const [showAddModal, setShowAddModal] =
    useState(false);
  const [searchQuery, setSeachQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("CreatedAt");

  const tableRef = useRef();

  const handleLeadSaved = () => {
    if (tableRef.current && tableRef.current.refreshTable) {
      tableRef.current.refreshTable();
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="search-input">
          <i className="fas fa-search"></i>

          <input type="text" placeholder="search Leads by name,company,email..." value={searchQuery} onChange={(e) => setSeachQuery(e.target.value)} />


          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="header-dropdown"
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>
        <button
          onClick={() =>
            setShowAddModal(true)
          }
        >
          + Add Lead
        </button>
      </div>

      <LeadTable
        ref={tableRef}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        sortBy={sortBy}
      />
      <LeadModal
        isOpen={showAddModal}
        lead={null}
        onClose={() =>
          setShowAddModal(false)
        }
        onLeadSaved={handleLeadSaved}
      />
    </>
  );
}


export default Leads;