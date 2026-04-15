import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import PersonalCalendarEvent from "@/models/PersonalCalendarEvent";

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
