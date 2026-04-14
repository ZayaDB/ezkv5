/**
 * Admin 계정 확인 스크립트
 * - DB 내 admin 계정 존재 여부만 확인
 * - 비밀번호 검증/출력 금지
 */

import connectDB from "../lib/db/mongodb";
import User from "../models/User";
import { loadEnvLocal } from "./load-env-local";

loadEnvLocal();

async function checkAdmin() {
  try {
    console.log("🔌 MongoDB 연결 중...");
    await connectDB();
    console.log("✅ MongoDB 연결 성공\n");

    const admins = await User.find({ role: "admin" }).select("email name role createdAt").lean();

    if (admins.length === 0) {
      console.log("❌ Admin 계정이 없습니다.");
      console.log("   아래처럼 환경변수로 생성하세요:");
      console.log("   ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/create-admin.ts");
      return;
    }

    console.log(`✅ ${admins.length}개의 Admin 계정을 찾았습니다:\n`);
    for (const admin of admins) {
      const row = admin as { email?: string; name?: string; role?: string; createdAt?: Date };
      console.log(`   이메일: ${row.email || "-"}`);
      console.log(`   이름: ${row.name || "-"}`);
      console.log(`   역할: ${row.role || "-"}`);
      console.log(`   생성일: ${row.createdAt || "-"}`);
      console.log("");
    }
  } catch (error: any) {
    console.error("❌ 오류 발생:", error.message || error);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

checkAdmin();
