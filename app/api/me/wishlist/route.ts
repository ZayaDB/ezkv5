import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequestDb } from "@/lib/middleware/auth";
import LectureWishlist from "@/models/LectureWishlist";
import Lecture from "@/models/Lecture";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await authenticateRequestDb(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const rows = await LectureWishlist.find({ userId: auth.userId })
      .sort({ createdAt: -1 })
      .populate("lectureId", "title type category price duration rating students image description")
      .lean();

    const wishlist = rows
      .map((row: any) => {
        const lec = row.lectureId;
        if (!lec || !lec._id) return null;
        return {
          id: String(row._id),
          lectureId: String(lec._id),
          lecture: {
            id: String(lec._id),
            title: String(lec.title || ""),
            instructor: "강사",
            type: lec.type,
            category: String(lec.category || ""),
            price: Number(lec.price) || 0,
            duration: String(lec.duration || ""),
            rating: Number(lec.rating) || 0,
            students: Number(lec.students) || 0,
            image: String(lec.image || ""),
            description: String(lec.description || ""),
          },
        };
      })
      .filter(Boolean);

    return NextResponse.json({ wishlist });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "찜 목록 조회 실패" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await authenticateRequestDb(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const { lectureId } = await request.json();
    if (!lectureId) {
      return NextResponse.json({ error: "lectureId가 필요합니다." }, { status: 400 });
    }

    const lecture = await Lecture.findById(lectureId).select("_id").lean();
    if (!lecture) {
      return NextResponse.json({ error: "강의를 찾을 수 없습니다." }, { status: 404 });
    }

    await LectureWishlist.findOneAndUpdate(
      { userId: auth.userId, lectureId },
      { $setOnInsert: { userId: auth.userId, lectureId } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "찜 추가 실패" }, { status: 500 });
  }
}
