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

const TEMPLATE_PRIORITIES: Record<string, RoadmapTemplate["priority"]> = {
  visa_extension: "high",
  settling_korea: "medium",
  moving: "medium",
  job_prep: "medium",
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
  if (/이사|moving|move|шилжих|орон сууц/.test(m)) return "moving";
  if (/정착|입국|외국인등록|settle|arrival/.test(m)) return "settling_korea";
  if (/d-?10|구직비자/.test(m)) return "d10_prep";
  if (/취업|알바|job|career|ажил/.test(m)) return "job_prep";
  return null;
}
