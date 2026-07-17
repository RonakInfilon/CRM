import { useState } from 'react';

export const useDragAndDrop = () => {
  const [tasks, setTasks] = useState([
    { '_id': '1', name: "Authentification", status: 'A faire' },
    { '_id': '2', name: "Upload FIle", status: 'A faire' },
    { '_id': '3', name: "Crud", status: 'A faire' },
    { '_id': '4', name: "Send EMail", status: 'A faire' },
    { '_id': '5', name: "Send Notification", status: 'A faire' },
    { '_id': '6', name: "Drap and Drop FIle", status: 'A faire' },
    { '_id': '7', name: "Pagination API", status: 'A faire' }
  ]);

  const statues = ["A faire", "En course", "A couurier", "Terminer", "Valider"];

  const groupedTask = statues.map(status => ({
    status,
    tasks: tasks.filter(task => task.status === status)
  }));

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const updatedTasks = tasks.map(task => {
      if (task._id === draggableId) {
        return { ...task, status: destination.droppableId };
      }
      return task;
    });

    setTasks(updatedTasks);
  };

  return {
    groupedTask,
    handleDragEnd,
  };
};
