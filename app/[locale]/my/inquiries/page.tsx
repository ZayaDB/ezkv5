"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { inquiryApi } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import PlatformCard from "@/components/ui/PlatformCard";
import LoadingState from "@/components/ui/LoadingState";
import Toast from "@/components/ui/Toast";

type Inquiry = {
  id: string;
  subject: string;
  body: string;
  status: string;
  adminReply?: string;
};

export default function MyInquiriesPage() {
  const t = useTranslations("myPages.inquiries");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [list, setList] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await inquiryApi.list();
    if (res.data?.inquiries) setList(res.data.inquiries as Inquiry[]);
    else setList([]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push(`/${locale}/login`);
  }, [authLoading, user, router, locale]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  const submit = async () => {
    setSubmitting(true);
    const res = await inquiryApi.create({ subject, body });
    setSubmitting(false);
    if (res.error) {
      setToast({ message: res.error, variant: "error" });
      return;
    }
    setSubject("");
    setBody("");
    setToast({ message: t("created"), variant: "success" });
    await load();
  };

  const startEdit = (q: Inquiry) => {
    setEditingId(q.id);
    setEditSubject(q.subject);
    setEditBody(q.body);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const res = await inquiryApi.update(editingId, { subject: editSubject, body: editBody });
    if (res.error) {
      setToast({ message: res.error, variant: "error" });
      return;
    }
    setEditingId(null);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("삭제할까요?")) return;
    const res = await inquiryApi.remove(id);
    if (res.error) {
      setToast({ message: res.error, variant: "error" });
      return;
    }
    await load();
  };

  if (authLoading || !user) {
    return <LoadingState />;
  }

  return (
    <div className="max-w-3xl space-y-8">
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
          closeLabel={tCommon("close")}
        />
      )}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{t("title")}</h1>
        <p className="text-sm text-zinc-600 mt-1">{t("subtitle")}</p>
      </div>

      <PlatformCard padding="lg">
        <h2 className="text-sm font-semibold text-zinc-900 mb-3">{t("formTitle")}</h2>
        <div className="space-y-3">
          <input
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
            placeholder={t("subject")}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <textarea
            className="w-full min-h-[120px] rounded-xl border border-zinc-200 px-3 py-2 text-sm"
            placeholder={t("body")}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button
            type="button"
            disabled={submitting}
            onClick={() => void submit()}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {t("submit")}
          </button>
        </div>
      </PlatformCard>

      {loading ? (
        <p className="text-sm text-zinc-500">{t("loading")}</p>
      ) : list.length === 0 ? (
        <PlatformCard>
          <p className="text-sm text-zinc-600">{t("empty")}</p>
        </PlatformCard>
      ) : (
        <ul className="space-y-4">
          {list.map((q) => (
            <PlatformCard key={q.id} padding="lg">
              {editingId === q.id ? (
                <div className="space-y-2">
                  <input
                    className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                  />
                  <textarea
                    className="w-full min-h-[100px] rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void saveEdit()}
                      className="text-xs font-semibold text-primary-600"
                    >
                      {t("save")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-xs text-zinc-500"
                    >
                      {t("cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-semibold text-zinc-900">{q.subject}</h3>
                    <span className="text-xs font-medium text-zinc-500">
                      {q.status === "answered" ? t("statusAnswered") : t("statusOpen")}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 mt-2 whitespace-pre-wrap">{q.body}</p>
                  {q.adminReply ? (
                    <div className="mt-4 rounded-xl bg-primary-50/80 border border-primary-100 px-3 py-3 text-sm">
                      <p className="text-xs font-semibold text-primary-800 mb-1">
                        {t("adminReply")}
                      </p>
                      <p className="text-zinc-800 whitespace-pre-wrap">{q.adminReply}</p>
                    </div>
                  ) : null}
                  {q.status === "open" && (
                    <div className="mt-3 flex gap-3 text-xs font-semibold">
                      <button type="button" className="text-primary-600" onClick={() => startEdit(q)}>
                        {t("edit")}
                      </button>
                      <button type="button" className="text-red-600" onClick={() => void remove(q.id)}>
                        {t("delete")}
                      </button>
                    </div>
                  )}
                </>
              )}
            </PlatformCard>
          ))}
        </ul>
      )}
    </div>
  );
}
