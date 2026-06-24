import React from 'react'

import "../styles/pagination.css"
const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  console.log({ currentPage, totalPages });

  return (
    <div className="pagination">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>

      <span>
        Page {currentPage} of {totalPages}
      </span>

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
 
};


export default Pagination