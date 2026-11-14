import { NextRequest, NextResponse } from "next/server";
import { localeFromRequest, trError } from "@/lib/i18n/runtime";
import { requireApiAdmin } from "@/lib/middleware/supabaseApiAuth";
import { listChannelPostsForAdmin } from "@/lib/supabase/channel-feed";

export async function GET(request: NextRequest) {
  const locale = localeFromRequest(request);
  try {
    const auth = await requireApiAdmin();
    if (!auth) {
      return NextResponse.json({ error: trError("adminRequired", locale) }, { status: 403 });
    }
    const limitParam = request.nextUrl.searchParams.get("limit");
    const limit = limitParam ? Math.min(200, Math.max(1, Number(limitParam) || 80)) : 80;
    const posts = await listChannelPostsForAdmin(limit);
    return NextResponse.json({ posts });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : trError("channelPostsLoadFailed", locale) },
      { status: 500 }
    );
  }
}
