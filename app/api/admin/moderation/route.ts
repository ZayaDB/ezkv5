import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { authenticateRequest } from "@/lib/middleware/auth";
import CommunityMembership from "@/models/CommunityMembership";
import FreelancerApplication from "@/models/FreelancerApplication";
import Mentor from "@/models/Mentor";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = authenticateRequest(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const [communityPending, freelancerPending, mentorPending] = await Promise.all([
      CommunityMembership.find({ status: "pending" })
        .populate("userId", "name email")
        .populate("groupId", "name category")
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
      FreelancerApplication.find({ status: "pending" })
        .populate("userId", "name email")
        .populate("groupId", "name category")
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
      Mentor.find({ approvalStatus: "pending" })
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
    ]);

    return NextResponse.json({
      mentorPending: mentorPending.map((r: any) => ({
        id: String(r._id),
        createdAt: r.createdAt,
        user: r.userId ? { id: String(r.userId._id), name: r.userId.name, email: r.userId.email } : null,
        title: r.title,
        location: r.location,
        specialties: r.specialties,
      })),
      communityPending: communityPending.map((r: any) => ({
        id: String(r._id),
        createdAt: r.createdAt,
        user: r.userId ? { id: String(r.userId._id), name: r.userId.name, email: r.userId.email } : null,
        group: r.groupId ? { id: String(r.groupId._id), name: r.groupId.name, category: r.groupId.category } : null,
      })),
      freelancerPending: freelancerPending.map((r: any) => ({
        id: String(r._id),
        createdAt: r.createdAt,
        user: r.userId ? { id: String(r.userId._id), name: r.userId.name, email: r.userId.email } : null,
        group: r.groupId ? { id: String(r.groupId._id), name: r.groupId.name, category: r.groupId.category } : null,
      })),
    });
  } catch (error: any) {
    console.error("Get moderation queue error:", error);
    return NextResponse.json(
      { error: error.message || "검수 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const auth = authenticateRequest(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { type, id, status } = await request.json();
    if (!type || !id || !status) {
      return NextResponse.json({ error: "type, id, status는 필수입니다." }, { status: 400 });
    }

    if (type === "community") {
      if (!["pending", "approved", "rejected"].includes(status)) {
        return NextResponse.json(
          { error: "community status는 pending/approved/rejected만 허용됩니다." },
          { status: 400 }
        );
      }
      const updated = await CommunityMembership.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean();
      if (!updated) return NextResponse.json({ error: "요청 대상을 찾을 수 없습니다." }, { status: 404 });
      return NextResponse.json({ ok: true, item: { id: String((updated as any)._id), status: (updated as any).status } });
    }

    if (type === "freelancer") {
      if (!["pending", "accepted", "rejected"].includes(status)) {
        return NextResponse.json(
          { error: "freelancer status는 pending/accepted/rejected만 허용됩니다." },
          { status: 400 }
        );
      }
      const updated = await FreelancerApplication.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean();
      if (!updated) return NextResponse.json({ error: "요청 대상을 찾을 수 없습니다." }, { status: 404 });
      return NextResponse.json({ ok: true, item: { id: String((updated as any)._id), status: (updated as any).status } });
    }

    if (type === "mentor") {
      if (!["approved", "rejected"].includes(status)) {
        return NextResponse.json(
          { error: "mentor status는 approved/rejected만 허용됩니다." },
          { status: 400 }
        );
      }
      const mentor = await Mentor.findById(id).lean();
      if (!mentor) return NextResponse.json({ error: "요청 대상을 찾을 수 없습니다." }, { status: 404 });
      const userId = String((mentor as any).userId);

      if (status === "approved") {
        await Mentor.findByIdAndUpdate(id, {
          $set: { approvalStatus: "approved", verified: true },
        });
        await User.findByIdAndUpdate(userId, { $set: { role: "mentor" } });
      } else {
        await Mentor.findByIdAndUpdate(id, {
          $set: { approvalStatus: "rejected", verified: false },
        });
      }

      return NextResponse.json({
        ok: true,
        item: { id, approvalStatus: status },
      });
    }

    return NextResponse.json(
      { error: "type은 community, freelancer, mentor 중 하나여야 합니다." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Patch moderation status error:", error);
    return NextResponse.json(
      { error: error.message || "검수 상태 변경에 실패했습니다." },
      { status: 500 }
    );
  }
}
