import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import { buildActionAssistantResponse } from "@/lib/ai/assistantActions";
import { createRoadmapFromTemplate } from "@/lib/roadmap/createFromTemplate";
import PersonalCalendarEvent from "@/models/PersonalCalendarEvent";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, locale = "kr", executeAction } = body;

    if (!message && !executeAction) {
      return NextResponse.json({ error: "message 또는 executeAction이 필요합니다." }, { status: 400 });
    }

    if (!executeAction) {
      const result = buildActionAssistantResponse(String(message), locale);
      return NextResponse.json(result);
    }

    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    await connectDB();

    const { type, templateKey, title, startsAt } = executeAction;

    if (type === "create_roadmap" && templateKey) {
      const result = await createRoadmapFromTemplate(auth.userId, String(templateKey));
      return NextResponse.json({
        ok: true,
        roadmapId: String(result.roadmap._id),
        redirectUrl: `/roadmap`,
      });
    }

    if (type === "create_calendar_event" && title && startsAt) {
      const uid = new mongoose.Types.ObjectId(auth.userId);
      const event = await PersonalCalendarEvent.create({
        userId: uid,
        title: String(title),
        startsAt: new Date(startsAt),
        category: "general",
        status: "planned",
        recurrence: { type: "none" },
      });
      return NextResponse.json({
        ok: true,
        eventId: String(event._id),
        redirectUrl: `/calendar`,
      });
    }

    return NextResponse.json({ error: "지원하지 않는 액션입니다." }, { status: 400 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "처리하지 못했습니다." }, { status: 500 });
  }
}
