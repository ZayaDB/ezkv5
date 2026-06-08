import { resolveTemplateKey } from "@/lib/roadmap/templates";

export type AssistantAction =
  | { type: "create_roadmap"; templateKey: string; label: string }
  | { type: "open_calendar"; label: string }
  | { type: "open_mentors"; label: string }
  | { type: "open_study_guide"; label: string };

export type AssistantActionResult = {
  response: string;
  actions: AssistantAction[];
  links: Array<{ type: string; title: string; url: string }>;
};

const labels: Record<string, Record<string, string>> = {
  kr: {
    visa_extension: "비자 연장 로드맵 만들기",
    moving: "이사 준비 로드맵 만들기",
    settling_korea: "한국 정착 로드맵 만들기",
    job_prep: "취업 준비 로드맵 만들기",
    d10_prep: "D-10 준비 로드맵 만들기",
    calendar: "캘린더에서 일정 확인",
    mentors: "멘토 찾기",
    guide: "한국생활 가이드 보기",
  },
  en: {
    visa_extension: "Create visa extension roadmap",
    moving: "Create moving roadmap",
    settling_korea: "Create settling-in roadmap",
    job_prep: "Create job prep roadmap",
    d10_prep: "Create D-10 roadmap",
    calendar: "Open calendar",
    mentors: "Find mentors",
    guide: "Open Korea life guide",
  },
  mn: {
    visa_extension: "Виз сунгах roadmap үүсгэх",
    moving: "Нүүх roadmap үүсгэх",
    settling_korea: "Суурьших roadmap үүсгэх",
    job_prep: "Ажил бэлтгэх roadmap",
    d10_prep: "D-10 roadmap үүсгэх",
    calendar: "Календар нээх",
    mentors: "Ментор хайх",
    guide: "Солонгос амьдралын гарын авлага",
  },
};

function L(locale: string, key: string): string {
  return labels[locale]?.[key] || labels.kr[key] || key;
}

export function buildActionAssistantResponse(
  message: string,
  locale: string
): AssistantActionResult {
  const templateKey = resolveTemplateKey(message);
  const actions: AssistantAction[] = [];
  const m = message.toLowerCase();

  const msg: Record<string, string> = {
    kr: "다음 행동을 바로 실행할 수 있어요. 원하시는 항목을 눌러주세요.",
    en: "You can take these actions right away. Tap what you need.",
    mn: "Дараах үйлдлүүдийг шууд хийж болно.",
  };

  if (templateKey) {
    actions.push({
      type: "create_roadmap",
      templateKey,
      label: L(locale, templateKey),
    });
    actions.push({ type: "open_calendar", label: L(locale, "calendar") });
    if (/비자|visa|виз/.test(m)) {
      actions.push({ type: "open_mentors", label: L(locale, "mentors") });
    }
  } else if (/멘토|mentor|ментор/.test(m)) {
    actions.push({ type: "open_mentors", label: L(locale, "mentors") });
  } else if (/일정|캘린더|calendar|хуанли/.test(m)) {
    actions.push({ type: "open_calendar", label: L(locale, "calendar") });
  } else {
    actions.push({ type: "open_study_guide", label: L(locale, "guide") });
    actions.push({ type: "open_calendar", label: L(locale, "calendar") });
  }

  return {
    response: msg[locale] || msg.kr,
    actions,
    links: [],
  };
}
