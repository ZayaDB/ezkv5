/**
 * Admin 계정 생성 스크립트
 * 기존 admin 계정이 없으면 생성합니다.
 *
 * 실행 방법:
 * npx tsx scripts/create-admin.ts
 */

import connectDB from "../lib/db/mongodb";
import User from "../models/User";
import { hashPassword } from "../lib/auth/password";

async function createAdmin() {
  try {
    console.log("🔌 MongoDB 연결 중...");
    await connectDB();
    console.log("✅ MongoDB 연결 성공");

    // 기존 admin 계정 확인
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("\n✅ Admin 계정이 이미 존재합니다:");
      console.log(`   이메일: ${existingAdmin.email}`);
      console.log(`   이름: ${existingAdmin.name}`);
      console.log(`   역할: ${existingAdmin.role}`);
      return;
    }

    // Admin 계정 생성
    console.log("👤 Admin 계정 생성 중...");
    const hashedPassword = await hashPassword("admin123");

    const admin = await User.create({
      email: "admin@example.com",
      password: hashedPassword,
      name: "관리자",
      role: "admin",
      locale: "kr",
    });

    console.log("\n✅ Admin 계정 생성 완료!");
    console.log("\n📋 로그인 정보:");
    console.log("   이메일: admin@example.com");
    console.log("   비밀번호: admin123");
    console.log("\n⚠️  보안을 위해 로그인 후 비밀번호를 변경하세요!");
  } catch (error: any) {
    console.error("❌ Admin 계정 생성 실패:", error.message);
    if (error.code === 11000) {
      console.error("   이메일이 이미 사용 중입니다.");
    }
    process.exit(1);
  } finally {
    // mongoose 연결은 connectDB에서 관리하므로 여기서는 종료하지 않음
    process.exit(0);
  }
}

createAdmin();
