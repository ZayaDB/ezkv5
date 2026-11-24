"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Check, ChevronDown, Loader2 } from "lucide-react";
import { ui } from "@/components/lnk/ui";
import { DueLabel, StepBody } from "@/components/visa/VisaSteps";
import VisaRoadmapBuilder from "@/components/visa/VisaRoadmapBuilder";
import type { RoadmapView } from "@/components/roadmap/RoadmapChecklist";
import { helpHref } from "@/lib/roadmap/stepLinks";
import { useAuth } from "@/lib/contexts/AuthContext";
import { normalizeVisa } from "@/lib/visa/normalize";
import { describeStep, visaContent } from "@/lib/visa/content";
import { buildVisaPlan, findRoute, parseVisaTemplateKey } from "@/lib/visa/plan";
import {
  CURRENT_VISAS,
  EMPTY_FACTS,
  isVisaCode,
  TARGET_VISAS,
  visaSlug,
  type CondResult,
  type VisaCode,
  type VisaFacts,
} from "@/lib/visa/types";

/** 지금 비자에서 보통 다음으로 가는 비자 (처음 로드맵을 자동으로 만들 때 사용) */
const NEXT_VISA: Partial<Record<VisaCode, VisaCode>> = {
  "D-4": "D-2",
  "D-2": "E-7",
  "D-10": "E-7",
  "E-7": "F-2-7",
  "F-2-7": "F-5-16",
  "F-2": "F-5-1",
};

/** 경로가 있는지만 볼 때는 학력 조건을 넓게 잡음 (석사 전용 길도 보이게) */
const OPEN_FACTS: VisaFacts = { ...EMPTY_FACTS, degree: "doctor", domesticDegree: true };

type Saved = { expiry: string | null; facts: VisaFacts };
function readSaved(meta: string | null | undefined): Saved {
  try {
    const m = meta ? (JSON.parse(meta) as { expiry?: string | null; facts?: Partial<VisaFacts> }) : {};
    return { expiry: m.expiry ?? null, facts: { ...EMPTY_FACTS, ...(m.facts ?? {}) } };
  } catch {
    return { expiry: null, facts: EMPTY_FACTS };
  }
}

/**
 * 마이페이지 비자 로드맵
 * - 가입 때 넣은 비자로 로드맵을 자동으로 만들고, 바로 "지금 할 일"을 보여줌
 * - 받고 싶은 비자는 위에서 바로 고름 (고르면 바로 다시 계산·저장)
 * - 가는 길은 비자 이름으로 보여주고, 누르면 비자 상세 페이지로 이동
 */
export default function VisaRoadmapPanel({
  roadmap,
  onToggle,
  onChanged,
}: {
  /** 저장된 비자 로드맵 (없으면 null) */
  roadmap: RoadmapView | null;
  onToggle: (roadmapId: string, stepId: string, nextCompleted: boolean) => Promise<void> | void;
  onChanged: () => void;
}) {
  const t = useTranslations("visa");
  const locale = useLocale();
  const { user } = useAuth();
  const guides = visaContent(locale).guides;

  const keys = parseVisaTemplateKey(roadmap?.templateKey);
  const saved = useMemo(() => readSaved(roadmap?.meta), [roadmap?.meta]);
  const profileVisa = normalizeVisa(user?.visaType);
  const profileExpiry = user?.visaExpireDate ? String(user.visaExpireDate).slice(0, 10) : null;

  const from: VisaCode | null = keys && isVisaCode(keys.from) ? keys.from : profileVisa;
  const to: VisaCode | null = keys && isVisaCode(keys.to) ? keys.to : from ? NEXT_VISA[from] ?? null : null;
  const expiry = saved.expiry ?? profileExpiry;

  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pendingTo, setPendingTo] = useState<VisaCode | null>(null);
  const [showAll, setShowAll] = useState(false);
  const autoTried = useRef(false);

  async function saveRoadmap(target: VisaCode) {
    if (!from) return;
    setBusy(true);
    setPendingTo(target);
    setError("");
    try {
      const res = await fetch("/api/visa/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: target, expiry, facts: saved.facts, locale }),
      });
      if (!res.ok) throw new Error();
      window.dispatchEvent(new Event("roadmap-updated"));
      onChanged();
    } catch {
      setError(t("saveError"));
    } finally {
      setBusy(false);
      setPendingTo(null);
    }
  }

  // 저장된 비자 로드맵이 없으면, 가입 때 넣은 비자로 다음 단계 로드맵을 자동으로 만듦
  useEffect(() => {
    if (roadmap || autoTried.current || !from || !to) return;
    autoTried.current = true;
    void saveRoadmap(to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadmap, from, to]);

  // 요건 판정은 저장된 입력값으로 다시 계산
  const plan = useMemo(
    () => (from && to && from !== to ? buildVisaPlan({ from, to, expiry, facts: saved.facts }) : null),
    [from, to, expiry, saved.facts]
  );
  const conds = useMemo(() => {
    const m = new Map<string, CondResult[]>();
    plan?.conditions.forEach((c) => m.set(`check:${c.hop}`, c.results));
    return m;
  }, [plan]);

  // 지금 비자에서 갈 수 있는 비자만 고를 수 있게
  const targets = useMemo(
    () => (from ? TARGET_VISAS.filter((v) => v !== from && findRoute(from, v, OPEN_FACTS)) : []),
    [from]
  );

  // 지금 비자를 모르거나, 직접 고치는 중이면 입력 화면
  if (!from || editing) {
    return (
      <div className="flex flex-col gap-3">
        {!from ? (
          <p className={`text-sm ${ui.muted}`}>
            {user?.visaType
              ? t("unsupportedVisa", { visa: String(user.visaType), list: CURRENT_VISAS.join(", ") })
              : t("noCurrentVisa")}
          </p>
        ) : null}
        <VisaRoadmapBuilder
          onSaved={() => {
            setEditing(false);
            onChanged();
          }}
          onCancel={from ? () => setEditing(false) : undefined}
        />
      </div>
    );
  }

  const route: VisaCode[] = plan?.route ?? [from, ...(to ? [to] : [])];
  const steps = roadmap?.steps ?? [];
  const nextIndex = steps.findIndex((s) => !s.completed);
  const next = nextIndex >= 0 ? steps[nextIndex] : null;
  const nextVisa = next ? describeStep(locale, next.title)?.visa ?? null : null;
  const mentorHref = helpHref(locale, "mentor", { mentor: "visa", learn: "lectures" });

  return (
    <div className={`${ui.card} flex flex-col gap-6 p-5 sm:p-6`}>
      {/* 받고 싶은 비자 고르기 */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold text-ink dark:text-snow">{t("formTarget")}</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("formTarget")}>
          {targets.map((v) => {
            const active = v === to;
            const loading = busy && pendingTo === v;
            return (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={busy}
                onClick={() => (active ? null : void saveRoadmap(v))}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
                  active
                    ? "border-teal bg-teal text-white dark:border-teal-dark dark:bg-teal-dark dark:text-night"
                    : "border-hairline text-ink hover:border-teal dark:border-hairline-dark dark:text-snow"
                }`}
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
                {v} · {guides[v].name}
              </button>
            );
          })}
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </div>

      {/* 가는 길: 비자 이름, 누르면 상세 페이지 */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold text-ink dark:text-snow">{t("route")}</p>
        {plan ? (
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <ol className="flex min-w-max items-stretch gap-2">
              {route.map((code, i) => (
                <li key={code} className="flex items-stretch gap-2">
                  <Link
                    href={`/${locale}/my/visa/${visaSlug(code)}`}
                    className={`flex w-32 flex-col gap-1 rounded-xl border p-3 transition-colors hover:border-teal dark:hover:border-teal-dark ${
                      i === 0
                        ? "border-teal bg-teal/5 dark:border-teal-dark dark:bg-teal-dark/10"
                        : "border-hairline dark:border-hairline-dark"
                    }`}
                  >
                    <span className={`text-[11px] font-bold ${i === 0 ? "text-teal dark:text-teal-dark" : i === 1 ? "text-[#75582b] dark:text-[#e2c48f]" : ui.muted}`}>
                      {i === 0 ? t("nowVisa") : i === 1 ? t("nextVisa") : t("laterVisa")}
                    </span>
                    <span className="text-base font-bold text-ink dark:text-snow">{code}</span>
                    <span className={`text-xs ${ui.muted}`}>{guides[code].name}</span>
                  </Link>
                  {i < route.length - 1 ? <ArrowRight className="h-4 w-4 shrink-0 self-center text-ink-muted" aria-hidden="true" /> : null}
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <p className={`text-sm ${ui.muted}`}>{t("noRoute")}</p>
        )}
        <p className={`text-xs ${ui.muted}`}>
          {t("tapVisaHint")}
          {expiry ? "" : ` ${t("noExpiry")}`}
        </p>
      </div>

      {/* 지금 할 일 (자동) */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold text-ink dark:text-snow">{t("nextTodo")}</p>
        {!roadmap ? (
          <p className={`flex items-center gap-2 text-sm ${ui.muted}`}>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {t("building")}
          </p>
        ) : next ? (
          <div className="rounded-xl border-2 border-teal p-4 dark:border-teal-dark">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="font-semibold text-ink dark:text-snow">
                {nextIndex + 1}. {describeStep(locale, next.title)?.title ?? next.title}
              </p>
              <DueLabel date={next.dueDate} />
            </div>
            <div className="mt-2">
              <StepBody stepKey={next.title} conds={conds.get(next.title)} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => roadmap && onToggle(roadmap.id, next.id, true)}
                className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                {t("stepDone")}
              </button>
              {nextVisa ? (
                <Link
                  href={`/${locale}/my/visa/${visaSlug(nextVisa)}`}
                  className="rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-ink hover:border-teal dark:border-hairline-dark dark:text-snow"
                >
                  {t("visaGuideOf", { visa: nextVisa })}
                </Link>
              ) : null}
              <Link
                href={mentorHref}
                className="rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-ink hover:border-teal dark:border-hairline-dark dark:text-snow"
              >
                {t("consult")}
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-sm font-semibold text-emerald-600">{t("allDone")}</p>
        )}
      </div>

      {/* 전체 단계 */}
      {roadmap && steps.length ? (
        <div className="border-t border-hairline pt-4 dark:border-hairline-dark">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="flex items-center gap-1 text-sm font-semibold text-ink dark:text-snow"
            aria-expanded={showAll}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`} aria-hidden="true" />
            {t("allSteps", { done: String(steps.filter((s) => s.completed).length), total: String(steps.length) })}
          </button>
          {showAll ? (
            <ol className="mt-3 flex flex-col gap-2">
              {steps.map((s, i) => (
                <li key={s.id} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggle(roadmap.id, s.id, !s.completed)}
                    aria-label={s.completed ? t("stepUndo") : t("stepDone")}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                      s.completed
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : i === nextIndex
                          ? "border-teal text-teal dark:border-teal-dark dark:text-teal-dark"
                          : "border-hairline text-ink-muted dark:border-hairline-dark"
                    }`}
                  >
                    {s.completed ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                  </button>
                  <span className={`min-w-0 flex-1 text-sm ${s.completed ? `${ui.muted} line-through` : "text-ink dark:text-snow"}`}>
                    {describeStep(locale, s.title)?.title ?? s.title}
                  </span>
                  <DueLabel date={s.dueDate} />
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <button type="button" onClick={() => setEditing(true)} className="text-xs font-semibold text-teal hover:underline dark:text-teal-dark">
          {t("refine")}
        </button>
      </div>
    </div>
  );
}
