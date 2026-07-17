import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import DealDetailView from "../../components/DealDetailView";
import Pageheader from "../../components/Pageheader";
import { usePipeline } from "./usePipeline";
import "./pipeline.styles.css";

const Pipeline = () => {
  const {
    stages,
    deals,
    loading,
    newStageName,
    setNewStageName,
    selectedDealId,
    setSelectedDealId,
    fetchDeals,
    handleAddStage,
    handleDeleteStage,
    onDragEnd,
  } = usePipeline();

  // Open Deal Detail View
  if (selectedDealId) {
    const activeDeal = deals.find(
      (deal) => String(deal.id) === String(selectedDealId)
    );

    return (
      <DealDetailView
        deal={activeDeal}
        stages={stages}
        onBack={() => {
          setSelectedDealId(null);
          fetchDeals(false); // always refresh so board shows latest stage
        }}
        onRefresh={() => {
          setSelectedDealId(null);
          fetchDeals(false);
        }}
      />
    );
  }

  return (
    <div className="pipeline-wrapper">
      <Pageheader
        searchQuery={newStageName}
        onSearchChange={setNewStageName}
        onAddClick={handleAddStage}
        placeholder="Add a new custom stage..."
        buttonText="+ Add Stage"
      />

      {loading ? (
        <p style={{ color: "#9ca3af", textAlign: "center", padding: 32 }}>Loading sales pipeline board...</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="pipeline-container">
            {stages.map((stage) => {
              const stageDeals = deals.filter((deal) => deal.stageId === stage.id);
              return (
                <div key={stage.id} className="pipeline-column">
                  <div className="column-header">
                    <strong>
                      {stage.name} <span className="item-count">({stageDeals.length})</span>
                    </strong>
                    <button
                      className="delete-stage-btn"
                      onClick={() => handleDeleteStage(stage.id)}
                    >
                      ✕
                    </button>
                  </div>

                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        className={`column-body ${snapshot.
                          isDraggingOver ? "dragging-over" : ""
                          }`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {stageDeals.map((deal, index) => (
                          <Draggable
                            key={String(deal.id)}
                            draggableId={String(deal.id)}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                className={`deal-card ${snapshot.isDragging ? "dragging" : ""}`}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setSelectedDealId(deal.id)}
                              >
                                <h4>{deal.dealName}</h4>
                                <p>{deal.company || "—"}</p>
                                <div className="deal-footer">
                                  <span className="deal-value">
                                    ${Number(deal.value).toLocaleString()}
                                  </span>
                                  {deal.contactPerson && (
                                    <span className="deal-contact">
                                      {deal.contactPerson}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default Pipeline;