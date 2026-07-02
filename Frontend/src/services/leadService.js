import API from "../api";

export const getLeads = async (page, limit, status, search, sort) => {
  let sortField = "CreatedAt"; 
  let sortOrder = "DESC";      

  const sortMapping = {
    "FirstName": "FirstName",
    "LastName": "LastName",
    "Organization": "Company",
    "Status": "Status",
    "CreatedAt": "CreatedAt"
  };

  let mappedSort = sortField;
  if (sort && typeof sort === 'string') {
    if (sort.includes(':')) {
      const parts = sort.split(':');
      mappedSort = sortMapping[parts[0]] || parts[0];
      sortOrder = parts[1];
    } else {
      mappedSort = sortMapping[sort] || sort;
    }
  }

  const response = await API.get('/leads', {
    params: {
      page,
      limit,
      status: status || undefined, 
      name: search || undefined,
      sort: mappedSort,
      order: sortOrder
    }
  });

  if (response.data && response.data.leads) {
    const mapped = response.data.leads.map(lead => {
      let activities = [];
      try {
        activities = lead.Activities ? (typeof lead.Activities === 'string' ? JSON.parse(lead.Activities) : lead.Activities) : [];
      } catch (e) {
        activities = [];
      }

      let notes = [];
      try {
        notes = lead.Notes ? (typeof lead.Notes === 'string' && lead.Notes.startsWith('[') ? JSON.parse(lead.Notes) : [lead.Notes]) : [];
      } catch (e) {
        notes = [lead.Notes];
      }

      return {
        LeadID: lead.LeadID,
        FirstName: lead.FirstName || "",
        LastName: lead.LastName || "",
        Salutation: lead.Salutation || "",
        Organization: lead.Company || "",
        Website: lead.Website || "",
        Territory: lead.Territory || "",
        Industry: lead.Industry || "",
        JobTitle: lead.JobTitle || "",
        Source: lead.Source || "",
        Status: lead.Status || "New",
        Notes: notes,
        Activities: activities,
        Email: lead.Email || "",
        Phone: lead.Phone || "",
        Value: lead.Value || 0,
        DevProgress: lead.DevProgress || 0,
        LostReason: lead.LostReason || ""
      };
    });

    response.data.data = {
      leads: mapped,
      total: response.data.total
    };
  }

  return response;
};

export const getLeadById = async (id) => {
  const response = await API.get(`/leads/${id}`);
  if (response.data) {
    const lead = response.data;
    
    let activities = [];
    try {
      activities = lead.Activities ? (typeof lead.Activities === 'string' ? JSON.parse(lead.Activities) : lead.Activities) : [];
    } catch (e) {
      activities = [];
    }

    let notes = [];
    try {
      notes = lead.Notes ? (typeof lead.Notes === 'string' && lead.Notes.startsWith('[') ? JSON.parse(lead.Notes) : [lead.Notes]) : [];
    } catch (e) {
      notes = [lead.Notes];
    }

    response.data = {
      LeadID: lead.LeadID,
      FirstName: lead.FirstName || "",
      LastName: lead.LastName || "",
      Salutation: lead.Salutation || "",
      Organization: lead.Company || "",
      Website: lead.Website || "",
      Territory: lead.Territory || "",
      Industry: lead.Industry || "",
      JobTitle: lead.JobTitle || "",
      Source: lead.Source || "",
      Status: lead.Status || "New",
      Notes: notes,
      Activities: activities,
      Email: lead.Email || "",
      Phone: lead.Phone || "",
      Value: lead.Value || 0,
      DevProgress: lead.DevProgress || 0,
      LostReason: lead.LostReason || ""
    };
  }
  return response;
};

export const createLead = (data) => {
  const payload = {
    salutation: data.salutation || data.Salutation || null,
    firstName: data.firstName || data.FirstName || "",
    lastName: data.lastName || data.LastName || null,
    name: data.name || data.Name || `${data.firstName || data.FirstName || ""} ${data.lastName || data.LastName || ""}`.trim(),
    email: data.email || data.Email || null,
    phone: data.phone || data.Phone || null,
    company: data.company || data.Company || data.organization || data.Organization || null,
    website: data.website || data.Website || null,
    territory: data.territory || data.Territory || null,
    industry: data.industry || data.Industry || null,
    jobTitle: data.jobTitle || data.JobTitle || null,
    source: data.source || data.Source || null,
    status: data.status || data.Status || "New",
    notes: data.notes || data.Notes || null,
    activities: data.activities || data.Activities || null,
    value: data.value || data.Value || 0,
    devProgress: data.devProgress || data.DevProgress || 0,
    lostReason: data.lostReason || data.LostReason || null
  };
  return API.post("/leads", payload);
};

export const updateLead = (id, data) => {
  const payload = {
    salutation: data.salutation || data.Salutation || null,
    firstName: data.firstName || data.FirstName || "",
    lastName: data.lastName || data.LastName || null,
    name: data.name || data.Name || `${data.firstName || data.FirstName || ""} ${data.lastName || data.LastName || ""}`.trim(),
    email: data.email || data.Email || null,
    phone: data.phone || data.Phone || null,
    company: data.company || data.Company || data.organization || data.Organization || null,
    website: data.website || data.Website || null,
    territory: data.territory || data.Territory || null,
    industry: data.industry || data.Industry || null,
    jobTitle: data.jobTitle || data.JobTitle || null,
    source: data.source || data.Source || null,
    status: data.status || data.Status || "New",
    notes: data.notes || data.Notes || null,
    activities: data.activities || data.Activities || null,
    value: data.value || data.Value || 0,
    devProgress: data.devProgress || data.DevProgress || 0,
    lostReason: data.lostReason || data.LostReason || null
  };
  return API.put(`/leads/${id}`, payload);
};

export const deleteLead = (id) => {
  return API.delete(`/leads/${id}`);
};