import { createServerSupabase } from "@/lib/supabase/server";

export type ApiUser = { userId: string; email: string; role: string };

/** API Route Handler — Supabase 쿠키 세션 기준 */
export async function getApiUser(): Promise<ApiUser | null> {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, email")
      .eq("id", user.id)
      .maybeSingle();

    return {
      userId: user.id,
      email: profile?.email ?? user.email ?? "",
      role: profile?.role ?? "user",
    };
  } catch {
    return null;
  }
}

export async function requireApiAdmin(): Promise<ApiUser | null> {
  const auth = await getApiUser();
  if (!auth || auth.role !== "admin") return null;
  return auth;
}
