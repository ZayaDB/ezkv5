import { currentLocale, rtMessages } from "@/lib/i18n/runtime";
import type { Locale } from "@/lib/i18n/config";
export type RoadmapTemplateStep = {
  title: string;
  description?: string;
};

export type RoadmapTemplate = {
  key: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  steps: RoadmapTemplateStep[];
};

/** 로드맵은 비자 전용 — 예전 비자 템플릿만 남김 (새 비자 로드맵은 lib/visa/plan.ts) */
const TEMPLATE_PRIORITIES: Record<string, RoadmapTemplate["priority"]> = {
  visa_extension: "high",
  d10_prep: "high",
};

export const ROADMAP_TEMPLATE_KEYS = Object.keys(TEMPLATE_PRIORITIES);

/** 템플릿 문구는 lib/i18n/messages/runtime/*.json 의 roadmapTemplates 에서 언어별로 가져온다 */
export function getRoadmapTemplate(key: string, locale: Locale = currentLocale()): RoadmapTemplate | null {
  const priority = TEMPLATE_PRIORITIES[key];
  const copy = (rtMessages(locale).roadmapTemplates as Record<string, Omit<RoadmapTemplate, "key" | "priority">>)[key];
  if (!priority || !copy) return null;
  return { key, priority, title: copy.title, description: copy.description, steps: copy.steps };
}

export function listRoadmapTemplates(locale: Locale = currentLocale()): RoadmapTemplate[] {
  return ROADMAP_TEMPLATE_KEYS.map((k) => getRoadmapTemplate(k, locale)).filter(
    (t): t is RoadmapTemplate => t !== null
  );
}

export function resolveTemplateKey(message: string): string | null {
  const m = message.toLowerCase();
  if (/비자.*연장|연장.*비자|visa.*extend|виз.*сунгах/.test(m)) return "visa_extension";
  if (/d-?10|구직비자/.test(m)) return "d10_prep";
  return null;
}
