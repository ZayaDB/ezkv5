import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchPublicProfiles(
  supabase: SupabaseClient,
  ids: string[]
): Promise<Map<string, { name: string; avatarUrl?: string }>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return new Map();

  const { data, error } = await supabase.rpc("get_public_profiles", { ids: unique });
  if (error) return new Map();

  const map = new Map<string, { name: string; avatarUrl?: string }>();
  for (const row of data || []) {
    const id = String(row.id);
    const entry: { name: string; avatarUrl?: string } = {
      name: typeof row.name === "string" ? row.name : "",
    };
    if (row.avatar_url) entry.avatarUrl = String(row.avatar_url);
    map.set(id, entry);
  }
  return map;
}
