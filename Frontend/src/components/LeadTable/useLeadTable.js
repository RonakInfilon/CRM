import { useState, useImperativeHandle, useMemo, useEffect, useCallback } from "react";
import { getLeads, deleteLead, updateLeadStatus } from "../../pages/leads/leadService.js";
import { useRole } from "../../context/RoleContext.jsx";

const SAMPLE_LEADS = [
  { LeadID: 1, FirstName: "Ronak", LastName: "Rathwa", Salutation: "Mr.", Organization: "Infilon Technology", Website: "https://www.infilon.com", Territory: "Ahmedabad", Industry: "Computer", JobTitle: "Software Engineer", Source: "Website", Status: "New", Notes: "Hello" },
  { LeadID: 2, FirstName: "Anjali", LastName: "Sharma", Salutation: "Ms.", Organization: "Athletex", Website: "https://www.athletex.com", Territory: "Mumbai", Industry: "Apparel", JobTitle: "Procurement Manager", Source: "Cold Call", Status: "Contacted", Notes: "Interested in bulk vendor dashboard tooling." },
  { LeadID: 3, FirstName: "John", LastName: "Doe", Salutation: "Mr.", Organization: "TechCorp", Website: "https://techcorp.io", Territory: "San Francisco", Industry: "Cloud Infrastructure", JobTitle: "CTO", Source: "LinkedIn", Status: "Qualified", Notes: "Requires custom API integrations." }
];

export function useLeadTable(ref, { searchQuery, statusFilter, sortBy }) {
  const [allLeads, setAllLeads] = useState(SAMPLE_LEADS);
  const [totalCount, setTotalCount] = useState(SAMPLE_LEADS.length);
  const [isOffline, setIsOffline] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { canDelete } = useRole();
  
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activePreviewLead, setActivePreviewLead] = useState(null);

  const rowsPerPage = 7;

  const fetchLeads = useCallback(async () => {
    try {
      const response = await getLeads(currentPage, rowsPerPage, statusFilter, searchQuery, sortBy);
      if (response.data?.data?.leads) {
        setAllLeads(response.data.data.leads);
        setTotalCount(response.data.data.total || 0);
        setIsOffline(false);
      }
    } catch (err) {
      console.warn("Failed to fetch leads from API, using local mock data:", err);
      setIsOffline(true);
    }
  }, [currentPage, statusFilter, searchQuery, sortBy]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".action-wrapper")) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
  const totalPages = useMemo(() => {
    if (isOffline) {
      return Math.max(Math.ceil(filteredAndSortedLeads.length / rowsPerPage), 1);
    } else {
      return Math.max(Math.ceil(totalCount / rowsPerPage), 1);
    }
  }, [isOffline, filteredAndSortedLeads.length, totalCount]);

  // Slice local active page chunk only if offline
  const displayedLeads = useMemo(() => {
    if (isOffline) {
      const verifiedPage = currentPage > totalPages ? 1 : currentPage; 
      const startIndex = (verifiedPage - 1) * rowsPerPage;
      return filteredAndSortedLeads.slice(startIndex, startIndex + rowsPerPage);
    } else {
      return allLeads;
    }
  }, [isOffline, allLeads, filteredAndSortedLeads, currentPage, totalPages]);

  const handleStatusChange = async (lead, newStatus) => {
    if (newStatus === "Contacted") {
      setSelectedLead({ ...lead, Status: "Contacted" });
      setShowModal(true);
      return;
    }

    if ((newStatus === "Qualified" || newStatus === "Won") && statusFilter !== "Qualified") {
      setAllLeads((prev) =>
        prev.filter((item) => item.LeadID !== lead.LeadID)
      );
    } else {
      setAllLeads((prev) =>
        prev.map((item) =>
          item.LeadID === lead.LeadID
            ? { ...item, Status: newStatus }
            : item
        )
      );
    }

    try {
      await updateLeadStatus(lead.LeadID, newStatus);

      if ((newStatus === "Qualified" || newStatus === "Won") && statusFilter !== "Qualified") {
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
      fetchLeads();
    }
  };

  const handleDelete = async (id) => {
    if (!canDelete) {
      alert("Permission Denied: Only Super Admin can delete records.");
      return;
    }

    if (!window.confirm("Delete this lead?")) return;

    try {
      await deleteLead(id);

      setAllLeads((prev) =>
        prev.filter((lead) => lead.LeadID !== id)
      );

      setOpenMenu(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete lead.");
    }
  };

  const handleEditClick = (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
    setOpenMenu(null);
  };

  return {
    displayedLeads,
    showModal,
    setShowModal,
    selectedLead,
    setSelectedLead,
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
  };
}
