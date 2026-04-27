import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/middleware/auth';
import { comparePassword, hashPassword } from '@/lib/auth/password';

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
    phone: userData.phone,
    address: userData.address,
    languages: userData.languages || [],
    createdAt: userData.createdAt,
  };
}

function isValidPhone(v: string): boolean {
  return /^[0-9+\-\s()]{8,20}$/.test(v);
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
    const { name, avatar, bio, location, phone, address, languages, locale, currentPassword, newPassword } = body;

    const update: Record<string, unknown> = {};
    if (typeof name === 'string') {
      const vv = name.trim();
      if (!vv) {
        return NextResponse.json({ error: '이름은 필수입니다.' }, { status: 400 });
      }
      if (vv.length < 2 || vv.length > 40) {
        return NextResponse.json({ error: '이름은 2~40자로 입력해 주세요.' }, { status: 400 });
      }
      update.name = vv;
    }
    if (typeof avatar === 'string') update.avatar = avatar;
    if (typeof bio === 'string') update.bio = bio;
    if (typeof location === 'string') {
      const vv = location.trim();
      if (!vv) {
        return NextResponse.json({ error: '활동 지역은 필수입니다.' }, { status: 400 });
      }
      if (vv.length < 2 || vv.length > 80) {
        return NextResponse.json({ error: '활동 지역은 2~80자로 입력해 주세요.' }, { status: 400 });
      }
      update.location = vv;
    }
    if (typeof phone === 'string') {
      const vv = phone.trim();
      if (!vv) {
        return NextResponse.json({ error: '전화번호는 필수입니다.' }, { status: 400 });
      }
      if (!isValidPhone(vv)) {
        return NextResponse.json({ error: '전화번호 형식이 올바르지 않습니다.' }, { status: 400 });
      }
      update.phone = vv;
    }
    if (typeof address === 'string') update.address = address;
    if (Array.isArray(languages)) update.languages = languages.filter((x: unknown) => typeof x === 'string');
    if (locale === 'kr' || locale === 'en' || locale === 'mn') update.locale = locale;

    if (newPassword !== undefined && newPassword !== null && newPassword !== '') {
      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return NextResponse.json({ error: '새 비밀번호는 최소 6자 이상이어야 합니다.' }, { status: 400 });
      }
      if (typeof currentPassword !== 'string' || !currentPassword) {
        return NextResponse.json({ error: '현재 비밀번호를 입력해 주세요.' }, { status: 400 });
      }
      const userForPassword = await User.findById(auth.userId).select('+password').lean();
      if (!userForPassword) {
        return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
      }
      const ok = await comparePassword(
        currentPassword,
        (userForPassword as { password?: string }).password || ''
      );
      if (!ok) {
        return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, { status: 400 });
      }
      update.password = await hashPassword(newPassword);
    }

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
