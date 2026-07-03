import API from "../api";

export const getLeads = (
  page = 1,
  limit = 5,
  status = "",
  search = ""
) => {
  return API.get("/leads", {
    params: {
      page,
      limit,
      status,
      search,
    },
  });
};

export const getLeadById = (id) => {
  return APi.get(`/leads/${id}`);
};

export const createLead = (leadData) => {
  return API.post("/leads", leadData);
};


export const updateLead = (id, leadData) => {
  return API.put(`/leads/${id}`, leadData);
};


export const updateLeadStatus = (id, status) => {
  return API.patch(`/leads/${id}/status`, {
    status,
  });
};

export const deleteLead = (id) => {
  return API.delete(`/leads/${id}`);
};