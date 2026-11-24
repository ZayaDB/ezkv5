import { VISA_CODES, type VisaCode } from "./types";

/** 비자 코드·이름 찾기 (서버·브라우저 어디서나 사용 가능) */
const VISA_CODE_RE = /\b([A-H])\s*-?\s*(\d{1,2})(?:\s*-\s*(\d{1,2}|[A-Z]{1,2}\d?))?\b/gi;

/** 질문에서 비자 코드(D-2, E-7-1, F-2-7 …)를 뽑음 */
export function extractVisaCodes(text: string): string[] {
  const out = new Set<string>();
  for (const m of text.matchAll(VISA_CODE_RE)) {
    const base = `${m[1].toUpperCase()}-${m[2]}`;
    out.add(m[3] ? `${base}-${m[3].toUpperCase()}` : base);
  }
  return [...out];
}

/** 우리 비자 안내와 연결되는 코드 찾기 (질문에 적힌 코드 + 이름 키워드) */
const NAME_HINTS: Array<[RegExp, VisaCode]> = [
  [/어학|language\s*(school|course|training)|хэлний\s*сургалт/i, "D-4"],
  [/유학|학생|student|study|оюутан|суралц/i, "D-2"],
  [/구직|job\s*seek|ажил\s*хай/i, "D-10"],
  [/특정활동|취업\s*비자|work\s*visa|ажлын\s*виз/i, "E-7"],
  [/점수제|우수인재|points?-?based|онооны/i, "F-2-7"],
  [/영주|permanent|байнгын/i, "F-5-16"],
];

export function matchGuides(text: string): VisaCode[] {
  const out: VisaCode[] = [];
  for (const raw of extractVisaCodes(text)) {
    const c = raw.toUpperCase();
    const hit =
      (VISA_CODES as readonly string[]).find((v) => v === c) ??
      (c.startsWith("E-7") ? "E-7" : c.startsWith("D-10") ? "D-10" : c.startsWith("D-4") ? "D-4" : c.startsWith("D-2") ? "D-2" : c === "F-2" || /^F-2-(?!7)/.test(c) ? "F-2" : c.startsWith("F-5") ? "F-5-16" : undefined);
    if (hit && !out.includes(hit as VisaCode)) out.push(hit as VisaCode);
  }
  if (!out.length) {
    for (const [re, code] of NAME_HINTS) if (re.test(text) && !out.includes(code)) out.push(code);
  }
  return out.slice(0, 2);
}

