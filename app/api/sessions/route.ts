import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Session from "@/models/Session";
import Mentor from "@/models/Mentor";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const mentorProfile = await Mentor.findOne({ userId: auth.userId }).lean();
    const mentorId = mentorProfile ? String((mentorProfile as any)._id) : null;

    const query = mentorId
      ? { $or: [{ menteeId: auth.userId }, { mentorId }] }
      : { menteeId: auth.userId };

    const rows = await Session.find(query)
      .populate({
        path: "mentorId",
        select: "userId title",
        populate: { path: "userId", select: "name" },
      })
      .populate("menteeId", "name")
      .sort({ date: 1 })
      .lean();

    const sessions = rows.map((row: any) => {
      const mentorName = row.mentorId?.userId?.name || "멘토";
      const menteeName = row.menteeId?.name || "멘티";
      return {
        id: String(row._id),
        date: row.date,
        duration: row.duration,
        type: row.type,
        status: row.status,
        mentorId: row.mentorId?._id ? String(row.mentorId._id) : null,
        mentorName,
        menteeId: row.menteeId?._id ? String(row.menteeId._id) : null,
        menteeName,
      };
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { error: error.message || "세션 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { mentorId, date, duration, type, notes } = await request.json();
    if (!mentorId || !date) {
      return NextResponse.json({ error: "mentorId와 date는 필수입니다." }, { status: 400 });
    }

    const mentor = await Mentor.findById(mentorId).lean();
    if (!mentor) {
      return NextResponse.json({ error: "멘토 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    const mentorUserId = String((mentor as any).userId);
    if (mentorUserId === auth.userId) {
      return NextResponse.json({ error: "본인 멘토 프로필에는 예약할 수 없습니다." }, { status: 400 });
    }

    const bookingDate = new Date(date);
    if (Number.isNaN(bookingDate.getTime())) {
      return NextResponse.json({ error: "유효하지 않은 날짜입니다." }, { status: 400 });
    }

    const mentorUser = await User.findById((mentor as any).userId).select("name").lean();

    const created = await Session.create({
      mentorId,
      menteeId: auth.userId,
      date: bookingDate,
      duration: typeof duration === "number" ? duration : 60,
      type: type === "offline" ? "offline" : "online",
      status: "upcoming",
      notes: typeof notes === "string" ? notes : undefined,
    });

    return NextResponse.json(
      {
        session: {
          id: String(created._id),
          mentorId: String((created as any).mentorId),
          mentorName: mentorUser?.name || "멘토",
          date: created.date,
          duration: created.duration,
          type: created.type,
          status: created.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create session error:", error);
    return NextResponse.json(
      { error: error.message || "세션 예약에 실패했습니다." },
      { status: 500 }
    );
  }
}
