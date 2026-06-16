import React, { useEffect, useState } from "react";
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
} from "../../services/leadService.js";

import EditLeadModal from "./EditLeadModel.jsx";

import "../../styles/LeadTable.css";

function LeadTable() {
  const [leads, setLeads] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [selectedLead, setSelectedLead] =
    useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await getLeads();
      console.log(response)
      setLeads(response.data.leads);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this lead?"
    );

    if (!confirmed) return;

    try {
      await deleteLead(id);

      fetchLeads();

      setOpenMenu(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (lead) => {
    setSelectedLead(lead);
    setShowEditModal(true);
    setOpenMenu(null);
  };

  const headers =
    leads.length > 0
      ? Object.keys(leads[0]).filter(
          (key) =>
            key !== "LeadID" &&
            key !== "CreatedAt" &&
            key !== "UpdatedAt"
        )
      : [];

  const getStatusClass = (status) => {
    switch (status) {
      case "New":
        return "new";

      case "Contacted":
        return "contacted";

      case "Qualified":
        return "qualified";

      case "Lost":
        return "lost";

      default:
        return "";
    }
  };

  return (
    <>
      <div className="table-wrapper">
        <Table className="crm-table">
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableCell
                  key={header}
                  isHeader
                >
                  {header}
                </TableCell>
              ))}

              <TableCell isHeader>
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {leads.map((lead) => (
              <TableRow
                key={lead.LeadID}
              >
                {headers.map((header) => (
                  <TableCell
                    key={header}
                  >
                    {header ===
                    "Status" ? (
                      <span
                        className={`status-badge ${getStatusClass(
                          lead[
                            header
                          ]
                        )}`}
                      >
                        {
                          lead[
                            header
                          ]
                        }
                      </span>
                    ) : (
                      lead[
                        header
                      ]
                    )}
                  </TableCell>
                ))}

                <TableCell>
                  <div className="action-wrapper">
                    <button
                      className="menu-btn"
                      onClick={() =>
                        setOpenMenu(
                          openMenu ===
                            lead.LeadID
                            ? null
                            : lead.LeadID
                        )
                      }
                    >
                      ⋮
                    </button>

                    {openMenu ===
                      lead.LeadID && (
                      <div className="dropdown-menu">
                        <button
                          onClick={() =>
                            handleEdit(
                              lead
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              lead.LeadID
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditLeadModal
        isOpen={showEditModal}
        onClose={() =>
          setShowEditModal(false)
        }
        lead={selectedLead}
        onLeadUpdated={fetchLeads}
      />
    </>
  );
}

export default LeadTable;