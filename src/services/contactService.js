import API from "../api";

export const getContacts = async (page = 1, limit = 100, search = "") => {
  return API.get('/contact', {
    params: {
      page,
      limit,
      search: search || undefined
    }
  });
};

export const createContact = async (data) => {
  return API.post('/contact', {
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone || null,
    job_title: data.job_title || null,
    organization: data.organization || null, // company name string or selection
    org_id: data.org_id || null, // company ID if selected
    lifecycle_stage: data.lifecycle_stage || 'Customer',
    contact_status: data.contact_status || 'Active'
  });
};

export const updateContact = async (id, data) => {
  return API.put(`/contact/${id}`, {
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone || null,
    job_title: data.job_title || null,
    organization: data.organization || null,
    org_id: data.org_id || null,
    lifecycle_stage: data.lifecycle_stage || 'Customer',
    contact_status: data.contact_status || 'Active'
  });
};

export const deleteContact = async (id) => {
  return API.delete(`/contact/${id}`);
};
