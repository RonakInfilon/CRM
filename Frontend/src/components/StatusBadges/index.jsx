
const StatusBadge = ({ value, onChange }) => {
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
    <div className={`status-badge-container ${getStatusClass(value)}`}>
      <select
        className="status-select-dropdown"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="New">New</option>
        <option value="Contacted">Contacted</option>
        <option value="Qualified">Qualified</option>
        <option value="Lost">Lost</option>
      </select>
    </div>
  );
};

export default StatusBadge;