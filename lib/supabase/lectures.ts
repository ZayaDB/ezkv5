import { createClient } from "@/lib/supabase/client";
import { fetchPublicProfiles } from "@/lib/supabase/publicProfiles";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Lecture } from "@/types";
import { userCanManageLectures } from "@/lib/supabase/mentors";

type LectureRow = {
  id: string;
  instructor_id: string;
  title: string;
  type: string;
  category: string;
  price: number;
  duration: string;
  description: string;
  image: string;
  short_description: string;
  target_audience: string;
  prerequisites: string;
  what_you_will_learn: string[];
  curriculum: string[];
  total_lessons: number;
  total_hours: number;
  difficulty: string;
  max_students: number;
  language: string;
  preview_video_url: string;
  materials_included: string[];
  faq: string[];
  rating: number;
  students: number;
  approval_status: string;
  profiles?: { name?: string } | null;
};

async function lectureRowsWithInstructorNames(
  supabase: SupabaseClient,
  rows: LectureRow[]
): Promise<LectureRow[]> {
  const profileMap = await fetchPublicProfiles(
    supabase,
    rows.map((r) => r.instructor_id)
  );
  return rows.map((r) => {
    const pub = profileMap.get(r.instructor_id);
    return {
      ...r,
      profiles: pub ? { name: pub.name } : null,
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

export function mapLectureRow(row: LectureRow, instructorName?: string): Lecture {
  return {
    id: row.id,
    title: row.title,
    instructor: instructorName || row.profiles?.name || "강사",
    type: row.type as Lecture["type"],
    category: row.category,
    price: Number(row.price) || 0,
    duration: row.duration,
    rating: Number(row.rating) || 0,
    students: row.students || 0,
    image: row.image || "",
    description: row.description,
    shortDescription: row.short_description,
    targetAudience: row.target_audience,
    prerequisites: row.prerequisites,
    whatYouWillLearn: row.what_you_will_learn || [],
    curriculum: row.curriculum || [],
    totalLessons: row.total_lessons,
    totalHours: Number(row.total_hours) || 0,
    difficulty: row.difficulty as Lecture["difficulty"],
    maxStudents: row.max_students,
    language: row.language,
    previewVideoUrl: row.preview_video_url,
    materialsIncluded: row.materials_included || [],
    faq: row.faq || [],
  };
}

function serializeMine(row: LectureRow) {
  return {
    ...mapLectureRow(row),
    approvalStatus: row.approval_status,
  };
}

export async function listApprovedLectures(
  supabase: SupabaseClient,
  options?: { limit?: number; page?: number; type?: "online" | "offline" | null; category?: string }
) {
  const limit = options?.limit ?? 24;
  const page = options?.page ?? 1;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let q = supabase
    .from("lectures")
    .select("*", { count: "exact" })
    .eq("approval_status", "approved");

  if (options?.type) q = q.eq("type", options.type);
  if (options?.category) q = q.ilike("category", `%${options.category}%`);

  const { data, error, count } = await q
    .order("rating", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const rows = await lectureRowsWithInstructorNames(supabase, (data || []) as LectureRow[]);
  const lectures = rows.map((r) => mapLectureRow(r));
  return { lectures, total: count ?? lectures.length };
}

export async function getApprovedLectureById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("lectures")
    .select("*")
    .eq("id", id)
    .eq("approval_status", "approved")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  const [row] = await lectureRowsWithInstructorNames(supabase, [data as LectureRow]);
  return mapLectureRow(row);
}

export async function getMyLectures() {
  const { supabase, userId } = await requireUserId();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  const allowed = await userCanManageLectures(userId, profile?.role || "user");
  if (!allowed) throw new Error("멘토 권한이 없습니다.");

  const { data, error } = await supabase
    .from("lectures")
    .select("*")
    .eq("instructor_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const rows = await lectureRowsWithInstructorNames(supabase, (data || []) as LectureRow[]);
  return { lectures: rows.map(serializeMine) };
}

export async function createLecture(payload: {
  title: string;
  type: "online" | "offline";
  category: string;
  price: number;
  duration: string;
  description: string;
  image?: string;
  shortDescription?: string;
  targetAudience?: string;
  prerequisites?: string;
  whatYouWillLearn?: string[];
  curriculum?: string[];
  totalLessons?: number;
  totalHours?: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
  maxStudents?: number;
  language?: string;
  previewVideoUrl?: string;
  materialsIncluded?: string[];
  faq?: string[];
}) {
  const { supabase, userId } = await requireUserId();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  const allowed = await userCanManageLectures(userId, profile?.role || "user");
  if (!allowed) throw new Error("멘토만 강의를 등록할 수 있습니다.");

  const row = {
    instructor_id: userId,
    title: payload.title.trim(),
    type: payload.type,
    category: payload.category.trim(),
    price: payload.price,
    duration: payload.duration.trim(),
    description: payload.description,
    image: payload.image || "",
    short_description: payload.shortDescription || "",
    target_audience: payload.targetAudience || "",
    prerequisites: payload.prerequisites || "",
    what_you_will_learn: payload.whatYouWillLearn || [],
    curriculum: payload.curriculum || [],
    total_lessons: payload.totalLessons || 0,
    total_hours: payload.totalHours || 0,
    difficulty: payload.difficulty || "beginner",
    max_students: payload.maxStudents || 30,
    language: payload.language || "ko",
    preview_video_url: payload.previewVideoUrl || "",
    materials_included: payload.materialsIncluded || [],
    faq: payload.faq || [],
    approval_status: "pending",
  };

  const { data, error } = await supabase.from("lectures").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return { lecture: serializeMine(data as LectureRow) };
}

export async function updateLecture(
  id: string,
  payload: {
    title: string;
    type: "online" | "offline";
    category: string;
    price: number;
    duration: string;
    description: string;
    image?: string;
    shortDescription?: string;
    targetAudience?: string;
    prerequisites?: string;
    whatYouWillLearn?: string[];
    curriculum?: string[];
    totalLessons?: number;
    totalHours?: number;
    difficulty?: "beginner" | "intermediate" | "advanced";
    maxStudents?: number;
    language?: string;
    previewVideoUrl?: string;
    materialsIncluded?: string[];
    faq?: string[];
  }
) {
  const { supabase, userId } = await requireUserId();
  const patch = {
    title: payload.title.trim(),
    type: payload.type,
    category: payload.category.trim(),
    price: payload.price,
    duration: payload.duration.trim(),
    description: payload.description,
    image: payload.image || "",
    short_description: payload.shortDescription || "",
    target_audience: payload.targetAudience || "",
    prerequisites: payload.prerequisites || "",
    what_you_will_learn: payload.whatYouWillLearn || [],
    curriculum: payload.curriculum || [],
    total_lessons: payload.totalLessons || 0,
    total_hours: payload.totalHours || 0,
    difficulty: payload.difficulty || "beginner",
    max_students: payload.maxStudents || 30,
    language: payload.language || "ko",
    preview_video_url: payload.previewVideoUrl || "",
    materials_included: payload.materialsIncluded || [],
    faq: payload.faq || [],
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("lectures")
    .update(patch)
    .eq("id", id)
    .eq("instructor_id", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return { lecture: serializeMine(data as LectureRow) };
}

export async function getLectureByIdForOwner(id: string) {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("lectures")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  const base = data as LectureRow;
  if (base.instructor_id !== userId) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
    if (profile?.role !== "admin") return null;
  }
  const [row] = await lectureRowsWithInstructorNames(supabase, [base]);
  return serializeMine(row);
}
