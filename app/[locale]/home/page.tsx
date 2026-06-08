"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Map,
  Sparkles,
} from "lucide-react";
import { homeApi } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouteGuard } from "@/lib/hooks/useRouteGuard";

type HomeData = Awaited<ReturnType<typeof homeApi.getControlCenter>>["data"];

export default function HomeControlCenterPage() {
  const t = useTranslations("controlCenter");
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const { allowed, loading: guardLoading } = useRouteGuard({ requireAuth: true, locale });
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!allowed) return;
    homeApi
      .getControlCenter()
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, [allowed]);

  if (guardLoading || !allowed) return null;

  const status = data?.statusCard as Record<string, unknown> | undefined;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8 space-y-6">
      <header>
        <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold">{t("badge")}</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {t("greeting", { name: user?.name || "" })}
        </h1>
      </header>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : (
        <>
          {/* Section 1: Status Card */}
          <section className="rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 text-white p-5 shadow-lg">
            <h2 className="text-sm font-medium opacity-90">{t("statusTitle")}</h2>
            <p className="text-xl font-bold mt-1">{String(status?.name || user?.name)}</p>
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div>
                <span className="opacity-75">{t("university")}</span>
                <p className="font-semibold">{String(status?.university || "—")}</p>
              </div>
              <div>
                <span className="opacity-75">{t("nationality")}</span>
                <p className="font-semibold">{String(status?.nationality || "—")}</p>
              </div>
              <div>
                <span className="opacity-75">{t("visaType")}</span>
                <p className="font-semibold">{String(status?.visaType || "—")}</p>
              </div>
              <div>
                <span className="opacity-75">{t("visaDday")}</span>
                <p className="font-semibold">
                  {status?.visaDday != null ? `D-${status.visaDday}` : "—"}
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Alerts */}
          {(data?.alerts?.length ?? 0) > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {t("alertsTitle")}
              </h2>
              {data!.alerts.map((a: any) => (
                <Link
                  key={a.id}
                  href={`/${locale}${a.actionUrl || "/roadmap"}`}
                  className={`block rounded-xl p-4 border ${
                    a.severity === "urgent"
                      ? "border-red-300 bg-red-50 dark:bg-red-950/30"
                      : a.severity === "warning"
                      ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30"
                      : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  }`}
                >
                  <p className="font-semibold text-gray-900 dark:text-white">{a.title}</p>
                  {a.body && <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{a.body}</p>}
                </Link>
              ))}
            </section>
          )}

          {/* Section 3: Roadmaps */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                <Map className="w-4 h-4" />
                {t("roadmapsTitle")}
              </h2>
              <Link href={`/${locale}/roadmap`} className="text-xs text-primary-600 font-semibold">
                {t("viewAll")}
              </Link>
            </div>
            {(data?.activeRoadmaps?.length ?? 0) === 0 ? (
              <Link
                href={`/${locale}/roadmap`}
                className="block rounded-xl border border-dashed border-gray-300 dark:border-slate-600 p-6 text-center text-sm text-gray-500"
              >
                {t("noRoadmaps")}
              </Link>
            ) : (
              <div className="space-y-3">
                {data!.activeRoadmaps.map((r: any) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4"
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-gray-900 dark:text-white">{r.title}</p>
                      <span className="text-sm font-bold text-primary-600">{r.progress}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${r.progress}%` }}
                      />
                    </div>
                    {r.nextStep && (
                      <p className="text-xs text-gray-500 mt-2">{t("nextStep")}: {r.nextStep}</p>
                    )}
                    <Link
                      href={`/${locale}/roadmap`}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-600"
                    >
                      {t("continue")} <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 4: Today */}
          <section>
            <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4" />
              {t("todayTitle")}
            </h2>
            {(data?.todaySchedule?.length ?? 0) === 0 ? (
              <p className="text-sm text-gray-500 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                {t("noSchedule")}
              </p>
            ) : (
              <div className="space-y-2">
                {data!.todaySchedule.map((s: any) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-3"
                  >
                    <span className="text-xs font-mono text-gray-500">
                      {new Date(s.startsAt).toLocaleTimeString(locale === "kr" ? "ko-KR" : "en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-slate-100">{s.title}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 5: Recommended */}
          <section>
            <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" />
              {t("actionsTitle")}
            </h2>
            <div className="grid gap-2">
              {(data?.recommendedActions || []).map((a: any) => (
                <Link
                  key={a.id}
                  href={`/${locale}${a.actionUrl}`}
                  className="flex items-center justify-between rounded-xl bg-primary-50 dark:bg-primary-950/30 px-4 py-3 text-sm font-semibold text-primary-800 dark:text-primary-200"
                >
                  {a.title}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
