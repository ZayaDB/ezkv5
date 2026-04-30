import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Lecture from '@/models/Lecture';
import { authenticateRequestDb } from '@/lib/middleware/auth';
import { canManageOwnLectures } from '@/lib/auth/mentorAccess';
import { queryLectureById } from '@/lib/data/queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lecture = await queryLectureById(params.id);
    if (!lecture) {
      return NextResponse.json({ error: '강의를 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(lecture);
  } catch (error: any) {
    console.error('Get lecture error:', error);
    return NextResponse.json(
      { error: error.message || '강의 정보를 불러오지 못했습니다.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const auth = await authenticateRequestDb(request);
    if (!auth) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }
    const allowed = await canManageOwnLectures(auth.userId, auth.role);
    if (!allowed) {
      return NextResponse.json({ error: '멘토 권한이 없습니다.' }, { status: 403 });
    }

    const existing = await Lecture.findById(params.id).lean();
    if (!existing) {
      return NextResponse.json({ error: '강의를 찾을 수 없습니다.' }, { status: 404 });
    }
    if (String((existing as any).instructorId) !== auth.userId) {
      return NextResponse.json({ error: '본인 강의만 수정할 수 있습니다.' }, { status: 403 });
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
        { error: 'title, type, category, duration, description은 필수입니다.' },
        { status: 400 }
      );
    }
    if (!shortDescription || String(shortDescription).trim().length < 20) {
      return NextResponse.json({ error: '짧은 소개는 20자 이상 입력해 주세요.' }, { status: 400 });
    }
    if (!targetAudience || String(targetAudience).trim().length < 10) {
      return NextResponse.json({ error: '대상 학습자를 10자 이상 입력해 주세요.' }, { status: 400 });
    }
    if (!Array.isArray(whatYouWillLearn) || whatYouWillLearn.filter(Boolean).length < 3) {
      return NextResponse.json({ error: '학습 포인트를 3개 이상 입력해 주세요.' }, { status: 400 });
    }
    if (!Array.isArray(curriculum) || curriculum.filter(Boolean).length < 1) {
      return NextResponse.json({ error: '커리큘럼을 1개 이상 입력해 주세요.' }, { status: 400 });
    }
    if (type !== 'online' && type !== 'offline') {
      return NextResponse.json({ error: 'type은 online 또는 offline이어야 합니다.' }, { status: 400 });
    }

    const updated = await Lecture.findByIdAndUpdate(
      params.id,
      {
        title: String(title).trim(),
        type,
        category: String(category).trim(),
        price: typeof price === 'number' ? price : parseInt(String(price || 0), 10) || 0,
        duration: String(duration).trim(),
        description: String(description),
        image: typeof image === 'string' ? image : '',
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
      },
      { new: true }
    );

    return NextResponse.json({
      lecture: {
        id: String(updated!._id),
        title: updated!.title,
        type: updated!.type,
        category: updated!.category,
        price: updated!.price,
        duration: updated!.duration,
      },
    });
  } catch (error: any) {
    console.error('Update lecture error:', error);
    return NextResponse.json(
      { error: error.message || '강의 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}
