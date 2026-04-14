"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { enrollmentApi } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import { BookOpen, ArrowLeft } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import PlatformCard from "@/components/ui/PlatformCard";
import Toast from "@/components/ui/Toast";

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

function enrollmentLabel(
  t: (key: string) => string,
  s: EnrollmentItem["status"]
) {
  if (s === "active") return t("enrollment.active");
  if (s === "completed") return t("enrollment.completed");
  return t("enrollment.cancelled");
}

function paymentLabel(t: (key: string) => string, p: EnrollmentItem["paymentStatus"]) {
  if (p === "pending") return t("payment.pending");
  if (p === "paid") return t("payment.paid");
  return t("payment.refunded");
}

export default function MyEnrollmentsPage() {
  const locale = useLocale();
  const fmt = useFormatter();
  const router = useRouter();
  const t = useTranslations("myPages.enrollments");
  const tMy = useTranslations("myPages");
  const tStatus = useTranslations("status");
  const tCommon = useTranslations("common");
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<EnrollmentItem[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  const loadEnrollments = useCallback(async () => {
    const res = await enrollmentApi.getMine();
    setItems((res.data?.enrollments || []) as EnrollmentItem[]);
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
      await loadEnrollments();
      if (!active) return;
    };
    run();
    return () => {
      active = false;
    };
  }, [user, loadEnrollments]);

  const handleStatus = async (id: string, status: EnrollmentItem["status"]) => {
    setUpdatingId(id);
    const res = await enrollmentApi.updateStatus(id, status);
    setUpdatingId(null);
    if (res.error) {
      setToast({ message: res.error || t("toastErr"), variant: "error" });
      return;
    }
    setToast({ message: t("toastOk"), variant: "success" });
    await loadEnrollments();
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
      <div className="w-full space-y-6">
        <Link
          href={`/${locale}/my/dashboard`}
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {tMy("backDashboard")}
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{t("title")}</h1>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{t("subtitle")}</p>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title={t("emptyTitle")}
            actionLabel={t("emptyCta")}
            actionHref={`/${locale}/lectures`}
          />
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <PlatformCard key={item.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      {tMy("appliedAt")}:{" "}
                      {fmt.dateTime(new Date(item.enrolledAt), {
                        dateStyle: "medium",
                      })}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {item.lecture?.title || tMy("deleted")}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {item.lecture?.category || "—"} · {item.lecture?.duration || "—"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      label={enrollmentLabel(tStatus, item.status)}
                      tone={statusTone(item.status)}
                    />
                    <StatusBadge
                      label={paymentLabel(tStatus, item.paymentStatus)}
                      tone={paymentTone(item.paymentStatus)}
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-800">
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
                          {t("complete")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatus(item.id, "cancelled")}
                          disabled={updatingId === item.id}
                          className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-60"
                        >
                          {t("cancel")}
                        </button>
                      </>
                    )}
                    {item.lecture?.id && (
                      <Link
                        href={`/${locale}/lectures/${item.lecture.id}`}
                        className="inline-flex items-center text-sm font-semibold text-primary-600 hover:underline"
                      >
                        <BookOpen className="w-4 h-4 mr-1" />
                        {t("viewLecture")}
                      </Link>
                    )}
                  </div>
                </div>
              </PlatformCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
