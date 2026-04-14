import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Mentor from "@/models/Mentor";
import { authenticateRequest } from "@/lib/middleware/auth";

function serialize(doc: Record<string, unknown>) {
  const uid = doc.userId as Record<string, unknown> | undefined;
  return {
    id: String(doc._id),
    userId: uid?._id ? String(uid._id) : String(doc.userId),
    title: doc.title,
    location: doc.location,
    languages: doc.languages || [],
    specialties: (doc as { specialties?: string[] }).specialties || [],
    price: doc.price,
    availability: doc.availability,
    photo: doc.photo,
    verified: doc.verified,
    bio: doc.bio,
    rating: doc.rating,
    reviewCount: doc.reviewCount,
    approvalStatus: (doc.approvalStatus as string) || "approved",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/** 본인 멘토 프로필 / 신청 상태 (목록 노출 여부와 무관) */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const row = await Mentor.findOne({ userId: auth.userId }).lean();
    if (!row) {
      return NextResponse.json({ mentor: null });
    }
    return NextResponse.json({ mentor: serialize(row as Record<string, unknown>) });
  } catch (error: any) {
    console.error("Get my mentor error:", error);
    return NextResponse.json(
      { error: error.message || "멘토 정보를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
