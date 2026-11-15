import { NextRequest, NextResponse } from "next/server";
import { getLessonAccess, EARLY_START_MINUTES } from "@/lib/live/access";
import { ensureMeeting, participantToken, updateMedia, LiveConfigError, PRESET_HOST } from "@/lib/live/server";

export const dynamic = "force-dynamic";

/** Instructor opens (or re-enters) the live classroom. */
export async function POST(request: NextRequest) {
  const { lessonId } = await request.json().catch(() => ({}));
  if (typeof lessonId !== "string") return NextResponse.json({ error: "invalid" }, { status: 400 });

  const access = await getLessonAccess(lessonId);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.error === "auth" ? 401 : 404 });
  if (access.role !== "instructor" && access.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { lesson } = access;
  if (lesson.kind !== "live") return NextResponse.json({ error: "not_live_lesson" }, { status: 409 });
  if (lesson.status !== "scheduled" && lesson.status !== "live") return NextResponse.json({ error: "ended" }, { status: 409 });
  if (lesson.status === "scheduled" && lesson.scheduled_at) {
    const opensAt = new Date(lesson.scheduled_at).getTime() - EARLY_START_MINUTES * 60_000;
    if (Date.now() < opensAt) return NextResponse.json({ error: "too_early", opensAt: new Date(opensAt).toISOString() }, { status: 409 });
  }

  try {
    const meetingId = await ensureMeeting(lesson.id, `${access.lectureTitle} · ${lesson.title}`);
    if (lesson.status !== "live") {
      await updateMedia(lesson.id, {}, { status: "live", started_at: new Date().toISOString() });
    }
    const token = await participantToken(meetingId, { id: access.userId, name: access.userName }, PRESET_HOST);
    return NextResponse.json({ token, role: "host" });
  } catch (e) {
    console.error("live/start", e);
    return NextResponse.json({ error: e instanceof LiveConfigError ? "not_configured" : "start_failed" }, { status: 500 });
  }
}
