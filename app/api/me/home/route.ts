import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import { buildHomeControlCenter } from "@/lib/home/buildHomeData";

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    await connectDB();
    const data = await buildHomeControlCenter(auth.userId);
    return NextResponse.json(data);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "홈 데이터를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
