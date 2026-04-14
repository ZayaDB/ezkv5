import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Mentor from "@/models/Mentor";
import { authenticateRequestDb } from "@/lib/middleware/auth";
import { queryMentors } from "@/lib/data/queries";

// GET: 멘토 목록 조회 (승인된 공개 프로필만)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const location = searchParams.get("location");
    const specialty = searchParams.get("specialty");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    const { mentors, total } = await queryMentors({
      category: category || undefined,
      location: location || undefined,
      specialty: specialty || undefined,
      page,
      limit,
    });

    return NextResponse.json({
      mentors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error("Get mentors error:", error);
    return NextResponse.json(
      { error: error.message || "멘토 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// POST: 멘토 프로필 생성 — mentee는 심사(pending), mentor 역할은 즉시 approved(시드/운영 호환)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await authenticateRequestDb(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    if (auth.role === "admin") {
      return NextResponse.json({ error: "관리자는 이 API로 멘토 신청을 할 수 없습니다." }, { status: 400 });
    }

    const body = await request.json();
    const {
      title,
      location,
      languages,
      specialties,
      price,
      availability,
      photo,
      bio,
    } = body;

    if (!title || !location || !bio) {
      return NextResponse.json({ error: "필수 필드를 입력해주세요." }, { status: 400 });
    }

    const existing = await Mentor.findOne({ userId: auth.userId });
    if (existing) {
      const st = (existing as { approvalStatus?: string }).approvalStatus || "approved";
      if (st === "pending") {
        return NextResponse.json({ error: "이미 심사 중인 멘토 신청이 있습니다." }, { status: 409 });
      }
      if (st === "approved") {
        return NextResponse.json({ error: "이미 멘토 프로필이 있습니다." }, { status: 400 });
      }
      if (st === "rejected") {
        const updated = await Mentor.findByIdAndUpdate(
          existing._id,
          {
            $set: {
              title,
              location,
              languages: languages || [],
              specialties: specialties || [],
              price: price ?? 0,
              availability: availability || "available",
              photo,
              bio,
              approvalStatus: "pending",
              verified: false,
            },
          },
          { new: true, runValidators: true }
        ).lean();
        return NextResponse.json(
          {
            mentor: {
              id: String((updated as any)._id),
              approvalStatus: "pending",
            },
          },
          { status: 200 }
        );
      }
    }

    const approvalStatus = auth.role === "mentor" ? "approved" : "pending";

    const mentor = await Mentor.create({
      userId: auth.userId,
      title,
      location,
      languages: languages || [],
      specialties: specialties || [],
      price: price ?? 0,
      availability: availability || "available",
      photo,
      bio,
      verified: approvalStatus === "approved",
      approvalStatus,
      rating: 0,
      reviewCount: 0,
    });

    return NextResponse.json(
      {
        mentor: {
          id: (mentor as any)._id.toString(),
          userId: (mentor as any).userId.toString(),
          title: mentor.title,
          location: mentor.location,
          languages: mentor.languages,
          specialties: mentor.specialties,
          price: mentor.price,
          availability: mentor.availability,
          photo: mentor.photo,
          verified: mentor.verified,
          approvalStatus: (mentor as any).approvalStatus,
          bio: mentor.bio,
          rating: mentor.rating,
          reviewCount: mentor.reviewCount,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create mentor error:", error);
    return NextResponse.json(
      { error: error.message || "멘토 프로필 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
