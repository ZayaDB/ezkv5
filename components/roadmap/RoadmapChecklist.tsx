"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { helpHref, stepHelp } from "@/lib/roadmap/stepLinks";

export type RoadmapStepView = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
};

export type RoadmapView = {
  id: string;
  title: string;
  templateKey?: string | null;
  progress: number;
  steps: RoadmapStepView[];
};

export default function RoadmapChecklist({
  roadmaps,
  onToggle,
  emptyHint,
}: {
  roadmaps: RoadmapView[];
  onToggle: (roadmapId: string, stepId: string, nextCompleted: boolean) => void;
  emptyHint?: string;
}) {
  const t = useTranslations("roadmap");
  const locale = useLocale();
  const [pickedId, setPickedId] = useState<string | null>(null);

  const text = (templateKey: string | null | undefined, path: string, fallback: string) => {
    if (!templateKey) return fallback;
    const full = `tpl.${templateKey}.${path}`;
    if (typeof t.has === "function" && !t.has(full)) return fallback;
    try {
      return t(full);
    } catch {
      return fallback;
    }
  };

  if (!roadmaps.length) {
    return (
      <div className="py-2">
        <div className="flex items-center gap-0 overflow-x-auto pb-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 dark:border-slate-600 shrink-0" />
              {i < 3 ? <div className="w-8 sm:w-12 h-px bg-gray-200 dark:bg-slate-700" /> : null}
            </div>
          ))}
        </div>
        {emptyHint ? (
          <p className="text-xs text-gray-400 mt-3">{emptyHint}</p>
        ) : null}
      </div>
    );
  }

  const selected = roadmaps.find((r) => r.id === pickedId) ?? roadmaps[0];
  const currentIndex = selected.steps.findIndex((s) => !s.completed);
  const help = stepHelp(selected.templateKey, currentIndex < 0 ? 0 : currentIndex);
  const stuckHref = helpHref(locale, "mentor", help);
  const learnHref = helpHref(locale, "learn", help);

  return (
    <div>
      {roadmaps.length > 1 ? (
        <div className="flex gap-1.5 mb-3 overflow-x-auto">
          {roadmaps.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setPickedId(r.id)}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                r.id === selected.id
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-500 dark:bg-slate-800"
              }`}
            >
              {text(r.templateKey, "title", r.title)}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs font-semibold text-zinc-500 dark:text-slate-400 mb-3">
          {text(selected.templateKey, "title", selected.title)}
        </p>
      )}

      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex items-start min-w-max">
          {selected.steps.map((step, i) => {
            const title = text(selected.templateKey, `s${i}`, step.title);
            const done = step.completed;
            const current = i === currentIndex;
            return (
              <div key={step.id} className="flex items-start">
                <div className="flex flex-col items-center w-[4.5rem] sm:w-24">
                  <button
                    type="button"
                    onClick={() => onToggle(selected.id, step.id, !done)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      done
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : current
                          ? "border-primary-500 bg-white dark:bg-slate-900 text-primary-600"
                          : "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-300"
                    }`}
                    aria-label={title}
                  >
                    {done ? (
                      <Check className="w-4 h-4" strokeWidth={3} />
                    ) : (
                      <span className="text-[11px] font-bold">{i + 1}</span>
                    )}
                  </button>
                  <p
                    title={title}
                    className={`mt-1.5 text-[11px] leading-tight text-center truncate w-full ${
                      done
                        ? "text-zinc-700 dark:text-slate-200"
                        : current
                          ? "text-zinc-900 dark:text-white font-semibold"
                          : "text-gray-400"
                    }`}
                  >
                    {title}
                  </p>
                </div>
                {i < selected.steps.length - 1 ? (
                  <div
                    className={`mt-4 w-6 sm:w-10 h-0.5 shrink-0 ${
                      done ? "bg-emerald-400" : "bg-gray-200 dark:bg-slate-700"
                    }`}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {currentIndex >= 0 ? (
          <>
            <Link
              href={stuckHref}
              className="rounded-full border border-zinc-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-slate-200 hover:border-primary-400"
            >
              {t("stuck")}
            </Link>
            <Link
              href={learnHref}
              className="rounded-full bg-zinc-900 dark:bg-white px-3 py-1.5 text-xs font-semibold text-white dark:text-zinc-900"
            >
              {t("learn")}
            </Link>
          </>
        ) : (
          <p className="text-xs text-emerald-600 font-semibold">{t("allDone")}</p>
        )}
      </div>
    </div>
  );
}
