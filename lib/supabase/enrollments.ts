import { trError } from "@/lib/i18n/runtime";
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

/**
 * Enrolls through the server-side checkout. Free courses enroll immediately; paid courses
 * must go through the payment flow on the course page, so this throws for them.
 */
export async function enrollInLecture(lectureId: string) {
  const { supabase } = await requireUserId();
  const { data, error } = await supabase.rpc("create_lecture_checkout", { p_lecture_id: lectureId });
  if (error) {
    if (/already enrolled/.test(error.message)) throw new Error(trError("alreadyEnrolled"));
    if (/own lecture/.test(error.message)) throw new Error(trError("cannotEnrollOwnLecture"));
    if (/not found/.test(error.message)) throw new Error(trError("lectureNotFound"));
    throw new Error(error.message);
  }
  const result = data as { free: boolean };
  if (!result.free) throw new Error(trError("paymentRequired"));

  return {
    id: lectureId,
    lectureId,
    status: "active",
    paymentStatus: "paid",
    enrolledAt: new Date().toISOString(),
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
