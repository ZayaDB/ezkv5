"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { sessionApi } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ArrowLeft, CalendarCheck2 } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import PlatformCard from "@/components/ui/PlatformCard";
import Toast from "@/components/ui/Toast";

interface SessionItem {
  id: string;
  date: string;
  duration: number;
  type: "online" | "offline";
  status: "upcoming" | "completed" | "cancelled";
  mentorId: string | null;
  mentorName: string;
}

function sessionTone(status: SessionItem["status"]) {
  if (status === "completed") return "green" as const;
  if (status === "cancelled") return "red" as const;
  return "blue" as const;
}

function sessionLabel(t: (key: string) => string, s: SessionItem["status"]) {
  if (s === "upcoming") return t("session.upcoming");
  if (s === "completed") return t("session.completed");
  return t("session.cancelled");
}

export default function MySessionsPage() {
  const locale = useLocale();
  const fmt = useFormatter();
  const router = useRouter();
  const t = useTranslations("myPages.sessions");
  const tMy = useTranslations("myPages");
  const tStatus = useTranslations("status");
  const tCommon = useTranslations("common");
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SessionItem[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  const load = useCallback(async () => {
    const res = await sessionApi.getMine();
    setItems((res.data?.sessions || []) as SessionItem[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [authLoading, user, router, locale]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!user) return;
      await load();
      if (!active) return;
    };
    run();
    return () => {
      active = false;
    };
  }, [user, load]);

  const handleStatus = async (id: string, status: "completed" | "cancelled") => {
    setUpdatingId(id);
    const res = await sessionApi.updateStatus(id, status);
    setUpdatingId(null);
    if (res.error) {
      setToast({ message: res.error || t("toastErr"), variant: "error" });
      return;
    }
    setToast({ message: t("toastOk"), variant: "success" });
    await load();
  };

  if (authLoading || !user || loading) {
    return <LoadingState message={t("loading")} />;
  }

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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {tMy("backDashboard")}
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("title")}</h1>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{t("subtitle")}</p>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title={t("emptyTitle")}
            actionLabel={t("emptyCta")}
            actionHref={`/${locale}/mentors`}
          />
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <PlatformCard key={item.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {item.mentorId ? (
                        <Link
                          href={`/${locale}/mentors/${item.mentorId}`}
                          className="hover:text-primary-600"
                        >
                          {item.mentorName}
                        </Link>
                      ) : (
                        item.mentorName
                      )}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {fmt.dateTime(new Date(item.date), {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}{" "}
                      · {t("minutes", { n: item.duration })} ·{" "}
                      {item.type === "online" ? t("typeOnline") : t("typeOffline")}
                    </p>
                  </div>
                  <StatusBadge
                    label={sessionLabel(tStatus, item.status)}
                    tone={sessionTone(item.status)}
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {item.status === "upcoming" && (
                    <>
                      <button
                        type="button"
                        disabled={updatingId === item.id}
                        onClick={() => handleStatus(item.id, "completed")}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {t("complete")}
                      </button>
                      <button
                        type="button"
                        disabled={updatingId === item.id}
                        onClick={() => handleStatus(item.id, "cancelled")}
                        className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-60"
                      >
                        {t("cancel")}
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => router.push(`/${locale}/dashboard`)}
                    className="inline-flex items-center text-sm font-semibold text-primary-600 hover:underline"
                  >
                    <CalendarCheck2 className="w-4 h-4 mr-1" />
                    {t("changeOnDashboard")}
                  </button>
                </div>
              </PlatformCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
