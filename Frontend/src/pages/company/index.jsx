import Pageheader from "../../components/Pageheader";
import Pagination from "../../components/Pagination";
import CompanyCard from "../../components/CompanyCard";
import CompanyModal from "../../components/CompanyModal";
import { useCompany } from "./useCompany";
import "./company.styles.css";

const Organization = () => {
  const {
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
  } = useCompany();

  return (
    <>
      <Pageheader
        searchQuery={searchQuery}
        onSearchChange={handleSearchQueryChange}
        onAddClick={handleAddClick}
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
            <p className="no-data">No organizations found.</p>
          )}
        </div>

        {!modalOpen && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
        
        <CompanyModal
          key={selectedCompany?.org_id || (modalOpen ? 'new' : 'none')}
          isOpen={modalOpen}
          mode={modalMode}
          company={selectedCompany}
          onClose={() => setModalOpen(false)}
          onSave={handleModalSave}
          onDelete={handleDeleteorganization}
        />
      </div>
    </>
  );
};

export default Organization;
