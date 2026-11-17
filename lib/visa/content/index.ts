import type { Locale } from "@/lib/i18n/config";
import type { CondResult, HopKey, PlanStep, VisaCode } from "../types";
import { HOPS } from "../plan";
import type { VisaContent } from "./types";
import kr from "./kr";
import en from "./en";
import mn from "./mn";

export type { VisaContent, VisaGuide } from "./types";

const ALL: Record<Locale, VisaContent> = { kr, en, mn };

/** 매뉴얼 기준일 (화면에 "언제 기준인지" 표시용) */
export const VISA_SOURCE_DATE = "2026-11";

export function visaContent(locale: string): VisaContent {
  return ALL[(locale as Locale) in ALL ? (locale as Locale) : "kr"];
}

function fill(text: string, vars: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** 단계 키(extend:D-2, check:D-2>E-7 …)를 지금 언어의 제목·설명·서류로 바꿈 */
export function describeStep(locale: string, key: string) {
  const c = visaContent(locale);
  const [kind, rest] = key.split(":") as [keyof VisaContent["steps"], string];
  const copy = c.steps[kind];
  if (!copy || !rest) return null;

  if (kind === "extend") {
    const visa = rest as VisaCode;
    const g = c.guides[visa];
    return {
      title: fill(copy.title, { visa }),
      body: copy.body,
      docs: g?.docsExtend ?? [],
      visa,
    };
  }

  const hop = rest as HopKey;
  const def = HOPS[hop];
  if (!def) return null;
  const vars = { from: def.from, to: def.to };
  const hopCopy = c.hops[hop];
  const target = c.guides[def.to];

  if (kind === "wait") {
    return { title: fill(copy.title, vars), body: hopCopy?.wait ?? "", docs: [], visa: def.from };
  }
  if (kind === "check") {
    return { title: fill(copy.title, vars), body: `${hopCopy?.note ?? ""}\n${copy.body}`.trim(), docs: [], visa: def.to };
  }
  if (kind === "docs") {
    return { title: fill(copy.title, vars), body: copy.body, docs: target?.docsChange ?? [], visa: def.to };
  }
  return { title: fill(copy.title, vars), body: copy.body, docs: [], visa: def.to };
}

export function describeCond(locale: string, r: CondResult) {
  return fill(visaContent(locale).conds[r.key], r.vars ?? {});
}

export function stepTitles(locale: string, steps: PlanStep[]) {
  return steps.map((s) => describeStep(locale, s.key)?.title ?? s.key);
}
