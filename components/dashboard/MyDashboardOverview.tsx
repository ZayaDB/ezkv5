"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertTriangle,
  BookMarked,
  CalendarDays,
  ChevronRight,
  Map,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getControlCenter } from "@/lib/supabase/home";
import DashboardModeToggle from "@/components/dashboard/DashboardModeToggle";

type HomeData = Awaited<ReturnType<typeof getControlCenter>>;

function SummaryCard({
  href,
  icon: Icon,
  label,
  value,
  sub,
}: {
  href: string;
  icon: typeof Map;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:border-primary-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-500/15 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getControlCenter(user)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const base = `/${locale}/my`;
  const status = data?.statusCard as Record<string, unknown> | undefined;
  const roadmaps = data?.activeRoadmaps ?? [];
  const avgProgress = useMemo(() => {
    if (!roadmaps.length) return 0;
    return Math.round(roadmaps.reduce((s, r) => s + r.progress, 0) / roadmaps.length);
  }, [roadmaps]);

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const canUseMentorMode = user?.role === "mentor" || user?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("greeting", { name: user?.name ?? "" })}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {roleLabel} · {t("subtitle")}
          </p>
        </div>
        <DashboardModeToggle canUseMentorMode={canUseMentorMode} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          href={`/${locale}/roadmap`}
          icon={Map}
          label={t("cardRoadmaps")}
          value={roadmaps.length}
          sub={roadmaps.length ? t("avgProgress", { pct: avgProgress }) : t("startRoadmap")}
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
          value={0}
          sub={t("comingSoon")}
        />
        <SummaryCard
          href={`${base}/profile`}
          icon={UserRound}
          label={t("cardProfile")}
          value="→"
          sub={t("cardProfileSub")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

        <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t("roadmapChart")}
            </h2>
            <Link href={`/${locale}/roadmap`} className="text-xs font-semibold text-primary-600">
              {tControl("viewAll")}
            </Link>
          </div>
          {roadmaps.length === 0 ? (
            <p className="text-sm text-slate-500">{tControl("noRoadmaps")}</p>
          ) : (
            <div className="space-y-3">
              {roadmaps.slice(0, 4).map((r) => (
                <div key={r.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate pr-2">
                      {r.title}
                    </span>
                    <span className="font-bold text-primary-600 shrink-0">{r.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${r.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {(data?.alerts?.length ?? 0) > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            {tControl("alertsTitle")}
          </h2>
          {data!.alerts.slice(0, 2).map((a) => (
            <Link
              key={a.id}
              href={`/${locale}${a.actionUrl || "/roadmap"}`}
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
