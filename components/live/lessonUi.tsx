"use client";

import { useTranslations } from "next-intl";
import type { LessonStatus } from "@/lib/live/client";

const tone: Record<LessonStatus, string> = {
  live: "bg-red-600 text-white",
  scheduled: "bg-primary-50 text-teal dark:bg-primary-950/40 dark:text-teal-dark",
  processing: "bg-[#f8f0df] text-[#75582b] dark:bg-[#2a2418] dark:text-[#e2c48f]",
  ready: "bg-ink text-white dark:bg-snow dark:text-night",
  failed: "bg-hairline/70 text-ink-muted dark:bg-night-pill dark:text-snow-muted",
  cancelled: "bg-hairline/70 text-ink-muted line-through dark:bg-night-pill dark:text-snow-muted",
};

export function LessonStatusPill({ status }: { status: LessonStatus }) {
  const t = useTranslations("live");
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone[status]}`}>
      {status === "live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />}
      {t(`status_${status}`)}
    </span>
  );
}

/** "2026. 11. 22. (토) 14:00 KST" style label in Korea time, localized date part. */
export function kstLabel(iso: string, locale: string) {
  const d = new Date(iso);
  const intl = locale === "kr" ? "ko-KR" : locale === "mn" ? "en-GB" : "en-US";
  const date = new Intl.DateTimeFormat(intl, { timeZone: "Asia/Seoul", month: "short", day: "numeric", weekday: "short" }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
  return `${date} ${time} KST`;
}

export function mmss(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${m}:${String(r).padStart(2, "0")}`;
}
