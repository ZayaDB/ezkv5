import type { SupabaseClient } from "@supabase/supabase-js";
import type { CommunityGroup, FreelancerGroup, StudyInfo } from "@/types";

export function mapCommunity(row: Record<string, unknown>): CommunityGroup {
  return {
    id: String(row.id),
    name: String(row.name || ""),
    description: String(row.description || ""),
    members: Number(row.members) || 0,
    category: String(row.category || ""),
    image: String(row.image || ""),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
  };
}

export function mapFreelancer(row: Record<string, unknown>): FreelancerGroup {
  return {
    id: String(row.id),
    name: String(row.name || ""),
    description: String(row.description || ""),
    members: Number(row.members) || 0,
    category: String(row.category || ""),
    image: String(row.image || ""),
    jobsPosted: Number(row.jobs_posted) || 0,
  };
}

export function mapStudyInfo(row: Record<string, unknown>): StudyInfo {
  return {
    id: String(row.id),
    category: row.category as StudyInfo["category"],
    title: String(row.title || ""),
    content: String(row.content || ""),
    image: row.image ? String(row.image) : undefined,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
  };
}

export async function queryCommunityGroupsWith(
  supabase: SupabaseClient,
  options?: { category?: string; limit?: number }
) {
  let q = supabase
    .from("community_groups")
    .select("id, name, description, members, category, image, tags")
    .order("members", { ascending: false });
  if (options?.category) q = q.eq("category", options.category);
  if (options?.limit) q = q.limit(options.limit);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data || []).map((r) => mapCommunity(r as Record<string, unknown>));
}

export async function queryCommunityByIdWith(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("community_groups")
    .select("id, name, description, members, category, image, tags")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapCommunity(data as Record<string, unknown>);
}

export async function queryFreelancerGroupsWith(
  supabase: SupabaseClient,
  options?: { category?: string; limit?: number }
) {
  let q = supabase
    .from("freelancer_groups")
    .select("id, name, description, members, category, image, jobs_posted")
    .order("members", { ascending: false });
  if (options?.category) q = q.eq("category", options.category);
  if (options?.limit) q = q.limit(options.limit);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data || []).map((r) => mapFreelancer(r as Record<string, unknown>));
}

export async function queryFreelancerByIdWith(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("freelancer_groups")
    .select("id, name, description, members, category, image, jobs_posted")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapFreelancer(data as Record<string, unknown>);
}

export async function queryStudyInfosWith(
  supabase: SupabaseClient,
  options?: { category?: StudyInfo["category"] }
) {
  let q = supabase
    .from("study_infos")
    .select("id, category, title, content, image, tags")
    .order("created_at", { ascending: false });
  if (options?.category) q = q.eq("category", options.category);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data || []).map((r) => mapStudyInfo(r as Record<string, unknown>));
}
