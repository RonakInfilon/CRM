export const defaultCompanyModules = {
  "Google": ["Dashboard", "Leads", "Pipeline", "Companies", "Activity", "Drag & Drop", "Permission"],
  "Microsoft": ["Dashboard", "Leads", "Companies", "Permission"],
  "Apple": ["Dashboard", "Leads", "Pipeline", "Companies", "Activity"],
  "Amazon": ["Dashboard", "Leads", "Companies"]
};

export const defaultRolePermissions = {
  // Google
  "Google_Manager": ["Dashboard", "Leads", "Pipeline", "Companies", "Activity", "Drag & Drop"],
  "Google_Company Employee": ["Dashboard", "Leads", "Companies"],
  // Microsoft
  "Microsoft_Manager": ["Dashboard", "Leads", "Companies"],
  "Microsoft_Company Employee": ["Dashboard", "Companies"],
  // Apple
  "Apple_Manager": ["Dashboard", "Leads", "Pipeline", "Companies", "Activity"],
  "Apple_Company Employee": ["Dashboard", "Leads", "Companies"],
  // Amazon
  "Amazon_Manager": ["Dashboard", "Leads", "Companies"],
  "Amazon_Company Employee": ["Dashboard", "Companies"]
};
