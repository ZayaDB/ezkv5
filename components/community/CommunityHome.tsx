"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, PenLine, ShieldCheck, Users } from "lucide-react";
import type { CommunityGroup } from "@/types";
import CommunityCard from "@/components/cards/CommunityCard";
import PublicFeedSection from "@/components/feed/PublicFeedSection";
import { useAuth } from "@/lib/contexts/AuthContext";
import { communityCategoryLabel } from "@/lib/lectures/categories";
import { PageIntro, PageShell, ui } from "@/components/lnk/ui";

type Tab = "feed" | "groups" | "jobs";

/* LNK 디자인 체계: 소개 + 밑줄 탭 + 본문 / 오른쪽 안내 카드 */
export default function CommunityHome({
  groups,
  initialTab = "feed",
}: {
  groups: CommunityGroup[];
  initialTab?: Tab;
}) {
  const t = useTranslations("community");
  const tp = useTranslations("communityPage");
  const locale = useLocale();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<Tab>(initialTab);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("tab");
    if (q === "jobs" || q === "groups") setTab(q);
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: "feed", label: t("tabFeed") },
    { id: "groups", label: `${t("tabGroups")} (${groups.length})` },
    { id: "jobs", label: t("tabJobs") },
  ];

  return (
    <PageShell>
      <PageIntro
        eyebrow={tp("eyebrow")}
        title={tp("title")}
        subtitle={t("subtitle")}
        actions={
          isAuthenticated ? (
            <Link href={`/${locale}/my/activity${tab === "groups" ? "#group" : ""}`} className={ui.btnPrimary}>
              <PenLine className="h-4 w-4" aria-hidden="true" />
              {tab === "groups" ? t("createGroup") : tp("write")}
            </Link>
          ) : (
            <Link href={`/${locale}/login`} className={ui.btnOutline}>
              {tp("loginToJoin")}
            </Link>
          )
        }
      />

      <div className="flex gap-6 border-b border-hairline dark:border-hairline-dark" role="tablist">
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={tab === x.id}
            onClick={() => setTab(x.id)}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
              tab === x.id
                ? "border-teal text-teal dark:border-teal-dark dark:text-teal-dark"
                : "border-transparent text-ink-muted hover:text-ink dark:text-snow-muted dark:hover:text-snow"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {tab === "feed" && <PublicFeedSection feedType="community" />}
          {tab === "jobs" && (
            <div className="flex flex-col gap-4">
              <p className={`text-sm ${ui.muted}`}>{t("jobsHint")}</p>
              <PublicFeedSection feedType="freelancer" />
            </div>
          )}
          {tab === "groups" &&
            (groups.length === 0 ? (
              <div className={`${ui.card} px-6 py-10 text-center text-sm ${ui.muted}`}>{t("noGroups")}</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {groups.map((group) => (
                  <CommunityCard key={group.id} group={group} />
                ))}
              </div>
            ))}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-28">
          {groups.length > 0 && (
            <section className={`${ui.card} p-5`}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink dark:text-snow">
                <Users className="h-4 w-4 text-teal dark:text-teal-dark" aria-hidden="true" />
                {tp("popularGroups")}
              </h2>
              <ul className="flex flex-col">
                {groups.slice(0, 4).map((g) => (
                  <li key={g.id} className="border-b border-hairline last:border-0 dark:border-hairline-dark">
                    <Link href={`/${locale}/community/${g.id}`} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink hover:text-teal dark:text-snow dark:hover:text-teal-dark">{g.name}</span>
                        <span className={`text-xs ${ui.muted}`}>
                          {communityCategoryLabel(g.category, t)} · {t("membersCount", { count: String(g.members) })}
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-muted dark:text-snow-muted" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="rounded-2xl bg-primary-50 p-5 dark:bg-night-pill">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink dark:text-snow">
              <ShieldCheck className="h-4 w-4 text-teal dark:text-teal-dark" aria-hidden="true" />
              {tp("rulesTitle")}
            </h2>
            <ul className={`flex list-disc flex-col gap-1.5 pl-5 text-[13px] leading-[1.55] ${ui.muted}`}>
              <li>{tp("rule1")}</li>
              <li>{tp("rule2")}</li>
              <li>{tp("rule3")}</li>
            </ul>
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
