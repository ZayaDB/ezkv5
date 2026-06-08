import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import Roadmap from "@/models/Roadmap";
import RoadmapStep from "@/models/RoadmapStep";
import { getNextStepTitle } from "@/lib/roadmap/progress";

type Params = { params: { id: string } };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const roadmap = await Roadmap.findOne({ _id: params.id, userId: uid }).lean() as Record<string, unknown> | null;
    if (!roadmap) {
      return NextResponse.json({ error: "로드맵을 찾을 수 없습니다." }, { status: 404 });
    }
    const steps = await RoadmapStep.find({ roadmapId: roadmap._id as string }).sort({ sortOrder: 1 }).lean();
    return NextResponse.json({
      id: String(roadmap._id),
      title: roadmap.title,
      description: roadmap.description,
      progress: roadmap.progress,
      priority: roadmap.priority,
      dueDate: roadmap.dueDate,
      status: roadmap.status,
      templateKey: roadmap.templateKey,
      nextStep: getNextStepTitle(
        steps.map((s) => ({ title: s.title, completed: s.completed, active: s.active }))
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
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "불러오지 못했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const body = await request.json();
    const update: Record<string, unknown> = {};
    if (body.title) update.title = String(body.title).trim();
    if (body.description !== undefined) update.description = body.description;
    if (body.priority) update.priority = body.priority;
    if (body.dueDate) update.dueDate = new Date(body.dueDate);
    if (body.status) update.status = body.status;

    const roadmap = await Roadmap.findOneAndUpdate(
      { _id: params.id, userId: uid },
      { $set: update },
      { new: true }
    ).lean() as Record<string, unknown> | null;
    if (!roadmap) {
      return NextResponse.json({ error: "로드맵을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ id: String(roadmap._id), ...update });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "수정하지 못했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const roadmap = await Roadmap.findOneAndDelete({ _id: params.id, userId: uid });
    if (!roadmap) {
      return NextResponse.json({ error: "로드맵을 찾을 수 없습니다." }, { status: 404 });
    }
    await RoadmapStep.deleteMany({ roadmapId: params.id });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "삭제하지 못했습니다." }, { status: 500 });
  }
}
