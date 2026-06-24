import { useState } from "react";
import "../styles/NotesSection.css";

function NotesSection() {
  const [noteText, setNoteText] = useState("");

  const [notes, setNotes] = useState([
    {
      id: 1,
      text: "Called customer regarding pricing.",
      createdAt: "2026-06-23 10:30 AM",
    },
    {
      id: 2,
      text: "Customer requested demo next week.",
      createdAt: "2026-06-23 11:15 AM",
    },
  ]);

  const addNote = () => {
    if (!noteText.trim()) return;

    const newNote = {
      id: Date.now(),
      text: noteText,
      createdAt: new Date().toLocaleString(),
    };

    setNotes([newNote, ...notes]);
    setNoteText("");
  };

  const deleteNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h3>Notes</h3>
      </div>

      <div className="add-note-section">
        <textarea
          placeholder="Write a note..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />

        <button onClick={addNote}>
          Add Note
        </button>
      </div>

      <div className="notes-list">
        {notes.map((note) => (
          <div className="note-card" key={note.id}>
            <div className="note-content">
              {note.text}
            </div>

            <div className="note-footer">
              <span>{note.createdAt}</span>

              <button
                className="delete-btn"
                onClick={() => deleteNote(note.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotesSection;