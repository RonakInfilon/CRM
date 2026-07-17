import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useRole } from "../../context/RoleContext";
import {
  getOrganization,
  updateOrganization,
  deleteOrganization,
  createOrganization,
} from "./organizationService";

const defaultOrgs = [
  {
    org_id: 1,
    organization_name: "Google",
    industry: "Technology",
    website: "google.com",
    annual_revenue: 250000000000,
    phone: "+1 (555) 019-2834",
    city: "Mountain View",
    country: "USA",
    billing_address: "1600 Amphitheatre Parkway",
    isPresent: 1
  },
  {
    org_id: 2,
    organization_name: "Microsoft",
    industry: "Technology",
    website: "microsoft.com",
    annual_revenue: 198000000000,
    phone: "+1 (555) 043-9821",
    city: "Redmond",
    country: "USA",
    billing_address: "One Microsoft Way",
    isPresent: 1
  },
  {
    org_id: 3,
    organization_name: "Apple",
    industry: "Technology",
    website: "apple.com",
    annual_revenue: 394000000000,
    phone: "+1 (555) 098-7654",
    city: "Cupertino",
    country: "USA",
    billing_address: "One Apple Park Way",
    isPresent: 1
  },
  {
    org_id: 4,
    organization_name: "Amazon",
    industry: "E-Commerce",
    website: "amazon.com",
    annual_revenue: 514000000000,
    phone: "+1 (555) 012-3456",
    city: "Seattle",
    country: "USA",
    billing_address: "410 Terry Ave N",
    isPresent: 1
  }
];

export const useCompany = () => {
  const location = useLocation();
  const { canDelete } = useRole();

  const [searchQuery, setSearchQuery] = useState("");
  const [debounceSearch, setDeBounceSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [organization, setOrganization] = useState([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedCompany, setSelectedCompany] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 4;

  // Initialize search query from URL parameter if available
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search");
    if (searchParam) {
      setSearchQuery(searchParam);
      setDeBounceSearch(searchParam);
      setCurrentPage(1);
    }
  }, [location.search]);

  // Debouncing search query (only if not already set by URL)
  useEffect(() => {
    if (!new URLSearchParams(location.search).get("search")) {
      const timer = setTimeout(() => {
        setDeBounceSearch(searchQuery);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, location.search]);

  // Fetch organizations from API, fallback to local storage
  const fetchOrganization = useCallback(async () => {
    try {
      const response = await getOrganization(
        currentPage,
        rowsPerPage,
        statusFilter,
        debounceSearch
      );

      console.log("API Response:", response.data);
      setOrganization(response.data?.data?.organizations || []);
      setTotalPages(
        Math.ceil((response.data?.data?.total || 0) / rowsPerPage)
      );
    } catch (error) {
      console.warn("Backend API failed. Falling back to local storage mock database.", error);
      
      let localOrgs = JSON.parse(localStorage.getItem("organizations"));
      if (!localOrgs) {
        localOrgs = defaultOrgs;
        localStorage.setItem("organizations", JSON.stringify(defaultOrgs));
      }

      let filtered = [...localOrgs];
      if (debounceSearch) {
        filtered = filtered.filter(org => 
          org.organization_name.toLowerCase().includes(debounceSearch.toLowerCase()) ||
          org.industry.toLowerCase().includes(debounceSearch.toLowerCase())
        );
      }

      const total = filtered.length;
      const startIndex = (currentPage - 1) * rowsPerPage;
      const paginated = filtered.slice(startIndex, startIndex + rowsPerPage);

      setOrganization(paginated);
      setTotalPages(Math.ceil(total / rowsPerPage));
    }
  }, [currentPage, statusFilter, debounceSearch]);

  // Trigger fetch when parameters change
  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  // Auto-open modal if search param matches a company name exactly
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search");
    if (searchParam && organization.length > 0) {
      const match = organization.find(
        (org) => org.organization_name.toLowerCase() === searchParam.toLowerCase()
      );
      if (match && !selectedCompany && !modalOpen) {
        setSelectedCompany(match);
        setModalMode("view");
        setModalOpen(true);
      }
    }
  }, [organization, location.search, selectedCompany, modalOpen]);

  const handleSearchQueryChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleDeleteorganization = async (id) => {
    if (!canDelete) {
      alert("Permission Denied: Only Super Admin can delete records.");
      return;
    }
    
    const confirmed = window.confirm("Are you sure you want to delete this organization?");
    if (!confirmed) return;
    try {
      await deleteOrganization(id);
      setOrganization((prev) => prev.filter((org) => org.org_id !== id));
      if (organization.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchOrganization();
      }
    } catch (error) {
      console.warn("API Delete failed. Deleting from local storage.", error);
      let localOrgs = JSON.parse(localStorage.getItem("organizations")) || defaultOrgs;
      localOrgs = localOrgs.filter((org) => org.org_id !== id);
      localStorage.setItem("organizations", JSON.stringify(localOrgs));
      
      setOrganization((prev) => prev.filter((org) => org.org_id !== id));
      fetchOrganization();
    }
  };

  const editOrganization = (companyData) => {
    setSelectedCompany(companyData);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleViewClick = (companyData) => {
    setSelectedCompany(companyData);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleModalSave = async (formData) => {
    try {
      if (modalMode === "add") {
        await createOrganization(formData);
      } else {
        await updateOrganization(formData.org_id, formData);
      }
      setModalOpen(false);
      fetchOrganization();
    } catch (error) {
      console.warn("API Save failed. Saving to local storage.", error);
      let localOrgs = JSON.parse(localStorage.getItem("organizations")) || defaultOrgs;
      if (modalMode === "add") {
        const newOrg = {
          ...formData,
          org_id: Date.now(),
        };
        localOrgs.unshift(newOrg);
      } else {
        localOrgs = localOrgs.map((org) =>
          org.org_id === formData.org_id ? formData : org
        );
      }
      localStorage.setItem("organizations", JSON.stringify(localOrgs));
      setModalOpen(false);
      fetchOrganization();
    }
  };

  const handleAddClick = () => {
    setSelectedCompany({
      organization_name: "",
      website: "",
      industry: "",
      company_size: "",
      annual_revenue: "",
      phone: "",
      city: "",
      country: "",
      billing_address: "",
      isPresent: 1,
    });
    setModalMode("add");
    setModalOpen(true);
  };

  return {
    searchQuery,
    handleSearchQueryChange,
    handleAddClick,
    organization,
    handleDeleteorganization,
    editOrganization,
    handleViewClick,
    modalOpen,
    setModalOpen,
    modalMode,
    selectedCompany,
    handleModalSave,
    currentPage,
    totalPages,
    setCurrentPage,
  };
};
