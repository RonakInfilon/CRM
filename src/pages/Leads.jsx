import React, { useState } from "react";
import LeadTable from "../components/layout/LeadTable";
import AddLeadModal from "../components/layout/AddLeadModel";
import "../styles/Leads.css"
function Leads() {
  const [showAddModal, setShowAddModal] =
    useState(false);

  return (
    <>
      <div className="page-header">
        <button
          onClick={() =>
            setShowAddModal(true)
          }
        >
          + Add Lead
        </button>
      </div>

      <LeadTable />

      <AddLeadModal
        isOpen={showAddModal}
        onClose={() =>
          setShowAddModal(false)
        }
      />
    </>
  );
}

export default Leads;