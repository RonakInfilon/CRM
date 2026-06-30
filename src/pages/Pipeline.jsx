import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../styles/PipeLine.css";
import DealDetailView from "../components/DealDetailView";
import Pageheader from "../components/Pageheader";
// Initial stages
const initialStages = [
  { id: "stg_opportunity", name: "Opportunity" },
  { id: "stg_proposal", name: "Proposal Sent" },
  { id: "stg_negotiation", name: "Negotiation" },
  { id: "stg_won", name: "Won" },
  { id: "stg_lost", name: "Lost" }
];

// Initial deals
const initialDeals = [
  {
    id: "d1",
    dealName: "CRM Implementation",
    company: "Google",
    value: 12500,
    stageId: "stg_opportunity",
    contactPerson: "John Smith",
    devProgress: 0,
    lostReason: "",
    notes: ["Initial call completed. Client is highly interested."],
    activities: ["Deal Created in Opportunity Stage"]
  },
  {
    id: "d2",
    dealName: "Custom CSS Theme",
    company: "Microsoft",
    value: 3200,
    stageId: "stg_opportunity",
    contactPerson: "Emma Watson",
    devProgress: 0,
    lostReason: "",
    notes: [],
    activities: ["Deal Created in Opportunity Stage"]
  }
];

const Pipeline = () => {
  const [stages, setStages] = useState(initialStages);
  const [deals, setDeals] = useState(initialDeals);
  const [newStageName, setNewStageName] = useState("");
  const [selectedDealId, setSelectedDealId] = useState(null);

  // Add stage
const handleAddStage = (e) => {
    e.preventDefault();

    console.log("Button clicked");
    console.log("Stage:", newStageName);

    if (!newStageName.trim()) {
        console.log("Empty name");
        return;
    }

    const newStage = {
        id: `stg_${Date.now()}`,
        name: newStageName.trim(),
    };

    setStages((prev) => [...prev, newStage]);
    setNewStageName("");
};

  // Delete stage
  const handleDeleteStage = (stageId) => {
    const fallbackStageId =
      stages.find((stage) => stage.id !== stageId)?.id || "";

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
  const onDragEnd = (result) => {
    const { destination, draggableId } = result;

    if (!destination) return;

    const targetStageId = destination.droppableId;

    const targetStageName =
      stages.find((stage) => stage.id === targetStageId)?.name ||
      targetStageId;

    setDeals((prevDeals) =>
      prevDeals.map((deal) => {
        if (deal.id === draggableId) {
          const previousStageName =
            stages.find((stage) => stage.id === deal.stageId)?.name ||
            "Unknown";

          const updatedDeal = {
            ...deal,
            stageId: targetStageId,
            activities: [
              ...deal.activities,
              `Moved from ${previousStageName} to ${targetStageName}`
            ]
          };

          if (
            targetStageId === "stg_lost" &&
            !deal.lostReason
          ) {
            setSelectedDealId(deal.id);
          }

          return updatedDeal;
        }

        return deal;
      })
    );
  };

  // Open Deal Detail View
  if (selectedDealId) {
    const activeDeal = deals.find(
      (deal) => deal.id === selectedDealId
    );

    return (
      <DealDetailView
        deal={activeDeal}
        stages={stages}
        onBack={() => setSelectedDealId(null)}
        onSave={(updatedDeal) => {
          setDeals((prevDeals) =>
            prevDeals.map((deal) =>
              deal.id === updatedDeal.id
                ? updatedDeal
                : deal
            )
          );
          setSelectedDealId(null);
        }}
      />
    );
  }

  return (
    <div className="pipeline-wrapper">

      {/* Actions */}
      {/* <div className="pipeline-actions">
        <form onSubmit={handleAddStage}>
          <input
            type="text"
            placeholder="New Stage Name"
            value={newStageName}
            onChange={(e) =>
              setNewStageName(e.target.value)
            }
            className="stage-input"
          />

          <button onClick={handleAddStage}>
            + Add Stage
          </button>
        </form>
      </div> */}
        <Pageheader
        searchQuery={newStageName}
        onSearchChange={setNewStageName}
       
        onAddClick={handleAddStage}
        placeholder="Search contacts by name, company, email..."
        buttonText="+ Add Pipeline"
      />

      {/* Pipeline */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="pipeline-container">

          {stages.map((stage) => {
            const stageDeals = deals.filter(
              (deal) => deal.stageId === stage.id
            );

            return (
              <div
                key={stage.id}
                className="pipeline-column"
              >
                {/* Header */}
                <div className="column-header">
                  <div>
                    <strong>{stage.name}</strong>

                    <span className="deal-count">
                      {stageDeals.length}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      handleDeleteStage(stage.id)
                    }
                  >
                    Delete
                  </button>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={stage.id}>
                  {(provided) => (
                    <div
                      className="column-body"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {stageDeals.map(
                        (deal, index) => (
                          <Draggable
                            key={deal.id}
                            draggableId={deal.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                className="deal-card"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() =>
                                  setSelectedDealId(
                                    deal.id
                                  )
                                }
                                style={{
                                  ...provided
                                    .draggableProps
                                    .style
                                }}
                              >
                                <h4>
                                  {deal.dealName}
                                </h4>

                                <p>
                                  {deal.company}
                                </p>

                                <div className="deal-footer">
                                  <span>
                                    $
                                    {deal.value.toLocaleString()}
                                  </span>

                                  <span>
                                    {" "}
                                    {
                                      deal.contactPerson
                                    }
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        )
                      )}

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Pipeline;