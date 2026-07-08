import { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../styles/PipeLine.css";
import DealDetailView from "../components/DealDetailView";
import Pageheader from "../components/Pageheader";
import {
  getPipeline,
  moveDeal,
  deleteDeal,
} from "../services/pipelineService";






const Pipeline = () => {
  const [stages, setStages] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStageName, setNewStageName] = useState("");
  const [selectedDealId, setSelectedDealId] = useState(null);

  // Fetch pipeline (stages + deals grouped) from the backend
  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPipeline();
      if (res.data?.success && Array.isArray(res.data.data)) {
        const pipelineData = res.data.data; // array of { stage_id, name, sort_order, deals[] }

        // Build stages list
        const fetchedStages = pipelineData.map(s => ({
          id: String(s.stage_id),
          name: s.name,
          sort_order: s.sort_order,
        }));

        // Flatten all deals and normalise field names for the card renderer
        const fetchedDeals = pipelineData.flatMap(s =>
          s.deals.map(d => ({
            id: String(d.deal_id),
            dealName: d.deal_name,
            company: d.company_name,
            value: d.value ?? 0,
            contactPerson:
              d.first_name || d.last_name
                ? `${d.first_name ?? ""} ${d.last_name ?? ""}`.trim()
                : "",
            stageId: String(s.stage_id),
            stage: s.name,
            lostReason: d.lost_reason ?? "",
            devProgress: d.dev_progress ?? 0,
            notes: [],
            activities: [],
            // keep raw backend fields for detail view
            ...d,
          }))
        );

        if (fetchedStages.length > 0) setStages(fetchedStages);
        setDeals(fetchedDeals);
      }
    } catch (err) {
      console.error("Failed to fetch pipeline:", err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Drag & Drop — prompt for lost_reason when dropping on Lost stage
  const onDragEnd = async (result) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const targetStageId = destination.droppableId;
    const targetStage = stages.find((s) => s.id === targetStageId);
    const targetStageName = targetStage?.name || "";
    const deal = deals.find((d) => String(d.id) === String(draggableId));
    if (!deal || deal.stageId === targetStageId) return; // no change

    let lostReason = null;
    if (targetStageName === "Lost") {
      lostReason = window.prompt(
        `Moving "${deal.dealName}" to Lost.\nPlease enter the reason for losing this deal:`
      );
      if (lostReason === null) return; 
      if (!lostReason.trim()) {
        alert("Lost reason cannot be empty.");
        return;
      }
    }

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) =>
        String(d.id) === String(draggableId)
          ? { ...d, stageId: targetStageId, stage: targetStageName }
          : d
      )
    );

    try {
      await moveDeal(deal.id, targetStageId, lostReason);
      fetchDeals(); // refresh from server
    } catch (err) {
      console.error("Failed to move deal:", err);
      fetchDeals(); // revert
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
        onBack={() => {
          setSelectedDealId(null);
          fetchDeals(); // always refresh so board shows latest stage
        }}
        onRefresh={() => {
          setSelectedDealId(null);
          fetchDeals();
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