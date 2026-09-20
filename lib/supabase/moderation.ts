import { createUserAlert } from "@/lib/supabase/notifications";
import { requireAdmin } from "@/lib/supabase/requireUser";

export async function listPendingMentors() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("mentor_profiles")
    .select("id, title, location, specialties, created_at, user_id, profiles(name, email)")
    .eq("approval_status", "pending")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);

  return (data || []).map((r: Record<string, unknown>) => {
    const p = r.profiles as { name?: string; email?: string } | null;
    return {
      id: String(r.id),
      createdAt: String(r.created_at),
      title: String(r.title || ""),
      location: String(r.location || ""),
      specialties: (r.specialties as string[]) || [],
      user: p
        ? { id: String(r.user_id), name: p.name || "", email: p.email || "" }
        : { id: String(r.user_id), name: "", email: "" },
    };
  });
}

export async function listPendingLectures() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("lectures")
    .select("id, title, category, type, created_at, instructor_id, profiles!lectures_instructor_id_fkey(name, email)")
    .eq("approval_status", "pending")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);

  return (data || []).map((r: Record<string, unknown>) => {
    const p = r.profiles as { name?: string; email?: string } | null;
    return {
      id: String(r.id),
      createdAt: String(r.created_at),
      title: String(r.title || ""),
      category: String(r.category || ""),
      type: String(r.type || ""),
      user: p
        ? { id: String(r.instructor_id), name: p.name || "", email: p.email || "" }
        : { id: String(r.instructor_id), name: "", email: "" },
    };
  });
}

export async function setMentorApproval(id: string, status: "approved" | "rejected") {
  const { supabase } = await requireAdmin();

  const { data: mentor, error: fetchErr } = await supabase
    .from("mentor_profiles")
    .select("id, user_id, title")
    .eq("id", id)
    .single();

  if (fetchErr || !mentor) throw new Error("멘토 신청을 찾을 수 없습니다.");

  const { error } = await supabase
    .from("mentor_profiles")
    .update({
      approval_status: status,
      verified: status === "approved",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  if (status === "approved") {
    const { error: roleErr } = await supabase
      .from("profiles")
      .update({ role: "mentor", updated_at: new Date().toISOString() })
      .eq("id", mentor.user_id);
    if (roleErr) throw new Error(roleErr.message);
    await createUserAlert({
      userId: mentor.user_id,
      kind: "mentor_approved",
      title: "멘토 신청이 승인되었습니다",
      message: "이제 멘토 모드와 강의 개설 메뉴를 사용할 수 있습니다.",
      severity: "info",
      actionUrl: "/my/dashboard",
    });
  } else {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", mentor.user_id)
      .maybeSingle();
    if (profile?.role === "mentor") {
      const { error: roleErr } = await supabase
        .from("profiles")
        .update({ role: "user", updated_at: new Date().toISOString() })
        .eq("id", mentor.user_id);
      if (roleErr) throw new Error(roleErr.message);
    }
    await createUserAlert({
      userId: mentor.user_id,
      kind: "mentor_rejected",
      title: "멘토 신청이 반려되었습니다",
      message: "프로필 > 멘토 탭에서 내용을 수정 후 다시 신청할 수 있습니다.",
      severity: "warning",
      actionUrl: "/my/profile?tab=mentor",
    });
  }

  return { ok: true };
}

export async function setLectureApproval(id: string, status: "approved" | "rejected") {
  const { supabase } = await requireAdmin();

  const { data: lecture, error: fetchErr } = await supabase
    .from("lectures")
    .select("id, instructor_id, title")
    .eq("id", id)
    .single();

  if (fetchErr || !lecture) throw new Error("강의를 찾을 수 없습니다.");

  const { error } = await supabase
    .from("lectures")
    .update({
      approval_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  if (status === "approved") {
    await createUserAlert({
      userId: lecture.instructor_id,
      kind: "lecture_approved",
      title: "강의가 승인되었습니다",
      message: `"${lecture.title}" 강의가 공개 목록에 표시됩니다.`,
      severity: "info",
      actionUrl: `/lectures/${lecture.id}`,
    });
  } else {
    await createUserAlert({
      userId: lecture.instructor_id,
      kind: "lecture_rejected",
      title: "강의 승인이 반려되었습니다",
      message: `"${lecture.title}" 내용을 수정한 뒤 다시 등록해 주세요.`,
      severity: "warning",
      actionUrl: "/my/lectures",
    });
  }

  return { ok: true };
}
