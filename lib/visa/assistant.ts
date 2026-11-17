import "server-only";
import { visaContent } from "./content";
import { searchManual, type ManualHit } from "./manualSearch";
import { extractVisaCodes, matchGuides } from "./match";
import { visaSlug, type VisaCode } from "./types";

/** 비자·체류 이야기인지 (아니면 AI가 답하지 않음) */
const VISA_TOPIC_RE =
  /비자|체류|사증|출입국|외국인등록|등록증|영주|거주|연장|자격\s*변경|재입국|아르바이트|알바|시간제|구직|취업\s*비자|점수제|사회통합|kiip|topik|하이코리아|hikorea|visa|immigration|residen|permit|extend|extension|part[-\s]?time|permanent|arc\b|re-?entry|виз|оршин\s*суу|цагаач|сунга|байнгын|цагийн\s*ажил|ажил\s*хай|үнэмлэх/i;

export function isVisaTopic(text: string): boolean {
  return VISA_TOPIC_RE.test(text) || extractVisaCodes(text).length > 0;
}

/** 다른 언어 질문도 한국어 매뉴얼에서 찾을 수 있게 핵심어를 한국어로 덧붙임 */
const CROSS_TERMS: Array<[RegExp, string]> = [
  [/part[-\s]?time|цагийн\s*ажил|아르바이트|알바/i, "시간제 취업 허가 허용 시간 주중 주말 방학"],
  [/extend|extension|сунга/i, "체류기간 연장허가"],
  [/change|switch|шилж|өөрчл/i, "체류자격 변경허가"],
  [/permanent|байнгын/i, "영주 F-5"],
  [/job\s*seek|ажил\s*хай/i, "구직 D-10"],
  [/document|paper|баримт|бичиг/i, "제출서류"],
  [/fee|cost|хураамж|төлбөр/i, "수수료"],
  [/re-?entry|дахин\s*орох/i, "재입국허가"],
  [/point|оноо/i, "점수"],
  [/income|salary|wage|орлого|цалин/i, "소득 임금요건"],
  [/spouse|wife|husband|эхнэр|нөхөр|гэр\s*бүл/i, "배우자 동반"],
  [/graduat|төгс/i, "졸업"],
  [/language\s*(school|course|training)|хэлний/i, "어학연수 D-4"],
  [/student|study|оюутан|сурал/i, "유학 D-2"],
  [/work|job|employ|ажил/i, "취업"],
  [/address|move|нүү|хаяг/i, "체류지 변경신고"],
  [/registration|card|бүртгэл|үнэмлэх/i, "외국인등록"],
];

export function retrieve(text: string): { hits: ManualHit[]; codes: VisaCode[] } {
  const extra = CROSS_TERMS.filter(([re]) => re.test(text)).map(([, ko]) => ko);
  const codes = matchGuides(text);
  const query = [text, ...extra, ...codes].join(" ");
  return { hits: searchManual(query, 4), codes };
}

/** 우리가 정리한 비자 안내(사용자 언어)를 AI에 함께 줌 */
export function guideContext(locale: string, codes: VisaCode[]): string {
  const c = visaContent(locale);
  return codes
    .map((code) => {
      const g = c.guides[code];
      return [`[${code} ${g.name}] ${g.short}`, ...g.who.map((x) => `- ${x}`), `- ${g.stay}`, ...g.rules.map((x) => `- ${x}`)].join("\n");
    })
    .join("\n\n");
}

const COPY: Record<string, Record<string, string>> = {
  kr: {
    offTopic: "저는 비자·체류 질문만 도와드려요. 예: \"D-2에서 E-7로 바꾸려면 뭐가 필요해?\", \"유학생 아르바이트는 몇 시간까지 돼?\"",
    intro: "매뉴얼을 기준으로 정리한 안내예요.",
    more: "자세히 보기",
    unknown: "질문과 딱 맞는 안내를 찾지 못했어요. 비자 로드맵을 만들어 보거나 비자 전문 멘토(행정사)에게 물어보세요.",
    note: "참고용 안내예요. 최종 판단은 출입국·외국인청이 해요.",
    loginRequired: "비자 비서는 회원 전용이에요. 로그인하면 비자 질문에 답해 드려요.",
  },
  en: {
    offTopic: "I can only help with visa and stay questions. For example: \"What do I need to change from D-2 to E-7?\" or \"How many hours can international students work part-time?\"",
    intro: "Here's a summary based on the immigration manual.",
    more: "Details",
    unknown: "I couldn't find a guide that matches your question. Try the visa roadmap, or ask a visa mentor (administrative agent).",
    note: "This is a guide only. The immigration office makes the final decision.",
    loginRequired: "The visa assistant is for members. Log in to ask your visa questions.",
  },
  mn: {
    offTopic: "Би зөвхөн виз, оршин суухтай холбоотой асуултад тусална. Жишээ нь: «D-2-оос E-7 рүү шилжихэд юу хэрэгтэй вэ?», «Оюутан долоо хоногт хэдэн цаг цагийн ажил хийж болох вэ?»",
    intro: "Цагаачлалын гарын авлагад үндэслэсэн товч мэдээлэл.",
    more: "Дэлгэрэнгүй",
    unknown: "Таны асуултад яг тохирох мэдээлэл олдсонгүй. Визийн замын зураг гаргаж үзэх эсвэл визийн ментороос (захиргааны төлөөлөгч) асуугаарай.",
    note: "Энэ бол лавлах мэдээлэл. Эцсийн шийдвэрийг цагаачлалын алба гаргана.",
    loginRequired: "Визийн туслах зөвхөн гишүүдэд зориулагдсан. Нэвтэрвэл визийн асуултад тань хариулна.",
  },
};

export function visaCopy(locale: string, key: keyof (typeof COPY)["kr"]): string {
  return (COPY[locale] ?? COPY.kr)[key];
}

/** AI 없이 답하기: 해당 비자 안내 요약 + 링크 */
export function ruleBasedVisaAnswer(text: string, locale: string): string {
  if (!isVisaTopic(text)) return visaCopy(locale, "offTopic");
  const codes = matchGuides(text);
  if (!codes.length) return visaCopy(locale, "unknown");
  const c = visaContent(locale);
  const parts = codes.map((code) => {
    const g = c.guides[code];
    const rules = g.rules.slice(0, 3).map((r) => `• ${r}`).join("\n");
    return `**${code} ${g.name}**\n${g.short}\n${rules}\n${visaCopy(locale, "more")}: /my/visa/${visaSlug(code)}`;
  });
  return `${visaCopy(locale, "intro")}\n\n${parts.join("\n\n")}\n\n${visaCopy(locale, "note")}`;
}
