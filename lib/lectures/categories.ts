/**
 * 강의 카테고리는 DB에 코드값으로 저장하고, 화면에서 번역해 보여준다.
 * 예전에 한국어 글자로 저장된 값도 코드로 읽어준다.
 */
export const LECTURE_CATEGORIES = [
  "visa",
  "housing",
  "health",
  "academic",
  "language",
  "career",
  "tech",
  "life",
  "other",
] as const;

export type LectureCategory = (typeof LECTURE_CATEGORIES)[number];

const LEGACY: Record<string, LectureCategory> = {
  비자: "visa",
  체류: "visa",
  주거: "housing",
  의료: "health",
  병원: "health",
  학업: "academic",
  공부: "academic",
  한국어: "language",
  언어: "language",
  커리어: "career",
  취업: "career",
  개발: "tech",
  it: "tech",
  생활: "life",
  기타: "other",
};

export function normalizeLectureCategory(raw: string | null | undefined): LectureCategory | null {
  const v = (raw || "").trim();
  if (!v) return null;
  const lower = v.toLowerCase();
  if ((LECTURE_CATEGORIES as readonly string[]).includes(lower)) return lower as LectureCategory;
  return LEGACY[v] ?? LEGACY[lower] ?? null;
}

type T = { (key: string): string; has?: (key: string) => boolean };

/** t 는 'lectures' 네임스페이스 번역 함수 */
export function lectureCategoryLabel(raw: string | null | undefined, t: T): string {
  const code = normalizeLectureCategory(raw);
  return code ? t(`categories.${code}`) : (raw || "").trim();
}

/** 커뮤니티 모임 카테고리 (DB 값 → community 네임스페이스 키) */
const COMMUNITY_KEYS: Record<string, string> = {
  모임: "catMeetup",
  meetup: "catMeetup",
  비자: "catVisa",
  visa: "catVisa",
  공부: "catStudy",
  study: "catStudy",
  구인: "catJob",
  job: "catJob",
};

export function communityCategoryLabel(raw: string | null | undefined, t: T): string {
  const v = (raw || "").trim();
  const key = COMMUNITY_KEYS[v] ?? COMMUNITY_KEYS[v.toLowerCase()];
  return key ? t(key) : v;
}
