import { useState, forwardRef, useImperativeHandle, useMemo, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
} from "../table/index.jsx";

import LeadModal from "../components/LeadModel.jsx";
import "../styles/LeadTable.css";
import Pagination from "./Pagination.jsx";
import StatusBadge from "./StatusBadges.jsx";
import LeadCard from "./LeadCard.jsx";
import { getLeads, updateLead, deleteLead } from "../services/leadService.js";
import { useRole } from "../context/RoleContext.jsx";

const SAMPLE_LEADS = [
  { LeadID: 1, FirstName: "Ronak", LastName: "Rathwa", Salutation: "Mr.", Organization: "Infilon Technology", Website: "https://www.infilon.com", Territory: "Ahmedabad", Industry: "Computer", JobTitle: "Software Engineer", Source: "Website", Status: "New", Notes: "Hello" },
  { LeadID: 2, FirstName: "Anjali", LastName: "Sharma", Salutation: "Ms.", Organization: "Athletex", Website: "https://www.athletex.com", Territory: "Mumbai", Industry: "Apparel", JobTitle: "Procurement Manager", Source: "Cold Call", Status: "Contacted", Notes: "Interested in bulk vendor dashboard tooling." },
  { LeadID: 3, FirstName: "John", LastName: "Doe", Salutation: "Mr.", Organization: "TechCorp", Website: "https://techcorp.io", Territory: "San Francisco", Industry: "Cloud Infrastructure", JobTitle: "CTO", Source: "LinkedIn", Status: "Qualified", Notes: "Requires custom API integrations." }
];

const LeadTable = forwardRef(({ searchQuery, statusFilter, sortBy }, ref) => {
  const [allLeads, setAllLeads] = useState(SAMPLE_LEADS);
  const [openMenu, setOpenMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { canDelete } = useRole();
  
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activePreviewLead, setActivePreviewLead] = useState(null);

  const rowsPerPage = 5;

  const fetchLeads = useCallback(async () => {
    try {
      const response = await getLeads(currentPage, rowsPerPage, statusFilter, searchQuery, sortBy);
      if (response.data?.data?.leads) {
        setAllLeads(response.data.data.leads);
      }
    } catch (err) {
      console.warn("Failed to fetch leads from API, using local mock data:", err);
    }
  }, [currentPage, statusFilter, searchQuery, sortBy]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Expose reset capabilities to parent safely
  useImperativeHandle(ref, () => ({
    refreshTable() {
      setCurrentPage(1);
      fetchLeads();
    }
  }));

  // Filter & Sort local fallback state
  const filteredAndSortedLeads = useMemo(() => {
    let result = [...allLeads];

    if (statusFilter) {
      result = result.filter(lead => lead.Status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(lead =>
        lead.FirstName?.toLowerCase().includes(query) ||
        lead.LastName?.toLowerCase().includes(query) ||
        lead.Organization?.toLowerCase().includes(query) ||
        lead.Industry?.toLowerCase().includes(query) ||
        lead.Territory?.toLowerCase().includes(query)
      );
    }

    if (sortBy) {
      result.sort((a, b) => {
        const valA = (a[sortBy] || "").toString().toLowerCase();
        const valB = (b[sortBy] || "").toString().toLowerCase();
        return valA.localeCompare(valB);
      });
    }

    return result;
  }, [allLeads, statusFilter, searchQuery, sortBy]);

  // Compute total pages dynamically
  const totalPages = Math.max(Math.ceil(filteredAndSortedLeads.length / rowsPerPage), 1);

  // Slice local active page chunk
  const displayedLeads = useMemo(() => {
    const verifiedPage = currentPage > totalPages ? 1 : currentPage; 
    const startIndex = (verifiedPage - 1) * rowsPerPage;
    return filteredAndSortedLeads.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedLeads, currentPage, totalPages]);

  const handleStatusChange = async (lead, newStatus) => {
    setAllLeads(prev =>
      prev.map(item =>
        item.LeadID === lead.LeadID ? { ...item, Status: newStatus } : item
      )
    );

    try {
      await updateLead(lead.LeadID, { ...lead, status: newStatus });
    } catch (err) {
      console.warn("Failed to update status on server:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!canDelete) {
      alert("Permission Denied: Only Super Admin can delete records.");
      return;
    }

    const confirmed = window.confirm("Delete this lead?");
    if (!confirmed) return;

    try {
      await deleteLead(id);
      setAllLeads(prev => prev.filter(lead => lead.LeadID !== id));
      setOpenMenu(null);
    } catch (err) {
      console.warn("Failed to delete lead on server, deleting locally:", err);
      setAllLeads(prev => prev.filter(lead => lead.LeadID !== id));
      setOpenMenu(null);
    }
  };

  const handleEditClick = (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
    setOpenMenu(null);
  };

  const headers = ["FirstName", "LastName", "Organization", "Territory", "Industry", "Status"];

  return (
    <>
      <div className="table-wrapper">
        <Table className="crm-table">
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