import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import { listChannelPostsForAdmin } from "@/lib/data/channelFeed";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = authenticateRequest(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }
    const limit = Math.min(120, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 80));
    const posts = await listChannelPostsForAdmin(limit);
    return NextResponse.json({
      posts: posts.map((p) => ({
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
