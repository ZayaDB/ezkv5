"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, PlayCircle, Radio, Settings2 } from "lucide-react";
import { getProgress, listLessons, type Lesson } from "@/lib/live/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import { LessonStatusPill, kstLabel } from "./lessonUi";
import { ui } from "@/components/lnk/ui";

/** Course page section: the lecture's live classes and replays. */
export default function LessonList({
  lectureId,
  canAccess,
  isOwner,
}: {
  lectureId: string;
  canAccess: boolean;
  isOwner: boolean;
}) {
  const t = useTranslations("live");
  const locale = useLocale();
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [progress, setProgress] = useState<Map<string, { position_seconds: number; completed_at: string | null }>>(new Map());

  useEffect(() => {
    let alive = true;
    listLessons(lectureId).then((rows) => alive && setLessons(rows));
    return () => {
      alive = false;
    };
  }, [lectureId]);

  useEffect(() => {
    if (!user || !lessons?.length) return;
    getProgress(user.id, lessons.map((l) => l.id)).then(setProgress);
  }, [user, lessons]);

  const visible = (lessons || []).filter((l) => isOwner || l.status !== "cancelled");
  if (lessons === null) return null;
  if (!visible.length && !isOwner) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-ink dark:text-snow">{t("sectionTitle")}</h2>
          <p className={`text-sm ${ui.muted}`}>{t("sectionLead")}</p>
        </div>
        {isOwner && (
          <Link href={`/${locale}/mentor/lectures/${lectureId}/lessons`} className={`${ui.btnOutline} h-10`}>
            <Settings2 className="h-4 w-4" /> {t("manage")}
          </Link>
        )}
      </div>

      {!visible.length ? (
        <p className={`${ui.card} p-5 text-sm ${ui.muted}`}>{t("empty")}</p>
      ) : (
        <ol className={`${ui.card} divide-y divide-hairline overflow-hidden dark:divide-hairline-dark`}>
          {visible.map((l, i) => {
            const p = progress.get(l.id);
            const pct = p && l.replay_seconds ? Math.min(100, Math.round((p.position_seconds / l.replay_seconds) * 100)) : 0;
            const open = canAccess || isOwner || (l.is_preview && l.status === "ready");
            const Icon = l.status === "live" ? Radio : l.status === "ready" ? PlayCircle : null;
            return (
              <li key={l.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex min-w-0 items-start gap-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold text-ink-muted dark:bg-night dark:text-snow-muted">
                    {p?.completed_at ? <CheckCircle2 className="h-5 w-5 text-teal dark:text-teal-dark" /> : i + 1}
                  </span>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <LessonStatusPill status={l.status} />
                      {l.is_preview && <span className="rounded-full border border-teal/40 px-2 py-0.5 text-[11px] font-semibold text-teal dark:text-teal-dark">{t("preview")}</span>}
                    </div>
                    <p className="font-semibold text-ink dark:text-snow">{l.title}</p>
                    <p className={`text-xs ${ui.muted}`}>
                      {l.scheduled_at ? kstLabel(l.scheduled_at, locale) : ""} · {t("minutes", { n: l.replay_seconds ? Math.round(l.replay_seconds / 60) : l.duration_min })}
                      {pct > 0 && !p?.completed_at ? ` · ${t("progress", { pct })}` : ""}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 sm:pl-4">
                  {l.status === "cancelled" ? null : open ? (
                    <Link
                      href={`/${locale}/lessons/${l.id}`}
                      className={l.status === "live" ? `${ui.btnPrimary} h-10 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:text-white` : `${ui.btnOutline} h-10`}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {l.status === "live" ? t("join") : l.status === "ready" ? t("watch") : t("open")}
                    </Link>
                  ) : (
                    <span className={`text-xs ${ui.muted}`}>{t("enrollToJoin")}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
