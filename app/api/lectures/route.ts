import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Lecture from "@/models/Lecture";
import { authenticateRequestDb } from "@/lib/middleware/auth";
import { queryLectures, docToLecture } from "@/lib/data/queries";
import { canManageOwnLectures } from "@/lib/auth/mentorAccess";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine");

    if (mine === "1") {
      await connectDB();
      const auth = await authenticateRequestDb(request);
      if (!auth) {
        return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
      }
      const allowed = await canManageOwnLectures(auth.userId, auth.role);
      if (!allowed) {
        return NextResponse.json({ error: "멘토 권한이 없습니다." }, { status: 403 });
      }

      const raw = await Lecture.find({ instructorId: auth.userId })
        .populate("instructorId", "name")
        .sort({ createdAt: -1 })
        .lean();

      const lectures = raw.map((row) => {
        const r = row as Record<string, unknown>;
        const ins = r.instructorId as { name?: string } | undefined;
        return docToLecture(r, ins?.name || "강사");
      });

      return NextResponse.json({ lectures });
    }

    const type = searchParams.get("type") as "online" | "offline" | null;
    const category = searchParams.get("category") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "24", 10);

    const { lectures, total } = await queryLectures({
      type: type === "online" || type === "offline" ? type : undefined,
      category,
      page,
      limit,
    });

    return NextResponse.json({
      lectures,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (error: any) {
    console.error("Get lectures error:", error);
    return NextResponse.json(
      { error: error.message || "강의 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await authenticateRequestDb(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const allowed = await canManageOwnLectures(auth.userId, auth.role);
    if (!allowed) {
      return NextResponse.json({ error: "멘토만 강의를 등록할 수 있습니다." }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      type,
      category,
      price,
      duration,
      description,
      image,
      shortDescription,
      targetAudience,
      prerequisites,
      whatYouWillLearn,
      curriculum,
      totalLessons,
      totalHours,
      difficulty,
      maxStudents,
      language,
      previewVideoUrl,
      materialsIncluded,
      faq,
    } = body;

    if (!title || !type || !category || !duration || description === undefined || description === null) {
      return NextResponse.json(
        { error: "title, type, category, duration, description은 필수입니다." },
        { status: 400 }
      );
    }
    if (!shortDescription || String(shortDescription).trim().length < 20) {
      return NextResponse.json({ error: "짧은 소개는 20자 이상 입력해 주세요." }, { status: 400 });
    }
    if (!targetAudience || String(targetAudience).trim().length < 10) {
      return NextResponse.json({ error: "대상 학습자를 10자 이상 입력해 주세요." }, { status: 400 });
    }
    if (!Array.isArray(whatYouWillLearn) || whatYouWillLearn.filter(Boolean).length < 3) {
      return NextResponse.json({ error: "학습 포인트를 3개 이상 입력해 주세요." }, { status: 400 });
    }
    if (!Array.isArray(curriculum) || curriculum.filter(Boolean).length < 1) {
      return NextResponse.json({ error: "커리큘럼을 1개 이상 입력해 주세요." }, { status: 400 });
    }
    if (type !== "online" && type !== "offline") {
      return NextResponse.json({ error: "type은 online 또는 offline이어야 합니다." }, { status: 400 });
    }

    const created = await Lecture.create({
      title: String(title).trim(),
      instructorId: auth.userId,
      type,
      category: String(category).trim(),
      price: typeof price === "number" ? price : parseInt(String(price || 0), 10) || 0,
      duration: String(duration).trim(),
      description: String(description),
      image: typeof image === "string" ? image : "",
      shortDescription: String(shortDescription || ''),
      targetAudience: String(targetAudience || ''),
      prerequisites: String(prerequisites || ''),
      whatYouWillLearn: Array.isArray(whatYouWillLearn) ? whatYouWillLearn : [],
      curriculum: Array.isArray(curriculum) ? curriculum : [],
      totalLessons: Number(totalLessons) || 0,
      totalHours: Number(totalHours) || 0,
      difficulty: difficulty === 'advanced' || difficulty === 'intermediate' ? difficulty : 'beginner',
      maxStudents: Math.max(1, Number(maxStudents) || 30),
      language: typeof language === 'string' ? language : 'ko',
      previewVideoUrl: typeof previewVideoUrl === 'string' ? previewVideoUrl : '',
      materialsIncluded: Array.isArray(materialsIncluded) ? materialsIncluded : [],
      faq: Array.isArray(faq) ? faq : [],
      rating: 0,
      students: 0,
    });

    return NextResponse.json(
      {
        lecture: {
          id: String(created._id),
          title: created.title,
          type: created.type,
          category: created.category,
          price: created.price,
          duration: created.duration,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create lecture error:", error);
    return NextResponse.json(
      { error: error.message || "강의 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}
