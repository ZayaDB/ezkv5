import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import FreelancerApplication from "@/models/FreelancerApplication";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const rows = await FreelancerApplication.find({ userId: auth.userId })
      .populate("groupId", "name category members jobsPosted")
      .sort({ createdAt: -1 })
      .lean();

    const applications = rows.map((row: any) => ({
      id: String(row._id),
      status: row.status,
      createdAt: row.createdAt,
      group: row.groupId
        ? {
            id: String(row.groupId._id),
            name: row.groupId.name,
            category: row.groupId.category,
            members: row.groupId.members,
            jobsPosted: row.groupId.jobsPosted,
          }
        : null,
    }));

    return NextResponse.json({ applications });
  } catch (error: any) {
    console.error("Get freelancer applications error:", error);
    return NextResponse.json(
      { error: error.message || "프리랜서 신청 내역을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
