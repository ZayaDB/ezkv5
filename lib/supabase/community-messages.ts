import { createClient } from "@/lib/supabase/client";
import { fetchPublicProfiles } from "@/lib/supabase/publicProfiles";
import { requireUserId } from "@/lib/supabase/requireUser";

export async function listCommunityMessages(groupId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("community_messages")
    .select("id, body, created_at, author_id")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true })
    .limit(80);
  if (error) throw new Error(error.message);
  const rows = data || [];
  const profileMap = await fetchPublicProfiles(
    supabase,
    rows.map((r) => String(r.author_id))
  );
  return rows.map((r) => ({
    id: String(r.id),
    body: String(r.body),
    createdAt: r.created_at as string,
    author: {
      id: String(r.author_id),
      name: profileMap.get(String(r.author_id))?.name || "User",
    },
  }));
}

export async function sendCommunityMessage(groupId: string, body: string) {
  const { supabase, userId } = await requireUserId();
  const text = body.trim().slice(0, 2000);
  if (!text) return { error: "메시지를 입력해 주세요." };
  const { error } = await supabase.from("community_messages").insert({
    group_id: groupId,
    author_id: userId,
    body: text,
  });
  if (error) return { error: error.message };
  return { ok: true as const };
}
