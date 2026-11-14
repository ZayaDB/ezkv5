"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, ArrowUpRight, Bot, BookOpen, CalendarDays, Compass, Users } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getControlCenter } from "@/lib/supabase/home";
import { getCachedEnrollments } from "@/lib/hooks/useMyDataCache";
import RoadmapChecklist, { type RoadmapView } from "@/components/roadmap/RoadmapChecklist";
import { roadmapsApi } from "@/lib/api/client";
import { openAssistant } from "@/components/chatbot/Chatbot";
import { formatDate } from "@/lib/i18n/dateFormat";
import { PageIntro, SectionHeader, StatTile, ui } from "@/components/lnk/ui";

type HomeData = Awaited<ReturnType<typeof getControlCenter>>;

/**
 * 마이페이지 홈 — "오늘 무엇을 해야 하는지"가 먼저 보이도록:
 * 1) 지금 할 일(가장 급한 알림 + 다음 로드맵 단계)  2) 숫자 요약  3) 로드맵 · 오늘 일정  4) 도움 카드
 */
export default function MyDashboardOverview() {
  const t = useTranslations("myPages.overview");
  const locale = useLocale();
  const { user } = useAuth();
  const [data, setData] = useState<HomeData | null>(null);
  const [courseCount, setCourseCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async (withSpinner = true) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    if (withSpinner) setLoading(true);
    Promise.all([getControlCenter(user).catch(() => null), getCachedEnrollments().catch(() => [])])
      .then(([home, enrollments]) => {
        setData(home);
        const list = Array.isArray(enrollments) ? enrollments : [];
        setCourseCount(list.filter((e: { status?: string }) => e?.status !== "cancelled" && e?.status !== "completed").length);
      })
      .finally(() => setLoading(false));
  };

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
  const today = data?.todaySchedule ?? [];
  const topAlert = data?.alerts?.[0];
  const nextStep = roadmaps.find((r) => r.nextStep);

  // 프로필 완성도: 비서·알림이 제대로 동작하는 데 필요한 항목
  const checks = [
    Boolean(user?.nationality),
    Boolean(user?.university),
    Boolean(user?.phone),
    user?.countryStatus === "residing_korea" ? Boolean(user?.visaType && user?.visaExpireDate) : Boolean(user?.countryStatus && user.countryStatus !== "unknown"),
  ];
  const profilePct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  const helpful = [
    { icon: Bot, title: t("helpAssistantTitle"), body: t("helpAssistantBody"), onClick: () => openAssistant(), cta: t("helpAssistantCta") },
    { icon: Compass, title: t("helpGuidesTitle"), body: t("helpGuidesBody"), href: `/${locale}/study-in-korea`, cta: t("helpGuidesCta") },
    { icon: Users, title: t("helpMentorsTitle"), body: t("helpMentorsBody"), href: `/${locale}/mentors`, cta: t("helpMentorsCta") },
  ];

  return (
    <div className="flex flex-col gap-10">
      <PageIntro
        size="md"
        status={visaDday != null ? t("visaStatus", { visa: String(data?.statusCard?.visaType || ""), days: String(visaDday) }) : t("statusDefault")}
        title={t("greeting", { name: user?.name ?? "" })}
        subtitle={t("subtitle")}
      />

      {/* 1. 지금 할 일 */}
      <section aria-labelledby="now-title" className={`${ui.card} overflow-hidden`}>
        <div className="flex flex-col gap-1 border-b border-hairline px-6 py-4 dark:border-hairline-dark">
          <h2 id="now-title" className="text-sm font-semibold text-ink dark:text-snow">
            {t("nowTitle")}
          </h2>
        </div>
        <ul className="divide-y divide-hairline dark:divide-hairline-dark">
          {topAlert ? (
            <li>
              <Link
                href={`/${locale}${topAlert.actionUrl || "/assistant"}`}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-surface dark:hover:bg-night"
              >
                <span className={`shrink-0 ${topAlert.severity === "urgent" ? ui.pillSand : ui.pillTeal}`}>{t("tagAlert")}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-ink dark:text-snow">{topAlert.title}</p>
                  {topAlert.body && <p className={`truncate text-sm ${ui.muted}`}>{topAlert.body}</p>}
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted dark:text-snow-muted" aria-hidden="true" />
              </Link>
            </li>
          ) : null}
          {nextStep ? (
            <li className="flex items-center gap-4 px-6 py-4">
              <span className={`shrink-0 ${ui.pillTeal}`}>{t("tagNextStep")}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-ink dark:text-snow">{nextStep.nextStep}</p>
                <p className={`truncate text-sm ${ui.muted}`}>
                  {nextStep.title} · {t("progress", { pct: String(nextStep.progress || 0) })}
                </p>
              </div>
              <a href="#roadmaps" className={`shrink-0 ${ui.btnGhost}`}>
                {t("openRoadmap")}
              </a>
            </li>
          ) : null}
          {profilePct < 100 ? (
            <li>
              <Link
                href={`${base}/profile?tab=info`}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-surface dark:hover:bg-night"
              >
                <span className={`shrink-0 ${ui.pillMuted}`}>{t("tagProfile")}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-ink dark:text-snow">{t("profileTitle", { pct: String(profilePct) })}</p>
                  <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-hairline dark:bg-hairline-dark">
                    <div className="h-full rounded-full bg-teal dark:bg-teal-dark" style={{ width: `${profilePct}%` }} />
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted dark:text-snow-muted" aria-hidden="true" />
              </Link>
            </li>
          ) : null}
          {!topAlert && !nextStep && profilePct >= 100 ? (
            <li className="flex items-center justify-between gap-4 px-6 py-5">
              <p className={`text-sm ${ui.muted}`}>{t("nowEmpty")}</p>
              <button type="button" onClick={() => openAssistant()} className={ui.btnOutline}>
                {t("askAssistant")}
              </button>
            </li>
          ) : null}
        </ul>
      </section>

      {/* 2. 숫자 요약 */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label={t("statsLabel")}>
        <StatTile
          label={t("statVisa")}
          value={visaDday != null ? `D-${visaDday}` : "—"}
          hint={visaDday != null ? t("statVisaHint") : t("statVisaNone")}
          tone={visaDday != null && visaDday <= 60 ? "alert" : "default"}
          href={`${base}/profile?tab=info`}
        />
        <StatTile
          label={t("statRoadmap")}
          value={avgProgress != null ? `${avgProgress}%` : "—"}
          hint={t("statRoadmapHint", { count: String(roadmaps.length) })}
          href="#roadmaps"
        />
        <StatTile label={t("statToday")} value={today.length} hint={t("statTodayHint")} href={`${base}/schedule`} />
        <StatTile label={t("statCourses")} value={courseCount} hint={t("statCoursesHint")} href={`${base}/courses`} />
      </section>

      {/* 3. 로드맵 + 오늘 일정 */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
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

        <section className="flex flex-col gap-4">
          <SectionHeader title={t("todayTitle")} action={{ label: t("openSchedule"), href: `${base}/schedule` }} />
          <div className={`${ui.card} p-5`}>
            {today.length === 0 ? (
              <div className="flex flex-col items-start gap-3">
                <CalendarDays className="h-5 w-5 text-teal dark:text-teal-dark" aria-hidden="true" />
                <p className={`text-sm ${ui.muted}`}>{t("todayEmpty")}</p>
              </div>
            ) : (
              <ol className="flex flex-col">
                {today.slice(0, 5).map((s) => (
                  <li key={s.id} className="flex items-start gap-3 border-b border-hairline py-3 first:pt-0 last:border-0 last:pb-0 dark:border-hairline-dark">
                    <span className="w-14 shrink-0 pt-0.5 text-xs font-semibold tabular-nums text-teal dark:text-teal-dark">
                      {formatDate(s.startsAt, locale, { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-sm font-medium text-ink dark:text-snow">{s.title}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>

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
