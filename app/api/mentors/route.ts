import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Mentor from '@/models/Mentor';
import { authenticateRequest } from '@/lib/middleware/auth';

// GET: 멘토 목록 조회
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const specialty = searchParams.get('specialty');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const filter: any = {};
    if (category) {
      filter.specialties = { $in: [category] };
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (specialty) {
      filter.specialties = { $in: [specialty] };
    }

    // 멘토 조회 (인증 불필요)
    const mentors = await Mentor.find(filter)
      .populate('userId', 'name email avatar')
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Mentor.countDocuments(filter);

    return NextResponse.json({
      mentors: mentors.map((mentor) => ({
        id: mentor._id.toString(),
        userId: mentor.userId._id?.toString() || mentor.userId.toString(),
        name: mentor.userId.name || 'Unknown',
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
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get mentors error:', error);
    return NextResponse.json(
      { error: error.message || '멘토 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 멘토 생성 (인증 필요)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // 인증 확인
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 멘토만 생성 가능
    if (auth.role !== 'mentor') {
      return NextResponse.json({ error: '멘토만 프로필을 생성할 수 있습니다.' }, { status: 403 });
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

    // Validation
    if (!title || !location || !bio) {
      return NextResponse.json(
        { error: '필수 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // Check if mentor profile already exists
    const existingMentor = await Mentor.findOne({ userId: auth.userId });
    if (existingMentor) {
      return NextResponse.json(
        { error: '이미 멘토 프로필이 존재합니다.' },
        { status: 400 }
      );
    }

    // Create mentor
    const mentor = await Mentor.create({
      userId: auth.userId,
      title,
      location,
      languages: languages || [],
      specialties: specialties || [],
      price: price || 0,
      availability: availability || 'available',
      photo,
      bio,
      verified: false,
      rating: 0,
      reviewCount: 0,
    });

    return NextResponse.json(
      {
        mentor: {
          id: mentor._id.toString(),
          userId: mentor.userId.toString(),
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
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create mentor error:', error);
    return NextResponse.json(
      { error: error.message || '멘토 프로필 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

