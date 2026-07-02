import { useState } from 'react';
import "../styles/NotesSection.css";

const NotesSection = ({ notes = [], onNotesChange }) => {
  const [currentNote, setCurrentNote] = useState("");

  const handleNotes = (e) => {
    e.preventDefault();
    if (!currentNote.trim()) return;
    onNotesChange([...notes, currentNote.trim()]);
    setCurrentNote("");
  };

  return (
    <div className="notes-container">
      <h3 className="notes-title">
        Negotiation Notes and Repository
      </h3>
      <form onSubmit={handleNotes} className="notes-form">
        <input 
          type="text"
          placeholder="Log ongoing Transaction discussion..."
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          className="notes-action-input"
        />
        <button type="submit" className="notes-action-button">Post Log</button>
      </form>
      <div className="notes-viewport">
        {notes.length === 0 ? (
          <p className="notes-empty-state">No Negotiation history records found.</p>
        ) : (
          notes.map((note, index) => (
            <div key={index} className="notes-message">
              <p className="notes-message-text">{note}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesSection;