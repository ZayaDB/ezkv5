import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import Mentor from '@/models/Mentor';
import { authenticateRequest } from '@/lib/middleware/auth';

// GET: 사용자 목록 조회 (Admin만)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Admin 권한 확인
    const auth = authenticateRequest(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // mentee, mentor, admin
    const search = searchParams.get('search'); // 이름/이메일 검색
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const filter: any = {};
    if (role) {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // 사용자 조회
    const users = await User.find(filter)
      .select('-password') // 비밀번호 제외
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(filter);

    // 각 사용자의 멘토 프로필 정보 추가
    const usersWithMentorInfo = await Promise.all(
      users.map(async (user: any) => {
        let mentorProfile = null;
        if (user.role === 'mentor') {
          mentorProfile = await Mentor.findOne({ userId: user._id })
            .select('title location specialties rating reviewCount verified')
            .lean();
        }
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          locale: user.locale,
          bio: user.bio,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          mentorProfile: mentorProfile
            ? {
                title: (mentorProfile as any).title,
                location: (mentorProfile as any).location,
                specialties: (mentorProfile as any).specialties,
                rating: (mentorProfile as any).rating,
                reviewCount: (mentorProfile as any).reviewCount,
                verified: (mentorProfile as any).verified,
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      users: usersWithMentorInfo,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: error.message || '사용자 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 사용자 삭제 (Admin만)
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    // Admin 권한 확인
    const auth = authenticateRequest(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: '사용자 ID가 필요합니다.' }, { status: 400 });
    }

    // 본인은 삭제 불가
    if (userId === auth.userId) {
      return NextResponse.json({ error: '본인 계정은 삭제할 수 없습니다.' }, { status: 400 });
    }

    // 사용자 삭제 (관련 멘토 프로필도 함께 삭제)
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 멘토 프로필이 있으면 삭제
    if (user.role === 'mentor') {
      await Mentor.deleteOne({ userId: user._id });
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json({ message: '사용자가 삭제되었습니다.' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: error.message || '사용자 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

