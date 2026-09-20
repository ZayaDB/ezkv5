import { NextRequest, NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/middleware/supabaseApiAuth";
import { listChannelPostsForAdmin } from "@/lib/supabase/channel-feed";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiAdmin();
    if (!auth) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }
    const limitParam = request.nextUrl.searchParams.get("limit");
    const limit = limitParam ? Math.min(200, Math.max(1, Number(limitParam) || 80)) : 80;
    const posts = await listChannelPostsForAdmin(limit);
    return NextResponse.json({ posts });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "채널 글 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
