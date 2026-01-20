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

    return NextResponse.json({
      id: mentor._id.toString(),
      userId: mentor.userId._id?.toString() || mentor.userId.toString(),
      name: mentor.userId.name || 'Unknown',
      email: mentor.userId.email,
      avatar: mentor.userId.avatar,
      locale: mentor.userId.locale,
      title: mentor.title,
      location: mentor.location,
      languages: mentor.languages,
      specialties: mentor.specialties,
      price: mentor.price,
      availability: mentor.availability,
      photo: mentor.photo,
      verified: mentor.verified,
      bio: mentor.bio,
      rating: mentor.rating,
      reviewCount: mentor.reviewCount,
      createdAt: mentor.createdAt,
      updatedAt: mentor.updatedAt,
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

    return NextResponse.json({
      mentor: {
        id: updatedMentor!._id.toString(),
        userId: updatedMentor!.userId._id?.toString() || updatedMentor!.userId.toString(),
        name: updatedMentor!.userId.name || 'Unknown',
        title: updatedMentor!.title,
        location: updatedMentor!.location,
        languages: updatedMentor!.languages,
        specialties: updatedMentor!.specialties,
        price: updatedMentor!.price,
        availability: updatedMentor!.availability,
        photo: updatedMentor!.photo,
        verified: updatedMentor!.verified,
        bio: updatedMentor!.bio,
        rating: updatedMentor!.rating,
        reviewCount: updatedMentor!.reviewCount,
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

