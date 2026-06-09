import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth/password';
import { DEFAULT_SIGNUP_ROLE } from '@/lib/auth/userRole';
import { syncUserAlerts } from '@/lib/alerts/generateAlerts';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      email,
      password,
      name,
      locale,
      nationality,
      university,
      region,
      residingInKorea,
      visaType,
      visaExpireDate,
    } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '이름, 이메일, 비밀번호는 필수입니다.' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: '이미 존재하는 이메일입니다.' },
        { status: 400 }
      );
    }

    const countryStatus = residingInKorea ? 'residing_korea' : 'abroad';
    let parsedVisaExpire: Date | undefined;
    if (visaExpireDate) {
      parsedVisaExpire = new Date(visaExpireDate);
      if (Number.isNaN(parsedVisaExpire.getTime())) {
        return NextResponse.json({ error: '비자 만료일 형식이 올바르지 않습니다.' }, { status: 400 });
      }
    }

    if (residingInKorea && (!visaType || !parsedVisaExpire)) {
      return NextResponse.json(
        { error: '한국 거주 시 비자 종류와 만료일을 입력해 주세요.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      email,
      password: hashedPassword,
      name: String(name).trim(),
      role: DEFAULT_SIGNUP_ROLE,
      locale: locale || 'kr',
      nationality: nationality ? String(nationality).trim() : undefined,
      university: university ? String(university).trim() : undefined,
      region: region ? String(region).trim() : undefined,
      location: region ? String(region).trim() : undefined,
      visaType: residingInKorea && visaType ? String(visaType).trim() : undefined,
      visaExpireDate: residingInKorea ? parsedVisaExpire : undefined,
      countryStatus,
      onboardingStatus: 'profile_complete',
    });

    await syncUserAlerts(user);

    return NextResponse.json(
      {
        message: '회원가입이 완료되었습니다. 로그인해 주세요.',
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      {
        error: error.message || '회원가입 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
