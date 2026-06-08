import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import UserAlert from "@/models/UserAlert";
import User from "@/models/User";
import { syncUserAlerts } from "@/lib/alerts/generateAlerts";

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    await connectDB();
    const user = await User.findById(auth.userId).lean();
    if (user) await syncUserAlerts(user as any);

    const uid = new mongoose.Types.ObjectId(auth.userId);
    const alerts = await UserAlert.find({
      userId: uid,
      dismissedAt: { $exists: false },
    })
      .sort({ severity: -1, dueDate: 1 })
      .lean();

    return NextResponse.json({
      alerts: alerts.map((a) => ({
        id: String(a._id),
        kind: a.kind,
        severity: a.severity,
        title: a.title,
        body: a.body,
        dueDate: a.dueDate,
        actionUrl: a.actionUrl,
      })),
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "알림을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const { alertId, dismiss } = await request.json();
    if (!alertId || !dismiss) {
      return NextResponse.json({ error: "alertId가 필요합니다." }, { status: 400 });
    }
    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const alert = await UserAlert.findOneAndUpdate(
      { _id: alertId, userId: uid },
      { $set: { dismissedAt: new Date() } },
      { new: true }
    );
    if (!alert) {
      return NextResponse.json({ error: "알림을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "처리하지 못했습니다." }, { status: 500 });
  }
}
