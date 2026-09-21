import { createClient } from "@/lib/supabase/client";
import { fetchPublicProfiles } from "@/lib/supabase/publicProfiles";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Mentor } from "@/types";

export type MentorProfileRow = {
  id: string;
  user_id: string;
  title: string;
  location: string;
  bio: string;
  languages: string[];
  specialties: string[];
  price: number;
  availability: string;
  photo: string | null;
  verified: boolean;
  approval_status: string;
  rating: number;
  review_count: number;
  years_of_experience: number;
  education: string;
  career_summary: string;
  session_duration: number;
  session_format: string;
  timezone: string;
  response_time: string;
  intro_video_url: string;
  portfolio_links: string[];
  mentoring_style: string;
  recommended_for: string;
  not_recommended_for: string;
  created_at: string;
  updated_at: string;
  profiles?: { name?: string; avatar_url?: string | null } | null;
};

async function mentorRowsWithPublicProfiles(
  supabase: SupabaseClient,
  rows: MentorProfileRow[]
): Promise<MentorProfileRow[]> {
  const profileMap = await fetchPublicProfiles(
    supabase,
    rows.map((r) => r.user_id)
  );
  return rows.map((r) => {
    const pub = profileMap.get(r.user_id);
    return {
      ...r,
      profiles: pub ? { name: pub.name, avatar_url: pub.avatarUrl ?? null } : null,
    };
  });
}

async function requireUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다.");
  return { supabase, userId: user.id };
}

export function mapMentorRow(row: MentorProfileRow): Mentor {
  const name = row.profiles?.name || "멘토";
  return {
    id: row.id,
    userId: row.user_id,
    name,
    title: row.title,
    location: row.location,
    languages: row.languages || [],
    rating: Number(row.rating) || 0,
    reviewCount: row.review_count || 0,
    specialties: row.specialties || [],
    price: Number(row.price) || 0,
    availability: (row.availability as Mentor["availability"]) || "available",
    photo: row.photo || row.profiles?.avatar_url || undefined,
    verified: row.verified,
    bio: row.bio,
    yearsOfExperience: row.years_of_experience,
    education: row.education,
    careerSummary: row.career_summary,
    sessionDuration: row.session_duration,
    sessionFormat: row.session_format as Mentor["sessionFormat"],
    timezone: row.timezone,
    responseTime: row.response_time,
    introVideoUrl: row.intro_video_url,
    portfolioLinks: row.portfolio_links || [],
    mentoringStyle: row.mentoring_style,
    recommendedFor: row.recommended_for,
    notRecommendedFor: row.not_recommended_for,
  };
}

export function serializeMine(row: MentorProfileRow) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    location: row.location,
    languages: row.languages || [],
    specialties: row.specialties || [],
    price: Number(row.price) || 0,
    availability: row.availability,
    photo: row.photo || "",
    verified: row.verified,
    approvalStatus: row.approval_status,
    bio: row.bio,
    rating: Number(row.rating) || 0,
    reviewCount: row.review_count || 0,
    yearsOfExperience: Number(row.years_of_experience) || 0,
    education: row.education || "",
    careerSummary: row.career_summary || "",
    sessionDuration: Number(row.session_duration) || 0,
    sessionFormat: row.session_format || "online",
    timezone: row.timezone || "",
    responseTime: row.response_time || "",
    introVideoUrl: row.intro_video_url || "",
    portfolioLinks: row.portfolio_links || [],
    mentoringStyle: row.mentoring_style || "",
    recommendedFor: row.recommended_for || "",
    notRecommendedFor: row.not_recommended_for || "",
  };
}

export type MyMentorProfile = ReturnType<typeof serializeMine>;

type MentorProfileWrite = {
  title: string;
  location: string;
  bio: string;
  languages?: string[];
  specialties?: string[];
  price?: number | string;
  availability?: string;
  photo?: string;
  sessionDuration?: number;
  sessionFormat?: "online" | "offline" | "both";
  yearsOfExperience?: number;
  education?: string;
  careerSummary?: string;
  responseTime?: string;
  timezone?: string;
  introVideoUrl?: string;
  portfolioLinks?: string[];
  mentoringStyle?: string;
  recommendedFor?: string;
  notRecommendedFor?: string;
};

function mentorContentFields(payload: MentorProfileWrite) {
  return {
    title: payload.title.trim(),
    location: payload.location.trim(),
    bio: payload.bio.trim(),
    languages: payload.languages || [],
    specialties: payload.specialties || [],
    price: Number(payload.price) || 0,
    availability: payload.availability || "available",
    photo: payload.photo || null,
    session_duration: Number(payload.sessionDuration) || 60,
    session_format: payload.sessionFormat || "online",
    years_of_experience: Number(payload.yearsOfExperience) || 0,
    education: payload.education || "",
    career_summary: payload.careerSummary || "",
    response_time: payload.responseTime || "",
    timezone: payload.timezone || "Asia/Seoul",
    intro_video_url: payload.introVideoUrl || "",
    portfolio_links: payload.portfolioLinks || [],
    mentoring_style: payload.mentoringStyle || "",
    recommended_for: payload.recommendedFor || "",
    not_recommended_for: payload.notRecommendedFor || "",
    updated_at: new Date().toISOString(),
  };
}

export async function listApprovedMentors(
  supabase: SupabaseClient,
  options?: { limit?: number; page?: number }
) {
  const limit = options?.limit ?? 24;
  const page = options?.page ?? 1;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("mentor_profiles")
    .select("*", { count: "exact" })
    .eq("approval_status", "approved")
    .order("rating", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const rows = await mentorRowsWithPublicProfiles(supabase, (data || []) as MentorProfileRow[]);
  const mentors = rows.map(mapMentorRow);
  return { mentors, total: count ?? mentors.length, page, limit };
}

export async function getApprovedMentorById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("mentor_profiles")
    .select("*")
    .eq("id", id)
    .eq("approval_status", "approved")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  const [row] = await mentorRowsWithPublicProfiles(supabase, [data as MentorProfileRow]);
  return mapMentorRow(row);
}

export async function getMyMentorProfile() {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("mentor_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return serializeMine(data as MentorProfileRow);
}

export async function applyMentorProfile(payload: MentorProfileWrite) {
  const { supabase, userId } = await requireUserId();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if (profile?.role === "admin") {
    throw new Error("관리자는 이 경로로 멘토 신청을 할 수 없습니다.");
  }

  const row = {
    user_id: userId,
    ...mentorContentFields(payload),
    approval_status: profile?.role === "mentor" ? "approved" : "pending",
    verified: profile?.role === "mentor",
  };

  const { data: existing } = await supabase
    .from("mentor_profiles")
    .select("id, approval_status")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const st = existing.approval_status;
    if (st === "pending") throw new Error("이미 심사 중인 멘토 신청이 있습니다.");
    if (st === "approved") throw new Error("이미 멘토 프로필이 있습니다.");

    const { data, error } = await supabase
      .from("mentor_profiles")
      .update({ ...row, approval_status: "pending", verified: false })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return { mentor: serializeMine(data as MentorProfileRow) };
  }

  const { data, error } = await supabase.from("mentor_profiles").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return { mentor: serializeMine(data as MentorProfileRow) };
}

export async function updateMyMentorProfile(payload: MentorProfileWrite) {
  const { supabase, userId } = await requireUserId();
  const { data: existing, error: fetchErr } = await supabase
    .from("mentor_profiles")
    .select("id, approval_status")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchErr) throw new Error(fetchErr.message);
  if (!existing) throw new Error("멘토 프로필이 없습니다.");
  if (existing.approval_status !== "approved") {
    throw new Error("승인된 멘토 프로필만 수정할 수 있습니다.");
  }

  const { data, error } = await supabase
    .from("mentor_profiles")
    .update(mentorContentFields(payload))
    .eq("id", existing.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return { mentor: serializeMine(data as MentorProfileRow) };
}

export async function userCanManageLectures(userId: string, role: string) {
  if (role === "admin" || role === "mentor") return true;
  const supabase = createClient();
  const { data } = await supabase
    .from("mentor_profiles")
    .select("approval_status")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.approval_status === "approved";
}
