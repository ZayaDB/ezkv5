import UserAlert from "@/models/UserAlert";
import mongoose from "mongoose";

type UserProfile = {
  _id: mongoose.Types.ObjectId;
  visaExpireDate?: Date | null;
  visaType?: string | null;
  countryStatus?: string;
};

function daysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function severityForVisaDays(days: number): "info" | "warning" | "urgent" {
  if (days <= 14) return "urgent";
  if (days <= 30) return "warning";
  return "info";
}

export async function syncVisaAlerts(user: UserProfile) {
  const uid = user._id;
  await UserAlert.deleteMany({ userId: uid, kind: "visa_expiry" });

  if (user.countryStatus !== "residing_korea" || !user.visaExpireDate) return;

  const days = daysUntil(new Date(user.visaExpireDate));
  if (days < 0) {
    await UserAlert.create({
      userId: uid,
      kind: "visa_expiry",
      severity: "urgent",
      title: "비자가 만료되었습니다",
      body: "즉시 연장·체류 자격을 확인하세요.",
      dueDate: user.visaExpireDate,
      actionUrl: "/roadmap",
    });
    return;
  }

  if (days <= 90) {
    const visaLabel = user.visaType ? `${user.visaType} ` : "";
    await UserAlert.create({
      userId: uid,
      kind: "visa_expiry",
      severity: severityForVisaDays(days),
      title: `${visaLabel}비자 만료 D-${days}`,
      body: days <= 30 ? "연장 준비를 시작하세요." : "만료일을 확인하고 일정을 잡으세요.",
      dueDate: user.visaExpireDate,
      actionUrl: "/roadmap",
      meta: { daysRemaining: days },
    });
  }
}

export async function syncUserAlerts(user: UserProfile) {
  await syncVisaAlerts(user);
}
