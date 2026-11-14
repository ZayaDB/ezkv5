import { NextRequest, NextResponse } from "next/server";
import { localeFromRequest, trError } from "@/lib/i18n/runtime";
import { requireApiAdmin } from "@/lib/middleware/supabaseApiAuth";
import { adminDeleteChannelPost } from "@/lib/supabase/channel-feed";

type RouteContext = { params: Promise<{ postId: string }> };

export async function DELETE(request: NextRequest, context: RouteContext) {
  const locale = localeFromRequest(request);
  try {
    const auth = await requireApiAdmin();
    if (!auth) {
      return NextResponse.json({ error: trError("adminRequired", locale) }, { status: 403 });
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
      { error: e instanceof Error ? e.message : trError("deleteFailed", locale) },
      { status: 500 }
    );
  }
}
