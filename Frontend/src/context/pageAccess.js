export const checkPageAccess = (pathname, role, company, companyModules, rolePermissions) => {
  const path = pathname.toLowerCase();
  
  // Base pages that are always accessible
  if (path === "/" || path === "/signup" || path === "/profile") {
    return true;
  }

  const isSuperAdmin = role === "Super Admin";
  const isCompanyAdmin = role === "Company Admin";

  // Super Admin has access to everything
  if (isSuperAdmin) {
    return true;
  }

  // Audit Logs: only Super Admin and Company Admin
  if (path.includes("/audit-logs")) {
    return isCompanyAdmin;
  }

  // Only Super Admin and Company Admin can manage Users
  if (path.includes("/users")) {
    return isCompanyAdmin;
  }

  // All other roles must check active company module availability
  const userCompany = company || "Google";
  
  // Only Super Admin can view all accounts across tenants;
  // Tenant users (Company Admin, Manager, Employee) see their own accounts
  if (path.includes("/account")) {
    return true; // Access controlled at backend level per tenant_id
  }

  // Map path segments to Module Names
  let requiredModule = "";
  if (path.includes("/dashboard")) requiredModule = "Dashboard";
  else if (path.includes("/leads")) requiredModule = "Leads";
  else if (path.includes("/pipeline")) requiredModule = "Pipeline";
  else if (path.includes("/companies")) requiredModule = "Companies";
  else if (path.includes("/activity")) requiredModule = "Activity";
  else if (path.includes("/drag")) requiredModule = "Drag & Drop";
  else if (path.includes("/permission")) requiredModule = "Permission";

  if (!requiredModule) return true;

  // Check 1: Does the Company have this module enabled by Master Admin?
  const allowedCompanyModules = companyModules[userCompany] || ["Dashboard", "Leads", "Pipeline", "Companies", "Activity", "Drag & Drop", "Permission"];
  if (!allowedCompanyModules.includes(requiredModule)) {
    return false;
  }

  // If Company Admin, they get full access to all company-enabled modules
  if (isCompanyAdmin) {
    return true;
  }

  // For Manager and Employee, check the role-based settings for this company
  const roleKey = `${userCompany}_${role}`;
  const allowedRoleModules = rolePermissions[roleKey] || (role === "Manager" 
    ? ["Dashboard", "Leads", "Pipeline", "Companies", "Activity", "Drag & Drop"]
    : ["Dashboard", "Leads", "Companies"]);
  return allowedRoleModules.includes(requiredModule);
};
