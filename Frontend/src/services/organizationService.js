import API from "../api";

export const getOrganization = (page = 1, limit = 10, status = "", search = "") => {
  return API.get("/companies", {
    params: {
      page,
      limit,
      status,
      search,
    },
  });
};

export const createOrganization = (companyData) => {
  return API.post("/companies", companyData);
};

export const updateOrganization = (id, companyData) => {
  return API.put(`/companies/${id}`, companyData);
};

export const deleteOrganization = (id) => {
  return API.delete(`/companies/${id}`);
};
