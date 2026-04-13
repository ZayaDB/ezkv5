"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  BookOpen,
  Calendar,
  CircleDollarSign,
  Compass,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { enrollmentApi, sessionApi } from "@/lib/api/client";
import StatusBadge from "@/components/ui/StatusBadge";

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

export default function DashboardPage() {
  const t = useTranslations("dashboardV2");
  const locale = useLocale();
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

  const loadDashboardData = async () => {
    setLoadingStats(true);
    const [mentors, lectures, community, freelancers, studyInfo, enrollments, sessions] = await Promise.all([
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
        sessions?.data?.sessions?.filter((s: any) => s?.status === "upcoming")?.length ?? 0,
    });
    setRecentEnrollments((enrollments?.data?.enrollments || []).slice(0, 3));
    setRecentSessions((sessions?.data?.sessions || []).slice(0, 3));
    setLoadingStats(false);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [authLoading, user, router, locale]);

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(MODE_STORAGE_KEY) as DashboardMode | null;
    if (saved === "mentee" || saved === "mentor") {
      setMode(saved);
      return;
    }
    setMode(user.role === "mentor" ? "mentor" : "mentee");
  }, [user]);

  useEffect(() => {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    let active = true;
    loadDashboardData().catch(() => {
      if (active) setLoadingStats(false);
    });
    return () => {
      active = false;
    };
  }, [user]);

  const handleSessionStatus = async (
    sessionId: string,
    status: "upcoming" | "completed" | "cancelled"
  ) => {
    const res = await sessionApi.updateStatus(sessionId, status);
    if (res.error) {
      alert(res.error);
      return;
    }
    await loadDashboardData();
  };

  const summaryCards = useMemo(
    () => [
      {
        title: "활성 멘토",
        value: stats.mentorsCount,
        icon: Users,
        color: "text-primary-600 bg-primary-50",
      },
      {
        title: "강의",
        value: stats.lecturesCount,
        icon: GraduationCap,
        color: "text-accent-600 bg-accent-50",
      },
      {
        title: "커뮤니티 그룹",
        value: stats.communityCount,
        icon: MessageSquare,
        color: "text-blue-600 bg-blue-50",
      },
      {
        title: "프리랜서 그룹",
        value: stats.freelancerCount,
        icon: Wallet,
        color: "text-purple-600 bg-purple-50",
      },
    ],
    [stats]
  );

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const canUseMentorMode = true;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-white/90 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {t("premium")}
              </p>
              <h1 className="text-4xl font-extrabold text-white mb-2">{t("title", { name: user.name })}</h1>
              <p className="text-white/90">
                {t("subtitle")}
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-md p-1 rounded-2xl inline-flex">
              <button
                type="button"
                disabled={switchingMode}
                onClick={async () => {
                  setMode("mentee");
                  if (user.role !== "admin" && user.role !== "mentee") {
                    setSwitchingMode(true);
                    const result = await switchRole("mentee");
                    setSwitchingMode(false);
                    if (!result.success) {
                      alert(result.error || "역할 전환에 실패했습니다.");
                    }
                  }
                }}
                className={`px-5 py-2 rounded-xl font-semibold transition-all ${
                  mode === "mentee" ? "bg-white text-primary-700" : "text-white"
                } disabled:opacity-60`}
              >
                {t("modeMentee")}
              </button>
              <button
                type="button"
                disabled={!canUseMentorMode}
                onClick={async () => {
                  setMode("mentor");
                  if (user.role !== "admin" && user.role !== "mentor") {
                    setSwitchingMode(true);
                    const result = await switchRole("mentor");
                    setSwitchingMode(false);
                    if (!result.success) {
                      alert(result.error || "역할 전환에 실패했습니다.");
                    }
                  }
                }}
                className={`px-5 py-2 rounded-xl font-semibold transition-all ${
                  mode === "mentor" ? "bg-white text-primary-700" : "text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={!canUseMentorMode ? "멘토 계정에서 활성화됩니다." : ""}
              >
                {t("modeMentor")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900">
                    {loadingStats ? "-" : card.value.toLocaleString("ko-KR")}
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-semibold">{card.title}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-primary-600" />
              {mode === "mentee" ? t("panelMentee") : t("panelMentor")}
            </h2>

            {mode === "mentee" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuickLink href={`/${locale}/lectures`} icon={BookOpen} title={t("mentee.quick1Title")} desc={t("mentee.quick1Desc")} />
                <QuickLink href={`/${locale}/mentors`} icon={Users} title={t("mentee.quick2Title")} desc={t("mentee.quick2Desc")} />
                <QuickLink href={`/${locale}/community`} icon={MessageSquare} title={t("mentee.quick3Title")} desc={t("mentee.quick3Desc")} />
                <QuickLink href={`/${locale}/freelancers`} icon={CircleDollarSign} title={t("mentee.quick4Title")} desc={t("mentee.quick4Desc")} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuickLink href={`/${locale}/profile`} icon={Calendar} title={t("mentor.quick1Title")} desc={t("mentor.quick1Desc")} />
                <QuickLink href={`/${locale}/lectures`} icon={GraduationCap} title={t("mentor.quick2Title")} desc={t("mentor.quick2Desc")} />
                <QuickLink href={`/${locale}/community`} icon={Compass} title={t("mentor.quick3Title")} desc={t("mentor.quick3Desc")} />
                <QuickLink href={`/${locale}/profile`} icon={Wallet} title={t("mentor.quick4Title")} desc={t("mentor.quick4Desc")} />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">{t("today")}</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>• {t("todo1")}</li>
                <li>• {t("todo2", { count: loadingStats ? "-" : String(stats.myEnrollmentsCount) })}</li>
                <li>• {t("todo3", { count: loadingStats ? "-" : String(stats.myUpcomingSessionsCount) })}</li>
              </ul>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/${locale}/my/enrollments`}
                  className="px-3 py-2 rounded-lg bg-primary-50 text-primary-700 text-xs font-semibold hover:bg-primary-100"
                >
                  {t("myEnrollments")}
                </Link>
                <Link
                  href={`/${locale}/my/sessions`}
                  className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100"
                >
                  {t("mySessions")}
                </Link>
                <Link
                  href={`/${locale}/my/community`}
                  className="px-3 py-2 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100"
                >
                  {t("myCommunity")}
                </Link>
                <Link
                  href={`/${locale}/my/freelancers`}
                  className="px-3 py-2 rounded-lg bg-orange-50 text-orange-700 text-xs font-semibold hover:bg-orange-100"
                >
                  {t("myFreelancers")}
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t("studyHubTitle")}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("studyHubDesc", { count: loadingStats ? "-" : String(stats.studyInfoCount) })}
              </p>
              <Link
                href={`/${locale}/study-in-korea`}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
              >
                {t("go")}
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">{t("recentEnrollments")}</h3>
              {recentEnrollments.length === 0 ? (
                <p className="text-sm text-gray-500">{t("emptyEnrollments")}</p>
              ) : (
                <div className="space-y-3">
                  {recentEnrollments.map((item) => (
                    <Link
                      key={item.id}
                      href={item.lecture?.id ? `/${locale}/lectures/${item.lecture.id}` : `/${locale}/lectures`}
                      className="block p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-primary-200 transition-colors"
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {item.lecture?.title || t("lecture")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.lecture?.category || t("category")} · {item.status || "active"}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">{t("recentSessions")}</h3>
              {recentSessions.length === 0 ? (
                <p className="text-sm text-gray-500">{t("emptySessions")}</p>
              ) : (
                <div className="space-y-3">
                  {recentSessions.map((item) => (
                    <div key={item.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.mentorId ? (
                          <Link href={`/${locale}/mentors/${item.mentorId}`} className="hover:underline">
                            {item.mentorName || t("mentorLabel")}
                          </Link>
                        ) : (
                          item.mentorName || t("mentorLabel")
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.date ? new Date(item.date).toLocaleString("ko-KR") : "-"} · {item.status || "-"}
                      </p>
                      {item.status && (
                        <div className="mt-1">
                          <StatusBadge
                            label={item.status}
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
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSessionStatus(item.id, "completed")}
                            className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 font-semibold"
                          >
                            {t("complete")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSessionStatus(item.id, "cancelled")}
                            className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 font-semibold"
                          >
                            {t("cancel")}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {user.role === "admin" && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-2">관리자 도구</h3>
                <p className="text-sm text-white/80 mb-4">{t("adminDesc")}</p>
                <div className="flex gap-2">
                  <Link href={`/${locale}/admin/dashboard`} className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-sm font-semibold">
                    {t("stats")}
                  </Link>
                  <Link href={`/${locale}/admin/users`} className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-sm font-semibold">
                    {t("users")}
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
      className="block p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50/40 transition-all"
    >
      <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-bold text-gray-900 mb-1">{title}</p>
      <p className="text-sm text-gray-600">{desc}</p>
    </Link>
  );
}
