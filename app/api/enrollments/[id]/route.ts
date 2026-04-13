import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Enrollment from "@/models/Enrollment";
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
    if (!["active", "completed", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "유효하지 않은 상태입니다." }, { status: 400 });
    }

    const enrollment = await Enrollment.findById(params.id).lean();
    if (!enrollment) {
      return NextResponse.json({ error: "수강 정보를 찾을 수 없습니다." }, { status: 404 });
    }
    if (String((enrollment as any).userId) !== auth.userId && auth.role !== "admin") {
      return NextResponse.json({ error: "수정 권한이 없습니다." }, { status: 403 });
    }

    const updated = await Enrollment.findByIdAndUpdate(
      params.id,
      { $set: { status } },
      { new: true }
    ).lean();

    return NextResponse.json({
      enrollment: {
        id: String((updated as any)._id),
        status: (updated as any).status,
      },
    });
  } catch (error: any) {
    console.error("Patch enrollment status error:", error);
    return NextResponse.json(
      { error: error.message || "수강 상태 변경에 실패했습니다." },
      { status: 500 }
    );
  }
}
