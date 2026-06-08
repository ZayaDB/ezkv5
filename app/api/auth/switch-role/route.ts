import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import Mentor from "@/models/Mentor";
import { authenticateRequest } from "@/lib/middleware/auth";
import { generateToken } from "@/lib/auth/jwt";
import { serializePublicUser } from "@/lib/auth/publicUser";
import { toDbRoleForSwitch } from "@/lib/auth/userRole";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    if (auth.role === "admin") {
      return NextResponse.json({ error: "관리자 계정은 역할 전환 대상이 아닙니다." }, { status: 400 });
    }

    const { targetRole } = await request.json();
    const dbRole = toDbRoleForSwitch(targetRole);
    if (!dbRole) {
      return NextResponse.json({ error: "유효하지 않은 역할입니다." }, { status: 400 });
    }

    if (dbRole === "mentor") {
      const profile = await Mentor.findOne({ userId: auth.userId }).lean();
      const st = profile ? (profile as { approvalStatus?: string }).approvalStatus || "approved" : null;
      if (!profile || st !== "approved") {
        return NextResponse.json(
          {
            error:
              "멘토 전환은 관리자가 멘토 신청을 승인한 뒤에만 가능합니다. 마이페이지에서 신청 상태를 확인해 주세요.",
          },
          { status: 400 }
        );
      }
    }

    const updated = await User.findByIdAndUpdate(
      auth.userId,
      { $set: { role: dbRole } },
      { new: true }
    )
      .select("-password")
      .lean();

    if (!updated) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    const token = generateToken({
      userId: String((updated as any)._id),
      email: String((updated as any).email),
      role: String((updated as any).role),
    });

    return NextResponse.json({
      user: serializePublicUser(updated as Record<string, unknown>),
      token,
    });
  } catch (error: any) {
    console.error("Switch role error:", error);
    return NextResponse.json(
      { error: error.message || "역할 전환에 실패했습니다." },
      { status: 500 }
    );
  }
}
