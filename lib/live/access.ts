import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";

export type LessonRow = {
  id: string;
  lecture_id: string;
  title: string;
  kind: "live" | "video";
  status: "scheduled" | "live" | "processing" | "ready" | "failed" | "cancelled";
  scheduled_at: string | null;
  duration_min: number;
  is_preview: boolean;
};

export type LessonAccess = {
  userId: string;
  userName: string;
  lesson: LessonRow;
  lectureTitle: string;
  role: "instructor" | "admin" | "student" | null;
};

/** Resolves who the signed-in user is relative to a lesson (cookie session, RLS applies). */
export async function getLessonAccess(lessonId: string): Promise<LessonAccess | { error: "auth" | "not_found" }> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "auth" };

  const { data: lesson } = await supabase
    .from("lecture_lessons")
    .select("id, lecture_id, title, kind, status, scheduled_at, duration_min, is_preview")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson) return { error: "not_found" };

  const [{ data: lecture }, { data: profile }, { data: enrollment }] = await Promise.all([
    supabase.from("lectures").select("id, title, instructor_id").eq("id", lesson.lecture_id).maybeSingle(),
    supabase.from("profiles").select("name, role").eq("id", user.id).maybeSingle(),
    supabase
      .from("lecture_enrollments")
      .select("id")
      .eq("lecture_id", lesson.lecture_id)
      .eq("user_id", user.id)
      .in("status", ["active", "completed"])
      .maybeSingle(),
  ]);

  const role: LessonAccess["role"] =
    lecture?.instructor_id === user.id
      ? "instructor"
      : profile?.role === "admin"
        ? "admin"
        : enrollment
          ? "student"
          : null;

  return {
    userId: user.id,
    userName: profile?.name || user.email?.split("@")[0] || "LNK",
    lesson: lesson as LessonRow,
    lectureTitle: lecture?.title || "",
    role,
  };
}

/** Instructors can open the room from 30 minutes before the scheduled time. */
export const EARLY_START_MINUTES = 30;
