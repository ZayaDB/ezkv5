import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import Inquiry from "@/models/Inquiry";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = authenticateRequest(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }
    const rows = await Inquiry.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("userId", "name email")
      .lean();
    const inquiries = rows.map((r: any) => ({
      id: String(r._id),
      subject: r.subject,
      body: r.body,
      status: r.status,
      adminReply: r.adminReply || "",
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: r.userId
        ? {
            id: String(r.userId._id || r.userId),
            name: r.userId.name,
            email: r.userId.email,
          }
        : null,
    }));
    return NextResponse.json({ inquiries });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
