"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import PlatformCard from "@/components/ui/PlatformCard";

type DashboardMode = "mentee" | "mentor";

export default function ModeSidePanel({
  mode,
  locale,
  t,
  loadingStats,
  stats,
  recentEnrollments,
  recentSessions,
  labelEnrollment,
  labelSession,
  onSessionStatus,
  isAdmin,
  formatDateTime,
}: {
  mode: DashboardMode;
  locale: string;
  t: (key: string, values?: Record<string, any>) => string;
  loadingStats: boolean;
  stats: { myEnrollmentsCount: number; myUpcomingSessionsCount: number; studyInfoCount: number };
  recentEnrollments: any[];
  recentSessions: any[];
  labelEnrollment: (s: string) => string;
  labelSession: (s: string) => string;
  onSessionStatus: (id: string, status: "upcoming" | "completed" | "cancelled") => void;
  isAdmin: boolean;
  formatDateTime: (date: Date) => string;
}) {
  return (
    <div className="space-y-6">
      {mode === "mentee" ? (
        <>
          <PlatformCard>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">{t("today")}</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span><span>{t("todo1")}</span></li>
              <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span><span>{t("todo2", { count: loadingStats ? "—" : String(stats.myEnrollmentsCount) })}</span></li>
              <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span><span>{t("todo3", { count: loadingStats ? "—" : String(stats.myUpcomingSessionsCount) })}</span></li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/${locale}/my/courses?tab=status`} className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors">{t("myEnrollments")}</Link>
              <Link href={`/${locale}/my/sessions`} className="inline-flex items-center rounded-lg bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">{t("mySessions")}</Link>
              <Link href={`/${locale}/my/community`} className="inline-flex items-center rounded-lg bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">{t("myCommunity")}</Link>
              <Link href={`/${locale}/my/freelancers`} className="inline-flex items-center rounded-lg bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">{t("myFreelancers")}</Link>
            </div>
          </PlatformCard>
          <PlatformCard>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{t("studyHubTitle")}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{t("studyHubDesc", { count: loadingStats ? "—" : String(stats.studyInfoCount) })}</p>
            <Link href={`/${locale}/study-in-korea`} className="inline-flex items-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors">{t("go")}</Link>
          </PlatformCard>
          <PlatformCard>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">{t("recentEnrollments")}</h3>
            {recentEnrollments.length === 0 ? <p className="text-sm text-slate-500">{t("emptyEnrollments")}</p> : (
              <div className="space-y-2">
                {recentEnrollments.map((item) => (
                  <Link key={item.id} href={item.lecture?.id ? `/${locale}/lectures/${item.lecture.id}` : `/${locale}/lectures`} className="block rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/70 px-3 py-3 hover:border-primary-200 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.lecture?.title || t("lecture")}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.lecture?.category || t("category")} · {item.status ? labelEnrollment(item.status) : "—"}</p>
                  </Link>
                ))}
              </div>
            )}
          </PlatformCard>
          <PlatformCard>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">{t("recentSessions")}</h3>
            {recentSessions.length === 0 ? <p className="text-sm text-slate-500">{t("emptySessions")}</p> : (
              <div className="space-y-2">
                {recentSessions.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/70 px-3 py-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {item.mentorId ? <Link href={`/${locale}/mentors/${item.mentorId}`} className="hover:text-primary-600">{item.mentorName || t("mentorLabel")}</Link> : item.mentorName || t("mentorLabel")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.date ? formatDateTime(new Date(item.date)) : "—"} · {item.status ? labelSession(item.status) : "—"}</p>
                    {item.status && <div className="mt-2"><StatusBadge label={labelSession(item.status)} tone={item.status === "completed" ? "green" : item.status === "cancelled" ? "red" : "blue"} /></div>}
                    {item.status === "upcoming" && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button type="button" onClick={() => onSessionStatus(item.id, "completed")} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700">{t("complete")}</button>
                        <button type="button" onClick={() => onSessionStatus(item.id, "cancelled")} className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">{t("cancel")}</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </PlatformCard>
        </>
      ) : (
        <PlatformCard>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
            {locale === "kr" ? "멘토 운영" : locale === "mn" ? "Ментор удирдлага" : "Mentor operations"}
          </h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span><span>{locale === "kr" ? "내 강의에서 강의 정보, 썸네일, 가격을 바로 수정하세요." : locale === "mn" ? "Миний хичээлээс мэдээлэл, зураг, үнийг шууд засна." : "Edit lecture info, thumbnail, and pricing from your lecture manager."}</span></li>
            <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span><span>{locale === "kr" ? "신규 강의 개설 후 내 강의 관리에서 운영 상태를 확인하세요." : locale === "mn" ? "Шинэ хичээл нээгээд менежмент хэсгээс явцыг шалгана." : "Create new courses, then manage operations in your lecture panel."}</span></li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/${locale}/my/lectures`} className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors">{locale === "kr" ? "내 강의 관리" : locale === "mn" ? "Миний хичээл" : "Manage lectures"}</Link>
            <Link href={`/${locale}/mentor/lectures/new`} className="inline-flex items-center rounded-lg bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">{locale === "kr" ? "강의 만들기" : locale === "mn" ? "Хичээл нэмэх" : "Create lecture"}</Link>
          </div>
        </PlatformCard>
      )}
      {isAdmin && (
        <div className="rounded-2xl bg-slate-900 text-white p-6 shadow-sm ring-1 ring-slate-800">
          <div className="flex items-start gap-3 mb-3">
            <ShieldCheck className="w-5 h-5 text-primary-300 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold">{t("adminTools")}</h3>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">{t("adminDesc")}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/${locale}/admin/dashboard`} className="inline-flex items-center rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15 transition-colors">{t("stats")}</Link>
            <Link href={`/${locale}/admin/users`} className="inline-flex items-center rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15 transition-colors">{t("users")}</Link>
            <Link href={`/${locale}/admin/moderation`} className="inline-flex items-center rounded-lg bg-primary-500 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-400 transition-colors">{t("moderationQueue")}</Link>
          </div>
        </div>
      )}
    </div>
  );
}

