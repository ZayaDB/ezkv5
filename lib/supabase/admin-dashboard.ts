import { requireAdmin } from "@/lib/supabase/requireUser";
import { listPendingLectures, listPendingMentors } from "@/lib/supabase/moderation";

type Period = "all" | "day" | "month" | "year";

function periodStart(period: Period): Date | null {
  const now = new Date();
  if (period === "day") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  if (period === "year") return new Date(now.getFullYear(), 0, 1);
  return null;
}

export async function fetchAdminStats(period: Period = "all") {
  const { supabase } = await requireAdmin();
  const since = periodStart(period);
  const sinceIso = since?.toISOString();

  const [
    profilesRes,
    mentorsRes,
    sessionsRes,
    sessionStatusRes,
    newProfilesRes,
    newMentorsRes,
    newSessionsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("id, role, created_at", { count: "exact", head: false }),
    supabase.from("mentor_profiles").select("id, created_at", { count: "exact", head: false }),
    supabase.from("mentor_sessions").select("id, status, created_at", { count: "exact", head: false }),
    supabase.from("mentor_sessions").select("status"),
    sinceIso
      ? supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sinceIso)
      : Promise.resolve({ count: 0 }),
    sinceIso
      ? supabase.from("mentor_profiles").select("id", { count: "exact", head: true }).gte("created_at", sinceIso)
      : Promise.resolve({ count: 0 }),
    sinceIso
      ? supabase.from("mentor_sessions").select("id", { count: "exact", head: true }).gte("created_at", sinceIso)
      : Promise.resolve({ count: 0 }),
  ]);

  const profiles = profilesRes.data || [];
  const roleStats = {
    mentee: profiles.filter((p) => p.role === "user" || p.role === "mentee").length,
    mentor: profiles.filter((p) => p.role === "mentor").length,
    admin: profiles.filter((p) => p.role === "admin").length,
  };

  const sessions = sessionStatusRes.data || [];
  const sessionStatus = {
    upcoming: sessions.filter((s) => s.status === "upcoming").length,
    completed: sessions.filter((s) => s.status === "completed").length,
    cancelled: sessions.filter((s) => s.status === "cancelled").length,
  };

  const monthlyMap = new Map<string, number>();
  for (const p of profiles) {
    const d = new Date(p.created_at as string);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
  }
  const monthlySignups = [...monthlyMap.entries()]
    .map(([key, count]) => {
      const [y, m] = key.split("-").map(Number);
      return { year: y, month: m, count };
    })
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .slice(-12);

  return {
    period,
    totals: {
      users: profiles.length,
      mentors: mentorsRes.data?.length || 0,
      mentees: roleStats.mentee,
      sessions: sessionsRes.data?.length || 0,
    },
    periodStats: {
      newUsers: newProfilesRes.count || 0,
      newMentors: newMentorsRes.count || 0,
      newMentees: newProfilesRes.count || 0,
      newSessions: newSessionsRes.count || 0,
    },
    roleStats,
    monthlySignups,
    sessionStatus,
  };
}

export async function fetchAdminUsers(params?: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { supabase } = await requireAdmin();
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let q = supabase
    .from("profiles")
    .select("id, email, name, role, locale, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params?.role) {
    const role = params.role === "mentee" ? "user" : params.role;
    q = q.eq("role", role);
  }
  if (params?.search?.trim()) {
    const s = params.search.trim();
    q = q.or(`name.ilike.%${s}%,email.ilike.%${s}%`);
  }

  const { data, error, count } = await q;
  if (error) throw new Error(error.message);

  const users = await Promise.all(
    (data || []).map(async (row) => {
      let mentorProfile = null;
      if (row.role === "mentor") {
        const { data: mp } = await supabase
          .from("mentor_profiles")
          .select("title, location, specialties, rating, review_count, verified")
          .eq("user_id", row.id)
          .maybeSingle();
        if (mp) {
          mentorProfile = {
            title: mp.title,
            location: mp.location,
            specialties: mp.specialties,
            rating: mp.rating,
            reviewCount: mp.review_count,
            verified: mp.verified,
          };
        }
      }
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        role: row.role === "user" ? "mentee" : row.role,
        locale: row.locale,
        createdAt: row.created_at,
        mentorProfile,
      };
    })
  );

  const total = count || 0;
  return {
    users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
}

export async function fetchAdminUserDetail(userId: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("사용자를 찾을 수 없습니다.");
  return data;
}

export async function fetchModerationSummary() {
  const [mentors, lectures] = await Promise.all([
    listPendingMentors().catch(() => []),
    listPendingLectures().catch(() => []),
  ]);
  return {
    mentorPending: mentors.length,
    lecturePending: lectures.length,
  };
}
