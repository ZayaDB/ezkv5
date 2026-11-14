"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { contentApi } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import Link from "next/link";
import type { CommunityGroup } from "@/types";
import GroupPostFeed from "@/components/channel/GroupPostFeed";
import CommunityGroupChat from "@/components/community/CommunityGroupChat";
import { communityCategoryLabel } from "@/lib/lectures/categories";

export default function CommunityDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations("community");
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const id = params.id as string;

  const [group, setGroup] = useState<CommunityGroup | null | undefined>(undefined);
  const [joining, setJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");

  const load = useCallback(async () => {
    const res = await contentApi.getCommunity(id);
    if (res.error || !res.data) {
      setGroup(null);
      return;
    }
    setGroup(res.data as CommunityGroup);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    if (joining) return;
    setJoining(true);
    setJoinMessage("");
    const res = await contentApi.joinCommunity(id);
    setJoining(false);
    if (res.error) {
      setJoinMessage(res.error);
      return;
    }
    setJoinMessage(t("joinSuccess"));
  };

  if (group === undefined) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center bg-surface dark:bg-night">
        <div className="w-10 h-10 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="font-semibold text-ink dark:text-snow mb-3">{t("notFound")}</p>
          <Link href={`/${locale}/community`} className="text-teal dark:text-teal-dark font-semibold hover:underline">
            {t("backToList")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-night">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-8 sm:px-8 lg:px-20 lg:py-12">
        <nav aria-label="Breadcrumb" className="text-[13px] text-ink-muted dark:text-snow-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href={`/${locale}/community?tab=groups`} className="hover:text-teal dark:hover:text-teal-dark">
                {t("backToList")}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink dark:text-snow" aria-current="page">{group.name}</li>
          </ol>
        </nav>

        <header className="flex flex-col gap-5 rounded-2xl border border-hairline bg-white p-7 dark:border-hairline-dark dark:bg-night-card sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-3">
            <span className="w-fit rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 dark:bg-night-pill dark:text-primary-300">
              {communityCategoryLabel(group.category, t)} · {t("membersCount", { count: String(group.members) })}
            </span>
            <h1 className="text-3xl font-semibold leading-[1.2] text-ink dark:text-snow">{group.name}</h1>
            <p className="text-base leading-[1.6] text-ink-muted dark:text-snow-muted">{group.description}</p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <button
              type="button"
              onClick={() => void handleJoin()}
              disabled={joining}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-teal px-5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 dark:bg-teal-dark dark:text-night"
            >
              {joining ? "…" : t("join")}
            </button>
            {joinMessage ? <p className="text-sm text-teal dark:text-teal-dark" role="status">{joinMessage}</p> : null}
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="flex min-w-0 flex-col gap-4">
            <h2 className="text-xl font-semibold text-ink dark:text-snow">{t("groupPosts")}</h2>
            <GroupPostFeed channel="community" channelId={id} />
          </section>
          <div className="lg:sticky lg:top-28">
            <CommunityGroupChat groupId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
