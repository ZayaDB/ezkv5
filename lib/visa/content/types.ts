import type { CondKey, HopKey, PlanStepKind, VisaCode } from "../types";

export type VisaGuide = {
  /** 이름 (예: 유학) */
  name: string;
  /** 한 줄 설명 */
  short: string;
  /** 누가 받을 수 있나 */
  who: string[];
  /** 1회 체류기간 등 */
  stay: string;
  /** 꼭 알아야 할 규칙 */
  rules: string[];
  /** 이 비자로 바꿀 때 서류 */
  docsChange: string[];
  /** 이 비자를 연장할 때 서류 (영주는 연장 없음 → 빈 배열) */
  docsExtend: string[];
  /** 주의할 점 */
  cautions: string[];
  /** 매뉴얼에서 찾을 곳 */
  section: string;
};

export type StepCopy = { title: string; body: string };

export type VisaContent = {
  guides: Record<VisaCode, VisaGuide>;
  /** 각 이동(예: D-2 → E-7)의 핵심 설명, 기간이 필요한 이동은 wait 설명 */
  hops: Record<HopKey, { note: string; wait?: string }>;
  /** 요건 이름 ({min}, {score}, {date} 치환) */
  conds: Record<CondKey, string>;
  /** 단계 종류별 제목·설명 ({visa}, {from}, {to}, {name} 치환) */
  steps: Record<PlanStepKind, StepCopy>;
};
