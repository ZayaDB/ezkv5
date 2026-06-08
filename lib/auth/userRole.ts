/** DB·JWT 역할. `mentee`는 레거시 — 신규 가입은 `user` */
export type DbUserRole = "user" | "mentee" | "mentor" | "admin";

/** API·클라이언트에 노출하는 역할 */
export type AppUserRole = "user" | "mentor" | "admin";

export function normalizeRole(role: string | undefined | null): AppUserRole {
  if (role === "admin") return "admin";
  if (role === "mentor") return "mentor";
  return "user";
}

export function isLegacyMentee(role: string | undefined | null): boolean {
  return role === "mentee";
}

export function toDbRoleForSwitch(target: string): DbUserRole | null {
  if (target === "user" || target === "mentee") return "user";
  if (target === "mentor") return "mentor";
  return null;
}

export const DEFAULT_SIGNUP_ROLE: DbUserRole = "user";
