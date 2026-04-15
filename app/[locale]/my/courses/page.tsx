"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { enrollmentApi } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import { BookOpen } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import PlatformCard from "@/components/ui/PlatformCard";
import Toast from "@/components/ui/Toast";

type Tab = "learn" | "status";

interface EnrollmentItem {
  id: string;
  status: "active" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  enrolledAt: string;
  lecture: {
    id: string;
    title: string;
    category: string;
    type: "online" | "offline";
    duration: string;
    price: number;
  } | null;
}

function noteKey(id: string) {
  return `mentorlink-course-notes:${id}`;
}

function statusTone(status: EnrollmentItem["status"]) {
  if (status === "completed") return "green" as const;
  if (status === "cancelled") return "red" as const;
  return "blue" as const;
}

function paymentTone(p: EnrollmentItem["paymentStatus"]) {
  if (p === "paid") return "green" as const;
  if (p === "refunded") return "red" as const;
  return "gray" as const;
}

function CoursesInner() {
  const t = useTranslations("myPages.courses");
  const tEnr = useTranslations("myPages.enrollments");
  const tMy = useTranslations("myPages");
  const tStatus = useTranslations("status");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const fmt = useFormatter();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const tab: Tab = searchParams.get("tab") === "status" ? "status" : "learn";
  const setTab = (next: Tab) => {
    router.replace(`/${locale}/my/courses?tab=${next}`);
  };

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<EnrollmentItem[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await enrollmentApi.getMine();
    setItems((res.data?.enrollments || []) as EnrollmentItem[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push(`/${locale}/login`);
  }, [authLoading, user, router, locale]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const it of items) {
      if (typeof window !== "undefined") {
        next[it.id] = localStorage.getItem(noteKey(it.id)) || "";
      }
    }
    setNotes(next);
  }, [items]);

  const learnItems = useMemo(
    () => items.filter((i) => i.status === "active" || i.status === "completed"),
    [items]
  );

  const persistNote = (enrollmentId: string, value: string) => {
    setNotes((n) => ({ ...n, [enrollmentId]: value }));
    try {
      localStorage.setItem(noteKey(enrollmentId), value);
    } catch {
      /* ignore */
    }
  };

  const enrollmentLabel = (s: EnrollmentItem["status"]) => {
    if (s === "active") return tStatus("enrollment.active");
    if (s === "completed") return tStatus("enrollment.completed");
    return tStatus("enrollment.cancelled");
  };

  const paymentLabel = (p: EnrollmentItem["paymentStatus"]) => {
    if (p === "paid") return tStatus("payment.paid");
    if (p === "pending") return tStatus("payment.pending");
    return tStatus("payment.refunded");
  };

  const handleStatus = async (id: string, status: EnrollmentItem["status"]) => {
    setUpdatingId(id);
    const res = await enrollmentApi.updateStatus(id, status);
    setUpdatingId(null);
    if (res.error) {
      setToast({ message: res.error || tEnr("toastErr"), variant: "error" });
      return;
    }
    setToast({ message: tEnr("toastOk"), variant: "success" });
    await load();
  };

  if (authLoading || !user || loading) {
    return <LoadingState message={tEnr("loading")} />;
  }

  return (
    <div className="w-full space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
          closeLabel={tCommon("close")}
        />
      )}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">{t("title")}</h1>
        <p className="text-sm text-zinc-600 mt-1">{t("subtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl bg-zinc-100 p-1 ring-1 ring-zinc-200/80">
        <button
          type="button"
          onClick={() => setTab("learn")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "learn"
              ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          {t("tabLearn")}
        </button>
        <button
          type="button"
          onClick={() => setTab("status")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "status"
              ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          {t("tabStatus")}
        </button>
      </div>

      {tab === "learn" ? (
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">{t("learnHint")}</p>
          {learnItems.length === 0 ? (
            <EmptyState
              title={t("emptyLearn")}
              actionLabel={t("browseLectures")}
              actionHref={`/${locale}/lectures`}
            />
          ) : (
            learnItems.map((item) => (
              <PlatformCard key={item.id} padding="lg">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {item.lecture?.title || tMy("deleted")}
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1">
                      {item.lecture?.category || "—"} · {item.lecture?.duration || "—"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge
                      label={enrollmentLabel(item.status)}
                      tone={statusTone(item.status)}
                    />
                    <StatusBadge
                      label={paymentLabel(item.paymentStatus)}
                      tone={paymentTone(item.paymentStatus)}
                    />
                  </div>
                </div>
                {item.lecture?.id && (
                  <Link
                    href={`/${locale}/lectures/${item.lecture.id}`}
                    className="inline-flex items-center text-sm font-semibold text-primary-600 hover:underline mb-4"
                  >
                    <BookOpen className="w-4 h-4 mr-1" />
                    {t("goLecture")}
                  </Link>
                )}
                <label className="block text-sm font-medium text-zinc-800 mb-1">{t("notesLabel")}</label>
                <textarea
                  value={notes[item.id] ?? ""}
                  onChange={(e) => persistNote(item.id, e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                  placeholder=""
                />
                <p className="text-xs text-zinc-500 mt-1">{t("notesSaved")}</p>
              </PlatformCard>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">{t("statusHelp")}</p>
          {items.length === 0 ? (
            <EmptyState
              title={tEnr("emptyTitle")}
              actionLabel={tEnr("emptyCta")}
              actionHref={`/${locale}/lectures`}
            />
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <PlatformCard key={item.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">
                        {tMy("appliedAt")}:{" "}
                        {fmt.dateTime(new Date(item.enrolledAt), {
                          dateStyle: "medium",
                        })}
                      </p>
                      <h3 className="text-lg font-semibold text-zinc-900">
                        {item.lecture?.title || tMy("deleted")}
                      </h3>
                      <p className="text-sm text-zinc-600 mt-1">
                        {item.lecture?.category || "—"} · {item.lecture?.duration || "—"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge
                        label={enrollmentLabel(item.status)}
                        tone={statusTone(item.status)}
                      />
                      <StatusBadge
                        label={paymentLabel(item.paymentStatus)}
                        tone={paymentTone(item.paymentStatus)}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-zinc-800">
                      {typeof item.lecture?.price === "number"
                        ? fmt.number(item.lecture.price, {
                            style: "currency",
                            currency: "KRW",
                            maximumFractionDigits: 0,
                          })
                        : "—"}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.status === "active" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStatus(item.id, "completed")}
                            disabled={updatingId === item.id}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {tEnr("complete")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatus(item.id, "cancelled")}
                            disabled={updatingId === item.id}
                            className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50 disabled:opacity-60"
                          >
                            {tEnr("cancel")}
                          </button>
                        </>
                      )}
                      {item.lecture?.id && (
                        <Link
                          href={`/${locale}/lectures/${item.lecture.id}`}
                          className="inline-flex items-center text-sm font-semibold text-primary-600 hover:underline"
                        >
                          <BookOpen className="w-4 h-4 mr-1" />
                          {tEnr("viewLecture")}
                        </Link>
                      )}
                    </div>
                  </div>
                </PlatformCard>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyCoursesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CoursesInner />
    </Suspense>
  );
}
