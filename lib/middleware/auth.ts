import { NextRequest } from "next/server";

export interface AuthRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/** @deprecated Supabase 세션 사용 — `getApiUser` */
export function getAuthToken(_request: NextRequest): string | null {
  return null;
}

/** @deprecated */
export function authenticateRequest(_request: NextRequest): null {
  return null;
}

/** API Route — Supabase 쿠키 세션 */
export async function authenticateRequestDb(_request: NextRequest) {
  const { getApiUser } = await import("@/lib/middleware/supabaseApiAuth");
  return getApiUser();
}
