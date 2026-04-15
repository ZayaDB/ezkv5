import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import Inquiry from "@/models/Inquiry";
import { createInquiryRepliedNotification } from "@/lib/data/userNotifications";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const auth = authenticateRequest(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }
    const { adminReply } = await request.json();
    const reply = String(adminReply || "").trim();
    if (!reply) {
      return NextResponse.json({ error: "답변 내용을 입력해 주세요." }, { status: 400 });
    }
    const doc = await Inquiry.findById(params.id).lean();
    if (!doc) {
      return NextResponse.json({ error: "문의를 찾을 수 없습니다." }, { status: 404 });
    }
    const updated = await Inquiry.findByIdAndUpdate(
      params.id,
      {
        $set: {
          adminReply: reply.slice(0, 8000),
          status: "answered",
        },
      },
      { new: true }
    ).lean();
    await createInquiryRepliedNotification({
      userId: String((doc as any).userId),
      inquiryId: params.id,
      subject: String((doc as any).subject || ""),
      replyPreview: reply.slice(0, 500),
    });
    return NextResponse.json({
      inquiry: {
        id: String((updated as any)._id),
        subject: (updated as any).subject,
        body: (updated as any).body,
        status: (updated as any).status,
        adminReply: (updated as any).adminReply,
        createdAt: (updated as any).createdAt,
        updatedAt: (updated as any).updatedAt,
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "답변 저장에 실패했습니다." },
      { status: 500 }
    );
  }
}
