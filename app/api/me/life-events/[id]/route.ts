import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import PersonalCalendarEvent from "@/models/PersonalCalendarEvent";
import { normalizeRecurrence, parseDate } from "@/lib/lifePlan/recurrence";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const body = await request.json();
    const title = String(body?.title || "").trim();
    const startsAt = parseDate(body?.startsAt);
    const endsAt = body?.endsAt ? parseDate(body?.endsAt) : null;
    const categoryRaw = String(body?.category || "other");
    const category =
      categoryRaw === "personal" ||
      categoryRaw === "work" ||
      categoryRaw === "health" ||
      categoryRaw === "parttime"
        ? categoryRaw
        : "other";
    const statusRaw = String(body?.status || "planned");
    const status =
      statusRaw === "completed" || statusRaw === "cancelled" ? statusRaw : "planned";
    const recurrence = normalizeRecurrence(body?.recurrence || { type: "none" });
    const notes = body?.notes != null ? String(body.notes).slice(0, 5000) : "";
    if (!title) {
      return NextResponse.json({ error: "제목을 입력해 주세요." }, { status: 400 });
    }
    if (!startsAt) {
      return NextResponse.json({ error: "일시를 올바르게 입력해 주세요." }, { status: 400 });
    }
    if (endsAt && endsAt < startsAt) {
      return NextResponse.json({ error: "종료 일시는 시작 일시 이후여야 합니다." }, { status: 400 });
    }
    if (recurrence.until && recurrence.until < startsAt) {
      return NextResponse.json({ error: "반복 종료일은 시작일 이후여야 합니다." }, { status: 400 });
    }
    await connectDB();
    const oid = new mongoose.Types.ObjectId(params.id);
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const updated = await PersonalCalendarEvent.findOneAndUpdate(
      { _id: oid, userId: uid },
      {
        $set: {
          title,
          notes: notes || undefined,
          startsAt,
          endsAt: endsAt || undefined,
          category,
          status,
          recurrence,
        },
      },
      { new: true }
    ).lean();
    if (!updated) {
      return NextResponse.json({ error: "일정을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({
      event: {
        id: String((updated as any)._id),
        title: (updated as any).title,
        notes: (updated as any).notes || "",
        startsAt: (updated as any).startsAt,
        endsAt: (updated as any).endsAt || null,
        category: (updated as any).category || "other",
        status: (updated as any).status || "planned",
        recurrence: (updated as any).recurrence || { type: "none", interval: 1, until: null },
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "수정하지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const oid = new mongoose.Types.ObjectId(params.id);
    const uid = new mongoose.Types.ObjectId(auth.userId);
    await connectDB();
    const res = await PersonalCalendarEvent.deleteOne({ _id: oid, userId: uid });
    if (res.deletedCount === 0) {
      return NextResponse.json({ error: "일정을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "삭제하지 못했습니다." },
      { status: 500 }
    );
  }
}
