import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Session from "@/models/Session";
import Mentor from "@/models/Mentor";
import { authenticateRequest } from "@/lib/middleware/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { status } = await request.json();
    if (!["upcoming", "completed", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "유효하지 않은 상태입니다." }, { status: 400 });
    }

    const session = await Session.findById(params.id).lean();
    if (!session) {
      return NextResponse.json({ error: "세션을 찾을 수 없습니다." }, { status: 404 });
    }

    const mentorProfile = await Mentor.findOne({ userId: auth.userId }).select("_id").lean();
    const isMenteeOwner = String((session as any).menteeId) === auth.userId;
    const isMentorOwner =
      mentorProfile && String((session as any).mentorId) === String((mentorProfile as any)._id);

    if (!isMenteeOwner && !isMentorOwner && auth.role !== "admin") {
      return NextResponse.json({ error: "수정 권한이 없습니다." }, { status: 403 });
    }

    const updated = await Session.findByIdAndUpdate(
      params.id,
      { $set: { status } },
      { new: true }
    ).lean();

    return NextResponse.json({
      session: {
        id: String((updated as any)._id),
        status: (updated as any).status,
      },
    });
  } catch (error: any) {
    console.error("Patch session status error:", error);
    return NextResponse.json(
      { error: error.message || "세션 상태 변경에 실패했습니다." },
      { status: 500 }
    );
  }
}
