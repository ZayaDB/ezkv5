"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { adminApi } from "@/lib/api/client";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingState from "@/components/ui/LoadingState";
import PlatformCard from "@/components/ui/PlatformCard";
import Toast from "@/components/ui/Toast";

type Tab = "all" | "community" | "freelancer" | "mentor" | "posts";

interface QueueItem {
  id: string;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
  group: { id: string; name: string; category: string } | null;
}

interface MentorQueueItem {
  id: string;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
  title?: string;
  location?: string;
  specialties?: string[];
}

interface ChannelPostAdminRow {
  id: string;
  channelType: "community" | "freelancer";
  channelId: string;
  groupName: string;
  title: string;
  bodyPreview: string;
  createdAt: string;
  author: { id: string; name: string; email: string };
}

const PAGE_SIZE = 8;

export default function AdminModerationPage() {
  const locale = useLocale();
  const fmt = useFormatter();
  const t = useTranslations("adminModeration");
  const tStatus = useTranslations("status");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [communityPending, setCommunityPending] = useState<QueueItem[]>([]);
  const [freelancerPending, setFreelancerPending] = useState<QueueItem[]>([]);
  const [mentorPending, setMentorPending] = useState<MentorQueueItem[]>([]);
  const [channelPosts, setChannelPosts] = useState<ChannelPostAdminRow[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("mentor");
  const [deleteTarget, setDeleteTarget] = useState<ChannelPostAdminRow | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [pageComm, setPageComm] = useState(1);
  const [pageFree, setPageFree] = useState(1);
  const [pageMent, setPageMent] = useState(1);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error" | "info";
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [qRes, pRes] = await Promise.all([
      adminApi.getModerationQueue(),
      adminApi.getChannelPosts(100),
    ]);
    setCommunityPending(qRes.data?.communityPending || []);
    setFreelancerPending(qRes.data?.freelancerPending || []);
    setMentorPending(qRes.data?.mentorPending || []);
    setChannelPosts((pRes.data?.posts || []) as ChannelPostAdminRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push(`/${locale}/login`);
      return;
    }
    if (user?.role === "admin") load();
  }, [authLoading, user, router, locale, load]);

  const updateStatus = async (
    type: "community" | "freelancer" | "mentor",
    id: string,
    status: string,
    successKey: "toastApproved" | "toastRejected"
  ) => {
    const res = await adminApi.updateModerationStatus({ type, id, status });
    if (res.error) {
      setToast({ message: res.error || t("toastError"), variant: "error" });
      return;
    }
    setToast({ message: t(successKey), variant: "success" });
    await load();
  };

  const filteredCommunity = useMemo(
    () =>
      communityPending.filter((item) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          item.user?.name?.toLowerCase().includes(q) ||
          item.user?.email?.toLowerCase().includes(q) ||
          item.group?.name?.toLowerCase().includes(q)
        );
      }),
    [communityPending, search]
  );

  const filteredFreelancer = useMemo(
    () =>
      freelancerPending.filter((item) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          item.user?.name?.toLowerCase().includes(q) ||
          item.user?.email?.toLowerCase().includes(q) ||
          item.group?.name?.toLowerCase().includes(q)
        );
      }),
    [freelancerPending, search]
  );

  const filteredMentor = useMemo(
    () =>
      mentorPending.filter((item) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          item.user?.name?.toLowerCase().includes(q) ||
          item.user?.email?.toLowerCase().includes(q) ||
          (item.title || "").toLowerCase().includes(q) ||
          (item.specialties || []).some((s) => s.toLowerCase().includes(q))
        );
      }),
    [mentorPending, search]
  );

  const filteredPosts = useMemo(
    () =>
      channelPosts.filter((p) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          p.title.toLowerCase().includes(q) ||
          p.bodyPreview.toLowerCase().includes(q) ||
          p.groupName.toLowerCase().includes(q) ||
          p.author.name.toLowerCase().includes(q) ||
          p.author.email.toLowerCase().includes(q)
        );
      }),
    [channelPosts, search]
  );

  const totalRows =
    tab === "all"
      ? filteredCommunity.length + filteredFreelancer.length + filteredMentor.length
      : tab === "community"
        ? filteredCommunity.length
        : tab === "freelancer"
          ? filteredFreelancer.length
          : tab === "posts"
            ? filteredPosts.length
            : filteredMentor.length;

  const totalPagesComm = Math.max(1, Math.ceil(filteredCommunity.length / PAGE_SIZE));
  const totalPagesFree = Math.max(1, Math.ceil(filteredFreelancer.length / PAGE_SIZE));
  const totalPagesMent = Math.max(1, Math.ceil(filteredMentor.length / PAGE_SIZE));

  const pagedCommunity = filteredCommunity.slice(
    (pageComm - 1) * PAGE_SIZE,
    pageComm * PAGE_SIZE
  );
  const pagedFreelancer = filteredFreelancer.slice(
    (pageFree - 1) * PAGE_SIZE,
    pageFree * PAGE_SIZE
  );
  const pagedMentor = filteredMentor.slice(
    (pageMent - 1) * PAGE_SIZE,
    pageMent * PAGE_SIZE
  );

  useEffect(() => {
    setPageComm(1);
    setPageFree(1);
    setPageMent(1);
  }, [search, tab]);

  if (authLoading || !user || loading) {
    return <LoadingState message={t("loading")} />;
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: t("tabAll") },
    { id: "mentor", label: t("tabMentor") },
    { id: "community", label: t("tabCommunity") },
    { id: "freelancer", label: t("tabFreelancer") },
    { id: "posts", label: t("tabPosts") },
  ];

  const gridClass =
    tab === "all" ? "grid grid-cols-1 xl:grid-cols-3 gap-6" : "grid grid-cols-1 gap-6";

  const submitDeletePost = async () => {
    if (!deleteTarget) return;
    const r = deleteReason.trim();
    if (!r) {
      setToast({ message: t("deleteReasonRequired"), variant: "error" });
      return;
    }
    setDeleting(true);
    const res = await adminApi.deleteChannelPost(deleteTarget.id, r);
    setDeleting(false);
    if (res.error) {
      setToast({ message: res.error || t("toastError"), variant: "error" });
      return;
    }
    setToast({ message: t("toastPostDeleted"), variant: "success" });
    setDeleteTarget(null);
    setDeleteReason("");
    await load();
  };

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("title")}</h1>
            <p className="text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">{t("subtitle")}</p>
          </div>
          <Link
            href={`/${locale}/admin/dashboard`}
            className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors self-start"
          >
            {t("backAdmin")}
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setTab(x.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                tab === x.id
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>

        <PlatformCard className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <span className="text-sm text-slate-500 whitespace-nowrap shrink-0">
            {t("total", { count: totalRows })}
          </span>
        </PlatformCard>

        <div className={gridClass}>
          {(tab === "all" || tab === "mentor") && (
            <PlatformCard padding="lg">
              <h2 className="text-base font-semibold text-slate-900 mb-4">{t("mentorTitle")}</h2>
              {pagedMentor.length === 0 ? (
                <p className="text-sm text-slate-500">{t("emptyMentor")}</p>
              ) : (
                <div className="space-y-3">
                  {pagedMentor.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                    >
                      <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.user?.name} · {item.user?.email}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.location} · {t("mentorSpec")}:{" "}
                        {(item.specialties || []).join(", ") || "—"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {fmt.dateTime(new Date(item.createdAt), {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusBadge label={tStatus("moderation.pending")} tone="purple" />
                        <button
                          type="button"
                          onClick={() => updateStatus("mentor", item.id, "approved", "toastApproved")}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          {t("approve")}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus("mentor", item.id, "rejected", "toastRejected")}
                          className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                        >
                          {t("reject")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {filteredMentor.length > PAGE_SIZE && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPageMent((p) => Math.max(1, p - 1))}
                    disabled={pageMent === 1}
                    className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 disabled:opacity-50"
                  >
                    {t("prev")}
                  </button>
                  <span className="text-sm text-slate-600">
                    {t("page", { current: pageMent, total: totalPagesMent })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPageMent((p) => Math.min(totalPagesMent, p + 1))}
                    disabled={pageMent === totalPagesMent}
                    className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 disabled:opacity-50"
                  >
                    {t("next")}
                  </button>
                </div>
              )}
            </PlatformCard>
          )}

          {(tab === "all" || tab === "community") && (
            <PlatformCard padding="lg">
              <h2 className="text-base font-semibold text-slate-900 mb-4">{t("communityTitle")}</h2>
              {pagedCommunity.length === 0 ? (
                <p className="text-sm text-slate-500">{t("emptyCommunity")}</p>
              ) : (
                <div className="space-y-3">
                  {pagedCommunity.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                    >
                      <p className="font-semibold text-slate-900 text-sm">
                        {item.user?.name} → {item.group?.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.user?.email} ·{" "}
                        {fmt.dateTime(new Date(item.createdAt), {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusBadge label={tStatus("moderation.pending")} tone="purple" />
                        <button
                          type="button"
                          onClick={() => updateStatus("community", item.id, "approved", "toastApproved")}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          {t("approve")}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus("community", item.id, "rejected", "toastRejected")}
                          className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                        >
                          {t("reject")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {filteredCommunity.length > PAGE_SIZE && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPageComm((p) => Math.max(1, p - 1))}
                    disabled={pageComm === 1}
                    className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 disabled:opacity-50"
                  >
                    {t("prev")}
                  </button>
                  <span className="text-sm text-slate-600">
                    {t("page", { current: pageComm, total: totalPagesComm })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPageComm((p) => Math.min(totalPagesComm, p + 1))}
                    disabled={pageComm === totalPagesComm}
                    className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 disabled:opacity-50"
                  >
                    {t("next")}
                  </button>
                </div>
              )}
            </PlatformCard>
          )}

          {(tab === "all" || tab === "freelancer") && (
            <PlatformCard padding="lg">
              <h2 className="text-base font-semibold text-slate-900 mb-4">{t("freelancerTitle")}</h2>
              {pagedFreelancer.length === 0 ? (
                <p className="text-sm text-slate-500">{t("emptyFreelancer")}</p>
              ) : (
                <div className="space-y-3">
                  {pagedFreelancer.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                    >
                      <p className="font-semibold text-slate-900 text-sm">
                        {item.user?.name} → {item.group?.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.user?.email} ·{" "}
                        {fmt.dateTime(new Date(item.createdAt), {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusBadge label={tStatus("moderation.pending")} tone="purple" />
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus("freelancer", item.id, "accepted", "toastApproved")
                          }
                          className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          {t("approve")}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus("freelancer", item.id, "rejected", "toastRejected")
                          }
                          className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-50"
                        >
                          {t("reject")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {filteredFreelancer.length > PAGE_SIZE && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPageFree((p) => Math.max(1, p - 1))}
                    disabled={pageFree === 1}
                    className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 disabled:opacity-50"
                  >
                    {t("prev")}
                  </button>
                  <span className="text-sm text-slate-600">
                    {t("page", { current: pageFree, total: totalPagesFree })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPageFree((p) => Math.min(totalPagesFree, p + 1))}
                    disabled={pageFree === totalPagesFree}
                    className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 disabled:opacity-50"
                  >
                    {t("next")}
                  </button>
                </div>
              )}
            </PlatformCard>
          )}

          {tab === "posts" && (
            <PlatformCard padding="lg">
              <h2 className="text-base font-semibold text-slate-900 mb-4">{t("postsTitle")}</h2>
              {filteredPosts.length === 0 ? (
                <p className="text-sm text-slate-500">{t("emptyPosts")}</p>
              ) : (
                <div className="space-y-3">
                  {filteredPosts.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2"
                    >
                      <p className="font-semibold text-slate-900 text-sm">{p.title}</p>
                      <p className="text-xs text-slate-600 whitespace-pre-wrap">{p.bodyPreview}</p>
                      <p className="text-xs text-slate-500">
                        {p.channelType === "community" ? t("postChannelCommunity") : t("postChannelFreelancer")}{" "}
                        · {p.groupName || "—"} · {p.author.name} ({p.author.email})
                      </p>
                      <p className="text-xs text-slate-400">
                        {fmt.dateTime(new Date(p.createdAt), {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteTarget(p);
                          setDeleteReason("");
                        }}
                        className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-50"
                      >
                        {t("deletePost")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </PlatformCard>
          )}
        </div>

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">{t("deletePostModalTitle")}</h3>
              <p className="text-sm text-slate-600">
                「{deleteTarget.title}」 — {deleteTarget.author.name}
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t("deleteReasonLabel")}
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder={t("deleteReasonPlaceholder")}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget(null);
                    setDeleteReason("");
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  {tCommon("close")}
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => void submitDeletePost()}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {deleting ? "…" : t("confirmDeletePost")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
