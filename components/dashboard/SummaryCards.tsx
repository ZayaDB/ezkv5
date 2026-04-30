"use client";

import type { ComponentType } from "react";
import PlatformCard from "@/components/ui/PlatformCard";

export default function SummaryCards({
  cards,
  loadingStats,
  numberFormatter,
}: {
  cards: {
    title: string;
    value: number;
    icon: ComponentType<{ className?: string }>;
    accent: string;
  }[];
  loadingStats: boolean;
  numberFormatter: (value: number) => string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <PlatformCard key={card.title} padding="md" className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.accent}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100 text-right">
                {loadingStats ? "—" : numberFormatter(card.value)}
              </div>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{card.title}</p>
          </PlatformCard>
        );
      })}
    </div>
  );
}

