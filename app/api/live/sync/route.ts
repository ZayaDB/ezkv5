import { NextRequest, NextResponse } from "next/server";
import { getLessonAccess } from "@/lib/live/access";
import { syncRecording } from "@/lib/live/server";

export const dynamic = "force-dynamic";

/** Nudges replay processing forward (used while a lesson shows "processing"). */
export async function POST(request: NextRequest) {
  const { lessonId } = await request.json().catch(() => ({}));
  if (typeof lessonId !== "string") return NextResponse.json({ error: "invalid" }, { status: 400 });

  const access = await getLessonAccess(lessonId);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.error === "auth" ? 401 : 404 });
  if (!access.role) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (access.lesson.status !== "processing") return NextResponse.json({ status: access.lesson.status });

  try {
    const state = await syncRecording(lessonId);
    return NextResponse.json({ status: state === "ready" ? "ready" : state === "failed" ? "failed" : "processing" });
  } catch (e) {
    console.error("live/sync", e);
    return NextResponse.json({ status: "processing" });
  }
}
