import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import PersonalBudgetLine, {
  type PersonalBudgetKind,
} from "@/models/PersonalBudgetLine";

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const rows = await PersonalBudgetLine.find({ userId: uid })
      .sort({ createdAt: -1 })
      .lean();
    const lines = rows.map((r: any) => ({
      id: String(r._id),
      kind: r.kind as PersonalBudgetKind,
      label: r.label,
      amount: r.amount,
    }));
    return NextResponse.json({ lines });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const body = await request.json();
    const kind = body?.kind === "income" ? "income" : "expense";
    const label = String(body?.label || "").trim();
    const amount = Number(body?.amount);
    if (!label) {
      return NextResponse.json({ error: "항목 이름을 입력해 주세요." }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ error: "금액을 올바르게 입력해 주세요." }, { status: 400 });
    }
    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const doc = await PersonalBudgetLine.create({
      userId: uid,
      kind,
      label,
      amount,
    });
    return NextResponse.json({
      line: { id: String(doc._id), kind, label, amount },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "저장하지 못했습니다." },
      { status: 500 }
    );
  }
}
