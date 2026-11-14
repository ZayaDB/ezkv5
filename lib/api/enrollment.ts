import { trError } from "@/lib/i18n/runtime";
export const enrollmentApi = {
  getMine: async () => {
    try {
      const { listMyEnrollments } = await import("@/lib/supabase/enrollments");
      const enrollments = await listMyEnrollments();
      return { data: { enrollments } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("enrollmentsLoadFailed") };
    }
  },
  create: async (lectureId: string) => {
    try {
      const { enrollInLecture } = await import("@/lib/supabase/enrollments");
      const enrollment = await enrollInLecture(lectureId);
      return { data: { enrollment } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("enrollFailed") };
    }
  },
  updateStatus: async (enrollmentId: string, status: "active" | "completed" | "cancelled") => {
    try {
      const { updateEnrollmentStatus } = await import("@/lib/supabase/enrollments");
      const enrollment = await updateEnrollmentStatus(enrollmentId, status);
      return { data: { enrollment } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("statusChangeFailed") };
    }
  },
};
