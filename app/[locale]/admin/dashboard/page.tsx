'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/contexts/AuthContext';
import { adminApi } from '@/lib/api/client';
import { Users, GraduationCap, Calendar, TrendingUp, BarChart3, UserPlus, BookOpen } from 'lucide-react';

interface Stats {
  period: string;
  totals: {
    users: number;
    mentors: number;
    mentees: number;
    sessions: number;
  };
  periodStats: {
    newUsers: number;
    newMentors: number;
    newMentees: number;
    newSessions: number;
  };
  roleStats: {
    mentee: number;
    mentor: number;
    admin: number;
  };
  monthlySignups: Array<{ year: number; month: number; count: number }>;
  sessionStatus: {
    upcoming: number;
    completed: number;
    cancelled: number;
  };
}

export default function AdminDashboardPage() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'all' | 'day' | 'month' | 'year'>('all');

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'admin')) {
      router.push(`/${locale}/login`);
      return;
    }
    if (currentUser && currentUser.role === 'admin') {
      loadStats();
    }
  }, [period, currentUser, authLoading, locale, router]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getStats(period);
      if (response.data) {
        setStats(response.data);
      } else {
        console.error('Failed to load stats:', response.error);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading || !stats || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">통계를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-500 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
            관리자 대시보드
          </h1>
          <p className="text-xl text-white/90">
            {currentUser?.name}님, 환영합니다
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Period Filter */}
        <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={() => setPeriod('all')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                period === 'all'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setPeriod('day')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                period === 'day'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300'
              }`}
            >
              오늘
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                period === 'month'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300'
              }`}
            >
              이번 달
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                period === 'year'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300'
              }`}
            >
              올해
            </button>
          </div>
        </div>

        {/* Total Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.totals.users}</span>
            </div>
            <p className="text-gray-600 font-medium">전체 사용자</p>
            <p className="text-sm text-gray-500 mt-1">
              기간 내 신규: <span className="font-semibold text-primary-600">{stats.periodStats.newUsers}</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-accent-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.totals.mentors}</span>
            </div>
            <p className="text-gray-600 font-medium">멘토</p>
            <p className="text-sm text-gray-500 mt-1">
              기간 내 신규: <span className="font-semibold text-accent-600">{stats.periodStats.newMentors}</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.totals.mentees}</span>
            </div>
            <p className="text-gray-600 font-medium">학생 (멘티)</p>
            <p className="text-sm text-gray-500 mt-1">
              기간 내 신규: <span className="font-semibold text-green-600">{stats.periodStats.newMentees}</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.totals.sessions}</span>
            </div>
            <p className="text-gray-600 font-medium">세션</p>
            <p className="text-sm text-gray-500 mt-1">
              기간 내 신규: <span className="font-semibold text-purple-600">{stats.periodStats.newSessions}</span>
            </p>
          </div>
        </div>

        {/* Role Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary-500" />
              역할별 통계
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="font-semibold text-gray-900">학생 (멘티)</span>
                </div>
                <span className="text-2xl font-bold text-primary-600">{stats.roleStats.mentee}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-accent-600" />
                  </div>
                  <span className="font-semibold text-gray-900">멘토</span>
                </div>
                <span className="text-2xl font-bold text-accent-600">{stats.roleStats.mentor}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-semibold text-gray-900">관리자</span>
                </div>
                <span className="text-2xl font-bold text-purple-600">{stats.roleStats.admin}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary-500" />
              세션 상태
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="font-semibold text-gray-900">예정된 세션</span>
                <span className="text-2xl font-bold text-blue-600">{stats.sessionStatus.upcoming}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="font-semibold text-gray-900">완료된 세션</span>
                <span className="text-2xl font-bold text-green-600">{stats.sessionStatus.completed}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="font-semibold text-gray-900">취소된 세션</span>
                <span className="text-2xl font-bold text-red-600">{stats.sessionStatus.cancelled}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Signups Chart */}
        {stats.monthlySignups.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary-500" />
              월별 가입 추이 (최근 12개월)
            </h2>
            <div className="space-y-3">
              {stats.monthlySignups.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-600">
                    {item.year}년 {item.month}월
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-accent-500 h-full rounded-full flex items-center justify-end pr-3"
                      style={{ width: `${(item.count / Math.max(...stats.monthlySignups.map(m => m.count))) * 100}%` }}
                    >
                      <span className="text-white text-sm font-semibold">{item.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

