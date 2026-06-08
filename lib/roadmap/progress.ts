import RoadmapStep from "@/models/RoadmapStep";
import Roadmap from "@/models/Roadmap";
import mongoose from "mongoose";

export async function recalculateRoadmapProgress(roadmapId: string | mongoose.Types.ObjectId) {
  const rid = typeof roadmapId === "string" ? new mongoose.Types.ObjectId(roadmapId) : roadmapId;
  const steps = await RoadmapStep.find({ roadmapId: rid }).sort({ sortOrder: 1 }).lean();
  if (steps.length === 0) {
    await Roadmap.findByIdAndUpdate(rid, { $set: { progress: 0 } });
    return 0;
  }
  const completed = steps.filter((s) => s.completed).length;
  const progress = Math.round((completed / steps.length) * 100);
  const allDone = completed === steps.length;
  await Roadmap.findByIdAndUpdate(rid, {
    $set: {
      progress,
      ...(allDone ? { status: "completed" } : { status: "active" }),
    },
  });
  return progress;
}

export async function activateNextStep(roadmapId: string | mongoose.Types.ObjectId) {
  const rid = typeof roadmapId === "string" ? new mongoose.Types.ObjectId(roadmapId) : roadmapId;
  const steps = await RoadmapStep.find({ roadmapId: rid }).sort({ sortOrder: 1 });
  const hasActive = steps.some((s) => s.active && !s.completed);
  if (hasActive) return;

  const next = steps.find((s) => !s.completed);
  if (next) {
    await RoadmapStep.updateMany({ roadmapId: rid }, { $set: { active: false } });
    next.active = true;
    await next.save();
  }
}

export function getNextStepTitle(
  steps: Array<{ title: string; completed: boolean; active: boolean }>
): string | null {
  const active = steps.find((s) => s.active && !s.completed);
  if (active) return active.title;
  const next = steps.find((s) => !s.completed);
  return next?.title ?? null;
}
