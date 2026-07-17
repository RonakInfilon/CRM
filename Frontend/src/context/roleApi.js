import API from "../services/api";

export const fetchProfileAPI = async () => {
  const res = await API.get("/users/profile");
  return res.data;
};

export const fetchPermissionsAPI = async () => {
  const res = await API.get("/permissions");
  return res.data;
};

export const switchPersonaAPI = async (role, company) => {
  const res = await API.post("/users/switch-persona", { role, company });
  return res.data;
};

export const updateProfileAPI = async (name, phone, bio) => {
  const res = await API.put("/users/profile", { name, phone, bio });
  return res.data;
};

export const updatePermissionsAPI = async (companyName, role, modules) => {
  const res = await API.post("/permissions", { companyName, role, modules });
  return res.data;
};
