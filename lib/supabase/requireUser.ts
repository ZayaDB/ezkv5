import { trError } from "@/lib/i18n/runtime";
import { createClient } from "@/lib/supabase/client";

export async function requireUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error(trError("authRequired"));
  return { supabase, userId: user.id };
}

export async function requireAdmin() {
  const { supabase, userId } = await requireUserId();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if (profile?.role !== "admin") throw new Error(trError("adminRequired"));
  return { supabase, userId };
}
