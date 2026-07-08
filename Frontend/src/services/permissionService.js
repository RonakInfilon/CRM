import API from "../api";

export const getPermissions = () => {
  return API.get("/permissions");
};

export const updatePermissions = (companyName, role, modules) => {
  return API.post("/auth/permissions", {
    companyName,
    role,
    modules,
  });
};
