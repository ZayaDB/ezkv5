import connectDB from "@/lib/db/mongodb";
import Mentor from "@/models/Mentor";

/** DB 역할이 mentee여도 승인된 멘토 프로필이 있으면 강의 개설·내 강의 목록 API 허용 */
export async function userHasApprovedMentorProfile(userId: string): Promise<boolean> {
  await connectDB();
  const m = await Mentor.findOne({ userId }).select("approvalStatus").lean();
  if (!m) return false;
  const st = (m as { approvalStatus?: string }).approvalStatus ?? "approved";
  return st === "approved";
}

export async function canManageOwnLectures(userId: string, dbRole: string): Promise<boolean> {
  if (dbRole === "admin" || dbRole === "mentor") return true;
  return userHasApprovedMentorProfile(userId);
}
