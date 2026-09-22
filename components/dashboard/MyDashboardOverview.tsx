"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertTriangle,
  BookMarked,
  Bot,
  CalendarDays,
  ChevronRight,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getControlCenter } from "@/lib/supabase/home";
import { getCachedEnrollments } from "@/lib/hooks/useMyDataCache";
import DashboardModeToggle from "@/components/dashboard/DashboardModeToggle";
import RoadmapChecklist, { type RoadmapView } from "@/components/roadmap/RoadmapChecklist";
import { roadmapsApi } from "@/lib/api/client";
import { openAssistant } from "@/components/chatbot/Chatbot";

type HomeData = Awaited<ReturnType<typeof getControlCenter>>;

function SummaryCard({
  href,
  onClick,
  icon: Icon,
  label,
  value,
  sub,
}: {
  href?: string;
  onClick?: () => void;
  icon: typeof Bot;
  label: string;
  value: string | number;
  sub?: string;
}) {
  const className =
    "group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:border-primary-300 hover:shadow-sm transition-all text-left w-full";
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-500/15 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {inner}
      </button>
    );
  }
  return (
    <Link href={href || "#"} className={className}>
      {inner}
    </Link>
  );
}

export default function MyDashboardOverview() {
  const t = useTranslations("myPages.dashboard");
  const tControl = useTranslations("controlCenter");
  const tProf = useTranslations("profile");
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
        setCourseCount(Array.isArray(enrollments) ? enrollments.length : 0);
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
  const status = data?.statusCard as Record<string, unknown> | undefined;
  const roadmapViews: RoadmapView[] = (data?.activeRoadmaps ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    templateKey: r.templateKey,
    progress: r.progress,
    steps: (r.steps || []).map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      completed: s.completed,
    })),
  }));

  const roleLabel = (() => {
    const key = user?.role === "user" ? "user" : user?.role ?? "user";
    try {
      return tProf(`roles.${key}`);
    } catch {
      return key;
    }
  })();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const canUseMentorMode = user?.role === "mentor" || user?.role === "admin";
  const visaDday = status?.visaDday;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("greeting", { name: user?.name ?? "" })}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {roleLabel} · {t("subtitle")}
            {visaDday != null ? (
              <span className="ml-2 text-xs font-semibold text-amber-600">D-{String(visaDday)}</span>
            ) : null}
          </p>
        </div>
        <DashboardModeToggle canUseMentorMode={canUseMentorMode} />
      </div>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
        <div className="flex justify-end mb-1">
          <button
            type="button"
            onClick={() => openAssistant()}
            className="text-xs font-semibold text-primary-600"
          >
            {t("askAssistant")}
          </button>
        </div>
        <RoadmapChecklist
          roadmaps={roadmapViews}
          onToggle={async (roadmapId, stepId, next) => {
            await roadmapsApi.completeStep(roadmapId, stepId, next);
            await load(false);
          }}
          emptyHint={t("emptySteps")}
        />
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          onClick={() => openAssistant()}
          icon={Bot}
          label={t("cardAssistant")}
          value="→"
          sub={t("cardAssistantSub")}
        />
        <SummaryCard
          href={`${base}/schedule`}
          icon={CalendarDays}
          label={t("cardSchedule")}
          value={data?.todaySchedule?.length ?? 0}
          sub={t("cardScheduleSub")}
        />
        <SummaryCard
          href={`${base}/courses`}
          icon={BookMarked}
          label={t("cardCourses")}
          value={courseCount}
          sub={t("cardCoursesSub")}
        />
        <SummaryCard
          href={`${base}/profile`}
          icon={UserRound}
          label={t("cardProfile")}
          value="→"
          sub={t("cardProfileSub")}
        />
      </div>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
          {tControl("statusTitle")}
        </h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500">{tControl("university")}</dt>
            <dd className="font-semibold">{String(status?.university || "—")}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{tControl("nationality")}</dt>
            <dd className="font-semibold">{String(status?.nationality || "—")}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{tControl("visaType")}</dt>
            <dd className="font-semibold">{String(status?.visaType || "—")}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{tControl("visaDday")}</dt>
            <dd className="font-semibold">
              {status?.visaDday != null ? `D-${status.visaDday}` : "—"}
            </dd>
          </div>
        </dl>
      </section>

      {(data?.alerts?.length ?? 0) > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            {tControl("alertsTitle")}
          </h2>
          {data!.alerts.slice(0, 2).map((a) => (
            <Link
              key={a.id}
              href={`/${locale}${a.actionUrl || "/assistant"}`}
              className="block rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 px-4 py-3 text-sm"
            >
              <p className="font-semibold text-slate-900 dark:text-slate-100">{a.title}</p>
              {a.body && <p className="text-slate-600 dark:text-slate-400 mt-0.5">{a.body}</p>}
            </Link>
          ))}
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            {tControl("todayTitle")}
          </h2>
          <Link href={`${base}/schedule`} className="text-xs font-semibold text-primary-600">
            {t("openSchedule")}
          </Link>
        </div>
        {(data?.todaySchedule?.length ?? 0) === 0 ? (
          <p className="text-sm text-slate-500">{tControl("noSchedule")}</p>
        ) : (
          <ul className="space-y-2">
            {data!.todaySchedule.slice(0, 3).map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 text-sm border-b border-slate-100 dark:border-slate-800 last:border-0 pb-2 last:pb-0"
              >
                <span className="text-xs font-mono text-slate-500 w-14 shrink-0">
                  {new Date(s.startsAt).toLocaleTimeString(locale === "kr" ? "ko-KR" : "en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-100">{s.title}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
