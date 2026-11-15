import { NextRequest, NextResponse } from "next/server";
import { getLessonAccess } from "@/lib/live/access";
import { getMedia, participantToken, LiveConfigError, PRESET_HOST, PRESET_STUDENT } from "@/lib/live/server";

export const dynamic = "force-dynamic";

/** Enrolled students (and the instructor) join a lesson that is live. */
export async function POST(request: NextRequest) {
  const { lessonId } = await request.json().catch(() => ({}));
  if (typeof lessonId !== "string") return NextResponse.json({ error: "invalid" }, { status: 400 });

  const access = await getLessonAccess(lessonId);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.error === "auth" ? 401 : 404 });
  if (!access.role) return NextResponse.json({ error: "not_enrolled" }, { status: 403 });

  const { lesson } = access;
  if (lesson.status === "scheduled") return NextResponse.json({ error: "not_started", scheduledAt: lesson.scheduled_at }, { status: 409 });
  if (lesson.status !== "live") return NextResponse.json({ error: "ended", status: lesson.status }, { status: 409 });

  try {
    const media = await getMedia(lesson.id);
    if (!media?.meeting_id) return NextResponse.json({ error: "not_started" }, { status: 409 });
    const preset = access.role === "student" ? PRESET_STUDENT : PRESET_HOST;
    const token = await participantToken(media.meeting_id, { id: access.userId, name: access.userName }, preset);
    return NextResponse.json({ token, role: preset === PRESET_HOST ? "host" : "student" });
  } catch (e) {
    console.error("live/join", e);
    return NextResponse.json({ error: e instanceof LiveConfigError ? "not_configured" : "join_failed" }, { status: 500 });
  }
}
