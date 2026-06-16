import API from "../api";

export const getLeads = () => {
  return API.get("/leads");
};

export const getLeadById = (id) => {
  return API.get(`/leads/${id}`);
};

export const createLead = (data) => {
  return API.post("/leads", data);
};

export const updateLead = (id, data) => {
  return API.put(`/leads/${id}`, data);
};

export const deleteLead = (id) => {
  return API.delete(`/leads/${id}`);
};