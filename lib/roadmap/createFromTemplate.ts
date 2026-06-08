import mongoose from "mongoose";
import Roadmap from "@/models/Roadmap";
import RoadmapStep from "@/models/RoadmapStep";
import PersonalCalendarEvent from "@/models/PersonalCalendarEvent";
import { ROADMAP_TEMPLATES } from "./templates";
import { activateNextStep, recalculateRoadmapProgress } from "./progress";

export async function createRoadmapFromTemplate(
  userId: string,
  templateKey: string,
  options?: { dueDate?: Date }
) {
  const template = ROADMAP_TEMPLATES[templateKey];
  if (!template) {
    throw new Error("알 수 없는 로드맵 템플릿입니다.");
  }

  const uid = new mongoose.Types.ObjectId(userId);
  const roadmap = await Roadmap.create({
    userId: uid,
    title: template.title,
    description: template.description,
    priority: template.priority,
    progress: 0,
    status: "active",
    templateKey: template.key,
    dueDate: options?.dueDate,
  });

  const steps = await RoadmapStep.insertMany(
    template.steps.map((step, index) => ({
      roadmapId: roadmap._id,
      userId: uid,
      title: step.title,
      description: step.description,
      completed: false,
      sortOrder: index,
      active: index === 0,
    }))
  );

  if (steps[0]?.dueDate || options?.dueDate) {
    const firstDue = steps[0]?.dueDate || options?.dueDate;
    if (firstDue) {
      await PersonalCalendarEvent.create({
        userId: uid,
        title: `[로드맵] ${steps[0].title}`,
        startsAt: firstDue,
        category: "roadmap",
        status: "planned",
        recurrence: { type: "none" },
        roadmapId: roadmap._id,
        roadmapStepId: steps[0]._id,
      });
    }
  }

  await recalculateRoadmapProgress(roadmap._id);
  await activateNextStep(roadmap._id);

  const populatedSteps = await RoadmapStep.find({ roadmapId: roadmap._id })
    .sort({ sortOrder: 1 })
    .lean();

  return {
    roadmap: roadmap.toObject(),
    steps: populatedSteps,
  };
}
