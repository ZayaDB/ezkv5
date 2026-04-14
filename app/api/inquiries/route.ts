import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Inquiry from "@/models/Inquiry";
import { authenticateRequestDb } from "@/lib/middleware/auth";

function serialize(doc: Record<string, unknown>) {
  return {
    id: String(doc._id),
    subject: doc.subject,
    body: doc.body,
    status: doc.status,
    adminReply: doc.adminReply || "",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await authenticateRequestDb(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    if (auth.role === "admin") {
      return NextResponse.json({ error: "일반 회원 전용 API입니다." }, { status: 403 });
    }

    const rows = await Inquiry.find({ userId: auth.userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      inquiries: rows.map((r) => serialize(r as Record<string, unknown>)),
    });
  } catch (error: any) {
    console.error("List inquiries error:", error);
    return NextResponse.json(
      { error: error.message || "문의 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await authenticateRequestDb(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    if (auth.role === "admin") {
      return NextResponse.json({ error: "관리자는 이 API로 문의를 등록할 수 없습니다." }, { status: 400 });
    }

    const { subject, body } = await request.json();
    if (!subject || typeof subject !== "string" || !body || typeof body !== "string") {
      return NextResponse.json({ error: "제목과 내용을 입력해 주세요." }, { status: 400 });
    }

    const created = await Inquiry.create({
      userId: auth.userId,
      subject: String(subject).trim().slice(0, 200),
      body: String(body).trim().slice(0, 8000),
      status: "open",
      adminReply: "",
    });

    return NextResponse.json(
      { inquiry: serialize(created.toObject() as Record<string, unknown>) },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create inquiry error:", error);
    return NextResponse.json(
      { error: error.message || "문의 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}
