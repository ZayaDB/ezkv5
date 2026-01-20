import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Mentor from '@/models/Mentor';
import { authenticateRequest } from '@/lib/middleware/auth';

// GET: 특정 멘토 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const mentor = await Mentor.findById(params.id)
      .populate('userId', 'name email avatar locale')
      .lean();

    if (!mentor) {
      return NextResponse.json(
        { error: '멘토를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const mentorData = mentor as any;

    return NextResponse.json({
      id: mentorData._id.toString(),
      userId: mentorData.userId._id?.toString() || mentorData.userId.toString(),
      name: mentorData.userId.name || 'Unknown',
      email: mentorData.userId.email,
      avatar: mentorData.userId.avatar,
      locale: mentorData.userId.locale,
      title: mentorData.title,
      location: mentorData.location,
      languages: mentorData.languages,
      specialties: mentorData.specialties,
      price: mentorData.price,
      availability: mentorData.availability,
      photo: mentorData.photo,
      verified: mentorData.verified,
      bio: mentorData.bio,
      rating: mentorData.rating,
      reviewCount: mentorData.reviewCount,
      createdAt: mentorData.createdAt,
      updatedAt: mentorData.updatedAt,
    });
  } catch (error: any) {
    console.error('Get mentor error:', error);
    return NextResponse.json(
      { error: error.message || '멘토 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 멘토 정보 수정 (인증 필요, 본인만)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const mentor = await Mentor.findById(params.id);
    if (!mentor) {
      return NextResponse.json(
        { error: '멘토를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 본인만 수정 가능
    if (mentor.userId.toString() !== auth.userId) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updatedMentor = await Mentor.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email avatar')
      .lean();

    const updatedMentorData = updatedMentor as any;

    return NextResponse.json({
      mentor: {
        id: updatedMentorData._id.toString(),
        userId: updatedMentorData.userId._id?.toString() || updatedMentorData.userId.toString(),
        name: updatedMentorData.userId.name || 'Unknown',
        title: updatedMentorData.title,
        location: updatedMentorData.location,
        languages: updatedMentorData.languages,
        specialties: updatedMentorData.specialties,
        price: updatedMentorData.price,
        availability: updatedMentorData.availability,
        photo: updatedMentorData.photo,
        verified: updatedMentorData.verified,
        bio: updatedMentorData.bio,
        rating: updatedMentorData.rating,
        reviewCount: updatedMentorData.reviewCount,
      },
    });
  } catch (error: any) {
    console.error('Update mentor error:', error);
    return NextResponse.json(
      { error: error.message || '멘토 정보 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 멘토 프로필 삭제 (인증 필요, 본인만)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const mentor = await Mentor.findById(params.id);
    if (!mentor) {
      return NextResponse.json(
        { error: '멘토를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 본인만 삭제 가능
    if (mentor.userId.toString() !== auth.userId) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    await Mentor.findByIdAndDelete(params.id);

    return NextResponse.json({ message: '멘토 프로필이 삭제되었습니다.' });
  } catch (error: any) {
    console.error('Delete mentor error:', error);
    return NextResponse.json(
      { error: error.message || '멘토 프로필 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

