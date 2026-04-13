import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import FreelancerGroup from "@/models/FreelancerGroup";
import FreelancerApplication from "@/models/FreelancerApplication";

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

    const group = await FreelancerGroup.findById(params.id).lean();
    if (!group) {
      return NextResponse.json({ error: "프리랜서 그룹을 찾을 수 없습니다." }, { status: 404 });
    }

    const existing = await FreelancerApplication.findOne({
      userId: auth.userId,
      groupId: params.id,
    }).lean();
    if (existing) {
      return NextResponse.json({ error: "이미 지원한 그룹입니다." }, { status: 409 });
    }

    const application = await FreelancerApplication.create({
      userId: auth.userId,
      groupId: params.id,
      status: "pending",
    });

    await FreelancerGroup.findByIdAndUpdate(params.id, { $inc: { members: 1 } });

    return NextResponse.json(
      {
        application: {
          id: String(application._id),
          groupId: params.id,
          status: application.status,
          createdAt: application.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Apply freelancer group error:", error);
    return NextResponse.json(
      { error: error.message || "프리랜서 지원에 실패했습니다." },
      { status: 500 }
    );
  }
}
