/**
 * 비자 로드맵 · 비자 안내 공통 타입
 * 기준 자료: 법무부 「외국인체류 안내매뉴얼」 (2026. 11.)
 */

export const VISA_CODES = ["D-4", "D-2", "D-10", "E-7", "F-2-7", "F-5-10", "F-5-16", "F-5-1"] as const;
export type VisaCode = (typeof VISA_CODES)[number];

/** 로드맵에서 "지금 비자"로 고를 수 있는 것 */
export const CURRENT_VISAS: VisaCode[] = ["D-4", "D-2", "D-10", "E-7", "F-2-7"];
/** 로드맵에서 "받고 싶은 비자"로 고를 수 있는 것 */
export const TARGET_VISAS: VisaCode[] = ["D-2", "D-10", "E-7", "F-2-7", "F-5-16", "F-5-10", "F-5-1"];

export function isVisaCode(v: unknown): v is VisaCode {
  return typeof v === "string" && (VISA_CODES as readonly string[]).includes(v);
}

/** URL용 슬러그 (F-2-7 → f-2-7) */
export const visaSlug = (code: VisaCode) => code.toLowerCase();
export function visaFromSlug(slug: string): VisaCode | null {
  const up = slug.toUpperCase();
  return isVisaCode(up) ? up : null;
}

export type DegreeLevel = "none" | "associate" | "bachelor" | "master" | "doctor";
export const DEGREE_LEVELS: DegreeLevel[] = ["none", "associate", "bachelor", "master", "doctor"];
export const degreeRank = (d: DegreeLevel) => DEGREE_LEVELS.indexOf(d);

/** 사용자가 입력하는 현재 상황 (모르면 비워 둠) */
export type VisaFacts = {
  degree: DegreeLevel;
  /** 한국 대학(원)에서 받은(받을) 학위인지 */
  domesticDegree: boolean;
  /** 이공계 학위인지 */
  stem: boolean;
  /** TOPIK 급수 (0 = 없음) */
  topik: number;
  /** 사회통합프로그램(KIIP) 이수 단계 (0 = 없음) */
  kiip: number;
  /** 취업이 확정됐거나 일하는 중인지 */
  jobOffer: boolean;
  /** 연봉(만원). 모르면 null */
  income: number | null;
  /** 태어난 해. 모르면 null */
  birthYear: number | null;
  /** 졸업(예정)일 YYYY-MM-DD. 모르면 null */
  gradDate: string | null;
};

export const EMPTY_FACTS: VisaFacts = {
  degree: "none",
  domesticDegree: false,
  stem: false,
  topik: 0,
  kiip: 0,
  jobOffer: false,
  income: null,
  birthYear: null,
  gradDate: null,
};

/** 요건 하나에 대한 판정 */
export type CondStatus = "ok" | "missing" | "check";

export type CondKey =
  | "admission"
  | "funds"
  | "graduated"
  | "jobOffer"
  | "wageE7"
  | "degreeE7"
  | "domesticMaster"
  | "points80"
  | "years3E7"
  | "years3F27"
  | "years5"
  | "bachelor"
  | "degreeF510"
  | "work3y"
  | "incomeGni"
  | "income2Gni"
  | "kiip5"
  | "conduct";

export type CondResult = { key: CondKey; status: CondStatus; vars?: Record<string, string | number> };

export type HopKey =
  | "D-4>D-2"
  | "D-2>D-10"
  | "D-2>E-7"
  | "D-10>E-7"
  | "D-2>F-2-7"
  | "E-7>F-2-7"
  | "F-2-7>F-5-16"
  | "E-7>F-5-10"
  | "E-7>F-5-1";

/** 로드맵 한 단계 (DB roadmap_steps 한 줄) */
export type PlanStepKind = "extend" | "wait" | "check" | "docs" | "apply";
export type PlanStep = {
  /** 번역 키: extend:D-2 / wait:E-7>F-2-7 / check:D-2>E-7 ... */
  key: string;
  kind: PlanStepKind;
  hop: HopKey | null;
  visa: VisaCode;
  dueDate: string | null;
};

export type VisaPlan = {
  from: VisaCode;
  to: VisaCode;
  route: VisaCode[];
  hops: HopKey[];
  steps: PlanStep[];
  conditions: Array<{ hop: HopKey; results: CondResult[] }>;
  points: PointsResult | null;
};

export type PointsResult = {
  total: number;
  age: number | null;
  degree: number;
  korean: number;
  income: number | null;
  bonus: number;
};
