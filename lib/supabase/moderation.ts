import { createUserAlert } from "@/lib/supabase/notifications";
import { requireAdmin } from "@/lib/supabase/requireUser";

export type PendingMentorApplication = {
  id: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  title: string;
  location: string;
  photo: string;
  bio: string;
  languages: string[];
  specialties: string[];
  price: number;
  availability: string;
  yearsOfExperience: number;
  education: string;
  careerSummary: string;
  sessionDuration: number;
  sessionFormat: string;
  timezone: string;
  responseTime: string;
  introVideoUrl: string;
  portfolioLinks: string[];
  mentoringStyle: string;
  recommendedFor: string;
  notRecommendedFor: string;
};

export async function listPendingMentors(): Promise<PendingMentorApplication[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("mentor_profiles")
    .select(
      "id, title, location, photo, bio, languages, specialties, price, availability, years_of_experience, education, career_summary, session_duration, session_format, timezone, response_time, intro_video_url, portfolio_links, mentoring_style, recommended_for, not_recommended_for, created_at, user_id, profiles(name, email)"
    )
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
      photo: String(r.photo || ""),
      bio: String(r.bio || ""),
      languages: (r.languages as string[]) || [],
      specialties: (r.specialties as string[]) || [],
      price: Number(r.price) || 0,
      availability: String(r.availability || ""),
      yearsOfExperience: Number(r.years_of_experience) || 0,
      education: String(r.education || ""),
      careerSummary: String(r.career_summary || ""),
      sessionDuration: Number(r.session_duration) || 0,
      sessionFormat: String(r.session_format || ""),
      timezone: String(r.timezone || ""),
      responseTime: String(r.response_time || ""),
      introVideoUrl: String(r.intro_video_url || ""),
      portfolioLinks: (r.portfolio_links as string[]) || [],
      mentoringStyle: String(r.mentoring_style || ""),
      recommendedFor: String(r.recommended_for || ""),
      notRecommendedFor: String(r.not_recommended_for || ""),
      user: p
        ? { id: String(r.user_id), name: p.name || "", email: p.email || "" }
        : { id: String(r.user_id), name: "", email: "" },
    };
  });
}

export type PendingLectureApplication = {
  id: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  title: string;
  type: string;
  category: string;
  price: number;
  duration: string;
  description: string;
  image: string;
  shortDescription: string;
  targetAudience: string;
  prerequisites: string;
  whatYouWillLearn: string[];
  curriculum: string[];
  totalLessons: number;
  totalHours: number;
  difficulty: string;
  maxStudents: number;
  language: string;
  previewVideoUrl: string;
  materialsIncluded: string[];
  faq: string[];
};

export async function listPendingLectures(): Promise<PendingLectureApplication[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("lectures")
    .select(
      "id, title, type, category, price, duration, description, image, short_description, target_audience, prerequisites, what_you_will_learn, curriculum, total_lessons, total_hours, difficulty, max_students, language, preview_video_url, materials_included, faq, created_at, instructor_id, profiles!lectures_instructor_id_fkey(name, email)"
    )
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
      type: String(r.type || ""),
      category: String(r.category || ""),
      price: Number(r.price) || 0,
      duration: String(r.duration || ""),
      description: String(r.description || ""),
      image: String(r.image || ""),
      shortDescription: String(r.short_description || ""),
      targetAudience: String(r.target_audience || ""),
      prerequisites: String(r.prerequisites || ""),
      whatYouWillLearn: (r.what_you_will_learn as string[]) || [],
      curriculum: (r.curriculum as string[]) || [],
      totalLessons: Number(r.total_lessons) || 0,
      totalHours: Number(r.total_hours) || 0,
      difficulty: String(r.difficulty || ""),
      maxStudents: Number(r.max_students) || 0,
      language: String(r.language || ""),
      previewVideoUrl: String(r.preview_video_url || ""),
      materialsIncluded: (r.materials_included as string[]) || [],
      faq: (r.faq as string[]) || [],
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
      message: "나의 정보에서 멘토 지원 페이지로 이동해 내용을 수정 후 다시 신청할 수 있습니다.",
      severity: "warning",
      actionUrl: "/my/profile/apply",
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
