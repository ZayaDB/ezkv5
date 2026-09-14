"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { dismissAlert, listAlerts, type UserAlert } from "@/lib/supabase/alerts";
import { useAuth } from "@/lib/contexts/AuthContext";
import LoadingState from "@/components/ui/LoadingState";
import PlatformCard from "@/components/ui/PlatformCard";

export default function MyNotificationsPage() {
  const t = useTranslations("myPages.notifications");
  const locale = useLocale();
  const fmt = useFormatter();
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
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">{t("title")}</h1>
          <p className="text-sm text-zinc-600 mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => void dismissAll()}
              className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
            >
              {t("dismissAll")}
            </button>
          )}
          <Link
            href={`/${locale}/my/dashboard`}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50"
          >
            ←
          </Link>
        </div>
      </div>

      <PlatformCard padding="lg">
        {items.length === 0 ? (
          <p className="text-sm text-zinc-600">{t("empty")}</p>
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
                <p className="text-sm font-semibold text-zinc-900">{n.title}</p>
                {n.body && <p className="text-sm text-zinc-800 whitespace-pre-wrap mt-1">{n.body}</p>}
                {n.dueDate && (
                  <p className="text-xs text-zinc-500 mt-1">
                    {t("dueDate", { date: fmt.dateTime(new Date(n.dueDate), { dateStyle: "medium" }) })}
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
                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-800"
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
