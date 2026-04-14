"use client";

import { useCallback, useEffect, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { enrollmentApi } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import PlatformCard from "@/components/ui/PlatformCard";
import LoadingState from "@/components/ui/LoadingState";

export default function MyReceiptsPage() {
  const t = useTranslations("myPages.receipts");
  const tPay = useTranslations("status.payment");
  const locale = useLocale();
  const fmt = useFormatter();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await enrollmentApi.getMine();
    setRows(res.data?.enrollments || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push(`/${locale}/login`);
  }, [authLoading, user, router, locale]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  const payLabel = (s: string) => {
    if (s === "paid") return tPay("paid");
    if (s === "pending") return tPay("pending");
    if (s === "refunded") return tPay("refunded");
    return s;
  };

  if (authLoading || !user) {
    return <LoadingState />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{t("title")}</h1>
        <p className="text-sm text-zinc-600 mt-1">{t("subtitle")}</p>
      </div>

      {loading ? (
        <LoadingState />
      ) : rows.length === 0 ? (
        <PlatformCard>
          <p className="text-sm text-zinc-600">{t("empty")}</p>
        </PlatformCard>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">{t("lecture")}</th>
                <th className="px-4 py-3">{t("amount")}</th>
                <th className="px-4 py-3">{t("payment")}</th>
                <th className="px-4 py-3">{t("enrolledAt")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((e) => (
                <tr key={e.id} className="hover:bg-zinc-50/80">
                  <td className="px-4 py-3 font-medium text-zinc-900">{e.lecture?.title || "—"}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {e.lecture?.price != null
                      ? fmt.number(e.lecture.price, { style: "currency", currency: "KRW" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{payLabel(e.paymentStatus)}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {e.enrolledAt
                      ? fmt.dateTime(new Date(e.enrolledAt), { dateStyle: "medium" })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
