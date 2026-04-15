import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import PersonalCalendarEvent from "@/models/PersonalCalendarEvent";

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
    const rows = await PersonalCalendarEvent.find({
      userId: uid,
      startsAt: { $gte: from, $lte: to },
    })
      .sort({ startsAt: 1 })
      .lean();
    const events = rows.map((r: any) => ({
      id: String(r._id),
      title: r.title,
      notes: r.notes || "",
      startsAt: r.startsAt,
    }));
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
    const startsAtRaw = body?.startsAt;
    const notes = body?.notes != null ? String(body.notes).slice(0, 5000) : "";
    if (!title) {
      return NextResponse.json({ error: "제목을 입력해 주세요." }, { status: 400 });
    }
    const startsAt = new Date(startsAtRaw);
    if (Number.isNaN(startsAt.getTime())) {
      return NextResponse.json({ error: "일시를 올바르게 입력해 주세요." }, { status: 400 });
    }
    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const doc = await PersonalCalendarEvent.create({
      userId: uid,
      title,
      notes: notes || undefined,
      startsAt,
    });
    return NextResponse.json({
      event: {
        id: String(doc._id),
        title: doc.title,
        notes: doc.notes || "",
        startsAt: doc.startsAt,
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
