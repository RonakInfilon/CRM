import { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../styles/PipeLine.css";
import DealDetailView from "../components/DealDetailView";
import Pageheader from "../components/Pageheader";
// import { getOpportunities, updateOpportunity } from "../services/opportunitiesService";

// Initial stages
const initialStages = [
  { id: "stg_opportunity", name: "Opportunity" },
  { id: "stg_proposal", name: "Proposal Sent" },
  { id: "stg_negotiation", name: "Negotiation" },
  { id: "stg_won", name: "Won" },
  { id: "stg_lost", name: "Lost" }
];

// ─── Temporary mock data (replace once backend is ready) ───────────────────
const MOCK_DEALS = [
  {
    id: "mock_1",
    dealName: "Enterprise SaaS Rollout",
    company: "Infosys Ltd.",
    value: 120000,
    contactPerson: "Arjun Mehta",
    stageId: "stg_opportunity",
    stage: "Opportunity",
    lostReason: "",
    devProgress: 0,
    notes: ["Initial discovery call completed. Strong interest in the platform."],
    activities: ["Lead created", "Discovery call held on 2026-06-10"]
  },
  {
    id: "mock_2",
    dealName: "Cloud Migration Contract",
    company: "TechMahindra",
    value: 85000,
    contactPerson: "Priya Sharma",
    stageId: "stg_opportunity",
    stage: "Opportunity",
    lostReason: "",
    devProgress: 0,
    notes: ["Client wants full AWS migration with 24/7 support."],
    activities: ["Lead created", "Email intro sent"]
  },
  {
    id: "mock_3",
    dealName: "ERP Implementation",
    company: "Wipro Infotech",
    value: 200000,
    contactPerson: "Rohan Desai",
    stageId: "stg_proposal",
    stage: "Proposal Sent",
    lostReason: "",
    devProgress: 0,
    notes: ["Full proposal sent. Awaiting legal review."],
    activities: ["Lead created", "Proposal sent on 2026-06-20"]
  },
  {
    id: "mock_4",
    dealName: "Cybersecurity Audit",
    company: "HCL Technologies",
    value: 55000,
    contactPerson: "Sneha Nair",
    stageId: "stg_proposal",
    stage: "Proposal Sent",
    lostReason: "",
    devProgress: 0,
    notes: ["Proposal includes penetration testing & compliance check."],
    activities: ["Lead created", "Demo scheduled", "Proposal sent"]
  },
  {
    id: "mock_5",
    dealName: "AI Analytics Platform",
    company: "Reliance Jio",
    value: 310000,
    contactPerson: "Karan Patel",
    stageId: "stg_negotiation",
    stage: "Negotiation",
    lostReason: "",
    devProgress: 0,
    notes: ["Price negotiation in progress. Client wants 15% discount."],
    activities: ["Lead created", "Proposal sent", "Counter-offer received 2026-06-28"]
  },
  {
    id: "mock_6",
    dealName: "Digital Transformation Suite",
    company: "L&T Infotech",
    value: 175000,
    contactPerson: "Anjali Verma",
    stageId: "stg_negotiation",
    stage: "Negotiation",
    lostReason: "",
    devProgress: 0,
    notes: ["Finalising SLA terms and payment schedule."],
    activities: ["Lead created", "Proposal sent", "SLA discussion 2026-07-01"]
  },
  {
    id: "mock_7",
    dealName: "HR Management System",
    company: "Zomato Pvt. Ltd.",
    value: 42000,
    contactPerson: "Vikram Singh",
    stageId: "stg_won",
    stage: "Won",
    lostReason: "",
    devProgress: 60,
    notes: ["Contract signed. Development phase is underway."],
    activities: ["Lead created", "Contract signed 2026-06-15", "Kickoff meeting held"]
  },
  {
    id: "mock_8",
    dealName: "Logistics Automation",
    company: "Delhivery Corp",
    value: 98000,
    contactPerson: "Meera Joshi",
    stageId: "stg_won",
    stage: "Won",
    lostReason: "",
    devProgress: 30,
    notes: ["Phase 1 delivery completed successfully."],
    activities: ["Lead created", "PO received", "Phase 1 delivered 2026-06-25"]
  },
  {
    id: "mock_9",
    dealName: "Mobile Banking App",
    company: "Axis Bank Ltd.",
    value: 220000,
    contactPerson: "Ravi Kumar",
    stageId: "stg_lost",
    stage: "Lost",
    lostReason: "Client selected a competitor offering a lower price point.",
    devProgress: 0,
    notes: ["Lost to Infosys BPO on pricing."],
    activities: ["Lead created", "Proposal sent", "Lost to competitor 2026-06-30"]
  },
  {
    id: "mock_10",
    dealName: "Retail POS Integration",
    company: "D-Mart Ltd.",
    value: 67000,
    contactPerson: "Pooja Iyer",
    stageId: "stg_lost",
    stage: "Lost",
    lostReason: "Budget cut – project postponed indefinitely by client.",
    devProgress: 0,
    notes: ["Deal stalled after Q2 budget review."],
    activities: ["Lead created", "Demo done", "Budget freeze confirmed 2026-07-01"]
  }
];
// ──────────────────────────────────────────────────────────────────────────

const Pipeline = () => {
  const [stages, setStages] = useState(initialStages);
  const [deals, setDeals] = useState(MOCK_DEALS);
  const [loading, setLoading] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [selectedDealId, setSelectedDealId] = useState(null);

  // Fetch qualified deals/opportunities from the backend
  // Falls back to MOCK_DEALS if the API is unavailable
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
        if (mappedDeals.length > 0) {
          setDeals(mappedDeals);
        }
        // If backend returns empty list, keep mock data visible
      }
    } catch (err) {
      console.warn("Backend unavailable – showing mock pipeline data.", err);
      // Keep the current mock data in state; do not wipe it
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

    // Skip backend call for temporary mock deals (IDs prefixed with "mock_")
    const isMockDeal = String(deal.id).startsWith("mock_");

    if (isMockDeal) {
      // For mock data: just handle the lost-stage prompt locally, no API call needed
      if (targetStageId === "stg_lost" && !deal.lostReason) {
        setSelectedDealId(deal.id);
      }
      return;
    }

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