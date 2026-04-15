import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest, authenticateRequestDb } from "@/lib/middleware/auth";
import { createPublicFeedPost, listPublicFeed } from "@/lib/data/publicFeed";

export async function GET(
  request: NextRequest,
  { params }: { params: { feedType: string } }
) {
  try {
    await connectDB();
    const auth = authenticateRequest(request);
    const res = await listPublicFeed(params.feedType, {
      viewerUserId: auth?.userId,
      limit: 50,
    });
    if ("error" in res && res.error) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    return NextResponse.json({
      posts: (res as any).posts.map((p: any) => ({
        ...p,
        createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
      })),
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { feedType: string } }
) {
  try {
    const auth = await authenticateRequestDb(request);
    if (!auth) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    await connectDB();
    const body = await request.json();
    const text = String(body?.body || "");
    const attachmentUrls = Array.isArray(body?.attachmentUrls) ? body.attachmentUrls : [];
    const res = await createPublicFeedPost(auth.userId, params.feedType, text, attachmentUrls);
    if ("error" in res && res.error) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    return NextResponse.json(res);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "저장하지 못했습니다." },
      { status: 500 }
    );
  }
}
