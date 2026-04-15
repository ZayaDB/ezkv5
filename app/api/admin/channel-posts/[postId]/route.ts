import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import { adminDeleteChannelPost } from "@/lib/data/channelFeed";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    await connectDB();
    const auth = authenticateRequest(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }
    const body = await request.json().catch(() => ({}));
    const reason = String(body?.reason || "");
    const res = await adminDeleteChannelPost(params.postId, reason);
    if ("error" in res && res.error) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "삭제하지 못했습니다." },
      { status: 500 }
    );
  }
}
