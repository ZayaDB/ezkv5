/**
 * 사업자 정보 (푸터·약관에 표시)
 * 사업자등록 후 Netlify 환경변수만 채우면 자동으로 나타난다. 비어 있는 항목은 숨긴다.
 *   NEXT_PUBLIC_BIZ_NAME           상호
 *   NEXT_PUBLIC_BIZ_OWNER          대표자
 *   NEXT_PUBLIC_BIZ_REG_NO         사업자등록번호
 *   NEXT_PUBLIC_BIZ_ECOMMERCE_NO   통신판매업 신고번호
 *   NEXT_PUBLIC_BIZ_ADDRESS        사업장 주소
 *   NEXT_PUBLIC_BIZ_EMAIL          고객센터 이메일
 *   NEXT_PUBLIC_BIZ_PHONE          고객센터 전화
 *   NEXT_PUBLIC_BIZ_PRIVACY_OFFICER 개인정보 보호책임자
 */
export type BusinessField =
  | "name"
  | "owner"
  | "regNo"
  | "ecommerceNo"
  | "address"
  | "email"
  | "phone"
  | "privacyOfficer";

export const business: Record<BusinessField, string> = {
  name: process.env.NEXT_PUBLIC_BIZ_NAME?.trim() || "",
  owner: process.env.NEXT_PUBLIC_BIZ_OWNER?.trim() || "",
  regNo: process.env.NEXT_PUBLIC_BIZ_REG_NO?.trim() || "",
  ecommerceNo: process.env.NEXT_PUBLIC_BIZ_ECOMMERCE_NO?.trim() || "",
  address: process.env.NEXT_PUBLIC_BIZ_ADDRESS?.trim() || "",
  email: process.env.NEXT_PUBLIC_BIZ_EMAIL?.trim() || "",
  phone: process.env.NEXT_PUBLIC_BIZ_PHONE?.trim() || "",
  privacyOfficer: process.env.NEXT_PUBLIC_BIZ_PRIVACY_OFFICER?.trim() || "",
};

export const businessOrder: BusinessField[] = [
  "name",
  "owner",
  "regNo",
  "ecommerceNo",
  "address",
  "email",
  "phone",
];

export const hasBusinessInfo = businessOrder.some((k) => business[k]);

/** 약관·방침 시행일 */
export const LEGAL_EFFECTIVE_DATE = "2026-11-15";
