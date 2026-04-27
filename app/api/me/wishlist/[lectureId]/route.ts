import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequestDb } from "@/lib/middleware/auth";
import LectureWishlist from "@/models/LectureWishlist";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { lectureId: string } }
) {
  try {
    await connectDB();
    const auth = await authenticateRequestDb(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const { lectureId } = params;
    if (!lectureId) {
      return NextResponse.json({ error: "lectureId가 필요합니다." }, { status: 400 });
    }

    await LectureWishlist.deleteOne({ userId: auth.userId, lectureId });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "찜 해제 실패" }, { status: 500 });
  }
}
