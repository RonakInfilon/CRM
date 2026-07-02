import { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../styles/PipeLine.css";
import DealDetailView from "../components/DealDetailView";
import Pageheader from "../components/Pageheader";
import { getOpportunities, updateOpportunity } from "../services/opportunitiesService";

// Initial stages
const initialStages = [
  { id: "stg_opportunity", name: "Opportunity" },
  { id: "stg_proposal", name: "Proposal Sent" },
  { id: "stg_negotiation", name: "Negotiation" },
  { id: "stg_won", name: "Won" },
  { id: "stg_lost", name: "Lost" }
];

const Pipeline = () => {
  const [stages, setStages] = useState(initialStages);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [selectedDealId, setSelectedDealId] = useState(null);

  // Fetch qualified deals/opportunities from the backend
  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getOpportunities(1, 100);
      if (res.data?.success && res.data.data?.opportunities) {
        // Map backend stage name to frontend stage id
        const mappedDeals = res.data.data.opportunities.map(deal => {
          let stageId = deal.stageId; // e.g. "Opportunity"
          const matchingStage = stages.find(
            s => s.name.toLowerCase() === (deal.stage || "").toLowerCase() ||
              s.id.toLowerCase() === (deal.stageId || "").toLowerCase()
          );
          if (matchingStage) {
            stageId = matchingStage.id;
          } else {
            // Default fallback mapping
            if (stageId === "Opportunity") stageId = "stg_opportunity";
            else if (stageId === "Proposal Sent") stageId = "stg_proposal";
            else if (stageId === "Negotiation") stageId = "stg_negotiation";
            else if (stageId === "Won") stageId = "stg_won";
            else if (stageId === "Lost") stageId = "stg_lost";
          }
          return {
            ...deal,
            stageId
          };
        });
        setDeals(mappedDeals);
      }
    } catch (err) {
      console.warn("Failed to load pipeline deals:", err);
    } finally {
      setLoading(false);
    }
  }, [stages]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // Add stage
  const handleAddStage = (e) => {
    e.preventDefault();
    if (!newStageName.trim()) return;

    const newStage = {
      id: `stg_${Date.now()}`,
      name: newStageName.trim(),
    };

    setStages((prev) => [...prev, newStage]);
    setNewStageName("");
  };

  // Delete stage
  const handleDeleteStage = (stageId) => {
    const fallbackStageId = stages.find((stage) => stage.id !== stageId)?.id || "";
    setStages(stages.filter((stage) => stage.id !== stageId));

    setDeals((prevDeals) =>
      prevDeals.map((deal) =>
        deal.stageId === stageId
          ? { ...deal, stageId: fallbackStageId }
          : deal
      )
    );
  };

  // Drag & Drop
  const onDragEnd = async (result) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const targetStageId = destination.droppableId;
    const targetStageName = stages.find((stage) => stage.id === targetStageId)?.name || targetStageId;
    const deal = deals.find(d => String(d.id) === String(draggableId));
    if (!deal) return;

    let newStatus = targetStageName;

    const prevStageName = stages.find(s => s.id === deal.stageId)?.name || "Unknown";
    const activityMsg = `Moved from ${prevStageName} to ${targetStageName}`;
    const updatedActivities = [...deal.activities, activityMsg];

    // Optimistically update local view
    setDeals(prev => prev.map(d => {
      if (String(d.id) === String(draggableId)) {
        return {
          ...d,
          stageId: targetStageId,
          stage: newStatus,
          activities: updatedActivities
        };
      }
      return d;
    }));

    try {
      await updateOpportunity(deal.id, {
        ...deal,
        stage: newStatus,
        activities: updatedActivities
      });

      if (targetStageId === "stg_lost" && !deal.lostReason) {
        setSelectedDealId(deal.id);
      }
      fetchDeals();
    } catch (err) {
      console.error("Failed to save dragged status update:", err);
    }
  };

  // Open Deal Detail View
  if (selectedDealId) {
    const activeDeal = deals.find(
      (deal) => String(deal.id) === String(selectedDealId)
    );

    return (
      <DealDetailView
        deal={activeDeal}
        stages={stages}
        onBack={() => setSelectedDealId(null)}
        onSave={async (updatedDeal) => {
          try {
            const targetStageName = stages.find(s => s.id === updatedDeal.stageId)?.name || updatedDeal.stageId;
            let newStatus = targetStageName;

            await updateOpportunity(updatedDeal.id, {
              ...updatedDeal,
              stage: newStatus
            });
            setSelectedDealId(null);
            fetchDeals();
          } catch (err) {
            console.error("Failed to commit deal details save:", err);
          }
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
                        className={`column-body ${snapshot.isDraggingOver ? "dragging-over" : ""
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
                                className={`deal-card ${snapshot.isDragging ? "dragging" : ""
                                  }`}
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