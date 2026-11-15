import { trError } from "@/lib/i18n/runtime";
import { createClient } from "@/lib/supabase/client";
import { requireUserId } from "@/lib/supabase/requireUser";
import { fetchPublicProfiles } from "@/lib/supabase/publicProfiles";

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string | null;
};

async function withNames(rows: { id: string; rating: number; comment: string | null; created_at: string; uid: string }[]) {
  const supabase = createClient();
  const names = await fetchPublicProfiles(supabase, rows.map((r) => r.uid));
  return rows.map<Review>((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
    reviewerId: r.uid,
    reviewerName: names.get(r.uid)?.name || "",
    reviewerAvatar: names.get(r.uid)?.avatarUrl || null,
  }));
}

export async function listMentorReviews(mentorProfileId: string, limit = 20): Promise<Review[]> {
  const { data, error } = await createClient()
    .from("mentor_reviews")
    .select("id, rating, comment, created_at, reviewer_id")
    .eq("mentor_profile_id", mentorProfileId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return withNames((data || []).map((r) => ({ ...r, uid: r.reviewer_id as string })) as Parameters<typeof withNames>[0]);
}

export async function listLectureReviews(lectureId: string, limit = 20): Promise<Review[]> {
  const { data, error } = await createClient()
    .from("lecture_reviews")
    .select("id, rating, comment, created_at, user_id")
    .eq("lecture_id", lectureId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return withNames((data || []).map((r) => ({ ...r, uid: r.user_id as string })) as Parameters<typeof withNames>[0]);
}

export async function getMySessionReview(sessionId: string) {
  const { data } = await createClient()
    .from("mentor_reviews")
    .select("rating, comment")
    .eq("session_id", sessionId)
    .maybeSingle();
  return data ? { rating: Number(data.rating), comment: (data.comment as string) || "" } : null;
}

export async function getMyLectureReview(lectureId: string) {
  const { supabase, userId } = await requireUserId();
  const { data } = await supabase
    .from("lecture_reviews")
    .select("rating, comment")
    .eq("lecture_id", lectureId)
    .eq("user_id", userId)
    .maybeSingle();
  return data ? { rating: Number(data.rating), comment: (data.comment as string) || "" } : null;
}

export async function submitMentorReview(sessionId: string, rating: number, comment: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.rpc("submit_mentor_review", {
    p_session_id: sessionId,
    p_rating: rating,
    p_comment: comment.trim().slice(0, 1000) || null,
  });
  if (error) throw new Error(trError("submitFailed"));
}

export async function submitLectureReview(lectureId: string, rating: number, comment: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.rpc("upsert_lecture_review", {
    p_lecture_id: lectureId,
    p_rating: rating,
    p_comment: comment.trim().slice(0, 1000) || null,
  });
  if (error) throw new Error(trError("submitFailed"));
}
