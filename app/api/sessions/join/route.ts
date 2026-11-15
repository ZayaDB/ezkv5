import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { fetchPublicProfiles } from "@/lib/supabase/publicProfiles";
import { ensureSessionMeeting, participantToken, LiveConfigError, PRESET_PAIR } from "@/lib/live/server";
import { SESSION_ROOM_EARLY_MINUTES, SESSION_ROOM_GRACE_MINUTES } from "@/lib/live/sessionRoom";

export const dynamic = "force-dynamic";

/** The mentee or the mentor of a paid (upcoming) session joins its private video room. */
export async function POST(request: NextRequest) {
  const { sessionId } = await request.json().catch(() => ({}));
  if (typeof sessionId !== "string") return NextResponse.json({ error: "invalid" }, { status: 400 });

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  // RLS returns the row only to the mentee, the mentor, or an admin
  const { data: session } = await supabase
    .from("mentor_sessions")
    .select("id, status, scheduled_at, duration, mentee_id, mentor_profiles(user_id, title)")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const mentorUserId = (session.mentor_profiles as { user_id?: string } | null)?.user_id;
  if (user.id !== session.mentee_id && user.id !== mentorUserId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (session.status !== "upcoming") return NextResponse.json({ error: "not_active", status: session.status }, { status: 409 });

  const start = new Date(session.scheduled_at).getTime();
  const opens = start - SESSION_ROOM_EARLY_MINUTES * 60_000;
  const closes = start + ((session.duration || 60) + SESSION_ROOM_GRACE_MINUTES) * 60_000;
  const now = Date.now();
  if (now < opens) return NextResponse.json({ error: "too_early", opensAt: new Date(opens).toISOString() }, { status: 409 });
  if (now > closes) return NextResponse.json({ error: "ended" }, { status: 409 });

  try {
    const names = await fetchPublicProfiles(supabase, [user.id]);
    const name = names.get(user.id)?.name || user.email?.split("@")[0] || "LNK";
    const meetingId = await ensureSessionMeeting(session.id, `LNK 1:1 · ${(session.mentor_profiles as { title?: string } | null)?.title || session.id}`);
    const token = await participantToken(meetingId, { id: user.id, name }, PRESET_PAIR);
    return NextResponse.json({ token });
  } catch (e) {
    console.error("sessions/join", e);
    return NextResponse.json({ error: e instanceof LiveConfigError ? "not_configured" : "join_failed" }, { status: 500 });
  }
}
