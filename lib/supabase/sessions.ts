import { trError, tr } from "@/lib/i18n/runtime";
import { fetchPublicProfiles } from "@/lib/supabase/publicProfiles";
import { requireUserId } from "@/lib/supabase/requireUser";

export async function listMySessions() {
  const { supabase, userId } = await requireUserId();

  const { data: myMentor } = await supabase
    .from("mentor_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  let query = supabase
    .from("mentor_sessions")
    .select(
      "id, scheduled_at, duration, type, status, mentee_id, mentor_profile_id, mentor_profiles(id, title, user_id)"
    )
    // unpaid checkouts are not real bookings yet
    .neq("status", "pending_payment")
    .order("scheduled_at", { ascending: true });

  if (myMentor?.id) {
    query = query.or(`mentee_id.eq.${userId},mentor_profile_id.eq.${myMentor.id}`);
  } else {
    query = query.eq("mentee_id", userId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = data || [];
  const mentorUserIds = rows
    .map((row) => {
      const mp = row.mentor_profiles as { user_id?: string } | null;
      return mp?.user_id ? String(mp.user_id) : "";
    })
    .filter(Boolean);
  const profileMap = await fetchPublicProfiles(supabase, mentorUserIds);

  return rows.map((row: Record<string, unknown>) => {
    const mp = row.mentor_profiles as { id?: string; user_id?: string } | null;
    const mentorUserId = mp?.user_id ? String(mp.user_id) : "";
    const mentorName = (mentorUserId && profileMap.get(mentorUserId)?.name) || tr("names.mentor");
    return {
      id: String(row.id),
      date: row.scheduled_at,
      duration: row.duration,
      type: row.type,
      status: row.status,
      mentorId: mp?.id ? String(mp.id) : null,
      mentorName,
      menteeId: row.mentee_id ? String(row.mentee_id) : null,
      menteeName: tr("names.mentee"),
    };
  });
}

/**
 * Books a session through the server-side checkout function.
 * Free mentors are confirmed immediately; paid mentors need the payment flow
 * (/mentors/[id]/book), so this throws for them.
 */
export async function bookMentorSession(payload: {
  mentorId: string;
  date: string;
  duration?: number;
  type?: "online" | "offline";
  notes?: string;
}) {
  const { supabase } = await requireUserId();
  const bookingDate = new Date(payload.date);
  if (Number.isNaN(bookingDate.getTime())) throw new Error(trError("invalidDate"));

  const { data, error } = await supabase.rpc("create_session_checkout", {
    p_mentor_id: payload.mentorId,
    p_scheduled_at: bookingDate.toISOString(),
    p_duration: typeof payload.duration === "number" ? payload.duration : null,
    p_type: payload.type === "offline" ? "offline" : "online",
    p_notes: typeof payload.notes === "string" ? payload.notes : null,
  });
  if (error) throw new Error(error.message);
  const result = data as { session_id: string; free: boolean };
  if (!result.free) throw new Error(trError("sessionBookFailed"));

  return {
    id: String(result.session_id),
    mentorId: payload.mentorId,
    mentorName: tr("names.mentor"),
    date: bookingDate.toISOString(),
    duration: payload.duration ?? 60,
    type: payload.type === "offline" ? "offline" : "online",
    status: "upcoming",
  };
}

export async function updateSessionStatus(
  sessionId: string,
  status: "upcoming" | "completed" | "cancelled"
) {
  const { supabase, userId } = await requireUserId();

  const { data: session } = await supabase
    .from("mentor_sessions")
    .select("id, mentee_id, mentor_profile_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session) throw new Error(trError("sessionNotFound"));

  const { data: mp } = await supabase
    .from("mentor_profiles")
    .select("user_id")
    .eq("id", session.mentor_profile_id)
    .maybeSingle();

  const isParticipant = session.mentee_id === userId || mp?.user_id === userId;
  if (!isParticipant) throw new Error(trError("noPermission"));

  const { data, error } = await supabase
    .from("mentor_sessions")
    .update({ status })
    .eq("id", sessionId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
