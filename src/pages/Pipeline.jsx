import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../styles/PipeLine.css";

// 1. Odoo-Style Relational State Setup
const initialStages = [
  { id: "stg_opportunity", name: "Opportunity" },
  { id: "stg_proposal", name: "Proposal Sent" },
  { id: "stg_negotiation", name: "Negotiation" },
  { id: "stg_won", name: "Won" },
  { id: "stg_lost", name: "Lost" }
];

const initialDeals = [
  { id: "d1", dealName: "CRM Implementation", company: "Google", value: 12500, stageId: "stg_opportunity", contactPerson: "John Smith" },
  { id: "d2", dealName: "Custom CSS Theme", company: "Microsoft", value: 3200, stageId: "stg_opportunity", contactPerson: "Emma Watson" },
  { id: "d3", dealName: "Cloud Support", company: "Meta", value: 25000, stageId: "stg_negotiation", contactPerson: "Alex Brown" },
];

const Pipeline = () => {
  const [stages, setStages] = useState(initialStages);
  const [deals, setDeals] = useState(initialDeals);
  const [newStageName, setNewStageName] = useState("");

  // 2. Handle adding a brand new column (Odoo feature)
  const handleAddStage = (e) => {
    e.preventDefault();
    if (!newStageName.trim()) return;

    const newStage = {
      id: `stg_${Date.now()}`,
      name: newStageName.trim()
    };

    setStages([...stages, newStage]);
    setNewStageName("");
  };

  // 3. Handle deleting a column (Odoo feature)
  const handleDeleteStage = (stageId) => {
    // Remove the stage column
    setStages(stages.filter(stg => stg.id !== stageId));
    
    // Safety fallback: Move any orphaned deals back to the first available stage
    const fallbackStageId = stages.find(stg => stg.id !== stageId)?.id || "";
    setDeals(deals.map(deal => deal.stageId === stageId ? { ...deal, stageId: fallbackStageId } : deal));
  };

  // 4. Combined Drag Handling (Handles moving cards between columns)
  const onDragEnd = (result) => {
    const { source, destination, type } = result;

    if (!destination) return;

    // Moving cards around
    if (type === "DEFAULT" || !type) {
      const targetDealId = result.draggableId;
      const targetStageId = destination.droppableId;

      setDeals(prevDeals => 
        prevDeals.map(deal => 
          deal.id === targetDealId ? { ...deal, stageId: targetStageId } : deal
        )
      );
    }
  };

  return (
    <div className="pipeline-wrapper" style={{ padding: "20px" }}>
      
      {/* ODOO CONFIGURATION PANEL */}
      <div className="pipeline-actions" style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
        <form onSubmit={handleAddStage} style={{ display: "flex", gap: "10px" }}>
          <input 
            type="text" 
            placeholder="New Column Name (e.g. Lost - Price)..." 
            value={newStageName}
            onChange={(e) => setNewStageName(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
          />
          <button type="submit" style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}>
            + Add Stage
          </button>
        </form>
      </div>

      {/* KANBAN SYSTEM */}
      <div className="pipeline-container" style={{ display: "flex", gap: "20px", overflowX: "auto", paddingBottom: "20px" }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {stages.map((stage) => {
            // Filter deals belonging dynamically to this specific stage column
            const stageDeals = deals.filter(deal => deal.stageId === stage.id);

            return (
              <div key={stage.id} className="pipeline-column" style={{ minWidth: "280px", background: "#f1f5f9", borderRadius: "8px", padding: "16px" }}>
                
                {/* Column Header with Delete Customization Trigger */}
                <div className="column-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <div>
                    <strong style={{ fontSize: "16px", color: "#1e293b" }}>{stage.name}</strong>
                    <span style={{ marginLeft: "8px", background: "#cbd5e1", padding: "2px 6px", borderRadius: "10px", fontSize: "12px" }}>
                      {stageDeals.length}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeleteStage(stage.id)} 
                    style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "14px" }}
                    title="Delete Column"
                  >
                    Delete
                  </button>
                </div>

                {/* Droppable Card Container Zone */}
                <Droppable droppableId={stage.id}>
                  {(provided) => (
                    <div
                      className="column-body"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{ minHeight: "400px" }}
                    >
                      {stageDeals.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided) => (
                            <div
                              className="lead-card deal-card"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                backgroundColor: "white",
                                padding: "15px",
                                borderRadius: "6px",
                                marginBottom: "12px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                borderLeft: "4px solid #2563eb",
                                ...provided.draggableProps.style
                              }}
                            >
                              <h4 style={{ margin: "0 0 6px 0", color: "#0f172a" }}>{item.dealName}</h4>
                              <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#64748b" }}>🏢 {item.company}</p>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontWeight: "bold", color: "#10b981" }}>${item.value.toLocaleString()}</span>
                                <span style={{ fontSize: "11px", color: "#64748b" }}>👤 {item.contactPerson}</span>
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
        </DragDropContext>
      </div>

    </div>
  );
};

export default Pipeline;