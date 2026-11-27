/**
 * 멘토 "사용 언어"는 DB에 사람이 쓴 글자 그대로(몽골어 / Монгол хэл / Mongolian …) 들어 있다.
 * 화면에서는 같은 언어를 하나의 코드로 묶고, 보는 사람 언어로 이름을 보여 준다.
 */
export type LangCode = "ko" | "en" | "mn" | "vi" | "zh" | "ja" | "ru" | "uz";

const ALIASES: Record<LangCode, string[]> = {
  ko: ["한국어", "korean", "солонгос", "солонгос хэл", "ko", "kr"],
  en: ["영어", "english", "англи", "англи хэл", "en"],
  mn: ["몽골어", "mongolian", "монгол", "монгол хэл", "mn"],
  vi: ["베트남어", "vietnamese", "tiếng việt", "вьетнам", "vi"],
  zh: ["중국어", "chinese", "中文", "хятад", "zh"],
  ja: ["일본어", "japanese", "日本語", "япон", "ja"],
  ru: ["러시아어", "russian", "русский", "орос", "ru"],
  uz: ["우즈베크어", "uzbek", "o'zbek", "узбек", "uz"],
};

const NAMES: Record<LangCode, Record<string, string>> = {
  ko: { kr: "한국어", en: "Korean", mn: "Солонгос хэл" },
  en: { kr: "영어", en: "English", mn: "Англи хэл" },
  mn: { kr: "몽골어", en: "Mongolian", mn: "Монгол хэл" },
  vi: { kr: "베트남어", en: "Vietnamese", mn: "Вьетнам хэл" },
  zh: { kr: "중국어", en: "Chinese", mn: "Хятад хэл" },
  ja: { kr: "일본어", en: "Japanese", mn: "Япон хэл" },
  ru: { kr: "러시아어", en: "Russian", mn: "Орос хэл" },
  uz: { kr: "우즈베크어", en: "Uzbek", mn: "Узбек хэл" },
};

const LOOKUP = new Map<string, LangCode>();
for (const [code, list] of Object.entries(ALIASES) as [LangCode, string[]][]) {
  for (const a of list) LOOKUP.set(a.toLowerCase(), code);
}

/** 글자 그대로의 언어 이름 → 코드 (모르면 원래 글자) */
export function langKey(raw: string): string {
  const k = raw.trim().toLowerCase();
  return LOOKUP.get(k) ?? raw.trim();
}

/** 코드나 원래 글자 → 보는 사람 언어의 이름 */
export function langName(rawOrCode: string, locale: string): string {
  const key = langKey(rawOrCode) as LangCode;
  return NAMES[key]?.[locale] ?? NAMES[key]?.en ?? rawOrCode;
}
