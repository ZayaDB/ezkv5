import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import Roadmap from "@/models/Roadmap";
import RoadmapStep from "@/models/RoadmapStep";
import { createRoadmapFromTemplate } from "@/lib/roadmap/createFromTemplate";
import { getNextStepTitle } from "@/lib/roadmap/progress";
import { ROADMAP_TEMPLATES } from "@/lib/roadmap/templates";

function serializeRoadmap(r: Record<string, unknown>, steps: Array<Record<string, unknown>>) {
  return {
    id: String(r._id),
    title: r.title,
    description: r.description,
    progress: r.progress,
    priority: r.priority,
    dueDate: r.dueDate,
    status: r.status,
    templateKey: r.templateKey,
    nextStep: getNextStepTitle(
      steps.map((s) => ({
        title: String(s.title),
        completed: Boolean(s.completed),
        active: Boolean(s.active),
      }))
    ),
    steps: steps.map((s) => ({
      id: String(s._id),
      title: s.title,
      description: s.description,
      completed: s.completed,
      dueDate: s.dueDate,
      sortOrder: s.sortOrder,
      active: s.active,
    })),
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "active";

    const filter: Record<string, unknown> = { userId: uid };
    if (status !== "all") filter.status = status;

    const roadmaps = await Roadmap.find(filter).sort({ updatedAt: -1 }).lean();
    const ids = roadmaps.map((r) => r._id);
    const steps = ids.length
      ? await RoadmapStep.find({ roadmapId: { $in: ids } }).sort({ sortOrder: 1 }).lean()
      : [];

    return NextResponse.json({
      templates: Object.values(ROADMAP_TEMPLATES).map((t) => ({
        key: t.key,
        title: t.title,
        description: t.description,
        priority: t.priority,
        stepCount: t.steps.length,
      })),
      roadmaps: roadmaps.map((r) =>
        serializeRoadmap(
          r as Record<string, unknown>,
          steps.filter((s) => String(s.roadmapId) === String(r._id)) as Record<string, unknown>[]
        )
      ),
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "로드맵을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    await connectDB();
    const body = await request.json();
    const { templateKey, title, description, priority, dueDate, steps } = body;

    if (templateKey) {
      const result = await createRoadmapFromTemplate(auth.userId, String(templateKey), {
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
      return NextResponse.json(
        serializeRoadmap(
          result.roadmap as Record<string, unknown>,
          result.steps as Record<string, unknown>[]
        ),
        { status: 201 }
      );
    }

    if (!title) {
      return NextResponse.json({ error: "title 또는 templateKey가 필요합니다." }, { status: 400 });
    }

    const uid = new mongoose.Types.ObjectId(auth.userId);
    const roadmap = await Roadmap.create({
      userId: uid,
      title: String(title).trim(),
      description: description ? String(description).trim() : undefined,
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      progress: 0,
      status: "active",
    });

    const stepInputs = Array.isArray(steps) ? steps : [];
    const createdSteps = stepInputs.length
      ? await RoadmapStep.insertMany(
          stepInputs.map((s: { title: string; description?: string; dueDate?: string }, i: number) => ({
            roadmapId: roadmap._id,
            userId: uid,
            title: String(s.title).trim(),
            description: s.description,
            dueDate: s.dueDate ? new Date(s.dueDate) : undefined,
            completed: false,
            sortOrder: i,
            active: i === 0,
          }))
        )
      : [];

    return NextResponse.json(
      serializeRoadmap(roadmap.toObject() as Record<string, unknown>, createdSteps as unknown as Record<string, unknown>[]),
      { status: 201 }
    );
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "로드맵을 생성하지 못했습니다." }, { status: 500 });
  }
}
