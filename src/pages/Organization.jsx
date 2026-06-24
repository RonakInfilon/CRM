import React, { useState, useEffect } from "react";
import Pageheader from "../components/Pageheader";
import Pagination from "../components/Pagination";
import CompanyCard from "../components/CompanyCard";
// import ActionMenu from "../components/ActionMenu";
import CompanyModal from "../components/CompanyModal";
import { getOrganization, updateOrganization, deleteOrganization, createOrganization } from "../services/organizationService";
import "../styles/Organization.css";

const Organization = () => {
  //its for organization container
  const [searchQuery, setSearchQuery] = useState(""); //store whetever user type in search box
  const [debounceSearch, setDeBounceSeach] = useState(""); // for debouncing

  const [statusFilter, setStatusFilter] = useState("");
  const [organization, setOrganization] = useState([]); //organization list 
  const [showAddModal, setShowAddModal] = useState(false);


  //control modal status
  const [modalOpen, setModalOpen] = useState(false); //control modal visibility
  const [modalMode, setModalMode] = useState("view"); //for view of edit
  const [selectedCompany, setSelectedCompany] = useState(null);//stored clicked company
  //its for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 4;

  //for deboucning
  useEffect(() => {
    const timer = setTimeout(() => {
      setDeBounceSeach(searchQuery);
    }, 500);
    return () => clearTimeout(timer)
  }, [searchQuery])

  //reset pagination
  useEffect(() => {
    setCurrentPage(1);
  }, [debounceSearch, statusFilter]);

  useEffect(() => {
    fetchOrganization();
  }, [currentPage, debounceSearch, statusFilter]);



//fetch organization function
  const fetchOrganization = async () => {
    try {
      const response = await getOrganization(
        currentPage,
        rowsPerPage,
        statusFilter,
        debounceSearch
      );

      console.log("API Response:", response.data);

      setOrganization(
        response.data?.data?.organizations || []
      );

      setTotalPages(
        Math.ceil(
          (response.data?.data?.total || 0) / rowsPerPage
        )
      );
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };



  const handleDeleteorganization = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this organization");
    if (!confirmed) return
    try {
      await deleteOrganization(id);
      setOrganization((prev) => prev.filter((org) => org.org_id !== id));
      if (organization.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchOrganization();
      }
    } catch (error) {
      console.log("Error deleting organization");
    }
  }
  const editOrganization = async (comapnyData) => {
    setSelectedCompany(comapnyData);
    setModalMode("edit");
    setModalOpen(true)
    console.log("Opening Edit for:", comapnyData);
  }

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
      console.error(`Failed saving organization in ${modalMode} mode:`, error);
    }
  };

  const handleSaveChanges = async (updatedData) => {
    try {
      await updateOrganization(updatedData.org_id, updatedData);
      setModalOpen(false);
      fetchOrganization(); 
    } catch (error) {
      console.error("Failed saving organization modifications:", error);
    }
  };
  console.log("search Query", searchQuery)

  return (
    <>
      <Pageheader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={() => setShowAddModal(true)}
        placeholder="Search organizations by name..."
        buttonText="+ Add Organization"
      />

      <div className="organization-page">
        <div className="organization-container">
          {organization.length > 0 ? (
            organization.map((org) => (
              <CompanyCard
                key={org.org_id}
                company={org}
                onDelete={handleDeleteorganization}
                onEditClick={editOrganization}
                onViewClick={() => handleViewClick(org)}
              />
            ))
          ) : (
            <p className="no-data">
              No organizations found.
            </p>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        <CompanyModal
          isOpen={modalOpen}
          mode={modalMode}
          company={selectedCompany}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveChanges}
          onDelete={handleDeleteorganization}
        />
      </div>
    </>
  );
};

export default Organization;



