import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import CommunityMembership from "@/models/CommunityMembership";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const rows = await CommunityMembership.find({ userId: auth.userId })
      .populate("groupId", "name category members")
      .sort({ createdAt: -1 })
      .lean();

    const memberships = rows.map((row: any) => ({
      id: String(row._id),
      status: row.status,
      createdAt: row.createdAt,
      group: row.groupId
        ? {
            id: String(row.groupId._id),
            name: row.groupId.name,
            category: row.groupId.category,
            members: row.groupId.members,
          }
        : null,
    }));

    return NextResponse.json({ memberships });
  } catch (error: any) {
    console.error("Get community memberships error:", error);
    return NextResponse.json(
      { error: error.message || "커뮤니티 신청 내역을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
