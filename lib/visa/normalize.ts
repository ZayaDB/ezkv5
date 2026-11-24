import { CURRENT_VISAS, isVisaCode, type VisaCode } from "./types";

/** 프로필의 비자 문자열(D-2-1, D2, f-2-7 등)을 로드맵 코드로. 지원하지 않는 비자는 null */
export function normalizeVisa(raw: string | null | undefined): VisaCode | null {
  let v = raw?.trim().toUpperCase().replace(/\s+/g, "");
  if (!v) return null;
  // 하이픈 없이 쓴 경우: D2 → D-2, F27 → F-2-7, D10 → D-10
  if (!v.includes("-")) {
    const m = v.match(/^([A-Z])(\d{1,3})$/);
    if (m) {
      const [, l, d] = m;
      if (d.startsWith("10")) v = d.length > 2 ? `${l}-10-${d.slice(2)}` : `${l}-10`;
      else v = d.length === 1 ? `${l}-${d}` : `${l}-${d[0]}-${d.slice(1)}`;
    }
  }
  if (isVisaCode(v) && CURRENT_VISAS.includes(v)) return v;
  if (v.startsWith("F-2-7")) return "F-2-7";
  // 점수제가 아닌 거주(F-2-3, F-2-99 등)는 일반 거주로
  if (v === "F-2" || v.startsWith("F-2-")) return "F-2";
  for (const code of ["D-10", "D-4", "D-2", "E-7"] as VisaCode[]) {
    if (v === code || v.startsWith(`${code}-`)) return code;
  }
  return null;
}
