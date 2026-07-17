import React, { useState, useEffect } from "react";
import { useRole } from "../context/RoleContext";
//this is here for icons 
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Contact,
  Building,
  Calendar,
  Layers,
  Lock,
  Check,
  Shield,
  Building2,
  UserCheck
} from "lucide-react";
import "../styles/Permission.css";
//this is list of all modules thay present 
const ALL_MODULES = [
  { id: "Dashboard", label: "Dashboard", description: "Analytical graphs, metrics, and data summaries.", icon: <LayoutDashboard size={20} /> },
  { id: "Leads", label: "Leads", description: "Leads creation, details, and status updates.", icon: <Users size={20} /> },
  { id: "Pipeline", label: "Pipeline", description: "Kanban board pipeline for managing sales opportunities.", icon: <GitBranch size={20} /> },
  { id: "Companies", label: "Companies", description: "Client organization directory and account management.", icon: <Building2 size={20} /> },
  { id: "Activity", label: "Activity", description: "Notes, schedule records, and task history logging.", icon: <Calendar size={20} /> },
  { id: "Drag & Drop", label: "Drag & Drop", description: "Interactive activity log with draggable components.", icon: <Layers size={20} /> },
  { id: "Permission", label: "Permission", description: "Configure system modules and role permissions.", icon: <Lock size={20} /> }
];
//this is permission componenet
const Permission = () => {
  //this is useRol context we can add data on global and anyone can access this data for usage
  const {
    role,
    company,
    companyModules,
    rolePermissions,
    updateCompanyModules,
    updateRolePermissions,
    isSuperAdmin,
    isCompanyAdmin
  } = useRole();

  // Load organizations from local storage to list them dynamically
  //this is list of companies 
  const [companies, setCompanies] = useState([]);
  //here it store the name of company that we selected and by default it takes google 
  const [selectedCompany, setSelectedCompany] = useState("");
  //selected role and by default it takes manager
  const [selectedRole, setSelectedRole] = useState("");

  // Local state for checkboxes
  const [checkedModules, setCheckedModules] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch all tenant companies from backend API
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || token === "mock-offline-token-12345") {
          // Fallback: use companyModules keys as company names when offline
          const offlineCompanies = Object.keys(companyModules).map((name, i) => ({
            org_id: i + 1,
            organization_name: name
          }));
          setCompanies(offlineCompanies);
          if (offlineCompanies.length > 0 && isSuperAdmin) {
            setSelectedCompany(offlineCompanies[0].organization_name);
          }
          return;
        }

        const res = await fetch("http://localhost:3000/api/tenant", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          // Map tenant_id and company_name to match the dropdown shape
          const tenantList = data.data.map(t => ({
            org_id: t.tenant_id,
            organization_name: t.company_name
          }));
          setCompanies(tenantList);
          if (tenantList.length > 0 && isSuperAdmin) {
            setSelectedCompany(tenantList[0].organization_name);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch tenants for Permission page:", err);
        // Fallback to companyModules keys
        const fallback = Object.keys(companyModules).map((name, i) => ({
          org_id: i + 1,
          organization_name: name
        }));
        setCompanies(fallback);
        if (fallback.length > 0 && isSuperAdmin) {
          setSelectedCompany(fallback[0].organization_name);
        }
      }
    };

    if (isSuperAdmin) {
      fetchTenants();
    }
  }, [isSuperAdmin, companyModules]);

  // Load active checkboxes depending on current selections
  useEffect(() => {
    if (isSuperAdmin) {
      // Load modules enabled for the selected company
      const activeModules = companyModules[selectedCompany] || [];
      setCheckedModules(activeModules);
    } else {
      // Load modules enabled for the selected role in the logged-in company
      const key = `${company}_${selectedRole}`;
      const activeModules = rolePermissions[key] || [];
      setCheckedModules(activeModules);
    }
  }, [isSuperAdmin, selectedCompany, selectedRole, company, companyModules, rolePermissions]);

  const handleToggleModule = (moduleId) => {
    setCheckedModules((prev) => {
      if (prev.includes(moduleId)) {
        return prev.filter((id) => id !== moduleId);
      } else {
        return [...prev, moduleId];
      }
    });
  };

  const handleSave = () => {
    if (isSuperAdmin) {
      updateCompanyModules(selectedCompany, checkedModules);
    } else {
      updateRolePermissions(company, selectedRole, checkedModules);
    }
    
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  // Determine which modules are available to render
  const visibleModules = isSuperAdmin 
    ? ALL_MODULES 
    : ALL_MODULES.filter(mod => {
        // Company Admin can only configure modules that Super Admin granted to their company
        const allowedCompanyModules = companyModules[company] || [];
        return allowedCompanyModules.includes(mod.id);
      });

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