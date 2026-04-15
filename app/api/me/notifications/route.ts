import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequestDb } from "@/lib/middleware/auth";
import { listNotificationsForUser, markNotificationsRead } from "@/lib/data/userNotifications";

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequestDb(request);
    if (!auth) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    await connectDB();
    const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 50));
    const { items, unreadCount } = await listNotificationsForUser(auth.userId, limit);
    return NextResponse.json({ notifications: items, unreadCount });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "알림을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticateRequestDb(request);
    if (!auth) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const ids = Array.isArray(body?.ids) ? body.ids.map((x: unknown) => String(x)) : undefined;
    const all = Boolean(body?.all);
    let res;
    if (all) {
      res = await markNotificationsRead(auth.userId);
    } else if (ids?.length) {
      res = await markNotificationsRead(auth.userId, ids);
    } else {
      return NextResponse.json({ error: "ids 또는 all: true 가 필요합니다." }, { status: 400 });
    }
    return NextResponse.json({ ok: true, modified: res.modified });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "처리하지 못했습니다." },
      { status: 500 }
    );
  }
}
