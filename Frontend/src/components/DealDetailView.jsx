import { useState } from 'react'
import ActivityLog from './ActivityLog'
import NotesSection from './NotesSection'
import "../styles/DealDataView.css"

const DealDetailView = ({deal,stages,onBack,onSave}) => {
  // Normalise notes to array — backend may return a string, NotesSection needs an array
  const normalisedDeal = {
    ...deal,
    notes: Array.isArray(deal.notes)
      ? deal.notes
      : deal.notes
        ? [deal.notes]
        : []
  };
  const[formData,setFormData]=useState({...normalisedDeal});
 const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === "stageId") {
        const stageName = stages.find(s => s.id === value)?.name || "Unknown";
        updated.activities = [...prev.activities, `Stage manually updated to "${stageName}"`];
      }
      return updated;
    });
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formData.stageId === "stg_lost" && !formData.lostReason?.trim()) {
      alert("Error: You must provide a valid reason for losing this deal.");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="detail-page-wrapper">
      <div className="detail-header">
        <button className="btn-secondary" onClick={onBack}>← Back to Board</button>
        <h2>{formData.dealName} Sheet</h2>
      </div>

      <div className="detail-layout">
        <form onSubmit={handleFormSubmit} className="detail-form-panel">
          <h3>Core Specifications</h3>
          
          <label>Deal Title</label>
          <input type="text" value={formData.dealName} onChange={e => handleChange("dealName", e.target.value)} required />

          <label>Corporate Account</label>
          <input type="text" value={formData.company} onChange={e => handleChange("company", e.target.value)} required />

          <div className="form-grid">
            <div>
              <label>Deal Value ($)</label>
              <input type="number" value={formData.value} onChange={e => handleChange("value", Number(e.target.value))} required />
            </div>
            <div>
              <label>Contact Executive</label>
              <input type="text" value={formData.contactPerson} onChange={e => handleChange("contactPerson", e.target.value)} required />
            </div>
          </div>

          <label>Lifecycle Stage</label>
          <select value={formData.stageId} onChange={e => handleChange("stageId", e.target.value)}>
            {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          {formData.stageId === "stg_won" && (
            <div className="conditional-pane win-pane">
              <label>Product Development Execution ({formData.devProgress}%)</label>
              <input 
                type="range" min="0" max="100" 
                value={formData.devProgress} 
                onChange={e => handleChange("devProgress", Number(e.target.value))} 
              />
            </div>
          )}

          {formData.stageId === "stg_lost" && (
            <div className="conditional-pane lost-pane">
              <label>Reason for Loss <span className="req">*</span></label>
              <textarea 
                placeholder="Log competitive failure analysis reason..." 
                value={formData.lostReason} 
                onChange={e => handleChange("lostReason", e.target.value)}
              />
            </div>
          )}

          <button type="submit" className="btn-primary save-btn">Commit Changes</button>
        </form>

        <div className="detail-feed-panel">
          <NotesSection 
            notes={formData.notes} 
            onNotesChange={(newNotes) => handleChange("notes", newNotes)} 
          />
          <ActivityLog activities={formData.activities} />
        </div>
      </div>
    </div>
  );
}

export default DealDetailView