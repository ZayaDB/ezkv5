import type { Mentor } from "@/types";

/** UI 카테고리 키 → 멘토 전문분야·소개 텍스트 키워드 매칭 */
export function mentorMatchesCategoryKey(mentor: Mentor, key: string | null): boolean {
  if (!key) return true;
  const text = [
    mentor.name,
    mentor.title,
    mentor.bio,
    ...mentor.specialties,
    ...mentor.languages,
  ]
    .join(" ")
    .toLowerCase();

  const patterns: Record<string, RegExp> = {
    visa: /비자|visa|출입국|immigration|체류|d-2|서류|법률/i,
    housing: /주거|housing|기숙사|자취|원룸|전세|월세|부동산/i,
    healthcare: /의료|health|병원|보험|건강|hospital|clinic/i,
    academic: /학업|academic|대학|수업|학교|논문|topik|장학/i,
    career: /커리어|career|취업|이력서|면접|인턴|it|개발|스타트업/i,
    dailyLife: /생활|daily|문화|교통|은행|쇼핑|적응|생활팁/i,
  };
  const re = patterns[key];
  return re ? re.test(text) : true;
}
