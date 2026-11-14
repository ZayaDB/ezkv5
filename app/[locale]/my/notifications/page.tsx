"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { dismissAlert, listAlerts, markAlertsRead, type UserAlert } from "@/lib/supabase/alerts";
import { useAuth } from "@/lib/contexts/AuthContext";
import LoadingState from "@/components/ui/LoadingState";
import PlatformCard from "@/components/ui/PlatformCard";
import { useFormatDate } from "@/lib/i18n/useFormatDate";

export default function MyNotificationsPage() {
  const t = useTranslations("myPages.notifications");
  const locale = useLocale();
  const fd = useFormatDate();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<UserAlert[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const alerts = await listAlerts(user.id);
      setItems(alerts);
      await markAlertsRead(user.id);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) router.push(`/${locale}/login`);
  }, [authLoading, user, router, locale]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  const dismissAll = async () => {
    if (!user || items.length === 0) return;
    await Promise.all(items.map((item) => dismissAlert(user.id, item.id)));
    await load();
  };

  const dismissOne = async (id: string) => {
    if (!user) return;
    await dismissAlert(user.id, id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  if ((authLoading && !user) || !user || loading) {
    return <LoadingState message={t("loading")} />;
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold leading-[1.2] text-ink dark:text-snow sm:text-[32px]">{t("title")}</h1>
          <p className="mt-2 text-base leading-[1.55] text-ink-muted dark:text-snow-muted">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => void dismissAll()}
              className="rounded-lg bg-teal px-3 py-2 text-xs font-semibold text-white hover:bg-primary-700 dark:bg-teal-dark dark:text-night dark:hover:bg-primary-400"
            >
              {t("dismissAll")}
            </button>
          )}
          <Link
            href={`/${locale}/my/dashboard`}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:text-snow-muted dark:bg-night"
          >
            ←
          </Link>
        </div>
      </div>

      <PlatformCard padding="lg">
        {items.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-snow-muted">{t("empty")}</p>
        ) : (
          <ul className="space-y-4">
            {items.map((n) => (
              <li
                key={n.id}
                className={`rounded-xl border px-4 py-3 ${
                  n.severity === "urgent"
                    ? "border-red-200 bg-red-50/50"
                    : n.severity === "warning"
                      ? "border-amber-200 bg-amber-50/50"
                      : "border-primary-100 bg-primary-50/40"
                }`}
              >
                <p className="text-sm font-semibold text-zinc-900 dark:text-snow">{n.title}</p>
                {n.body && <p className="text-sm text-zinc-800 whitespace-pre-wrap mt-1 dark:text-snow">{n.body}</p>}
                {n.dueDate && (
                  <p className="text-xs text-zinc-500 mt-1 dark:text-snow-muted">
                    {t("dueDate", { date: fd(new Date(n.dueDate), { dateStyle: "medium" }) })}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-3">
                  {n.actionUrl && (
                    <Link
                      href={`/${locale}${n.actionUrl.startsWith("/") ? n.actionUrl : `/${n.actionUrl}`}`}
                      className="text-xs font-semibold text-primary-600 hover:underline"
                    >
                      {t("viewAction")}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => void dismissOne(n.id)}
                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-snow-muted"
                  >
                    {t("dismiss")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PlatformCard>
    </div>
  );
}
