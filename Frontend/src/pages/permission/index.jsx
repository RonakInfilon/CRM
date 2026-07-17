import {
  LayoutDashboard,
  Users,
  GitBranch,
  Building,
  Calendar,
  Layers,
  Lock,
  Check,
  Shield,
  Building2,
  UserCheck
} from "lucide-react";
import { usePermission } from "./usePermission";
import "./permission.styles.css";

const ALL_MODULES = [
  { id: "Dashboard", label: "Dashboard", description: "Analytical graphs, metrics, and data summaries.", icon: <LayoutDashboard size={20} /> },
  { id: "Leads", label: "Leads", description: "Leads creation, details, and status updates.", icon: <Users size={20} /> },
  { id: "Pipeline", label: "Pipeline", description: "Kanban board pipeline for managing sales opportunities.", icon: <GitBranch size={20} /> },
  { id: "Companies", label: "Companies", description: "Client organization directory and account management.", icon: <Building2 size={20} /> },
  { id: "Activity", label: "Activity", description: "Notes, schedule records, and task history logging.", icon: <Calendar size={20} /> },
  { id: "Drag & Drop", label: "Drag & Drop", description: "Interactive activity log with draggable components.", icon: <Layers size={20} /> },
  { id: "Permission", label: "Permission", description: "Configure system modules and role permissions.", icon: <Lock size={20} /> }
];

const Permission = () => {
  const {
    isSuperAdmin,
    isCompanyAdmin,
    company,
    companies,
    selectedCompany,
    setSelectedCompany,
    selectedRole,
    setSelectedRole,
    checkedModules,
    handleToggleModule,
    handleSave,
    saveSuccess,
    visibleModules,
  } = usePermission(ALL_MODULES);

  return (
    <div className="permission-page">
      <div className="permission-card-header">
        <div className="title-section">
          <div className="shield-icon">
            <Shield size={24} />
          </div>
          <div>
            <h1>Permission Control Panel</h1>
            <p>
              {isSuperAdmin 
                ? "As Master Admin, you grant module licenses to tenant companies." 
                : `Configure role-level access parameters for the ${company} organization.`}
            </p>
          </div>
        </div>

        {/* Configurations Selector Bar */}
        <div className="selector-bar">
          {isSuperAdmin ? (
            <div className="selector-item">
              <label>Select Tenant Company:</label>
              <div className="select-wrapper">
                <Building2 size={16} />
                <select 
                  value={selectedCompany} 
                  onChange={(e) => setSelectedCompany(e.target.value)}
                >
                  {companies.map((org) => (
                    <option key={org.org_id} value={org.organization_name}>
                      {org.organization_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="selector-item">
              <label>Select Company Role:</label>
              <div className="select-wrapper">
                <UserCheck size={16} />
                <select 
                  value={selectedRole} 
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="Manager">Manager</option>
                  <option value="Company Employee">Company Employee</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Permissions Grid Box */}
      <div className="permissions-body">
        {saveSuccess && (
          <div className="success-banner animate-fade-in">
            <Check size={16} />
            Permissions updated successfully! The navigation and access limits have been updated in real-time.
          </div>
        )}

        {visibleModules.length === 0 ? (
          <div className="no-modules-alert">
            <p>No modules are currently assigned to your organization.</p>
            <span>Please contact the CRM Master Administrator to assign subscription modules for your company.</span>
          </div>
        ) : (
          <div className="permission-grid">
            {visibleModules.map((module) => {
              const isChecked = checkedModules.includes(module.id);
              return (
                <div 
                  key={module.id} 
                  className={`permission-item-card ${isChecked ? "active" : ""}`}
                  onClick={() => handleToggleModule(module.id)}
                >
                  <div className="permission-card-top">
                    <div className="module-icon-container">
                      {module.icon}
                    </div>
                    <div className="checkbox-outer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by card onClick
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="checkbox-custom">
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </span>
                    </div>
                  </div>
                  <div className="module-info">
                    <h3>{module.label}</h3>
                    <p>{module.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {visibleModules.length > 0 && (
          <div className="save-actions">
            <button className="save-btn" onClick={handleSave}>
              Save Permissions Config
            </button>
            {!isSuperAdmin && (
              <span className="restriction-notice">
                Note: Available modules are restricted by your Master CRM subscription configuration.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Permission;