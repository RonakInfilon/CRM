import API from "../api";

export const getLeads = (page, limit, status, search, sort) => {
  let sortField = "CreatedAt"; 
  let sortOrder = "DESC";      

  if (sort && typeof sort === 'string') {
    if (sort.includes(':')) {
      const parts = sort.split(':');
      sortField = parts[0];
      sortOrder = parts[1];
    } else {
      
      sortField = sort;
    }
  }

  return API.get('/leads', {
    params: {
      page,
      limit,
      status: status || undefined, 
      name: search || undefined,
      sort: sortField,
      order: sortOrder
    }
  });
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