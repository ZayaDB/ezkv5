"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { CommunityGroup } from "@/types";
import CommunityCard from "@/components/cards/CommunityCard";
import PublicFeedSection from "@/components/feed/PublicFeedSection";
import { useAuth } from "@/lib/contexts/AuthContext";

type Tab = "feed" | "groups" | "jobs";

export default function CommunityHome({
  groups,
  initialTab = "feed",
}: {
  groups: CommunityGroup[];
  initialTab?: Tab;
}) {
  const t = useTranslations("community");
  const locale = useLocale();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<Tab>(initialTab);

  const tabs: { id: Tab; label: string }[] = [
    { id: "feed", label: t("tabFeed") },
    { id: "groups", label: t("tabGroups") },
    { id: "jobs", label: t("tabJobs") },
  ];

  const writeLink = (
    <Link
      href={`/${locale}/my/activity`}
      className="block rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-primary-600"
    >
      {t("writeInMy")}
    </Link>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 border-b border-zinc-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t("title")}</h1>
          <p className="text-sm text-zinc-600 dark:text-slate-400 mt-1">{t("subtitle")}</p>
          <div className="mt-5 flex gap-1 rounded-xl bg-zinc-100 dark:bg-slate-800 p-1">
            {tabs.map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setTab(x.id)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
                  tab === x.id
                    ? "bg-white dark:bg-slate-900 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500"
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {tab === "feed" && (
          <div className="space-y-3">
            {isAuthenticated ? writeLink : null}
            <PublicFeedSection feedType="community" />
          </div>
        )}
        {tab === "jobs" && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600">{t("jobsHint")}</p>
            {isAuthenticated ? writeLink : null}
            <PublicFeedSection feedType="freelancer" />
          </div>
        )}
        {tab === "groups" && (
          <div className="space-y-4">
            {isAuthenticated ? (
              <Link
                href={`/${locale}/my/activity#group`}
                className="block rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-primary-600"
              >
                {t("createInMy")}
              </Link>
            ) : null}
            {groups.length === 0 ? (
              <p className="text-sm text-zinc-500">{t("noGroups")}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groups.map((group) => (
                  <CommunityCard key={group.id} group={group} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
