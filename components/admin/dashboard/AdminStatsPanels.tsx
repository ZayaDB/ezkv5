"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
import { formatDate } from "@/lib/i18n/dateFormat";

const PERIODS: StatsPeriod[] = ["all", "day", "month", "year"];
const periodKey: Record<StatsPeriod, string> = {
  all: "periodAll",
  day: "periodDay",
  month: "periodMonth",
  year: "periodYear",
};

type Props = {
  locale: string;
  stats: AdminStats;
  period: StatsPeriod;
  onPeriodChange: (p: StatsPeriod) => void;
};

export default function AdminStatsPanels({ locale, stats, period, onPeriodChange }: Props) {
  const router = useRouter();
  const t = useTranslations("admin");
  const maxSignup = Math.max(...stats.monthlySignups.map((m) => m.count), 1);

  return (
    <>
      <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg border border-brand-line">
        <div className="flex flex-wrap gap-3">
          {PERIODS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onPeriodChange(key)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                period === key
                  ? "bg-brand text-white shadow-md"
                  : "bg-white border-2 border-brand-line text-brand-ink hover:border-primary-300"
              }`}
            >
              {t(periodKey[key])}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Users className="w-6 h-6 text-primary-600" />}
          iconBg="bg-primary-100"
          value={stats.totals.users}
          label={t("totalUsers")}
          delta={stats.periodStats.newUsers}
          deltaClass="text-primary-600"
        />
        <StatCard
          icon={<GraduationCap className="w-6 h-6 text-brand-deep" />}
          iconBg="bg-brand-sun/30"
          value={stats.totals.mentors}
          label={t("roleMentor")}
          delta={stats.periodStats.newMentors}
          deltaClass="text-brand-deep"
        />
        <StatCard
          icon={<UserPlus className="w-6 h-6 text-green-600" />}
          iconBg="bg-green-100"
          value={stats.totals.mentees}
          label={t("roleMenteeLong")}
          delta={stats.periodStats.newMentees}
          deltaClass="text-green-600"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6 text-purple-600" />}
          iconBg="bg-purple-100"
          value={stats.totals.sessions}
          label={t("sessions")}
          delta={stats.periodStats.newSessions}
          deltaClass="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-line">
          <h2 className="text-2xl font-bold text-brand-ink mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary-500" />
            {t("roleStats")}
          </h2>
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => router.push(`/${locale}/admin/users?role=mentee`)}
              className="w-full flex items-center justify-between p-4 bg-brand-mist rounded-xl hover:bg-brand-mist transition-colors text-left"
            >
              <RoleRow icon={<Users className="w-5 h-5 text-primary-600" />} bg="bg-primary-100" label={t("roleMenteeLong")} />
              <span className="text-2xl font-bold text-primary-600">{stats.roleStats.mentee}</span>
            </button>
            <div className="flex items-center justify-between p-4 bg-brand-mist rounded-xl">
              <RoleRow icon={<GraduationCap className="w-5 h-5 text-brand-deep" />} bg="bg-brand-sun/30" label={t("roleMentor")} />
              <span className="text-2xl font-bold text-brand-deep">{stats.roleStats.mentor}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-brand-mist rounded-xl">
              <RoleRow icon={<Users className="w-5 h-5 text-purple-600" />} bg="bg-purple-100" label={t("roleAdmin")} />
              <span className="text-2xl font-bold text-purple-600">{stats.roleStats.admin}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-line">
          <h2 className="text-2xl font-bold text-brand-ink mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-500" />
            {t("sessionStatus")}
          </h2>
          <SessionRow label={t("sessionUpcoming")} value={stats.sessionStatus.upcoming} color="text-blue-600" />
          <SessionRow label={t("sessionCompleted")} value={stats.sessionStatus.completed} color="text-green-600" />
          <SessionRow label={t("sessionCancelled")} value={stats.sessionStatus.cancelled} color="text-red-600" />
        </div>
      </div>

      {stats.monthlySignups.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-line">
          <h2 className="text-2xl font-bold text-brand-ink mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-500" />
            {t("monthlySignups")}
          </h2>
          <div className="space-y-3">
            {stats.monthlySignups.map((item, index) => (
              <div key={`${item.year}-${item.month}-${index}`} className="flex items-center gap-4">
                <div className="w-24 text-sm text-brand-soft">
                  {formatDate(new Date(item.year, item.month - 1, 1), locale, { year: "numeric", month: "short" })}
                </div>
                <div className="flex-1 bg-brand-mist rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-brand h-full rounded-full flex items-center justify-end pr-3 min-w-[2rem]"
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
  const t = useTranslations("admin");
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-line">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>{icon}</div>
        <span className="text-2xl font-bold text-brand-ink">{value}</span>
      </div>
      <p className="text-brand-soft font-medium">{label}</p>
      <p className="text-sm text-brand-soft mt-1">
        {t("newInPeriod")} <span className={`font-semibold ${deltaClass}`}>{delta}</span>
      </p>
    </div>
  );
}

function RoleRow({ icon, bg, label }: { icon: React.ReactNode; bg: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>{icon}</div>
      <span className="font-semibold text-brand-ink">{label}</span>
    </div>
  );
}

function SessionRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-brand-mist rounded-xl mb-4 last:mb-0">
      <span className="font-semibold text-brand-ink">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
  );
}
