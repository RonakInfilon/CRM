import { useState, useEffect, useCallback } from "react";
import {
  getPipeline,
  moveDeal,
  deleteDeal,
  createStage,
  deleteStage,
} from "./pipelineService";

export const usePipeline = () => {
  const [stages, setStages] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStageName, setNewStageName] = useState("");
  const [selectedDealId, setSelectedDealId] = useState(null);

  // Fetch pipeline (stages + deals grouped) from the backend
  const fetchDeals = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
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
    fetchDeals(true);
  }, [fetchDeals]);

  // Add stage
  const handleAddStage = async (e) => {
    e.preventDefault();
    if (!newStageName.trim()) return;

    try {
      const res = await createStage({
        name: newStageName.trim(),
        sort_order: stages.length
      });
      if (res.data?.success) {
        setNewStageName("");
        fetchDeals(false);
      }
    } catch (err) {
      console.error("Failed to add stage:", err);
      alert(err.response?.data?.message || "Failed to add stage.");
    }
  };

  // Delete stage
  const handleDeleteStage = async (stageId) => {
    if (!window.confirm("Are you sure you want to delete this stage? Associated deals will be moved to another stage.")) return;

    try {
      await deleteStage(stageId);
      fetchDeals(false);
    } catch (err) {
      console.error("Failed to delete stage:", err);
      alert(err.response?.data?.message || "Failed to delete stage.");
    }
  };

  // Drag & Drop — prompt for lost_reason when dropping on Lost stage
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    // Check if anything actually changed (either column or index within column)
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return; // Truly no change
    }

    const targetStageId = destination.droppableId;
    const targetStage = stages.find((s) => s.id === targetStageId);
    const targetStageName = targetStage?.name || "";
    const deal = deals.find((d) => String(d.id) === String(draggableId));
    if (!deal) return;

    let lostReason = null;
    if (targetStageName === "Lost" && deal.stageId !== targetStageId) {
      lostReason = window.prompt(
        `Moving "${deal.dealName}" to Lost.\nPlease enter the reason for losing this deal:`
      );
      if (lostReason === null) return;
      if (!lostReason.trim()) {
        alert("Lost reason cannot be empty.");
        return;
      }
    }

    // Optimistic reorder & update
    setDeals((prev) => {
      // Remove the deal from the list
      const newDeals = prev.filter((d) => String(d.id) !== String(draggableId));
      // Update its stage
      const updatedDeal = {
        ...deal,
        stageId: targetStageId,
        stage: targetStageName,
        lostReason: lostReason || deal.lostReason
      };

      // Find all deals that will be in the target stage
      const targetDeals = newDeals.filter((d) => d.stageId === targetStageId);

      // Find the deal that is currently at the destination index in that stage
      const targetAtDest = targetDeals[destination.index];

      if (targetAtDest) {
        // Insert updatedDeal right before targetAtDest
        const insertIndex = newDeals.findIndex((d) => String(d.id) === String(targetAtDest.id));
        newDeals.splice(insertIndex, 0, updatedDeal);
      } else {
        // Otherwise, place it at the end of target stage deals
        const lastTargetDeal = targetDeals[targetDeals.length - 1];
        if (lastTargetDeal) {
          const insertIndex = newDeals.findIndex((d) => String(d.id) === String(lastTargetDeal.id));
          newDeals.splice(insertIndex + 1, 0, updatedDeal);
        } else {
          newDeals.push(updatedDeal);
        }
      }

      return newDeals;
    });

    // If it changed stage, send update to backend
    if (deal.stageId !== targetStageId) {
      try {
        await moveDeal(deal.id, targetStageId, lostReason);
        // Do NOT call fetchDeals() on success to preserve custom drop index
      } catch (err) {
        console.error("Failed to move deal:", err);
        alert("Failed to save move. Reverting board...");
        fetchDeals(false); // revert to server state
      }
    }
  };

  return {
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
  };
};
