import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Enrollment from "@/models/Enrollment";
import Lecture from "@/models/Lecture";
import { authenticateRequest } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const docs = await Enrollment.find({ userId: auth.userId })
      .populate("lectureId", "title category type duration price")
      .sort({ createdAt: -1 })
      .lean();

    const enrollments = docs.map((doc: any) => ({
      id: String(doc._id),
      status: doc.status,
      paymentStatus: doc.paymentStatus,
      enrolledAt: doc.enrolledAt,
      lecture: doc.lectureId
        ? {
            id: String(doc.lectureId._id),
            title: doc.lectureId.title,
            category: doc.lectureId.category,
            type: doc.lectureId.type,
            duration: doc.lectureId.duration,
            price: doc.lectureId.price,
          }
        : null,
    }));

    return NextResponse.json({ enrollments });
  } catch (error: any) {
    console.error("Get enrollments error:", error);
    return NextResponse.json(
      { error: error.message || "수강 내역을 불러오지 못했습니다." },
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

    const { lectureId } = await request.json();
    if (!lectureId || typeof lectureId !== "string") {
      return NextResponse.json({ error: "lectureId가 필요합니다." }, { status: 400 });
    }

    const lecture = await Lecture.findById(lectureId).lean();
    if (!lecture) {
      return NextResponse.json({ error: "강의를 찾을 수 없습니다." }, { status: 404 });
    }

    const existing = await Enrollment.findOne({ userId: auth.userId, lectureId }).lean();
    if (existing) {
      return NextResponse.json({ error: "이미 신청한 강의입니다." }, { status: 409 });
    }

    const created = await Enrollment.create({
      userId: auth.userId,
      lectureId,
      status: "active",
      paymentStatus: "paid",
    });

    await Lecture.findByIdAndUpdate(lectureId, { $inc: { students: 1 } });

    return NextResponse.json(
      {
        enrollment: {
          id: String(created._id),
          lectureId,
          status: created.status,
          paymentStatus: created.paymentStatus,
          enrolledAt: created.enrolledAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create enrollment error:", error);
    return NextResponse.json(
      { error: error.message || "수강 신청에 실패했습니다." },
      { status: 500 }
    );
  }
}
