import React from 'react';

const Pageheader = ({
  searchQuery = "",
  onSearchChange,
  statusFilter = "",
  onFilterChange,
  onAddClick,
  buttonText = "+ ADD",
  placeholder = "Search......"
}) => {
  return (
    <div className="page-header">
      {onSearchChange && (
        <div className="search-input">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder={placeholder} 
            value={searchQuery} 
            onChange={(e) => onSearchChange(e.target.value)} 
          />
        </div>
      )}

      {onFilterChange && (
        <div className="filter-group">
          <select 
            value={statusFilter} 
            onChange={(e) => onFilterChange(e.target.value)} 
            className="header-dropdown"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      )}

      {onAddClick && (
        <button onClick={onAddClick}>
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default Pageheader;
