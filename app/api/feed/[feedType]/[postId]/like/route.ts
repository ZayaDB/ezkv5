import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequestDb } from "@/lib/middleware/auth";
import { togglePublicFeedLike } from "@/lib/data/publicFeed";

export async function POST(
  request: NextRequest,
  { params }: { params: { feedType: string; postId: string } }
) {
  try {
    const auth = await authenticateRequestDb(request);
    if (!auth) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    await connectDB();
    const res = await togglePublicFeedLike(auth.userId, params.postId);
    if ("error" in res && res.error) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    return NextResponse.json(res);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "처리하지 못했습니다." },
      { status: 500 }
    );
  }
}
