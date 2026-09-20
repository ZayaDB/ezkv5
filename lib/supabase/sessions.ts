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
    const mentorName = (mentorUserId && profileMap.get(mentorUserId)?.name) || "멘토";
    return {
      id: String(row.id),
      date: row.scheduled_at,
      duration: row.duration,
      type: row.type,
      status: row.status,
      mentorId: mp?.id ? String(mp.id) : null,
      mentorName,
      menteeId: row.mentee_id ? String(row.mentee_id) : null,
      menteeName: "멘티",
    };
  });
}

export async function bookMentorSession(payload: {
  mentorId: string;
  date: string;
  duration?: number;
  type?: "online" | "offline";
  notes?: string;
}) {
  const { supabase, userId } = await requireUserId();

  const { data: mentor, error: mErr } = await supabase
    .from("mentor_profiles")
    .select("id, user_id, approval_status")
    .eq("id", payload.mentorId)
    .maybeSingle();

  if (mErr) throw new Error(mErr.message);
  if (!mentor || mentor.approval_status !== "approved") {
    throw new Error("멘토 정보를 찾을 수 없습니다.");
  }
  if (mentor.user_id === userId) throw new Error("본인 멘토 프로필에는 예약할 수 없습니다.");

  const bookingDate = new Date(payload.date);
  if (Number.isNaN(bookingDate.getTime())) throw new Error("유효하지 않은 날짜입니다.");

  const { data: created, error } = await supabase
    .from("mentor_sessions")
    .insert({
      mentor_profile_id: payload.mentorId,
      mentee_id: userId,
      scheduled_at: bookingDate.toISOString(),
      duration: typeof payload.duration === "number" ? payload.duration : 60,
      type: payload.type === "offline" ? "offline" : "online",
      status: "upcoming",
      notes: typeof payload.notes === "string" ? payload.notes : null,
    })
    .select("id, scheduled_at, duration, type, status, mentor_profile_id")
    .single();

  if (error) throw new Error(error.message);

  const profileMap = await fetchPublicProfiles(supabase, [String(mentor.user_id)]);
  const mentorName = profileMap.get(String(mentor.user_id))?.name || "멘토";

  return {
    id: String(created.id),
    mentorId: String(created.mentor_profile_id),
    mentorName,
    date: created.scheduled_at,
    duration: created.duration,
    type: created.type,
    status: created.status,
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

  if (!session) throw new Error("세션을 찾을 수 없습니다.");

  const { data: mp } = await supabase
    .from("mentor_profiles")
    .select("user_id")
    .eq("id", session.mentor_profile_id)
    .maybeSingle();

  const isParticipant = session.mentee_id === userId || mp?.user_id === userId;
  if (!isParticipant) throw new Error("권한이 없습니다.");

  const { data, error } = await supabase
    .from("mentor_sessions")
    .update({ status })
    .eq("id", sessionId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
