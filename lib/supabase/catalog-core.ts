import type { SupabaseClient } from "@supabase/supabase-js";
import type { CommunityGroup, FreelancerGroup, StudyInfo } from "@/types";

/**
 * 운영 콘텐츠(유학 가이드·커뮤니티·프리랜서 그룹) 번역.
 * 원문은 원래 컬럼에, 다른 언어는 translations jsonb에 { kr: {...}, en: {...}, mn: {...} } 로 저장.
 * 번역이 없는 필드는 원문을 그대로 보여 준다.
 */
type Translations = Record<string, Record<string, unknown>>;
function tr<T extends Record<string, unknown>>(base: T, row: Record<string, unknown>, locale?: string): T {
  if (!locale) return base;
  const all = row.translations as Translations | null | undefined;
  const pick = all && typeof all === "object" ? all[locale] : null;
  if (!pick || typeof pick !== "object") return base;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(pick)) {
    if (!(k in base)) continue;
    if (typeof v === "string" && v.trim()) out[k] = v;
    else if (Array.isArray(v) && v.length) out[k] = v;
  }
  // 번역본을 보여 주면 "콘텐츠 언어"도 그 언어로 표시
  if ("language" in base) out.language = locale === "kr" ? "ko" : locale;
  return out as T;
}

export function mapCommunity(row: Record<string, unknown>, locale?: string): CommunityGroup {
  return tr({
    id: String(row.id),
    name: String(row.name || ""),
    description: String(row.description || ""),
    members: Number(row.members) || 0,
    category: String(row.category || ""),
    image: String(row.image || ""),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
  }, row, locale);
}

export function mapFreelancer(row: Record<string, unknown>, locale?: string): FreelancerGroup {
  return tr({
    id: String(row.id),
    name: String(row.name || ""),
    description: String(row.description || ""),
    members: Number(row.members) || 0,
    category: String(row.category || ""),
    image: String(row.image || ""),
    jobsPosted: Number(row.jobs_posted) || 0,
  }, row, locale);
}

export function mapStudyInfo(row: Record<string, unknown>, locale?: string): StudyInfo {
  return tr({
    id: String(row.id),
    category: row.category as StudyInfo["category"],
    title: String(row.title || ""),
    content: String(row.content || ""),
    image: row.image ? String(row.image) : undefined,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    summary: String(row.summary || ""),
    audience: String(row.audience || ""),
    readMinutes: Number(row.read_minutes) || 0,
    featured: Boolean(row.featured),
    language: String(row.language || "ko"),
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : null,
    createdAt: row.created_at ? String(row.created_at) : null,
  }, row, locale);
}

const STUDY_INFO_SELECT =
  "id, category, title, content, image, tags, summary, audience, read_minutes, featured, language, reviewed_at, created_at, translations";

export async function queryStudyInfoByIdWith(supabase: SupabaseClient, id: string, locale?: string) {
  const { data, error } = await supabase.from("study_infos").select(STUDY_INFO_SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapStudyInfo(data as Record<string, unknown>, locale) : null;
}

export async function queryCommunityGroupsWith(
  supabase: SupabaseClient,
  options?: { category?: string; limit?: number; locale?: string }
) {
  let q = supabase
    .from("community_groups")
    .select("id, name, description, members, category, image, tags, translations")
    .order("members", { ascending: false });
  if (options?.category) q = q.eq("category", options.category);
  if (options?.limit) q = q.limit(options.limit);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data || []).map((r) => mapCommunity(r as Record<string, unknown>, options?.locale));
}

export async function queryCommunityByIdWith(supabase: SupabaseClient, id: string, locale?: string) {
  const { data, error } = await supabase
    .from("community_groups")
    .select("id, name, description, members, category, image, tags, translations")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapCommunity(data as Record<string, unknown>, locale);
}

export async function queryFreelancerGroupsWith(
  supabase: SupabaseClient,
  options?: { category?: string; limit?: number; locale?: string }
) {
  let q = supabase
    .from("freelancer_groups")
    .select("id, name, description, members, category, image, jobs_posted, translations")
    .order("members", { ascending: false });
  if (options?.category) q = q.eq("category", options.category);
  if (options?.limit) q = q.limit(options.limit);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data || []).map((r) => mapFreelancer(r as Record<string, unknown>, options?.locale));
}

export async function queryFreelancerByIdWith(supabase: SupabaseClient, id: string, locale?: string) {
  const { data, error } = await supabase
    .from("freelancer_groups")
    .select("id, name, description, members, category, image, jobs_posted, translations")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapFreelancer(data as Record<string, unknown>, locale);
}

export async function queryStudyInfosWith(
  supabase: SupabaseClient,
  options?: { category?: StudyInfo["category"]; locale?: string }
) {
  let q = supabase
    .from("study_infos")
    .select(STUDY_INFO_SELECT)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: true });
  if (options?.category) q = q.eq("category", options.category);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data || []).map((r) => mapStudyInfo(r as Record<string, unknown>, options?.locale));
}
