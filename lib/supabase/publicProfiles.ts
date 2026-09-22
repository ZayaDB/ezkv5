import type { SupabaseClient } from "@supabase/supabase-js";

export type PublicProfile = {
  name: string;
  avatarUrl?: string;
  bio?: string;
  university?: string;
  nationality?: string;
  role?: string;
};

export async function fetchPublicProfiles(
  supabase: SupabaseClient,
  ids: string[]
): Promise<Map<string, PublicProfile>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return new Map();

  const { data, error } = await supabase.rpc("get_public_profiles", { ids: unique });
  if (error) return new Map();

  const map = new Map<string, PublicProfile>();
  for (const row of data || []) {
    const id = String(row.id);
    const entry: PublicProfile = {
      name: typeof row.name === "string" ? row.name : "",
    };
    if (row.avatar_url) entry.avatarUrl = String(row.avatar_url);
    if (row.bio) entry.bio = String(row.bio);
    if (row.university) entry.university = String(row.university);
    if (row.nationality) entry.nationality = String(row.nationality);
    if (row.role) entry.role = String(row.role);
    map.set(id, entry);
  }
  return map;
}
