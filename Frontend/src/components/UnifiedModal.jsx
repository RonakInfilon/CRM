import { useState } from "react";
import "../styles/UnifiedModal.css";

const UnifiedModal = ({ card, isOpen, onClose }) => {
  const [formData, setFormData] = useState({ ...card });
  const [newActivity, setNewActivity] = useState("");
  const [activities, setActivities] = useState([
    { id: 1, text: "Initial discovery call completed.", date: "2026-06-20" },
    { id: 2, text: "Sent requirement analysis document.", date: "2026-06-22" },
  ]);

  if (!isOpen || !card) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleActivitySubmit = (e) => {
    e.preventDefault();
    if (!newActivity.trim()) return;
    const newActObj = {
      id: Date.now(),
      text: newActivity.trim(),
      date: new Date().toISOString().split("T")[0],
    };
    setActivities((prev) => [newActObj, ...prev]);
    setNewActivity("");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{formData.dealName || formData.title || "Details"}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="form-section">
            <h3>🏢 Company Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Deal Value ($)</label>
                <input
                  type="text"
                  name="value"
                  value={formData.value || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>👤 Contact Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contactPerson || formData.contact || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="example@company.com"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>📋 Activity Log</h3>
            <form onSubmit={handleActivitySubmit} className="activity-form">
              <input
                type="text"
                placeholder="Log a new activity or note..."
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
              />
              <button type="submit">Log</button>
            </form>

            <div className="activity-list">
              {activities.map((act) => (
                <div key={act.id} className="activity-item">
                  <span className="activity-date">{act.date}</span>
                  <p className="activity-text">{act.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="btn-primary"
            onClick={() => alert("Saved changes (mocked)")}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedModal;