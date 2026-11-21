/**
 * 비자 로드맵 계산 (AI 없이 규칙으로만 계산)
 * 근거: 법무부 「외국인체류 안내매뉴얼」 (2026. 11.) — 각 규칙 옆 주석에 매뉴얼 항목을 적어 둠
 */
import {
  degreeRank,
  type CondKey,
  type CondResult,
  type HopKey,
  type PlanStep,
  type PointsResult,
  type VisaCode,
  type VisaFacts,
  type VisaPlan,
} from "./types";

type HopDef = {
  from: VisaCode;
  to: VisaCode;
  /** 언제 넘어가는지: 입학 / 졸업 / 취업 / 일정 기간 체류 후 */
  trigger: "enroll" | "graduation" | "job" | "years";
  /** trigger=years 일 때 필요한 연수 */
  years?: number;
  conds: CondKey[];
  /** 이 사람이 이 길을 갈 수 있는지 (불가능한 길은 경로 탐색에서 제외) */
  eligible?: (f: VisaFacts) => boolean;
};

export const HOPS: Record<HopKey, HopDef> = {
  // 유학(D-2) 체류자격 변경허가 — 어학연수(D-4)→유학(D-2)
  "D-4>D-2": { from: "D-4", to: "D-2", trigger: "enroll", conds: ["admission", "funds"] },
  // 구직(D-10) — 국내 대학 졸업 후 최초 구직 자격 변경은 점수제 면제
  "D-2>D-10": { from: "D-2", to: "D-10", trigger: "graduation", conds: ["graduated"] },
  // 특정활동(E-7) — 국내 대학 학사 이상은 경력 요건 면제, 임금 요건
  "D-2>E-7": { from: "D-2", to: "E-7", trigger: "graduation", conds: ["graduated", "degreeE7", "jobOffer", "wageE7"] },
  "D-10>E-7": { from: "D-10", to: "E-7", trigger: "job", conds: ["degreeE7", "jobOffer", "wageE7"] },
  // 거주(F-2-7) 유학인재 — 국내 석사 이상, 학위 취득 5년 이내 E-1~E-7-1 직종 취업
  "D-2>F-2-7": {
    from: "D-2",
    to: "F-2-7",
    trigger: "graduation",
    conds: ["domesticMaster", "jobOffer", "points80", "conduct"],
    eligible: (f) => f.domesticDegree && degreeRank(f.degree) >= degreeRank("master"),
  },
  // 거주(F-2-7) 전문직 종사자 — E-7-1 등으로 3년 이상 연속 체류(연 소득 4천만원 이상이면 면제)
  "E-7>F-2-7": { from: "E-7", to: "F-2-7", trigger: "years", years: 3, conds: ["years3E7", "points80", "conduct"] },
  // 영주(F-5-16) — F-2-7로 3년 이상 체류
  "F-2-7>F-5-16": { from: "F-2-7", to: "F-5-16", trigger: "years", years: 3, conds: ["years3F27", "income2Gni", "kiip5", "conduct"] },
  // 영주(F-5-10) — 학사·석사 학위증 및 자격증 소지자
  "E-7>F-5-10": { from: "E-7", to: "F-5-10", trigger: "years", years: 3, conds: ["degreeF510", "work3y", "incomeGni", "kiip5", "conduct"] },
  // 영주(F-5-1) — D-7~E-7 / F-2로 5년 이상
  "E-7>F-5-1": { from: "E-7", to: "F-5-1", trigger: "years", years: 5, conds: ["years5", "bachelor", "income2Gni", "kiip5", "conduct"] },
};

const HOP_KEYS = Object.keys(HOPS) as HopKey[];

/** 지금 비자 → 목표 비자까지 가장 짧은 길 (갈 수 없는 길은 뺌) */
export function findRoute(from: VisaCode, to: VisaCode, facts: VisaFacts): HopKey[] | null {
  if (from === to) return [];
  const queue: Array<{ at: VisaCode; path: HopKey[] }> = [{ at: from, path: [] }];
  const seen = new Set<VisaCode>([from]);
  while (queue.length) {
    const { at, path } = queue.shift()!;
    for (const key of HOP_KEYS) {
      const hop = HOPS[key];
      if (hop.from !== at || seen.has(hop.to)) continue;
      if (hop.eligible && !hop.eligible(facts)) continue;
      const next = [...path, key];
      if (hop.to === to) return next;
      seen.add(hop.to);
      queue.push({ at: hop.to, path: next });
    }
  }
  return null;
}

/* ───────── 점수제 거주(F-2-7) 점수 계산 (거주(F-2) 5. 점수제 우수인재 나. 심사기준) ───────── */

function agePoints(age: number): number {
  if (age < 18) return 0;
  if (age <= 24) return 23;
  if (age <= 29) return 25;
  if (age <= 34) return 23;
  if (age <= 39) return 20;
  if (age <= 44) return 12;
  if (age <= 50) return 8;
  return 3;
}

function degreePoints(f: VisaFacts): number {
  const stem = f.stem;
  switch (f.degree) {
    case "doctor":
      return stem ? 25 : 20;
    case "master":
      return stem ? 20 : 17;
    case "bachelor":
      return stem ? 17 : 15;
    case "associate":
      return stem ? 15 : 10;
    default:
      return 0;
  }
}

function koreanPoints(f: VisaFacts): number {
  const level = Math.max(f.topik, f.kiip);
  if (level >= 5) return 20;
  if (level === 4) return 15;
  if (level === 3) return 10;
  if (level === 2) return 5;
  if (level === 1) return 3;
  return 0;
}

/** 연봉(만원) → 소득 점수. 최저임금 미만이거나 소득 없음은 0점 */
function incomePoints(income: number): number {
  if (income >= 10000) return 60;
  if (income >= 9000) return 58;
  if (income >= 8000) return 56;
  if (income >= 7000) return 53;
  if (income >= 6000) return 50;
  if (income >= 5000) return 45;
  if (income >= 4000) return 40;
  if (income >= 3000) return 30;
  if (income > 0) return 10;
  return 0;
}

function bonusPoints(f: VisaFacts): number {
  let bonus = 0;
  if (f.kiip >= 5) bonus += 10; // 사회통합프로그램 5단계 이수
  if (f.domesticDegree) {
    // 국내 학위 가점: 박사 10 / 석사 7 / 학사 5 (가장 높은 것 하나)
    if (f.degree === "doctor") bonus += 10;
    else if (f.degree === "master") bonus += 7;
    else if (f.degree === "bachelor") bonus += 5;
  }
  return Math.min(bonus, 40);
}

export function computeF27Points(f: VisaFacts, today = new Date()): PointsResult {
  const age = f.birthYear ? agePoints(today.getFullYear() - f.birthYear) : null;
  const income = f.income != null ? incomePoints(f.income) : null;
  const degree = degreePoints(f);
  const korean = koreanPoints(f);
  const bonus = bonusPoints(f);
  return { total: (age ?? 0) + degree + korean + (income ?? 0) + bonus, age, degree, korean, income, bonus };
}

/* ───────── 요건 판정 ───────── */

/** 2026년 E-7-1 임금요건: 연 3,112만원 (특정활동(E-7) 국민고용 보호 심사기준) */
export const E7_1_MIN_WAGE_2026 = 3112;

function evalCond(key: CondKey, f: VisaFacts, points: PointsResult, today: Date): CondResult {
  const deg = degreeRank(f.degree);
  switch (key) {
    case "graduated": {
      if (!f.domesticDegree || deg < degreeRank("associate")) return { key, status: "missing" };
      if (f.gradDate && new Date(f.gradDate) > today) return { key, status: "check", vars: { date: f.gradDate } };
      return { key, status: "ok" };
    }
    case "jobOffer":
      return { key, status: f.jobOffer ? "ok" : "missing" };
    case "wageE7":
    {
      const vars = { min: "3,112", minM: (E7_1_MIN_WAGE_2026 / 100).toFixed(2) };
      if (f.income == null) return { key, status: "check", vars };
      return { key, status: f.income >= E7_1_MIN_WAGE_2026 ? "ok" : "missing", vars };
    }
    case "degreeE7":
      // 국내 학사 이상: 전공 무관 경력 면제 / 국내 전문학사: 전공 관련 직종이면 경력 면제 / 석사 이상: 일반요건 충족
      if (deg >= degreeRank("master")) return { key, status: "ok" };
      if (f.domesticDegree && deg >= degreeRank("bachelor")) return { key, status: "ok" };
      if (f.domesticDegree && deg === degreeRank("associate")) return { key, status: "check" };
      if (deg >= degreeRank("bachelor")) return { key, status: "check" }; // 해외 학사: 1년 경력 필요
      return { key, status: "missing" };
    case "domesticMaster":
      return { key, status: f.domesticDegree && deg >= degreeRank("master") ? "ok" : "missing" };
    case "points80":
      // 나이·소득을 모르면 "지금까지 최소 몇 점"으로 보여줌
      if (points.age == null || points.income == null) return { key, status: "check", vars: { score: `${points.total}+` } };
      return { key, status: points.total >= 80 ? "ok" : "missing", vars: { score: points.total } };
    case "bachelor":
      return { key, status: deg >= degreeRank("bachelor") ? "ok" : "missing" };
    case "degreeF510": {
      // 첨단 분야 학사 이상 / 국내 이공계 학사 이상 / 국내 석사 이상 / 기술사 자격증
      if (f.domesticDegree && deg >= degreeRank("master")) return { key, status: "ok" };
      if (f.domesticDegree && f.stem && deg >= degreeRank("bachelor")) return { key, status: "ok" };
      if (f.stem && deg >= degreeRank("bachelor")) return { key, status: "check" };
      return { key, status: "missing" };
    }
    case "kiip5":
      return { key, status: f.kiip >= 5 ? "ok" : "missing" };
    case "conduct":
    case "admission":
    case "funds":
    case "years3E7":
    case "years3F27":
    case "years5":
    case "work3y":
    case "incomeGni":
    case "income2Gni":
    default:
      return { key, status: "check" };
  }
}

/* ───────── 날짜 ───────── */

const DAY = 24 * 60 * 60 * 1000;
function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}
function addDays(dateIso: string, days: number) {
  return iso(new Date(new Date(`${dateIso}T00:00:00Z`).getTime() + days * DAY));
}
function clampToToday(dateIso: string, today: Date) {
  return dateIso < iso(today) ? iso(today) : dateIso;
}

/**
 * 로드맵 만들기
 * - 첫 번째 단계(지금 비자에서 넘어가는 것)는 만료일 기준으로 날짜를 계산
 * - 졸업이 만료일 뒤라면 먼저 "지금 비자 연장" 단계를 넣음
 * - 몇 년 체류해야 하는 단계는 날짜 없이 "유지" 단계를 넣음
 */
export function buildVisaPlan(input: {
  from: VisaCode;
  to: VisaCode;
  expiry: string | null;
  facts: VisaFacts;
  today?: Date;
}): VisaPlan | null {
  const today = input.today ?? new Date();
  const hops = findRoute(input.from, input.to, input.facts);
  if (!hops || hops.length === 0) return null;

  const points = computeF27Points(input.facts, today);
  const steps: PlanStep[] = [];
  const expiry = input.expiry;

  hops.forEach((hopKey, i) => {
    const hop = HOPS[hopKey];
    const first = i === 0;
    let applyDue: string | null = null;

    if (first && expiry) {
      const grad = input.facts.gradDate;
      const needsGraduation = hop.trigger === "graduation";
      const gradAfterExpiry = needsGraduation && (!grad || grad > expiry);
      if (hop.trigger === "years" || gradAfterExpiry) {
        // 아직 넘어갈 때가 아니면, 그때까지 지금 비자를 연장해야 함
        steps.push({ key: `extend:${hop.from}`, kind: "extend", hop: null, visa: hop.from, dueDate: clampToToday(expiry, today) });
      } else {
        // 지금 비자가 끝나기 전에 신청해야 함 (체류허가는 국내 체류 중, 만료 전에 신청)
        applyDue = clampToToday(expiry, today);
      }
    }

    if (hop.trigger === "years") {
      steps.push({ key: `wait:${hopKey}`, kind: "wait", hop: hopKey, visa: hop.from, dueDate: null });
    }

    const docsDue = applyDue ? clampToToday(addDays(applyDue, -30), today) : null;
    const checkDue = applyDue ? clampToToday(addDays(applyDue, -60), today) : null;
    steps.push({ key: `check:${hopKey}`, kind: "check", hop: hopKey, visa: hop.to, dueDate: checkDue });
    steps.push({ key: `docs:${hopKey}`, kind: "docs", hop: hopKey, visa: hop.to, dueDate: docsDue });
    steps.push({ key: `apply:${hopKey}`, kind: "apply", hop: hopKey, visa: hop.to, dueDate: applyDue });
  });

  return {
    from: input.from,
    to: input.to,
    route: [input.from, ...hops.map((h) => HOPS[h].to)],
    hops,
    steps,
    conditions: hops.map((h) => ({ hop: h, results: HOPS[h].conds.map((c) => evalCond(c, input.facts, points, today)) })),
    points: hops.some((h) => HOPS[h].to === "F-2-7") ? points : null,
  };
}

/** DB에 저장하는 템플릿 키: visa:D-2>F-5-16 */
export const visaTemplateKey = (from: VisaCode, to: VisaCode) => `visa:${from}>${to}`;
export function parseVisaTemplateKey(key: string | null | undefined): { from: VisaCode; to: VisaCode } | null {
  if (!key?.startsWith("visa:")) return null;
  const [from, to] = key.slice(5).split(">");
  return from && to ? ({ from, to } as { from: VisaCode; to: VisaCode }) : null;
}
