import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import Mentor from '@/models/Mentor';
import Session from '@/models/Session';
import { authenticateRequest } from '@/lib/middleware/auth';

// GET: Admin 통계 조회
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Admin 권한 확인
    const auth = authenticateRequest(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // all, day, month, year

    // 날짜 필터 설정
    let dateFilter: any = {};
    const now = new Date();
    
    if (period === 'day') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { createdAt: { $gte: startOfDay } };
    } else if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { createdAt: { $gte: startOfMonth } };
    } else if (period === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      dateFilter = { createdAt: { $gte: startOfYear } };
    }

    // 전체 통계
    const totalUsers = await User.countDocuments();
    const totalMentors = await Mentor.countDocuments();
    const totalMentees = await User.countDocuments({ role: 'mentee' });
    const totalSessions = await Session.countDocuments();

    // 기간별 통계
    const newUsers = await User.countDocuments(dateFilter);
    const newMentors = await Mentor.countDocuments(dateFilter);
    const newMentees = await User.countDocuments({ ...dateFilter, role: 'mentee' });
    const newSessions = await Session.countDocuments(dateFilter);

    // 역할별 사용자 수
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const roleStats = {
      mentee: usersByRole.find((r) => r._id === 'mentee')?.count || 0,
      mentor: usersByRole.find((r) => r._id === 'mentor')?.count || 0,
      admin: usersByRole.find((r) => r._id === 'admin')?.count || 0,
    };

    // 월별 가입 추이 (최근 12개월)
    const monthlySignups = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    // 멘토별 세션 수
    const sessionsByMentor = await Session.aggregate([
      {
        $group: {
          _id: '$mentorId',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // 세션 상태별 통계
    const sessionsByStatus = await Session.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusStats = {
      upcoming: sessionsByStatus.find((s) => s._id === 'upcoming')?.count || 0,
      completed: sessionsByStatus.find((s) => s._id === 'completed')?.count || 0,
      cancelled: sessionsByStatus.find((s) => s._id === 'cancelled')?.count || 0,
    };

    return NextResponse.json({
      period,
      totals: {
        users: totalUsers,
        mentors: totalMentors,
        mentees: totalMentees,
        sessions: totalSessions,
      },
      periodStats: {
        newUsers,
        newMentors,
        newMentees,
        newSessions,
      },
      roleStats,
      monthlySignups: monthlySignups.map((m) => ({
        year: m._id.year,
        month: m._id.month,
        count: m.count,
      })),
      topMentors: sessionsByMentor.length,
      sessionStatus: statusStats,
    });
  } catch (error: any) {
    console.error('Get admin stats error:', error);
    return NextResponse.json(
      { error: error.message || '통계를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

