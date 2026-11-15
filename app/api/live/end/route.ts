import { NextRequest, NextResponse } from "next/server";
import { getLessonAccess } from "@/lib/live/access";
import { endMeeting, getMedia, syncRecording, updateMedia, LiveConfigError } from "@/lib/live/server";

export const dynamic = "force-dynamic";

/** Instructor ends the class: everyone leaves, recording is finalized, replay processing starts. */
export async function POST(request: NextRequest) {
  const { lessonId } = await request.json().catch(() => ({}));
  if (typeof lessonId !== "string") return NextResponse.json({ error: "invalid" }, { status: 400 });

  const access = await getLessonAccess(lessonId);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.error === "auth" ? 401 : 404 });
  if (access.role !== "instructor" && access.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (access.lesson.status !== "live") return NextResponse.json({ status: access.lesson.status });

  try {
    const media = await getMedia(lessonId);
    if (media?.meeting_id) await endMeeting(media.meeting_id);
    await updateMedia(lessonId, {}, { status: "processing", ended_at: new Date().toISOString() });
    const state = await syncRecording(lessonId).catch(() => "processing");
    return NextResponse.json({ status: state === "ready" ? "ready" : "processing" });
  } catch (e) {
    console.error("live/end", e);
    return NextResponse.json({ error: e instanceof LiveConfigError ? "not_configured" : "end_failed" }, { status: 500 });
  }
}
