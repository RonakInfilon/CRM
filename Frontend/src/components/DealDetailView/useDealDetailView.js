import { useState, useEffect, useCallback } from "react";
import {
  updateDeal,
  moveDeal,
  deleteDeal,
  getDealNotes,
  addDealNote,
  deleteDealNote,
  getDealActivities,
  addDealActivity,
} from "../../pages/pipeline/pipelineService";
import { useRole } from "../../context/RoleContext";

export const useDealDetailView = ({ deal, stages, onBack, onRefresh }) => {
  const dealId = deal.deal_id || deal.id;
  const { canDelete } = useRole();

  const [formData, setFormData] = useState({
    dealName:      deal.deal_name      || deal.dealName      || "",
    company:       deal.company_name   || deal.company       || "",
    value:         deal.value          ?? 0,
    contactPerson: (deal.first_name || deal.last_name)
      ? `${deal.first_name ?? ""} ${deal.last_name ?? ""}`.trim()
      : deal.contactPerson || "",
    stageId:       String(deal.stage_id || deal.stageId || ""),
    devProgress:   deal.dev_progress   ?? deal.devProgress   ?? 0,
    lostReason:    deal.lost_reason    || deal.lostReason    || "",
  });

  const [notes, setNotes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [newActivity, setNewActivity] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [error, setError] = useState("");

  const fetchNotes = useCallback(async () => {
    try {
      setLoadingNotes(true);
      const res = await getDealNotes(dealId);
      setNotes(res.data?.data || []);
    } catch (e) {
      console.error("Failed to load notes:", e);
    } finally {
      setLoadingNotes(false);
    }
  }, [dealId]);

  const fetchActivities = useCallback(async () => {
    try {
      setLoadingActivities(true);
      const res = await getDealActivities(dealId);
      setActivities(res.data?.data || []);
    } catch (e) {
      console.error("Failed to load activities:", e);
    } finally {
      setLoadingActivities(false);
    }
  }, [dealId]);

  useEffect(() => {
    fetchNotes();
    fetchActivities();
  }, [fetchNotes, fetchActivities]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const currentStageName = stages.find((s) => s.id === formData.stageId)?.name || "";
  const isWon = currentStageName === "Won";
  const isLost = currentStageName === "Lost";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isLost && !formData.lostReason?.trim()) {
      setError("Please provide a reason for losing this deal.");
      return;
    }

    setSaving(true);
    try {
      await updateDeal(dealId, {
        deal_name: formData.dealName,
        company_name: formData.company,
        value: formData.value,
        dev_progress: formData.devProgress,
        contact_person_name: formData.contactPerson,
        contact_id: deal.contact_id,
      });

      const originalStageId = String(deal.stage_id || deal.stageId || "");
      if (formData.stageId !== originalStageId) {
        await moveDeal(
          dealId,
          formData.stageId,
          isLost ? formData.lostReason : null,
          null
        );
      }

      if (onRefresh) onRefresh();
      onBack();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save deal.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this deal? This action cannot be undone.")) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      await deleteDeal(dealId);
      if (onRefresh) onRefresh();
      onBack();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete deal.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await addDealNote(dealId, { note_text: newNote.trim() });
      setNewNote("");
      fetchNotes();
    } catch (err) {
      console.error("Failed to add note:", err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteDealNote(noteId);
      fetchNotes();
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!newActivity.trim()) return;
    try {
      await addDealActivity(dealId, { activity_text: newActivity.trim() });
      setNewActivity("");
      fetchActivities();
    } catch (err) {
      console.error("Failed to add activity:", err);
    }
  };

  return {
    formData,
    notes,
    activities,
    newNote,
    setNewNote,
    newActivity,
    setNewActivity,
    saving,
    loadingNotes,
    loadingActivities,
    error,
    canDelete,
    handleChange,
    currentStageName,
    isWon,
    isLost,
    handleSubmit,
    handleDelete,
    handleAddNote,
    handleDeleteNote,
    handleAddActivity,
  };
};
