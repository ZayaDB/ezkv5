import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Inquiry from "@/models/Inquiry";
import { authenticateRequestDb } from "@/lib/middleware/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await authenticateRequestDb(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const { id } = await params;
    const doc = (await Inquiry.findById(id).lean()) as any;
    if (!doc || String(doc.userId) !== auth.userId) {
      return NextResponse.json({ error: "문의를 찾을 수 없습니다." }, { status: 404 });
    }
    if (doc.status !== "open") {
      return NextResponse.json({ error: "답변이 완료된 문의는 수정할 수 없습니다." }, { status: 400 });
    }

    const { subject, body } = await request.json();
    const updated = await Inquiry.findByIdAndUpdate(
      id,
      {
        ...(typeof subject === "string" ? { subject: subject.trim().slice(0, 200) } : {}),
        ...(typeof body === "string" ? { body: body.trim().slice(0, 8000) } : {}),
      },
      { new: true }
    ).lean();

    return NextResponse.json({
      inquiry: {
        id: String((updated as any)._id),
        subject: (updated as any).subject,
        body: (updated as any).body,
        status: (updated as any).status,
        adminReply: (updated as any).adminReply || "",
        createdAt: (updated as any).createdAt,
        updatedAt: (updated as any).updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Patch inquiry error:", error);
    return NextResponse.json(
      { error: error.message || "문의 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await authenticateRequestDb(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const { id } = await params;
    const doc = (await Inquiry.findById(id).lean()) as any;
    if (!doc || String(doc.userId) !== auth.userId) {
      return NextResponse.json({ error: "문의를 찾을 수 없습니다." }, { status: 404 });
    }
    if (doc.status !== "open") {
      return NextResponse.json({ error: "답변 완료된 문의는 삭제할 수 없습니다." }, { status: 400 });
    }

    await Inquiry.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Delete inquiry error:", error);
    return NextResponse.json(
      { error: error.message || "문의 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
