import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import PersonalCalendarEvent from "@/models/PersonalCalendarEvent";
import {
  expandRecurringDates,
  normalizeRecurrence,
  parseDate,
} from "@/lib/lifePlan/recurrence";

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");
    if (!fromStr || !toStr) {
      return NextResponse.json(
        { error: "from, to 쿼리(ISO 날짜)가 필요합니다." },
        { status: 400 }
      );
    }
    const from = new Date(fromStr);
    const to = new Date(toStr);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return NextResponse.json({ error: "날짜 형식이 올바르지 않습니다." }, { status: 400 });
    }
    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const rows = await PersonalCalendarEvent.find({ userId: uid })
      .sort({ startsAt: 1 })
      .lean();
    const events = rows.flatMap((r: any) => {
      const recurrence = normalizeRecurrence(r.recurrence || { type: "none" });
      const startsAt = new Date(r.startsAt);
      const endsAt = r.endsAt ? new Date(r.endsAt) : null;
      const instances = expandRecurringDates({
        startsAt,
        from,
        to,
        recurrence,
      });
      return instances.map((instanceDate) => {
        const durationMs = endsAt ? Math.max(0, endsAt.getTime() - startsAt.getTime()) : 0;
        const instanceEndAt = durationMs > 0 ? new Date(instanceDate.getTime() + durationMs) : null;
        return {
          id: `${String(r._id)}:${instanceDate.toISOString()}`,
          sourceId: String(r._id),
          title: r.title,
          notes: r.notes || "",
          startsAt: instanceDate,
          endsAt: instanceEndAt,
          category: r.category || "other",
          status: r.status || "planned",
          recurrence,
        };
      });
    });
    return NextResponse.json({ events });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const doc = await PersonalCalendarEvent.create({
      userId: uid,
      title,
      notes: notes || undefined,
      startsAt,
      endsAt: endsAt || undefined,
      category,
      status,
      recurrence,
    });
    return NextResponse.json({
      event: {
        id: String(doc._id),
        title: doc.title,
        notes: doc.notes || "",
        startsAt: doc.startsAt,
        endsAt: doc.endsAt || null,
        category: doc.category,
        status: doc.status,
        recurrence: doc.recurrence,
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "저장하지 못했습니다." },
      { status: 500 }
    );
  }
}
