import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/middleware/auth';

// GET: 현재 로그인한 사용자 정보 조회
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = await User.findById(auth.userId).select('-password').lean();
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const userData = user as any;

    return NextResponse.json({
      user: {
        id: userData._id.toString(),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        locale: userData.locale,
        avatar: userData.avatar,
        bio: userData.bio,
        createdAt: userData.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: error.message || '사용자 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

