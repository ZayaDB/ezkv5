import { NextRequest, NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/middleware/supabaseApiAuth";
import { adminDeleteChannelPost } from "@/lib/supabase/channel-feed";

type RouteContext = { params: Promise<{ postId: string }> };

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireApiAdmin();
    if (!auth) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }
    const { postId } = await context.params;
    let reason = "";
    try {
      const body = await request.json();
      if (body && typeof body.reason === "string") reason = body.reason;
    } catch {
      /* empty body */
    }
    const res = await adminDeleteChannelPost(postId, reason);
    if ("error" in res && res.error) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    return NextResponse.json(res);
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
