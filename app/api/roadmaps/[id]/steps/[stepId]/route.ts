import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import RoadmapStep from "@/models/RoadmapStep";
import PersonalCalendarEvent from "@/models/PersonalCalendarEvent";
import {
  activateNextStep,
  recalculateRoadmapProgress,
} from "@/lib/roadmap/progress";

type Params = { params: { id: string; stepId: string } };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const body = await request.json();

    const step = await RoadmapStep.findOne({
      _id: params.stepId,
      roadmapId: params.id,
      userId: uid,
    });
    if (!step) {
      return NextResponse.json({ error: "단계를 찾을 수 없습니다." }, { status: 404 });
    }

    if (typeof body.completed === "boolean") {
      step.completed = body.completed;
      if (body.completed) step.active = false;
    }
    if (body.title) step.title = String(body.title).trim();
    if (body.description !== undefined) step.description = body.description;
    if (body.dueDate) {
      step.dueDate = new Date(body.dueDate);
      await PersonalCalendarEvent.findOneAndUpdate(
        { userId: uid, roadmapStepId: step._id },
        {
          $set: {
            title: `[로드맵] ${step.title}`,
            startsAt: step.dueDate,
            category: "roadmap",
          },
        },
        { upsert: true }
      );
    }

    await step.save();

    if (body.completed === true) {
      await activateNextStep(params.id);
    }

    const progress = await recalculateRoadmapProgress(params.id);
    const updated = await RoadmapStep.findById(step._id).lean() as Record<string, unknown> | null;

    return NextResponse.json({
      step: {
        id: String(updated?._id),
        title: updated?.title,
        completed: updated?.completed,
        active: updated?.active,
        dueDate: updated?.dueDate,
      },
      progress,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "수정하지 못했습니다." }, { status: 500 });
  }
}
