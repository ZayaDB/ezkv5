"use client";

import { createClient } from "@/lib/supabase/client";

export type LessonStatus = "scheduled" | "live" | "processing" | "ready" | "failed" | "cancelled";

export type Lesson = {
  id: string;
  lecture_id: string;
  position: number;
  title: string;
  description: string | null;
  kind: "live" | "video";
  scheduled_at: string | null;
  duration_min: number;
  status: LessonStatus;
  is_preview: boolean;
  replay_seconds: number | null;
  started_at: string | null;
  ended_at: string | null;
};

const LESSON_COLS =
  "id, lecture_id, position, title, description, kind, scheduled_at, duration_min, status, is_preview, replay_seconds, started_at, ended_at";

export async function listLessons(lectureId: string): Promise<Lesson[]> {
  const { data } = await createClient()
    .from("lecture_lessons")
    .select(LESSON_COLS)
    .eq("lecture_id", lectureId)
    .order("position", { ascending: true })
    .order("scheduled_at", { ascending: true, nullsFirst: false });
  return (data as Lesson[]) || [];
}

export async function getLesson(lessonId: string) {
  const supabase = createClient();
  const { data: lesson } = await supabase.from("lecture_lessons").select(LESSON_COLS).eq("id", lessonId).maybeSingle();
  if (!lesson) return null;
  const { data: lecture } = await supabase
    .from("lectures")
    .select("id, title, instructor_id")
    .eq("id", (lesson as Lesson).lecture_id)
    .maybeSingle();
  return { lesson: lesson as Lesson, lecture: lecture as { id: string; title: string; instructor_id: string } | null };
}

export async function isEnrolled(lectureId: string, userId: string) {
  const { data } = await createClient()
    .from("lecture_enrollments")
    .select("id")
    .eq("lecture_id", lectureId)
    .eq("user_id", userId)
    .in("status", ["active", "completed"])
    .maybeSingle();
  return Boolean(data);
}

export async function createLesson(input: {
  lectureId: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  durationMin: number;
  position: number;
}) {
  const { error } = await createClient().from("lecture_lessons").insert({
    lecture_id: input.lectureId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    kind: "live",
    scheduled_at: input.scheduledAt.toISOString(),
    duration_min: input.durationMin,
    position: input.position,
  });
  if (error) throw new Error(error.message);
}

export async function setLessonCancelled(lessonId: string, cancelled: boolean) {
  const { error } = await createClient()
    .from("lecture_lessons")
    .update({ status: cancelled ? "cancelled" : "scheduled" })
    .eq("id", lessonId);
  if (error) throw new Error(error.message);
}

export async function setLessonPreview(lessonId: string, isPreview: boolean) {
  const { error } = await createClient().from("lecture_lessons").update({ is_preview: isPreview }).eq("id", lessonId);
  if (error) throw new Error(error.message);
}

export async function deleteLesson(lessonId: string) {
  const { error } = await createClient().from("lecture_lessons").delete().eq("id", lessonId);
  if (error) throw new Error(error.message);
}

async function post<T>(path: string, body: unknown): Promise<T & { error?: string }> {
  const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return (await res.json().catch(() => ({ error: "network" }))) as T & { error?: string };
}

export const liveApi = {
  start: (lessonId: string) => post<{ token?: string; opensAt?: string }>("/api/live/start", { lessonId }),
  join: (lessonId: string) => post<{ token?: string; role?: "host" | "student"; scheduledAt?: string }>("/api/live/join", { lessonId }),
  end: (lessonId: string) => post<{ status?: LessonStatus }>("/api/live/end", { lessonId }),
  sync: (lessonId: string) => post<{ status?: LessonStatus }>("/api/live/sync", { lessonId }),
  replay: async (lessonId: string) => {
    const res = await fetch(`/api/live/replay?lessonId=${encodeURIComponent(lessonId)}`, { cache: "no-store" });
    return (await res.json().catch(() => ({ error: "network" }))) as { status?: LessonStatus; url?: string; error?: string };
  },
};

export async function getProgress(userId: string, lessonIds: string[]) {
  if (!lessonIds.length) return new Map<string, { position_seconds: number; completed_at: string | null }>();
  const { data } = await createClient()
    .from("lesson_progress")
    .select("lesson_id, position_seconds, completed_at")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);
  return new Map((data || []).map((r) => [r.lesson_id as string, r as { position_seconds: number; completed_at: string | null }]));
}

export async function saveProgress(userId: string, lessonId: string, seconds: number, duration: number | null) {
  const completed = duration ? seconds >= duration * 0.9 : false;
  await createClient()
    .from("lesson_progress")
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        position_seconds: Math.max(0, Math.floor(seconds)),
        ...(completed ? { completed_at: new Date().toISOString() } : {}),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    );
}
