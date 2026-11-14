"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useFormatter } from "next-intl";
import { useAuth } from "@/lib/contexts/AuthContext";
import { adminApi } from "@/lib/api";

type InquiryRow = {
  id: string;
  subject: string;
  body: string;
  status: string;
  adminReply: string;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
};

export default function AdminInquiriesPage() {
  const locale = useLocale();
  const t = useTranslations("admin");
  const router = useRouter();
  const fmt = useFormatter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [items, setItems] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.listInquiries();
    setItems((res.data?.inquiries || []) as InquiryRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== "admin")) {
      router.push(`/${locale}/login`);
      return;
    }
    if (currentUser?.role === "admin") void load();
  }, [authLoading, currentUser, locale, router, load]);

  const submitReply = async (id: string) => {
    const text = (replyDraft[id] || "").trim();
    if (!text) return;
    setSavingId(id);
    const res = await adminApi.replyInquiry(id, text);
    setSavingId(null);
    if (res.error) {
      alert(res.error);
      return;
    }
    setReplyDraft((d) => ({ ...d, [id]: "" }));
    await load();
  };

  if (authLoading || loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-100">
      <div className="bg-gradient-to-r from-slate-700 to-primary-700 py-8 rounded-t-2xl">
        <div className="px-6 sm:px-8">
          <h1 className="text-3xl font-extrabold text-white">{t("inquiriesTitle")}</h1>
          <p className="text-white/85 mt-2 text-sm">
            {t("inquiriesSubtitle")}
          </p>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-10 space-y-6">
        {items.length === 0 ? (
          <p className="text-gray-600 text-sm">{t("noInquiries")}</p>
        ) : (
          items.map((q) => (
            <article
              key={q.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    {q.status === "answered" ? t("answered") : t("received")}
                  </p>
                  <h2 className="text-lg font-bold text-gray-900 mt-1">{q.subject}</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {q.user ? (
                      <>
                        {q.user.name} · {q.user.email}
                      </>
                    ) : (
                      "—"
                    )}
                    {" · "}
                    {fmt.dateTime(new Date(q.createdAt), { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{q.body}</p>
              </div>
              {q.adminReply ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                  <p className="text-xs font-semibold text-emerald-800 mb-1">{t("previousReply")}</p>
                  <p className="text-sm text-emerald-950 whitespace-pre-wrap">{q.adminReply}</p>
                </div>
              ) : null}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">{t("adminReply")}</label>
                <textarea
                  value={replyDraft[q.id] ?? ""}
                  onChange={(e) => setReplyDraft((d) => ({ ...d, [q.id]: e.target.value }))}
                  rows={4}
                  placeholder={t("replyPlaceholder")}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  disabled={savingId === q.id}
                  onClick={() => void submitReply(q.id)}
                  className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                >
                  {savingId === q.id ? t("saving") : t("submitReply")}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
