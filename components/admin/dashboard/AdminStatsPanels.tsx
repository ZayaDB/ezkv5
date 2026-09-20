"use client";

import { useRouter } from "next/navigation";
import {
  Users,
  GraduationCap,
  Calendar,
  BarChart3,
  UserPlus,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import type { AdminStats, StatsPeriod } from "./types";

const periodLabels: Record<StatsPeriod, string> = {
  all: "전체",
  day: "오늘",
  month: "이번 달",
  year: "올해",
};

type Props = {
  locale: string;
  stats: AdminStats;
  period: StatsPeriod;
  onPeriodChange: (p: StatsPeriod) => void;
};

export default function AdminStatsPanels({ locale, stats, period, onPeriodChange }: Props) {
  const router = useRouter();
  const maxSignup = Math.max(...stats.monthlySignups.map((m) => m.count), 1);

  return (
    <>
      <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-wrap gap-3">
          {(Object.keys(periodLabels) as StatsPeriod[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onPeriodChange(key)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                period === key
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300"
              }`}
            >
              {periodLabels[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Users className="w-6 h-6 text-primary-600" />}
          iconBg="bg-primary-100"
          value={stats.totals.users}
          label="전체 사용자"
          delta={stats.periodStats.newUsers}
          deltaClass="text-primary-600"
        />
        <StatCard
          icon={<GraduationCap className="w-6 h-6 text-accent-600" />}
          iconBg="bg-accent-100"
          value={stats.totals.mentors}
          label="멘토"
          delta={stats.periodStats.newMentors}
          deltaClass="text-accent-600"
        />
        <StatCard
          icon={<UserPlus className="w-6 h-6 text-green-600" />}
          iconBg="bg-green-100"
          value={stats.totals.mentees}
          label="학생 (멘티)"
          delta={stats.periodStats.newMentees}
          deltaClass="text-green-600"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6 text-purple-600" />}
          iconBg="bg-purple-100"
          value={stats.totals.sessions}
          label="세션"
          delta={stats.periodStats.newSessions}
          deltaClass="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary-500" />
            역할별 통계
          </h2>
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => router.push(`/${locale}/admin/users?role=mentee`)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <RoleRow icon={<Users className="w-5 h-5 text-primary-600" />} bg="bg-primary-100" label="학생 (멘티)" />
              <span className="text-2xl font-bold text-primary-600">{stats.roleStats.mentee}</span>
            </button>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <RoleRow icon={<GraduationCap className="w-5 h-5 text-accent-600" />} bg="bg-accent-100" label="멘토" />
              <span className="text-2xl font-bold text-accent-600">{stats.roleStats.mentor}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <RoleRow icon={<Users className="w-5 h-5 text-purple-600" />} bg="bg-purple-100" label="관리자" />
              <span className="text-2xl font-bold text-purple-600">{stats.roleStats.admin}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-500" />
            세션 상태
          </h2>
          <SessionRow label="예정된 세션" value={stats.sessionStatus.upcoming} color="text-blue-600" />
          <SessionRow label="완료된 세션" value={stats.sessionStatus.completed} color="text-green-600" />
          <SessionRow label="취소된 세션" value={stats.sessionStatus.cancelled} color="text-red-600" />
        </div>
      </div>

      {stats.monthlySignups.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-500" />
            월별 가입 추이 (최근 12개월)
          </h2>
          <div className="space-y-3">
            {stats.monthlySignups.map((item, index) => (
              <div key={`${item.year}-${item.month}-${index}`} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">
                  {item.year}년 {item.month}월
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-accent-500 h-full rounded-full flex items-center justify-end pr-3 min-w-[2rem]"
                    style={{ width: `${(item.count / maxSignup) * 100}%` }}
                  >
                    <span className="text-white text-sm font-semibold">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({
  icon,
  iconBg,
  value,
  label,
  delta,
  deltaClass,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: number;
  label: string;
  delta: number;
  deltaClass: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>{icon}</div>
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      <p className="text-gray-600 font-medium">{label}</p>
      <p className="text-sm text-gray-500 mt-1">
        기간 내 신규: <span className={`font-semibold ${deltaClass}`}>{delta}</span>
      </p>
    </div>
  );
}

function RoleRow({ icon, bg, label }: { icon: React.ReactNode; bg: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>{icon}</div>
      <span className="font-semibold text-gray-900">{label}</span>
    </div>
  );
}

function SessionRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4 last:mb-0">
      <span className="font-semibold text-gray-900">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
  );
}
