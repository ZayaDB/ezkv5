import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import Mentor from '@/models/Mentor';
import Enrollment from '@/models/Enrollment';
import Session from '@/models/Session';
import { authenticateRequest } from '@/lib/middleware/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const auth = authenticateRequest(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const user = await User.findById(params.id).select('-password').lean();
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    const [mentorProfile, enrollments, sessions] = await Promise.all([
      Mentor.findOne({ userId: params.id }).lean(),
      Enrollment.find({ userId: params.id })
        .populate('lectureId', 'title category')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Session.find({ menteeId: params.id })
        .populate({
          path: 'mentorId',
          select: 'userId',
          populate: { path: 'userId', select: 'name email' },
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    return NextResponse.json({
      user: {
        id: String((user as any)._id),
        email: (user as any).email,
        name: (user as any).name,
        role: (user as any).role,
        locale: (user as any).locale,
        bio: (user as any).bio,
        location: (user as any).location,
        languages: (user as any).languages || [],
        createdAt: (user as any).createdAt,
        mentorProfile: mentorProfile
          ? {
              id: String((mentorProfile as any)._id),
              title: (mentorProfile as any).title,
              location: (mentorProfile as any).location,
              specialties: (mentorProfile as any).specialties || [],
              approvalStatus: (mentorProfile as any).approvalStatus || 'approved',
              verified: (mentorProfile as any).verified,
            }
          : null,
      },
      stats: {
        enrollmentCount: enrollments.length,
        sessionCount: sessions.length,
      },
      recentEnrollments: enrollments.map((row: any) => ({
        id: String(row._id),
        status: row.status,
        paymentStatus: row.paymentStatus,
        lectureTitle: row.lectureId?.title || '-',
        lectureCategory: row.lectureId?.category || '-',
        createdAt: row.createdAt,
      })),
      recentSessions: sessions.map((row: any) => ({
        id: String(row._id),
        status: row.status,
        type: row.type,
        date: row.date,
        mentorName: row.mentorId?.userId?.name || '멘토',
      })),
    });
  } catch (error: any) {
    console.error('Get user detail error:', error);
    return NextResponse.json(
      { error: error.message || '사용자 상세 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
