import { useState } from "react";

export const useUnifiedModal = (card) => {
  const [formData, setFormData] = useState({ ...card });
  const [newActivity, setNewActivity] = useState("");
  const [activities, setActivities] = useState([
    { id: 1, text: "Initial discovery call completed.", date: "2026-06-20" },
    { id: 2, text: "Sent requirement analysis document.", date: "2026-06-22" },
  ]);

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

  return {
    formData,
    newActivity,
    setNewActivity,
    activities,
    handleInputChange,
    handleActivitySubmit,
  };
};
