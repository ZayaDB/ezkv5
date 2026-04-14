"use client";

import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import {
  BookOpen,
  Calendar,
  CircleDollarSign,
  Compass,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  PenLine,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { enrollmentApi, mentorsApi, sessionApi } from "@/lib/api/client";
import StatusBadge from "@/components/ui/StatusBadge";
import PlatformCard from "@/components/ui/PlatformCard";
import Toast from "@/components/ui/Toast";

type DashboardMode = "mentee" | "mentor";

interface DashboardStats {
  mentorsCount: number;
  lecturesCount: number;
  communityCount: number;
  freelancerCount: number;
  studyInfoCount: number;
  myEnrollmentsCount: number;
  myUpcomingSessionsCount: number;
}

interface SimpleEnrollment {
  id: string;
  lecture?: {
    id?: string;
    title?: string;
    category?: string;
  } | null;
  status?: string;
}

interface SimpleSession {
  id: string;
  mentorId?: string | null;
  mentorName?: string;
  date?: string;
  status?: string;
}

const MODE_STORAGE_KEY = "dashboard_mode";

async function safeJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function useSessionStatusLabel(t: (key: string) => string) {
  return (s: string) => {
    if (s === "upcoming") return t("session.upcoming");
    if (s === "completed") return t("session.completed");
    if (s === "cancelled") return t("session.cancelled");
    return s;
  };
}

function useEnrollmentStatusLabel(t: (key: string) => string) {
  return (s: string) => {
    if (s === "active") return t("enrollment.active");
    if (s === "completed") return t("enrollment.completed");
    if (s === "cancelled") return t("enrollment.cancelled");
    return s;
  };
}

export default function DashboardPage() {
  const t = useTranslations("dashboardV2");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");
  const locale = useLocale();
  const fmt = useFormatter();
  const router = useRouter();
  const { user, loading: authLoading, switchRole } = useAuth();
  const [mode, setMode] = useState<DashboardMode>("mentee");
  const [switchingMode, setSwitchingMode] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentEnrollments, setRecentEnrollments] = useState<SimpleEnrollment[]>([]);
  const [recentSessions, setRecentSessions] = useState<SimpleSession[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    mentorsCount: 0,
    lecturesCount: 0,
    communityCount: 0,
    freelancerCount: 0,
    studyInfoCount: 0,
    myEnrollmentsCount: 0,
    myUpcomingSessionsCount: 0,
  });
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error" | "info";
  } | null>(null);
  /** 관리자 승인된 멘토 프로필이 있으면 mentee 역할이어도 멘토 모드 전환 가능 */
  const [mentorGateOk, setMentorGateOk] = useState(false);
  const [mentorGateLoaded, setMentorGateLoaded] = useState(false);

  const labelSession = useSessionStatusLabel(tStatus);
  const labelEnrollment = useEnrollmentStatusLabel(tStatus);

  const loadDashboardData = useCallback(async () => {
    setLoadingStats(true);
    const [mentors, lectures, community, freelancers, studyInfo, enrollments, sessions] =
      await Promise.all([
        safeJson<{ pagination?: { total?: number }; mentors?: unknown[] }>("/api/mentors?limit=1"),
        safeJson<{ pagination?: { total?: number }; lectures?: unknown[] }>("/api/lectures?limit=1"),
        safeJson<{ groups?: unknown[] }>("/api/community"),
        safeJson<{ groups?: unknown[] }>("/api/freelancers"),
        safeJson<{ items?: unknown[] }>("/api/study-info"),
        user ? enrollmentApi.getMine() : Promise.resolve(null),
        user ? sessionApi.getMine() : Promise.resolve(null),
      ]);

    setStats({
      mentorsCount: mentors?.pagination?.total ?? mentors?.mentors?.length ?? 0,
      lecturesCount: lectures?.pagination?.total ?? lectures?.lectures?.length ?? 0,
      communityCount: community?.groups?.length ?? 0,
      freelancerCount: freelancers?.groups?.length ?? 0,
      studyInfoCount: studyInfo?.items?.length ?? 0,
      myEnrollmentsCount: enrollments?.data?.enrollments?.length ?? 0,
      myUpcomingSessionsCount:
        sessions?.data?.sessions?.filter((s: { status?: string }) => s?.status === "upcoming")
          ?.length ?? 0,
    });
    setRecentEnrollments((enrollments?.data?.enrollments || []).slice(0, 3));
    setRecentSessions((sessions?.data?.sessions || []).slice(0, 3));
    setLoadingStats(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [authLoading, user, router, locale]);

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") {
      setMentorGateLoaded(true);
      return;
    }
    let cancelled = false;
    setMentorGateLoaded(false);
    (async () => {
      const res = await mentorsApi.getMine();
      if (cancelled) return;
      const m = res.data?.mentor;
      const st = m?.approvalStatus ?? "approved";
      setMentorGateOk(!!m && st === "approved");
      setMentorGateLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user || !mentorGateLoaded) return;
    const saved = localStorage.getItem(MODE_STORAGE_KEY) as DashboardMode | null;
    const canMentor = user.role === "mentor" || user.role === "admin" || mentorGateOk;
    if (saved === "mentor" && !canMentor) {
      setMode("mentee");
      localStorage.setItem(MODE_STORAGE_KEY, "mentee");
      return;
    }
    if (saved === "mentee" || saved === "mentor") {
      setMode(saved);
      return;
    }
    setMode(user.role === "mentor" ? "mentor" : "mentee");
  }, [user, mentorGateOk, mentorGateLoaded]);

  useEffect(() => {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    let active = true;
    loadDashboardData()
      .catch(() => {
        if (active) setLoadingStats(false);
      })
      .then(() => {
        if (!active) return;
      });
    return () => {
      active = false;
    };
  }, [loadDashboardData]);

  const handleSessionStatus = async (
    sessionId: string,
    status: "upcoming" | "completed" | "cancelled"
  ) => {
    const res = await sessionApi.updateStatus(sessionId, status);
    if (res.error) {
      setToast({ message: res.error || t("toastSessionErr"), variant: "error" });
      return;
    }
    setToast({ message: t("toastSessionOk"), variant: "success" });
    await loadDashboardData();
  };

  const summaryCards = useMemo(
    () => [
      {
        titleKey: "statMentors" as const,
        value: stats.mentorsCount,
        icon: Users,
        accent: "bg-slate-900 text-white",
      },
      {
        titleKey: "statLectures" as const,
        value: stats.lecturesCount,
        icon: GraduationCap,
        accent: "bg-primary-600 text-white",
      },
      {
        titleKey: "statCommunity" as const,
        value: stats.communityCount,
        icon: MessageSquare,
        accent: "bg-slate-700 text-white",
      },
      {
        titleKey: "statFreelancers" as const,
        value: stats.freelancerCount,
        icon: Wallet,
        accent: "bg-slate-800 text-white",
      },
    ],
    [stats]
  );

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const canUseMentorMode = user.role === "mentor" || user.role === "admin" || mentorGateOk;

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
          closeLabel={tCommon("close")}
        />
      )}

      <header className="border-b border-slate-200/80 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-2 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                {t("premium")}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                {t("title", { name: user.name })}
              </h1>
              <p className="mt-2 text-slate-600 leading-relaxed">{t("subtitle")}</p>
            </div>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200/80 self-start">
              <button
                type="button"
                disabled={switchingMode}
                onClick={async () => {
                  if (mode === "mentee") return;
                  if (user.role === "admin") {
                    setMode("mentee");
                    return;
                  }
                  if (user.role === "mentee") {
                    setMode("mentee");
                    return;
                  }
                  setSwitchingMode(true);
                  const result = await switchRole("mentee");
                  if (result.success) setMode("mentee");
                  else
                    setToast({
                      message: result.error || t("roleSwitchFailed"),
                      variant: "error",
                    });
                  setSwitchingMode(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  mode === "mentee"
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                } disabled:opacity-60`}
              >
                {t("modeMentee")}
              </button>
              <button
                type="button"
                disabled={switchingMode || !canUseMentorMode}
                onClick={async () => {
                  if (mode === "mentor") return;
                  if (!canUseMentorMode) {
                    setToast({ message: t("mentorModeDisabledHint"), variant: "info" });
                    return;
                  }
                  if (user.role === "admin") {
                    setMode("mentor");
                    return;
                  }
                  if (user.role === "mentor") {
                    setMode("mentor");
                    return;
                  }
                  setSwitchingMode(true);
                  const result = await switchRole("mentor");
                  if (result.success) setMode("mentor");
                  else
                    setToast({
                      message: result.error || t("roleSwitchFailed"),
                      variant: "error",
                    });
                  setSwitchingMode(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  mode === "mentor"
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={!canUseMentorMode ? t("mentorModeDisabledHint") : undefined}
              >
                {t("modeMentor")}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <PlatformCard key={card.titleKey} padding="md" className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.accent}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold tabular-nums text-slate-900 text-right">
                    {loadingStats ? "—" : fmt.number(card.value)}
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-600">{t(card.titleKey)}</p>
              </PlatformCard>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PlatformCard padding="lg" className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-primary-600" />
              {mode === "mentee" ? t("panelMentee") : t("panelMentor")}
            </h2>

            {mode === "mentee" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <QuickLink
                    href={`/${locale}/lectures`}
                    icon={BookOpen}
                    title={t("mentee.quick1Title")}
                    desc={t("mentee.quick1Desc")}
                  />
                  <QuickLink
                    href={`/${locale}/mentors`}
                    icon={Users}
                    title={t("mentee.quick2Title")}
                    desc={t("mentee.quick2Desc")}
                  />
                  <QuickLink
                    href={`/${locale}/community`}
                    icon={MessageSquare}
                    title={t("mentee.quick3Title")}
                    desc={t("mentee.quick3Desc")}
                  />
                  <QuickLink
                    href={`/${locale}/freelancers`}
                    icon={CircleDollarSign}
                    title={t("mentee.quick4Title")}
                    desc={t("mentee.quick4Desc")}
                  />
                </div>
                {user.role === "mentee" && (
                  <p className="mt-5 text-sm text-slate-600 leading-relaxed">
                    {t("mentorApplyHint")}{" "}
                    <Link
                      href={`/${locale}/profile?tab=mentor`}
                      className="font-semibold text-primary-600 hover:underline"
                    >
                      {t("mentorApplyLink")}
                    </Link>
                  </p>
                )}
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <QuickLink
                  href={`/${locale}/profile`}
                  icon={Calendar}
                  title={t("mentor.quick1Title")}
                  desc={t("mentor.quick1Desc")}
                />
                <QuickLink
                  href={`/${locale}/lectures`}
                  icon={GraduationCap}
                  title={t("mentor.quick2Title")}
                  desc={t("mentor.quick2Desc")}
                />
                <QuickLink
                  href={`/${locale}/mentor/lectures/new`}
                  icon={PenLine}
                  title={t("mentor.quick5Title")}
                  desc={t("mentor.quick5Desc")}
                />
                <QuickLink
                  href={`/${locale}/community`}
                  icon={Compass}
                  title={t("mentor.quick3Title")}
                  desc={t("mentor.quick3Desc")}
                />
                <QuickLink
                  href={`/${locale}/profile`}
                  icon={Wallet}
                  title={t("mentor.quick4Title")}
                  desc={t("mentor.quick4Desc")}
                />
              </div>
            )}
          </PlatformCard>

          <div className="space-y-6">
            <PlatformCard>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">{t("today")}</h3>
              <ul className="space-y-2 text-sm text-slate-600 leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-slate-400 shrink-0">•</span>
                  <span>{t("todo1")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-slate-400 shrink-0">•</span>
                  <span>
                    {t("todo2", {
                      count: loadingStats ? "—" : String(stats.myEnrollmentsCount),
                    })}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-slate-400 shrink-0">•</span>
                  <span>
                    {t("todo3", {
                      count: loadingStats ? "—" : String(stats.myUpcomingSessionsCount),
                    })}
                  </span>
                </li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/${locale}/my/enrollments`}
                  className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  {t("myEnrollments")}
                </Link>
                <Link
                  href={`/${locale}/my/sessions`}
                  className="inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
                >
                  {t("mySessions")}
                </Link>
                <Link
                  href={`/${locale}/my/community`}
                  className="inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
                >
                  {t("myCommunity")}
                </Link>
                <Link
                  href={`/${locale}/my/freelancers`}
                  className="inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
                >
                  {t("myFreelancers")}
                </Link>
              </div>
            </PlatformCard>

            <PlatformCard>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">{t("studyHubTitle")}</h3>
              <p className="text-sm text-slate-600 mb-4">
                {t("studyHubDesc", {
                  count: loadingStats ? "—" : String(stats.studyInfoCount),
                })}
              </p>
              <Link
                href={`/${locale}/study-in-korea`}
                className="inline-flex items-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
              >
                {t("go")}
              </Link>
            </PlatformCard>

            <PlatformCard>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">{t("recentEnrollments")}</h3>
              {recentEnrollments.length === 0 ? (
                <p className="text-sm text-slate-500">{t("emptyEnrollments")}</p>
              ) : (
                <div className="space-y-2">
                  {recentEnrollments.map((item) => (
                    <Link
                      key={item.id}
                      href={
                        item.lecture?.id
                          ? `/${locale}/lectures/${item.lecture.id}`
                          : `/${locale}/lectures`
                      }
                      className="block rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 hover:border-primary-200 hover:bg-white transition-colors"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {item.lecture?.title || t("lecture")}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.lecture?.category || t("category")} ·{" "}
                        {item.status ? labelEnrollment(item.status) : "—"}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </PlatformCard>

            <PlatformCard>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">{t("recentSessions")}</h3>
              {recentSessions.length === 0 ? (
                <p className="text-sm text-slate-500">{t("emptySessions")}</p>
              ) : (
                <div className="space-y-2">
                  {recentSessions.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {item.mentorId ? (
                          <Link
                            href={`/${locale}/mentors/${item.mentorId}`}
                            className="hover:text-primary-600"
                          >
                            {item.mentorName || t("mentorLabel")}
                          </Link>
                        ) : (
                          item.mentorName || t("mentorLabel")
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.date
                          ? fmt.dateTime(new Date(item.date), {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "—"}{" "}
                        · {item.status ? labelSession(item.status) : "—"}
                      </p>
                      {item.status && (
                        <div className="mt-2">
                          <StatusBadge
                            label={labelSession(item.status)}
                            tone={
                              item.status === "completed"
                                ? "green"
                                : item.status === "cancelled"
                                  ? "red"
                                  : "blue"
                            }
                          />
                        </div>
                      )}
                      {item.status === "upcoming" && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleSessionStatus(item.id, "completed")}
                            className="text-xs px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                          >
                            {t("complete")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSessionStatus(item.id, "cancelled")}
                            className="text-xs px-2.5 py-1 rounded-lg bg-white text-slate-700 font-semibold ring-1 ring-slate-200 hover:bg-slate-50"
                          >
                            {t("cancel")}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </PlatformCard>

            {user.role === "admin" && (
              <div className="rounded-2xl bg-slate-900 text-white p-6 shadow-sm ring-1 ring-slate-800">
                <div className="flex items-start gap-3 mb-3">
                  <ShieldCheck className="w-5 h-5 text-primary-300 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold">{t("adminTools")}</h3>
                    <p className="text-sm text-slate-300 mt-1 leading-relaxed">{t("adminDesc")}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/${locale}/admin/dashboard`}
                    className="inline-flex items-center rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15 transition-colors"
                  >
                    {t("stats")}
                  </Link>
                  <Link
                    href={`/${locale}/admin/users`}
                    className="inline-flex items-center rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15 transition-colors"
                  >
                    {t("users")}
                  </Link>
                  <Link
                    href={`/${locale}/admin/moderation`}
                    className="inline-flex items-center rounded-lg bg-primary-500 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-400 transition-colors"
                  >
                    {t("moderationQueue")}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-slate-200 bg-white p-4 hover:border-primary-200 hover:shadow-sm transition-all"
    >
      <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-semibold text-slate-900 text-sm mb-1">{title}</p>
      <p className="text-sm text-slate-600 leading-snug">{desc}</p>
    </Link>
  );
}
