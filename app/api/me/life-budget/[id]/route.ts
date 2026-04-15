import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import PersonalBudgetLine from "@/models/PersonalBudgetLine";
import type { PersonalBudgetKind } from "@/models/PersonalBudgetLine";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    await connectDB();
    const oidLine = new mongoose.Types.ObjectId(params.id);
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const body = await request.json();
    const kind: PersonalBudgetKind = body?.kind === "income" ? "income" : "expense";
    const label = String(body?.label || "").trim();
    const amount = Number(body?.amount);
    if (!label) {
      return NextResponse.json({ error: "항목 이름을 입력해 주세요." }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ error: "금액을 올바르게 입력해 주세요." }, { status: 400 });
    }
    const updated = await PersonalBudgetLine.findOneAndUpdate(
      { _id: oidLine, userId: uid },
      { $set: { kind, label, amount } },
      { new: true }
    ).lean();
    if (!updated) {
      return NextResponse.json({ error: "항목을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({
      line: {
        id: String((updated as any)._id),
        kind: (updated as any).kind,
        label: (updated as any).label,
        amount: (updated as any).amount,
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "수정하지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const oid = new mongoose.Types.ObjectId(params.id);
    const uid = new mongoose.Types.ObjectId(auth.userId);
    await connectDB();
    const res = await PersonalBudgetLine.deleteOne({ _id: oid, userId: uid });
    if (res.deletedCount === 0) {
      return NextResponse.json({ error: "항목을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "삭제하지 못했습니다." },
      { status: 500 }
    );
  }
}
