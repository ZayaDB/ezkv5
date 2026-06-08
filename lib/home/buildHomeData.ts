import mongoose from "mongoose";
import User from "@/models/User";
import Roadmap from "@/models/Roadmap";
import RoadmapStep from "@/models/RoadmapStep";
import UserAlert from "@/models/UserAlert";
import PersonalCalendarEvent from "@/models/PersonalCalendarEvent";
import Session from "@/models/Session";
import Enrollment from "@/models/Enrollment";
import Lecture from "@/models/Lecture";
import { getNextStepTitle } from "@/lib/roadmap/progress";
import { syncUserAlerts } from "@/lib/alerts/generateAlerts";

function daysUntil(date: Date): number | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const RECOMMENDED_ACTIONS = [
  { id: "arc", title: "외국인등록증 갱신 확인", actionUrl: "/roadmap" },
  { id: "visa", title: "비자 연장 준비", actionUrl: "/roadmap" },
  { id: "insurance", title: "건강보험 확인", actionUrl: "/calendar" },
];

export async function buildHomeControlCenter(userId: string) {
  const uid = new mongoose.Types.ObjectId(userId);
  const user = await User.findById(uid).lean() as Record<string, unknown> | null;
  if (!user) throw new Error("사용자를 찾을 수 없습니다.");

  await syncUserAlerts({
    _id: uid,
    visaExpireDate: user.visaExpireDate as Date | undefined,
    visaType: user.visaType as string | undefined,
    countryStatus: user.countryStatus as string | undefined,
  });

  const visaDday =
    user.visaExpireDate && user.countryStatus === "residing_korea"
      ? daysUntil(new Date(user.visaExpireDate as string | Date))
      : null;

  const statusCard = {
    name: user.name,
    university: user.university || null,
    nationality: user.nationality || null,
    visaType: user.visaType || null,
    visaDday,
    countryStatus: user.countryStatus,
  };

  const alerts = await UserAlert.find({
    userId: uid,
    dismissedAt: { $exists: false },
  })
    .sort({ severity: -1, dueDate: 1 })
    .limit(10)
    .lean();

  const roadmaps = await Roadmap.find({ userId: uid, status: "active" })
    .sort({ priority: -1, updatedAt: -1 })
    .limit(5)
    .lean();

  const roadmapIds = roadmaps.map((r) => r._id);
  const allSteps = roadmapIds.length
    ? await RoadmapStep.find({ roadmapId: { $in: roadmapIds } }).sort({ sortOrder: 1 }).lean()
    : [];

  const activeRoadmaps = roadmaps.map((r) => {
    const steps = allSteps
      .filter((s) => String(s.roadmapId) === String(r._id))
      .map((s) => ({
        title: String(s.title),
        completed: Boolean(s.completed),
        active: Boolean(s.active),
      }));
    return {
      id: String(r._id),
      title: r.title,
      progress: r.progress,
      nextStep: getNextStepTitle(steps),
      dueDate: r.dueDate,
    };
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const personalEvents = await PersonalCalendarEvent.find({
    userId: uid,
    startsAt: { $gte: todayStart, $lte: todayEnd },
    status: { $ne: "cancelled" },
  })
    .sort({ startsAt: 1 })
    .lean();

  const sessions = await Session.find({
    menteeId: uid,
    date: { $gte: todayStart, $lte: todayEnd },
    status: { $ne: "cancelled" },
  })
    .populate("mentorId")
    .lean();

  const todaySchedule = [
    ...personalEvents.map((e) => ({
      id: String(e._id),
      type: "calendar" as const,
      title: e.title,
      startsAt: e.startsAt,
      category: e.category,
    })),
    ...sessions.map((s) => ({
      id: String(s._id),
      type: "session" as const,
      title: "멘토링 세션",
      startsAt: s.date,
      category: "mentoring",
    })),
  ].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const enrollments = await Enrollment.find({ userId: uid, status: "active" })
    .limit(3)
    .lean();
  const lectureIds = enrollments.map((e) => e.lectureId);
  const lectures = lectureIds.length
    ? await Lecture.find({ _id: { $in: lectureIds } }).select("title").lean()
    : [];

  const recommendedActions = RECOMMENDED_ACTIONS.filter((a) => {
    if (a.id === "visa" && visaDday !== null && visaDday <= 60) return true;
    if (a.id === "insurance" && user.countryStatus === "residing_korea") return true;
    if (a.id === "arc" && user.countryStatus === "residing_korea") return true;
    return false;
  });

  if (recommendedActions.length === 0) {
    recommendedActions.push(RECOMMENDED_ACTIONS[0]);
  }

  return {
    statusCard,
    alerts: alerts.map((a) => ({
      id: String(a._id),
      kind: a.kind,
      severity: a.severity,
      title: a.title,
      body: a.body,
      dueDate: a.dueDate,
      actionUrl: a.actionUrl,
    })),
    activeRoadmaps,
    todaySchedule,
    recommendedActions,
    learning: lectures.map((l) => ({ id: String(l._id), title: l.title })),
    onboardingStatus: user.onboardingStatus,
  };
}
