import { useState, useRef } from "react";

export const useLeads = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSeachQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy] = useState("CreatedAt");
  const tableRef = useRef();

  const handleLeadSaved = () => {
    if (tableRef.current && tableRef.current.refreshTable) {
      tableRef.current.refreshTable();
    }
  };

  return {
    showAddModal,
    setShowAddModal,
    searchQuery,
    setSeachQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    tableRef,
    handleLeadSaved,
  };
};
