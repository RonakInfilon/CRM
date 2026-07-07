import API from "../api";

export const getContacts = (page = 1, limit = 100, search = "") => {
  return API.get("/contacts", {
    params: {
      page,
      limit,
      search,
    },
  });
};

export const getContactById = (id) => {
  return API.get(`/contacts/${id}`);
};

export const createContact = (contactData) => {
  return API.post("/contacts", contactData);
};

export const updateContact = (id, contactData) => {
  return API.put(`/contacts/${id}`, contactData);
};

export const deleteContact = (id) => {
  return API.delete(`/contacts/${id}`);
};
