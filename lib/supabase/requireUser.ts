import { createClient } from "@/lib/supabase/client";

export async function requireUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다.");
  return { supabase, userId: user.id };
}

export async function requireAdmin() {
  const { supabase, userId } = await requireUserId();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if (profile?.role !== "admin") throw new Error("관리자 권한이 필요합니다.");
  return { supabase, userId };
}
