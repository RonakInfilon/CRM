import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

const DragAndDrop = () => {
  //this is for data means dynamic data
  const [tasks, setTasks] = useState([
    { '_id': '1', name: "Authentification", status: 'A faire' },
    { '_id': '2', name: "Upload FIle", status: 'A faire' },
    { '_id': '3', name: "Crud", status: 'A faire' },
    { '_id': '4', name: "Send EMail", status: 'A faire' },
    { '_id': '5', name: "Send Notification", status: 'A faire' },
    { '_id': '6', name: "Drap and Drop FIle", status: 'A faire' },
    { '_id': '7', name: "Pagination API", status: 'A faire' }
  ])
  //this is status and before add columnhardcoded i used this for dynamic column
  const statues = ["A faire", "En course", "A couurier", "Terminer", "Valider"]

  // Group tasks dynamically by their status attribute
  //because we want column with status and their tasks
  const groupedTask = statues.map(status => ({
    status,
    tasks: tasks.filter(task => task.status === status)
  }))

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    
    // 1. If dropped outside any droppable area, exit early
    if (!destination) return;
    
    // 2. If dropped in the exact same spot, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // 3. Clean React State Update: Map over tasks and switch the status of the moved card
    const updatedTasks = tasks.map(task => {
      if (task._id === draggableId) {
        return { ...task, status: destination.droppableId }; // destination.droppableId holds the new column name
      }
      return task;
    });

    setTasks(updatedTasks);
  }

  return (
    <div className="container">
      <h1 className='mt-4 text-center'>Drag and Drop Task using @hello-pangea</h1>
      <div className='d-flex justify-center mt-4'>
        {/* It is brain of drag and drop  and it require onDragEnd function because it will set the thing when we clickd on mouse */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={{ display: 'flex', gap: '20px' }}>
            
            {groupedTask.map((group) => (
              <Droppable droppableId={group.status} key={group.status}>
                {(provided) => (
                  <div  
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ 
                      padding: '10px', 
                      border: '1px solid #adababff', 
                      borderRadius: '8px', 
                      minWidth: '200px',
                      backgroundColor: '#f8f9fa' 
                    }}
                  >
                    <h3>{group.status}</h3>

                    {group.tasks.map((task, index) => (
                      /* Fixed: Changed key={tasks._id} to task._id */
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              padding: '10px',
                              marginBottom: '10px',
                              backgroundColor: '#001DA0ff',
                              color: '#ffff',
                              borderRadius: '4px',
                              cursor: 'grab',
                              ...provided.draggableProps.style // Injects the visual physics for dragging
                            }}
                          >
                            {task.name}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}

          </div>
        </DragDropContext>
      </div>
    </div>
  )   
}

export default DragAndDrop;
