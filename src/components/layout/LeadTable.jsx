import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
} from "../../table/index.jsx";

import {
  getLeads,
  deleteLead,
  updateLead,
} from "../../services/leadService.js";

import LeadModal from "../layout/LeadModel.jsx";
import "../../styles/LeadTable.css";

const LeadTable = forwardRef(({ searchQuery, statusFilter, sortBy }, ref) => {
  const [leads, setLeads] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  useImperativeHandle(ref, () => ({
    refreshTable() {
      fetchLeads();
    }
  }));



  useEffect(() => {

    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchLeads();
    }
  }, [searchQuery, statusFilter, sortBy]);

  useEffect(() => {
    if (currentPage !== 1) {
      fetchLeads();
    }
  }, [currentPage]);

  const fetchLeads = async () => {
    try {

      const response = await getLeads(currentPage, rowsPerPage, statusFilter, searchQuery, sortBy);

      setLeads(response.data.leads || []);
      setTotalPages(
        Math.ceil((response.data.total || 0) / rowsPerPage)
      );
    } catch (err) {
      console.error("Error reading lead records:", err);
    }
  };

  const handleStatusChange = async (lead, newStatus) => {
    try {
      await updateLead(lead.LeadID, {
        name: lead.Name,
        email: lead.Email,
        phone: lead.Phone,
        company: lead.Company,
        source: lead.Source,
        notes: lead.Notes,
        status: newStatus,
      });
      fetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this lead?");
    if (!confirmed) return;
    try {
      await deleteLead(id);
      fetchLeads();
      setOpenMenu(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
    setOpenMenu(null);
  };

  const headers =
    leads.length > 0
      ? Object.keys(leads[0]).filter(
        (key) => key !== "LeadID" && key !== "CreatedAt" && key !== "UpdatedAt"
      )
      : ["Name", "Email", "Phone", "Company", "Status"];

  const getStatusClass = (status) => {
    switch (status) {
      case "New": return "new";
      case "Contacted": return "contacted";
      case "Qualified": return "qualified";
      case "Lost": return "lost";
      default: return "";
    }
  };

  return (
    <>
      <div className="table-wrapper">
        <Table className="crm-table">
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header} isHeader>{header}</TableCell>
              ))}
              <TableCell isHeader>Action</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headers.length + 1} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                  No leads found matching your parameters.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.LeadID}>
                  {headers.map((header) => (
                    <TableCell key={header}>
                      {header === "Status" ? (
                        <div className={`status-badge-container ${getStatusClass(lead[header])}`}>
                          <select
                            className="status-select-dropdown"
                            value={lead[header]}
                            onChange={(e) => handleStatusChange(lead, e.target.value)}
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Lost">Lost</option>
                          </select>
                        </div>
                      ) : (
                        lead[header]
                      )}
                    </TableCell>
                  ))}

                  <TableCell>
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
                          <button onClick={() => handleDelete(lead.LeadID)}>Delete</button>
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
        isOpen={showModal}
        lead={selectedLead}
        onClose={() => setShowModal(false)}
        onLeadSaved={fetchLeads}
      />

      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
          Next
        </button>
      </div>
    </>
  );
});

export default LeadTable;