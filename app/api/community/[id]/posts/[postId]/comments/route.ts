import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequestDb } from "@/lib/middleware/auth";
import { addComment, listComments } from "@/lib/data/channelFeed";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; postId: string } }
) {
  try {
    await connectDB();
    const comments = await listComments(params.postId);
    return NextResponse.json({ comments });
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
  { params }: { params: { id: string; postId: string } }
) {
  try {
    const auth = await authenticateRequestDb(request);
    if (!auth) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    const body = await request.json();
    const text = String(body?.body || "").trim();
    if (!text) {
      return NextResponse.json({ error: "댓글 내용을 입력해 주세요." }, { status: 400 });
    }
    await connectDB();
    const res = await addComment(
      auth.userId,
      "community",
      params.id,
      params.postId,
      text
    );
    if ("error" in res && res.error) {
      return NextResponse.json({ error: res.error }, { status: 403 });
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
