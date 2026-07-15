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
} from "../services/pipelineService";
import { useRole } from "../context/RoleContext";
import "../styles/DealDataView.css";
import "../styles/NotesSection.css";


const DealDetailView = ({ deal, stages, onBack, onRefresh }) => {
  const dealId = deal.deal_id || deal.id;
  const { canDelete } = useRole();

  // Normalize: backend sends snake_case, frontend mapped fields are camelCase
  // Support both so nothing is lost
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

  // ─── Load notes from DB ───────────────────────────────────────────────────

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

  // ─── Load activities from DB ──────────────────────────────────────────────
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

  // ─── Handle form field changes ────────────────────────────────────────────
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ─── Detect Won / Lost by stage NAME (not hardcoded ID) ──────────────────
  const currentStageName = stages.find((s) => s.id === formData.stageId)?.name || "";
  const isWon = currentStageName === "Won";
  const isLost = currentStageName === "Lost";

  // ─── Save deal (update fields + move stage if changed) ───────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isLost && !formData.lostReason?.trim()) {
      setError("Please provide a reason for losing this deal.");
      return;
    }

    setSaving(true);
    try {
      // 1. Update core deal fields
      await updateDeal(dealId, {
        deal_name: formData.dealName,
        company_name: formData.company,
        value: formData.value,
        dev_progress: formData.devProgress,
        contact_person_name: formData.contactPerson,
        contact_id: deal.contact_id,
      });

      // 2. Move stage if it changed (this also logs activity + handles Won/Lost)
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

  // ─── Add note ─────────────────────────────────────────────────────────────
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

  // ─── Delete note ──────────────────────────────────────────────────────────
  const handleDeleteNote = async (noteId) => {
    try {
      await deleteDealNote(noteId);
      fetchNotes();
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  // ─── Add activity manually ────────────────────────────────────────────────
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

  return (
    <div className="detail-page-wrapper">
      {/* ─── Header ─────────────────────────────────────────── */}
      <div className="detail-header">
        <button className="btn-secondary" onClick={onBack}>
          ← Back to Board
        </button>
        <h2>{formData.dealName} — Deal Sheet</h2>
        {isWon && <span className="stage-badge stage-won"> WON</span>}
        {isLost && <span className="stage-badge stage-lost"> LOST</span>}
      </div>

      <div className="detail-layout">
        {/* ─── LEFT: Deal Form ──────────────────────────────── */}
        <form onSubmit={handleSubmit} className="detail-form-panel">
          <h3>Core Specifications</h3>

          {error && <div className="form-error">{error}</div>}

          <label>Deal Title</label>
          <input
            type="text"
            value={formData.dealName}
            onChange={(e) => handleChange("dealName", e.target.value)}
            required
          />

          <label>Corporate Account</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => handleChange("company", e.target.value)}
            required
          />

          <div className="form-grid">
            <div>
              <label>Deal Value ($)</label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => handleChange("value", Number(e.target.value))}
                required
                min="0"
              />
            </div>
            <div>
              <label>Contact Executive</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => handleChange("contactPerson", e.target.value)}
              />
            </div>
          </div>

          <label>Lifecycle Stage</label>
          <select
            value={formData.stageId}
            onChange={(e) => handleChange("stageId", e.target.value)}
          >
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Won pane */}
          {isWon && (
            <div className="conditional-pane win-pane">
              <label>
                Product Development Execution ({formData.devProgress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.devProgress}
                onChange={(e) =>
                  handleChange("devProgress", Number(e.target.value))
                }
              />
              <p className="won-info">
                 Client company record will be created automatically for onboarding.
              </p>
            </div>
          )}

          {/* Lost pane */}
          {isLost && (
            <div className="conditional-pane lost-pane">
              <label>
                Reason for Loss <span className="req">*</span>
              </label>
              <textarea
                placeholder="Log competitive failure analysis reason..."
                value={formData.lostReason}
                onChange={(e) => handleChange("lostReason", e.target.value)}
              />
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary save-btn" disabled={saving}>
              {saving ? "Saving..." : "Commit Changes"}
            </button>
            {canDelete && (
              <button
                type="button"
                className="btn-danger delete-btn"
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? "Deleting..." : "Delete Deal"}
              </button>
            )}
          </div>
        </form>

        {/* ─── RIGHT: Notes + Activity Feed ─────────────────── */}
        <div className="detail-feed-panel">
          {/* Notes Section */}
          <div className="notes-container">
            <h3 className="notes-title">📝 Negotiation Notes</h3>
            <form onSubmit={handleAddNote} className="notes-form">
              <input
                type="text"
                placeholder="Log ongoing transaction discussion..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="notes-action-input"
              />
              <button type="submit" className="notes-action-button">
                Post
              </button>
            </form>
            <div className="notes-viewport">
              {loadingNotes ? (
                <p className="notes-empty-state">Loading notes...</p>
              ) : notes.length === 0 ? (
                <p className="notes-empty-state">No notes yet. Add one above.</p>
              ) : (
                notes.map((note) => (
                  <div key={note.note_id} className="notes-message">
                    <p className="notes-message-text">{note.note_text}</p>
                    <div className="note-meta">
                      <span className="note-time">
                        {new Date(note.created_at).toLocaleString()}
                      </span>
                      <button
                        className="note-delete-btn"
                        onClick={() => handleDeleteNote(note.note_id)}
                        title="Delete note"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Log Section */}
          <div className="activity-container">
            <h3 className="activity-title">📋 Activity Audit Log</h3>
            <form onSubmit={handleAddActivity} className="notes-form">
              <input
                type="text"
                placeholder="Log a manual activity or comment..."
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                className="notes-action-input"
              />
              <button type="submit" className="notes-action-button">
                Log
              </button>
            </form>
            <div className="activity-pipeline">
              {loadingActivities ? (
                <p className="notes-empty-state">Loading activities...</p>
              ) : activities.length === 0 ? (
                <p className="notes-empty-state">No activity yet.</p>
              ) : (
                activities.map((act) => (
                  <div key={act.activity_id} className="activity-event-node">
                    <span className="activity-dot">●</span>
                    <div className="activity-content">
                      <p className="activity-node-message">{act.activity_text}</p>
                      <span className="activity-time">
                        {new Date(act.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealDetailView;