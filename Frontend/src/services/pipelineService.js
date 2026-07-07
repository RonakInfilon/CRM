import API from "../api";

export const getPipeline = () => {
  return API.get("/pipeline");
};

export const getAllDeals = () => {
  return API.get("/pipeline/deals");
};

export const getDealById = (id) => {
  return API.get(`/pipeline/${id}`);
};

export const createDeal = (dealData) => {
  return API.post("/pipeline", dealData);
};

export const updateDeal = (id, dealData) => {
  return API.put(`/pipeline/${id}`, dealData);
};

export const moveDeal = (id, stage_id, lost_reason = null, note_text = null) => {
  return API.patch(`/pipeline/${id}/stage`, {
    stage_id,
    ...(lost_reason && { lost_reason }),
    ...(note_text && { note_text }),
  });
};

export const deleteDeal = (id) => {
  return API.delete(`/pipeline/${id}`);
};
export const getDealNotes = (dealId) => {
  return API.get(`/pipeline/${dealId}/notes`);
};

export const addDealNote = (dealId, noteData) => {
  return API.post(`/pipeline/${dealId}/notes`, noteData);
};


export const deleteDealNote = (noteId) => {
  return API.delete(`/pipeline/notes/${noteId}`);
};


export const getDealActivities = (dealId) => {
  return API.get(`/pipeline/${dealId}/activity`);
};

export const addDealActivity = (dealId, activityData) => {
  return API.post(`/pipeline/${dealId}/activity`, activityData);
};

// Stage operations
export const createStage = (stageData) => {
  return API.post("/pipeline/stages", stageData);
};

export const deleteStage = (stageId) => {
  return API.delete(`/pipeline/stages/${stageId}`);
};