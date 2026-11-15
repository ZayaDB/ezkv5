import { NextRequest, NextResponse } from "next/server";
import { getLessonAccess } from "@/lib/live/access";
import { replayUrl, syncRecording } from "@/lib/live/server";

export const dynamic = "force-dynamic";

/** Signed, short-lived player URL — only for enrolled students, the instructor, admins, or preview lessons. */
export async function GET(request: NextRequest) {
  const lessonId = request.nextUrl.searchParams.get("lessonId") || "";
  const access = await getLessonAccess(lessonId);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.error === "auth" ? 401 : 404 });
  if (!access.role && !access.lesson.is_preview) return NextResponse.json({ error: "not_enrolled" }, { status: 403 });

  let status = access.lesson.status;
  if (status === "processing") {
    const s = await syncRecording(lessonId).catch(() => "processing");
    if (s === "ready" || s === "failed") status = s;
  }
  if (status !== "ready") return NextResponse.json({ status });

  try {
    const url = await replayUrl(lessonId);
    if (!url) return NextResponse.json({ status: "processing" });
    return NextResponse.json({ status: "ready", url }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) {
    console.error("live/replay", e);
    return NextResponse.json({ error: "replay_failed" }, { status: 500 });
  }
}
