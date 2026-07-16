import API from "../api";


export const getLogs = (page = 1, limit = 30, org_id = null) => {
  const params = { page, limit };
  if (org_id) params.org_id = org_id;
  return API.get("/logs", { params });
};
