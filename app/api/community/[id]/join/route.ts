import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import CommunityGroup from "@/models/CommunityGroup";
import CommunityMembership from "@/models/CommunityMembership";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const group = await CommunityGroup.findById(params.id).lean();
    if (!group) {
      return NextResponse.json({ error: "커뮤니티를 찾을 수 없습니다." }, { status: 404 });
    }

    const existing = await CommunityMembership.findOne({
      userId: auth.userId,
      groupId: params.id,
    }).lean();

    if (existing) {
      const st = (existing as { status?: string }).status;
      if (st === "approved") {
        return NextResponse.json({ error: "이미 가입한 커뮤니티입니다." }, { status: 409 });
      }
      /** 거절·대기(구버전) 모두 즉시 가입 처리 — 글·댓글은 관리자 사후 삭제로만 조정 */
      const updated = await CommunityMembership.findByIdAndUpdate(
        (existing as { _id: unknown })._id,
        { $set: { status: "approved" } },
        { new: true }
      ).lean();
      if (!updated) {
        return NextResponse.json({ error: "가입 처리에 실패했습니다." }, { status: 500 });
      }
      const u = updated as unknown as { _id: unknown; status: string; createdAt: Date };
      return NextResponse.json(
        {
          membership: {
            id: String(u._id),
            groupId: params.id,
            status: u.status,
            createdAt: u.createdAt,
          },
        },
        { status: 200 }
      );
    }

    const membership = await CommunityMembership.create({
      userId: auth.userId,
      groupId: params.id,
      status: "approved",
    });

    await CommunityGroup.findByIdAndUpdate(params.id, { $inc: { members: 1 } });

    return NextResponse.json(
      {
        membership: {
          id: String(membership._id),
          groupId: params.id,
          status: membership.status,
          createdAt: membership.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Join community error:", error);
    return NextResponse.json(
      { error: error.message || "커뮤니티 가입 신청에 실패했습니다." },
      { status: 500 }
    );
  }
}
