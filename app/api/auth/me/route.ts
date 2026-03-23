import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/middleware/auth';

function publicUser(userData: Record<string, unknown>) {
  return {
    id: userData._id?.toString(),
    email: userData.email,
    name: userData.name,
    role: userData.role,
    locale: userData.locale,
    avatar: userData.avatar,
    bio: userData.bio,
    location: userData.location,
    languages: userData.languages || [],
    createdAt: userData.createdAt,
  };
}

// GET: 현재 로그인한 사용자 정보 조회
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const user = await User.findById(auth.userId).select('-password').lean();
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({
      user: publicUser(user as Record<string, unknown>),
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: error.message || '사용자 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PATCH: 프로필 수정 (본인)
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio, location, languages, locale } = body;

    const update: Record<string, unknown> = {};
    if (typeof name === 'string' && name.trim()) update.name = name.trim();
    if (typeof bio === 'string') update.bio = bio;
    if (typeof location === 'string') update.location = location;
    if (Array.isArray(languages)) update.languages = languages.filter((x: unknown) => typeof x === 'string');
    if (locale === 'kr' || locale === 'en' || locale === 'mn') update.locale = locale;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: '수정할 항목이 없습니다.' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(auth.userId, { $set: update }, { new: true })
      .select('-password')
      .lean();

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ user: publicUser(user as Record<string, unknown>) });
  } catch (error: any) {
    console.error('Patch user error:', error);
    return NextResponse.json(
      { error: error.message || '프로필 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
