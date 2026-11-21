"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { helpHref, stepHelp } from "@/lib/roadmap/stepLinks";
import { describeStep } from "@/lib/visa/content";
import { buildVisaPlan, parseVisaTemplateKey } from "@/lib/visa/plan";
import { EMPTY_FACTS, isVisaCode, visaSlug, type CondResult, type VisaFacts } from "@/lib/visa/types";
import { DueLabel, StepBody } from "@/components/visa/VisaSteps";

export type RoadmapStepView = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string | null;
};

export type RoadmapView = {
  id: string;
  title: string;
  templateKey?: string | null;
  /** 비자 로드맵: 만들 때 입력한 값(JSON) — 요건 판정을 다시 계산하는 데 씀 */
  meta?: string | null;
  progress: number;
  steps: RoadmapStepView[];
};

/** 비자 로드맵 저장값에서 요건 판정 다시 만들기 */
function visaConditions(r: RoadmapView): Map<string, CondResult[]> {
  const map = new Map<string, CondResult[]>();
  const keys = parseVisaTemplateKey(r.templateKey);
  if (!keys || !r.meta) return map;
  try {
    const saved = JSON.parse(r.meta) as { from?: string; to?: string; expiry?: string | null; facts?: Partial<VisaFacts> };
    if (!isVisaCode(keys.from) || !isVisaCode(keys.to)) return map;
    const plan = buildVisaPlan({ from: keys.from, to: keys.to, expiry: saved.expiry ?? null, facts: { ...EMPTY_FACTS, ...saved.facts } });
    plan?.conditions.forEach((c) => map.set(`check:${c.hop}`, c.results));
  } catch {
    /* 저장값이 깨졌으면 요건 없이 보여줌 */
  }
  return map;
}

export default function RoadmapChecklist({
  roadmaps,
  onToggle,
  emptyHint,
  onEditVisa,
}: {
  roadmaps: RoadmapView[];
  onToggle: (roadmapId: string, stepId: string, nextCompleted: boolean) => void;
  emptyHint?: string;
  /** 비자 로드맵 다시 만들기 */
  onEditVisa?: () => void;
}) {
  const t = useTranslations("roadmap");
  const tv = useTranslations("visa");
  const locale = useLocale();
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [pickedStep, setPickedStep] = useState<string | null>(null);

  const selected = roadmaps.find((r) => r.id === pickedId) ?? roadmaps[0];
  const isVisa = Boolean(parseVisaTemplateKey(selected?.templateKey));
  const conds = useMemo(() => (selected && isVisa ? visaConditions(selected) : new Map()), [selected, isVisa]);

  if (!roadmaps.length || !selected) {
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
        {emptyHint ? <p className="text-xs text-gray-400 mt-3 dark:text-snow-muted">{emptyHint}</p> : null}
      </div>
    );
  }

  /** 예전 템플릿 로드맵 문구 (번역 키가 있으면 번역 사용) */
  const tplText = (templateKey: string | null | undefined, path: string, fallback: string) => {
    if (!templateKey) return fallback;
    const full = `tpl.${templateKey}.${path}`;
    if (typeof t.has === "function" && !t.has(full)) return fallback;
    try {
      return t(full);
    } catch {
      return fallback;
    }
  };

  const roadmapTitle = (r: RoadmapView) => {
    const v = parseVisaTemplateKey(r.templateKey);
    return v ? `${v.from} → ${v.to}` : tplText(r.templateKey, "title", r.title);
  };
  const stepTitle = (r: RoadmapView, s: RoadmapStepView, i: number) =>
    parseVisaTemplateKey(r.templateKey) ? describeStep(locale, s.title)?.title ?? s.title : tplText(r.templateKey, `s${i}`, s.title);

  const currentIndex = selected.steps.findIndex((s) => !s.completed);
  const focusIndex = Math.max(
    0,
    pickedStep ? selected.steps.findIndex((s) => s.id === pickedStep) : currentIndex < 0 ? selected.steps.length - 1 : currentIndex
  );
  const focus = selected.steps[focusIndex];
  const help = isVisa ? { mentor: "visa" as const, learn: "lectures" as const } : stepHelp(selected.templateKey, focusIndex);
  const stuckHref = helpHref(locale, "mentor", help);
  const learnHref = helpHref(locale, "learn", help);
  const focusVisa = focus && isVisa ? describeStep(locale, focus.title)?.visa : null;

  return (
    <div>
      {roadmaps.length > 1 ? (
        <div className="flex gap-1.5 mb-3 overflow-x-auto">
          {roadmaps.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setPickedId(r.id);
                setPickedStep(null);
              }}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                r.id === selected.id
                  ? "bg-teal text-white dark:bg-teal-dark dark:text-night"
                  : "bg-zinc-100 text-zinc-500 dark:bg-slate-800"
              }`}
            >
              {roadmapTitle(r)}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs font-semibold text-zinc-500 dark:text-slate-400 mb-3">{roadmapTitle(selected)}</p>
      )}

      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex items-start min-w-max">
          {selected.steps.map((step, i) => {
            const title = stepTitle(selected, step, i);
            const done = step.completed;
            const current = i === currentIndex;
            const focused = i === focusIndex;
            return (
              <div key={step.id} className="flex items-start">
                <button
                  type="button"
                  onClick={() => setPickedStep(step.id)}
                  className="flex flex-col items-center w-[4.5rem] sm:w-24"
                  aria-pressed={focused}
                  aria-label={title}
                >
                  <span
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      done
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : current
                          ? "border-primary-500 bg-white dark:bg-slate-900 text-primary-600"
                          : "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-300"
                    } ${focused ? "ring-2 ring-offset-2 ring-teal dark:ring-teal-dark dark:ring-offset-night-card" : ""}`}
                  >
                    {done ? <Check className="w-4 h-4" strokeWidth={3} /> : <span className="text-[11px] font-bold">{i + 1}</span>}
                  </span>
                  <span
                    title={title}
                    className={`mt-1.5 text-[11px] leading-tight text-center line-clamp-2 w-full ${
                      done
                        ? "text-zinc-700 dark:text-slate-200"
                        : current
                          ? "text-zinc-900 dark:text-white font-semibold"
                          : "text-gray-400 dark:text-snow-muted"
                    }`}
                  >
                    {title}
                  </span>
                </button>
                {i < selected.steps.length - 1 ? (
                  <div className={`mt-4 w-6 sm:w-10 h-0.5 shrink-0 ${done ? "bg-emerald-400" : "bg-gray-200 dark:bg-slate-700"}`} />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {focus ? (
        <div className="mt-4 rounded-xl border border-hairline p-4 dark:border-hairline-dark">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="font-semibold text-ink dark:text-snow">
              {focusIndex + 1}. {stepTitle(selected, focus, focusIndex)}
            </p>
            {isVisa ? <DueLabel date={focus.dueDate} /> : null}
          </div>
          <div className="mt-2">
            {isVisa ? (
              <StepBody stepKey={focus.title} conds={conds.get(focus.title)} />
            ) : (
              <p className="text-sm text-ink-muted dark:text-snow-muted">
                {tplText(selected.templateKey, `s${focusIndex}d`, focus.description ?? "")}
              </p>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onToggle(selected.id, focus.id, !focus.completed)}
              className={
                focus.completed
                  ? "rounded-full border border-zinc-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-slate-200"
                  : "rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              }
            >
              {focus.completed ? tv("stepUndo") : tv("stepDone")}
            </button>
            {focusVisa ? (
              <Link
                href={`/${locale}/my/visa/${visaSlug(focusVisa)}`}
                className="rounded-full border border-zinc-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-slate-200 hover:border-primary-400"
              >
                {tv("more")}
              </Link>
            ) : null}
            <Link
              href={stuckHref}
              className="rounded-full border border-zinc-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-slate-200 hover:border-primary-400"
            >
              {t("stuck")}
            </Link>
            {!isVisa ? (
              <Link
                href={learnHref}
                className="rounded-full bg-teal dark:bg-teal-dark px-3 py-1.5 text-xs font-semibold text-white dark:text-night hover:opacity-90"
              >
                {t("learn")}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {currentIndex < 0 ? <p className="mt-3 text-xs text-emerald-600 font-semibold">{t("allDone")}</p> : null}

      {isVisa && onEditVisa ? (
        <button type="button" onClick={onEditVisa} className="mt-3 inline-block text-xs font-semibold text-teal hover:underline dark:text-teal-dark">
          {tv("edit")}
        </button>
      ) : null}
    </div>
  );
}
