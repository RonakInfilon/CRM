import API from "../api";

export const getOpportunities = async (page, limit, stage) => {
  return await API.get("/opportunities", {
    params: {
      page,
      limit,
      stage: stage || undefined
    }
  });
};

export const createOpportunity = async (data) => {
  const payload = {
    deal_name: data.dealName || data.deal_name,
    account_id: data.account_id || data.org_id,
    primary_contact_id: data.primary_contact_id || null,
    value: data.value || 0,
    stage: data.stage || "Opportunity",
    dev_progress: data.dev_progress || 0,
    lost_reason: data.lost_reason || null,
    notes: data.notes || null,
    activities: data.activities || null
  };
  return await API.post("/opportunities", payload);
};

export const updateOpportunity = async (id, data) => {
  const payload = {
    deal_name: data.dealName || data.deal_name,
    account_id: data.account_id || data.org_id,
    primary_contact_id: data.primary_contact_id || null,
    value: data.value || 0,
    stage: data.stage || "Opportunity",
    dev_progress: data.dev_progress || 0,
    lost_reason: data.lost_reason || null,
    notes: data.notes || null,
    activities: data.activities || null
  };
  return await API.put(`/opportunities/${id}`, payload);
};

export const deleteOpportunity = async (id) => {
  return await API.delete(`/opportunities/${id}`);
};
