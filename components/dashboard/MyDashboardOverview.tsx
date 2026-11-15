"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, Bot, BookOpen, Compass, Users } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getControlCenter } from "@/lib/supabase/home";
import { getCachedEnrollments, getCachedSessions } from "@/lib/hooks/useMyDataCache";
import { useUnreadMessages } from "@/lib/hooks/useUnreadMessages";
import MentorOverview from "@/components/mentor/MentorOverview";
import RoadmapChecklist, { type RoadmapView } from "@/components/roadmap/RoadmapChecklist";
import { roadmapsApi } from "@/lib/api/client";
import { openAssistant } from "@/components/chatbot/Chatbot";
import { PageIntro, SectionHeader, StatTile, ui } from "@/components/lnk/ui";

type HomeData = Awaited<ReturnType<typeof getControlCenter>>;

/**
 * 마이페이지 홈 (개요)
 * - 학생 모드: 요약 카드(로드맵·학습·예정 상담·메시지) → 로드맵 → 도움 카드
 * - 멘토 모드: 수익·예약 요약 카드 → 로드맵 → 상담 예약 · 수익 내역 → 도움 카드
 */
export default function MyDashboardOverview() {
  const t = useTranslations("myPages.overview");
  const locale = useLocale();
  const { user } = useAuth();
  const [data, setData] = useState<HomeData | null>(null);
  const [courseCount, setCourseCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [mode, setMode] = useState<"mentee" | "mentor">("mentee");
  const { unread: unreadMessages } = useUnreadMessages(Boolean(user));
  const canMentor = user?.role === "mentor" || user?.role === "admin";
  const isMentorMode = canMentor && mode === "mentor";
  const [loading, setLoading] = useState(true);

  const load = async (withSpinner = true) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    if (withSpinner) setLoading(true);
    Promise.all([
      getControlCenter(user).catch(() => null),
      getCachedEnrollments().catch(() => []),
      getCachedSessions().catch(() => []),
    ])
      .then(([home, enrollments, sessions]) => {
        setData(home);
        const list = Array.isArray(enrollments) ? enrollments : [];
        setCourseCount(list.filter((e: { status?: string }) => e?.status !== "cancelled" && e?.status !== "completed").length);
        const now = Date.now();
        const mine = (Array.isArray(sessions) ? sessions : []) as { status?: string; date?: string; menteeId?: string | null }[];
        setSessionCount(
          mine.filter((x) => x.status === "upcoming" && x.menteeId === user.id && x.date && new Date(x.date).getTime() > now).length
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const sync = () => {
      try {
        const raw = localStorage.getItem("dashboard_mode");
        if (raw === "mentor" || raw === "mentee") setMode(raw);
      } catch {
        /* ignore */
      }
    };
    sync();
    window.addEventListener("dashboard-mode-changed", sync);
    return () => window.removeEventListener("dashboard-mode-changed", sync);
  }, []);

  useEffect(() => {
    void load();
    const onRoadmap = () => void load(false);
    window.addEventListener("roadmap-updated", onRoadmap);
    return () => window.removeEventListener("roadmap-updated", onRoadmap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const base = `/${locale}/my`;

  if (loading) {
    return (
      <div className="flex animate-pulse flex-col gap-6" aria-busy="true">
        <div className="h-10 w-2/3 rounded-lg bg-hairline dark:bg-night-card" />
        <div className="h-28 rounded-2xl bg-hairline dark:bg-night-card" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-hairline dark:bg-night-card" />
          ))}
        </div>
      </div>
    );
  }

  const visaDday = (data?.statusCard?.visaDday as number | null | undefined) ?? null;
  const roadmaps = data?.activeRoadmaps ?? [];
  const roadmapViews: RoadmapView[] = roadmaps.map((r) => ({
    id: r.id,
    title: r.title,
    templateKey: r.templateKey,
    progress: r.progress,
    steps: (r.steps || []).map((s) => ({ id: s.id, title: s.title, description: s.description, completed: s.completed })),
  }));
  const avgProgress = roadmaps.length
    ? Math.round(roadmaps.reduce((sum, r) => sum + (r.progress || 0), 0) / roadmaps.length)
    : null;
  const helpful = [
    { icon: Bot, title: t("helpAssistantTitle"), body: t("helpAssistantBody"), onClick: () => openAssistant(), cta: t("helpAssistantCta") },
    { icon: Compass, title: t("helpGuidesTitle"), body: t("helpGuidesBody"), href: `/${locale}/study-in-korea`, cta: t("helpGuidesCta") },
    { icon: Users, title: t("helpMentorsTitle"), body: t("helpMentorsBody"), href: `/${locale}/mentors`, cta: t("helpMentorsCta") },
  ];

  const roadmapsSection = (
      <section id="roadmaps" className="flex scroll-mt-28 flex-col gap-4">
        <SectionHeader title={t("roadmapsTitle")} description={t("roadmapsBody")} />
        <div className={`${ui.card} p-5 sm:p-6`}>
          <RoadmapChecklist
            roadmaps={roadmapViews}
            onToggle={async (roadmapId, stepId, next) => {
              await roadmapsApi.completeStep(roadmapId, stepId, next);
              await load(false);
            }}
            emptyHint={t("roadmapsEmpty")}
          />
          {roadmaps.length === 0 && (
            <button type="button" onClick={() => openAssistant()} className={`mt-4 ${ui.btnPrimary}`}>
              <Bot className="h-4 w-4" aria-hidden="true" />
              {t("startRoadmap")}
            </button>
          )}
        </div>
      </section>
  );

  return (
    <div className="flex flex-col gap-10">
      <PageIntro
        size="md"
        status={visaDday != null ? t("visaStatus", { visa: String(data?.statusCard?.visaType || ""), days: String(visaDday) }) : t("statusDefault")}
        title={t("greeting", { name: user?.name ?? "" })}
        subtitle={t("subtitle")}
      />

      {isMentorMode ? (
        <MentorOverview>{roadmapsSection}</MentorOverview>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label={t("statsLabel")}>
            <StatTile
              label={t("statRoadmap")}
              value={avgProgress != null ? `${avgProgress}%` : "—"}
              hint={t("statRoadmapHint", { count: String(roadmaps.length) })}
              href="#roadmaps"
            />
            <StatTile label={t("statCourses")} value={courseCount} hint={t("statCoursesHint")} href={`${base}/courses`} />
            <StatTile label={t("statSessions")} value={sessionCount} hint={t("statSessionsHint")} href={`${base}/schedule`} />
            <StatTile label={t("statMessages")} value={unreadMessages} hint={t("statMessagesHint")} href={`${base}/messages`} />
          </section>
          {roadmapsSection}
        </>
      )}

      {/* 4. 도움 카드 */}
      <section className="flex flex-col gap-4">
        <SectionHeader title={t("helpTitle")} />
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {helpful.map((h) => {
            const Icon = h.icon;
            const body = (
              <>
                <Icon className="h-5 w-5 text-teal dark:text-teal-dark" aria-hidden="true" />
                <p className="text-[17px] font-semibold text-ink dark:text-snow">{h.title}</p>
                <p className={`flex-1 text-sm leading-[1.55] ${ui.muted}`}>{h.body}</p>
                <span className={ui.btnGhost}>
                  {h.cta}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </>
            );
            const cls = `${ui.card} ${ui.cardHover} flex h-full w-full flex-col items-start gap-3 p-6 text-left`;
            return (
              <li key={h.title}>
                {h.href ? (
                  <Link href={h.href} className={cls}>
                    {body}
                  </Link>
                ) : (
                  <button type="button" onClick={h.onClick} className={cls}>
                    {body}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <p className={`flex items-center gap-2 text-xs ${ui.muted}`}>
        <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
        {t("footnote")}
      </p>
    </div>
  );
}
