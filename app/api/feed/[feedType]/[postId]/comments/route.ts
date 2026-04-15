import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequestDb } from "@/lib/middleware/auth";
import { addPublicFeedComment, listPublicFeedComments } from "@/lib/data/publicFeed";

export async function GET(
  _request: NextRequest,
  { params }: { params: { feedType: string; postId: string } }
) {
  try {
    await connectDB();
    const res = await listPublicFeedComments(params.postId);
    if ("error" in res && res.error) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    return NextResponse.json({
      comments: (res as any).comments.map((c: any) => ({
        ...c,
        createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
      })),
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "댓글을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

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
    const body = await request.json();
    const text = String(body?.body || "");
    const res = await addPublicFeedComment(auth.userId, params.postId, text);
    if ("error" in res && res.error) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "댓글을 저장하지 못했습니다." },
      { status: 500 }
    );
  }
}
