import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequestDb } from "@/lib/middleware/auth";
import { createPost, listPosts } from "@/lib/data/channelFeed";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const posts = await listPosts("community", params.id);
    return NextResponse.json({ posts });
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
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequestDb(request);
    if (!auth) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    const body = await request.json();
    const title = String(body?.title || "").trim();
    const text = String(body?.body || "").trim();
    if (!title || !text) {
      return NextResponse.json(
        { error: "제목과 내용을 입력해 주세요." },
        { status: 400 }
      );
    }
    await connectDB();
    const res = await createPost(auth.userId, "community", params.id, title, text);
    if ("error" in res && res.error) {
      return NextResponse.json({ error: res.error }, { status: 403 });
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
