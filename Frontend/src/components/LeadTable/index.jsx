import { forwardRef } from "react";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
} from "../Table/index.jsx";

import LeadModal from "../LeadModel/index.jsx";
import "./LeadTable.styles.css";
import Pagination from "../Pagination";
import StatusBadge from "../StatusBadges";
import LeadCard from "../LeadCard";
import { useLeadTable } from "./useLeadTable";

const LeadTable = forwardRef(({ searchQuery, statusFilter, sortBy }, ref) => {
  const {
    displayedLeads,
    showModal,
    setShowModal,
    selectedLead,
    activePreviewLead,
    setActivePreviewLead,
    openMenu,
    setOpenMenu,
    currentPage,
    setCurrentPage,
    totalPages,
    fetchLeads,
    handleStatusChange,
    handleDelete,
    handleEditClick,
    canDelete,
  } = useLeadTable(ref, { searchQuery, statusFilter, sortBy });

  const headers = ["FirstName", "LastName", "Organization", "Territory", "Industry", "Status"];

  return (
    <>
      {statusFilter === "Qualified" && (
        <div className="qualified-banner">
          <span className="qualified-banner-icon"></span>
          <div className="qualified-banner-text">
            <strong>Viewing Qualified Leads</strong>

          </div>
        </div>
      )}
      <div className="table-wrapper">
        <Table className={`crm-table ${statusFilter === "Qualified" ? "qualified-table" : ""}`}>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header} isHeader>
                  {header.replace(/([A-Z])/g, " $1").trim()}
                </TableCell>
              ))}
              <TableCell isHeader>Action</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {displayedLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headers.length + 1} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                  No leads found matching your parameters.
                </TableCell>
              </TableRow>
            ) : (
              displayedLeads.map((lead) => (
                <TableRow
                  key={lead.LeadID}
                  onClick={() => {
                    console.log("Row clicked! Lead data:", lead);
                    setActivePreviewLead(lead);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {headers.map((header) => (
                    <TableCell 
                      key={header} 
                      onClick={(e) => header === "Status" && e.stopPropagation()}
                    >
                      {header === "Status" ? (
                        <StatusBadge
                          value={lead[header]}
                          onChange={(newStatus) => handleStatusChange(lead, newStatus)}
                        />
                      ) : (
                        lead[header]
                      )}
                    </TableCell>
                  ))}

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="action-wrapper">
                      <button
                        className="menu-btn"
                        onClick={() => setOpenMenu(openMenu === lead.LeadID ? null : lead.LeadID)}
                      >
                        ⋮
                      </button>

                      {openMenu === lead.LeadID && (
                        <div className="dropdown-menu">
                          <button onClick={() => handleEditClick(lead)}>Edit</button>
                          {canDelete && <button onClick={() => handleDelete(lead.LeadID)}>Delete</button>}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <LeadModal
        key={selectedLead?.LeadID || (showModal ? "new" : "none")}
        isOpen={showModal}
        lead={selectedLead}
        onClose={() => setShowModal(false)}
        onLeadSaved={fetchLeads}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      {activePreviewLead && (
        <LeadCard 
          lead={activePreviewLead} 
          onClose={() => setActivePreviewLead(null)} 
        />
      )}
    </>
  );
});

LeadTable.displayName = "LeadTable";

export default LeadTable;