import { matchGuides } from "@/lib/visa/match";
import type { VisaCode } from "@/lib/visa/types";

/** 비서가 보여주는 버튼: 비자 로드맵 · 비자 안내 · 비자 멘토 */
export type AssistantAction =
  | { type: "open_visa_roadmap"; label: string }
  | { type: "open_visa_guide"; code: VisaCode; label: string }
  | { type: "open_mentors"; label: string };

const labels: Record<string, Record<string, string>> = {
  kr: { roadmap: "비자 로드맵 만들기", guide: "{code} 안내 보기", mentors: "행정사 상담받기" },
  en: { roadmap: "Create a visa roadmap", guide: "Open {code} guide", mentors: "Talk to a visa expert" },
  mn: { roadmap: "Визийн замын зураг гаргах", guide: "{code} мэдээлэл харах", mentors: "Визийн мэргэжилтэнтэй зөвлөлдөх" },
};

function L(locale: string, key: string, code = ""): string {
  return (labels[locale]?.[key] || labels.kr[key] || key).replace("{code}", code);
}

export function buildVisaActions(message: string, locale: string): AssistantAction[] {
  const actions: AssistantAction[] = [];
  for (const code of matchGuides(message)) {
    actions.push({ type: "open_visa_guide", code, label: L(locale, "guide", code) });
  }
  actions.push({ type: "open_visa_roadmap", label: L(locale, "roadmap") });
  actions.push({ type: "open_mentors", label: L(locale, "mentors") });
  return actions;
}
