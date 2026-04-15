import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequestDb } from "@/lib/middleware/auth";
import CommunityMembership from "@/models/CommunityMembership";
import FreelancerApplication from "@/models/FreelancerApplication";

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequestDb(request);
    if (!auth) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);

    const cms = await CommunityMembership.find({ userId: uid, status: "approved" })
      .populate("groupId", "name")
      .lean();

    const community = (cms as any[])
      .filter((m) => m.groupId && typeof m.groupId === "object")
      .map((m) => ({
        id: String(m.groupId._id),
        name: String(m.groupId.name || ""),
      }));

    const fas = await FreelancerApplication.find({
      userId: uid,
      status: "accepted",
    })
      .populate("groupId", "name")
      .lean();

    const freelancers = (fas as any[])
      .filter((m) => m.groupId && typeof m.groupId === "object")
      .map((m) => ({
        id: String(m.groupId._id),
        name: String(m.groupId.name || ""),
      }));

    return NextResponse.json({ community, freelancers });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
