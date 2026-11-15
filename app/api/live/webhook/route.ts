import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getMediaByMeeting, syncRecording, webhookKey } from "@/lib/live/server";

export const dynamic = "force-dynamic";

/** Finds the first meeting id-looking field in RealtimeKit webhook payloads. */
function meetingIdFrom(body: unknown): string | null {
  const b = body as Record<string, any> | null;
  return (
    b?.meeting?.id ||
    b?.meetingId ||
    b?.meeting_id ||
    b?.recording?.meetingId ||
    b?.recording?.meeting_id ||
    b?.data?.meeting?.id ||
    b?.data?.meeting_id ||
    null
  );
}

/**
 * RealtimeKit webhook (recording.statusUpdate, meeting.ended).
 * The payload is only a hint: we re-read state from Cloudflare before changing anything.
 */
export async function POST(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key") || "";
  const expected = webhookKey();
  if (key.length !== expected.length || !timingSafeEqual(Buffer.from(key), Buffer.from(expected))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const meetingId = meetingIdFrom(body);
  if (!meetingId) return NextResponse.json({ ok: true });

  try {
    const media = await getMediaByMeeting(String(meetingId));
    if (!media) return NextResponse.json({ ok: true });
    await syncRecording(media.lesson_id);
  } catch (e) {
    console.error("live/webhook", e);
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
