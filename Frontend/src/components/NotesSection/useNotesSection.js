import { useState } from "react";

export const useNotesSection = (notes, onNotesChange) => {
  const [currentNote, setCurrentNote] = useState("");

  const handleNotes = (e) => {
    e.preventDefault();
    if (!currentNote.trim()) return;
    onNotesChange([...notes, currentNote.trim()]);
    setCurrentNote("");
  };

  return {
    currentNote,
    setCurrentNote,
    handleNotes,
  };
};
