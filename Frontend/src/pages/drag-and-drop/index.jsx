import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useDragAndDrop } from './useDragAndDrop';

const DragAndDrop = () => {
  const {
    groupedTask,
    handleDragEnd,
  } = useDragAndDrop();

  return (
    <div className="container">
      <h1 className='mt-4 text-center'>Drag and Drop Task using @hello-pangea</h1>
      <div className='d-flex justify-center mt-4'>
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
                              ...provided.draggableProps.style
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
  );
};

export default DragAndDrop;
