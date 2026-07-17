import { useState, useEffect } from "react";
import { useRole } from "../../context/RoleContext";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Building,
  Calendar,
  Layers,
  Lock,
  Building2,
} from "lucide-react";

export const usePermission = (ALL_MODULES) => {
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
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("Manager");

  // Local state for checkboxes
  const [checkedModules, setCheckedModules] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch all tenant companies from backend API
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || token === "mock-offline-token-12345") {
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
      const activeModules = companyModules[selectedCompany] || [];
      setCheckedModules(activeModules);
    } else {
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
        const allowedCompanyModules = companyModules[company] || [];
        return allowedCompanyModules.includes(mod.id);
      });

  return {
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
  };
};
