"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { notificationsApi } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import LoadingState from "@/components/ui/LoadingState";
import PlatformCard from "@/components/ui/PlatformCard";

type Row = {
  id: string;
  kind: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  meta: {
    postTitle?: string;
    channelType?: string;
    channelId?: string;
    inquiryId?: string;
    inquirySubject?: string;
  };
};

export default function MyNotificationsPage() {
  const t = useTranslations("myPages.notifications");
  const locale = useLocale();
  const fmt = useFormatter();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Row[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await notificationsApi.list();
    setItems((res.data?.notifications || []) as Row[]);
    setUnread(res.data?.unreadCount ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push(`/${locale}/login`);
  }, [authLoading, user, router, locale]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  const markAll = async () => {
    await notificationsApi.markRead({ all: true });
    await load();
  };

  if (authLoading || !user || loading) {
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
          {unread > 0 && (
            <button
              type="button"
              onClick={() => void markAll()}
              className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
            >
              {t("markAllRead")}
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
            {items.map((n) => {
              const title =
                n.kind === "channel_post_removed"
                  ? t("postRemovedTitle")
                  : n.kind === "inquiry_replied"
                    ? t("inquiryReplyTitle")
                    : n.kind;
              return (
                <li
                  key={n.id}
                  className={`rounded-xl border px-4 py-3 ${
                    n.readAt ? "border-zinc-100 bg-zinc-50/60" : "border-primary-100 bg-primary-50/40"
                  }`}
                >
                  <p className="text-sm font-semibold text-zinc-900">{title}</p>
                  {n.kind === "channel_post_removed" && n.meta?.postTitle && (
                    <p className="text-xs text-zinc-600 mt-1">
                      {t("postRemovedMeta", { title: n.meta.postTitle })}
                    </p>
                  )}
                  {n.kind === "channel_post_removed" &&
                    (n.meta?.channelType === "community" || n.meta?.channelType === "freelancer") && (
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {n.meta.channelType === "community" ? t("channelCommunity") : t("channelFreelancer")}
                      </p>
                    )}
                  {n.kind === "inquiry_replied" && n.meta?.inquirySubject && (
                    <p className="text-xs text-zinc-600 mt-1">
                      {t("inquiryReplySubject", { title: n.meta.inquirySubject })}
                    </p>
                  )}
                  {n.kind === "channel_post_removed" && (
                    <p className="text-xs font-semibold text-zinc-700 mt-2">{t("postRemovedReason")}</p>
                  )}
                  <p className="text-sm text-zinc-800 whitespace-pre-wrap mt-1">{n.body}</p>
                  {n.kind === "inquiry_replied" && (
                    <Link
                      href={`/${locale}/my/inquiries`}
                      className="inline-block mt-2 text-xs font-semibold text-primary-600 hover:underline"
                    >
                      {t("viewInquiries")}
                    </Link>
                  )}
                  <p className="text-[11px] text-zinc-400 mt-2">
                    {fmt.dateTime(new Date(n.createdAt), { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </PlatformCard>
    </div>
  );
}
