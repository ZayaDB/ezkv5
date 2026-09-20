import { requireUserId } from "@/lib/supabase/requireUser";
import { mapLectureRow } from "@/lib/supabase/lectures";

export async function listMyEnrollments() {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("lecture_enrollments")
    .select(
      "id, status, payment_status, enrolled_at, lecture_id, lectures(title, category, type, duration, price, instructor_id)"
    )
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data || [])
    .filter((row) => {
      const lec = row.lectures as { instructor_id?: string } | null;
      return !lec?.instructor_id || lec.instructor_id !== userId;
    })
    .map((row) => {
      const rawLec = row.lectures as Record<string, unknown> | Record<string, unknown>[] | null;
      const lec = Array.isArray(rawLec) ? rawLec[0] : rawLec;
      return {
        id: String(row.id),
        status: row.status,
        paymentStatus: row.payment_status,
        enrolledAt: row.enrolled_at,
        lecture: lec
          ? {
              id: String(row.lecture_id),
              title: String(lec.title || ""),
              category: String(lec.category || ""),
              type: lec.type,
              duration: String(lec.duration || ""),
              price: Number(lec.price) || 0,
            }
          : null,
      };
    });
}

export async function enrollInLecture(lectureId: string) {
  const { supabase, userId } = await requireUserId();

  const { data: lecture, error: lecErr } = await supabase
    .from("lectures")
    .select("id, instructor_id, approval_status")
    .eq("id", lectureId)
    .maybeSingle();

  if (lecErr) throw new Error(lecErr.message);
  if (!lecture) throw new Error("강의를 찾을 수 없습니다.");
  if (lecture.approval_status !== "approved") throw new Error("승인된 강의만 수강 신청할 수 있습니다.");
  if (lecture.instructor_id === userId) throw new Error("본인이 개설한 강의에는 수강 신청할 수 없습니다.");

  const { data: existing } = await supabase
    .from("lecture_enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("lecture_id", lectureId)
    .maybeSingle();

  if (existing) throw new Error("이미 신청한 강의입니다.");

  const { data: created, error } = await supabase
    .from("lecture_enrollments")
    .insert({
      user_id: userId,
      lecture_id: lectureId,
      status: "active",
      payment_status: "paid",
    })
    .select("id, status, payment_status, enrolled_at, lecture_id")
    .single();

  if (error) throw new Error(error.message);

  return {
    id: String(created.id),
    lectureId,
    status: created.status,
    paymentStatus: created.payment_status,
    enrolledAt: created.enrolled_at,
  };
}

export async function updateEnrollmentStatus(
  enrollmentId: string,
  status: "active" | "completed" | "cancelled"
) {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("lecture_enrollments")
    .update({ status })
    .eq("id", enrollmentId)
    .eq("user_id", userId)
    .select("id, status, payment_status, enrolled_at, lecture_id")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
