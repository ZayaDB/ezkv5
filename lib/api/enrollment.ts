export const enrollmentApi = {
  getMine: async () => {
    try {
      const { listMyEnrollments } = await import("@/lib/supabase/enrollments");
      const enrollments = await listMyEnrollments();
      return { data: { enrollments } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "수강 내역을 불러오지 못했습니다." };
    }
  },
  create: async (lectureId: string) => {
    try {
      const { enrollInLecture } = await import("@/lib/supabase/enrollments");
      const enrollment = await enrollInLecture(lectureId);
      return { data: { enrollment } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "수강 신청에 실패했습니다." };
    }
  },
  updateStatus: async (enrollmentId: string, status: "active" | "completed" | "cancelled") => {
    try {
      const { updateEnrollmentStatus } = await import("@/lib/supabase/enrollments");
      const enrollment = await updateEnrollmentStatus(enrollmentId, status);
      return { data: { enrollment } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "상태 변경에 실패했습니다." };
    }
  },
};
