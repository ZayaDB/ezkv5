/**
 * Admin 계정 생성 스크립트 (보안 버전)
 * - 하드코딩 자격증명 사용 금지
 * - 환경변수로만 생성
 *
 * 실행 예시 (PowerShell):
 * $env:ADMIN_EMAIL="owner@yourdomain.com"
 * $env:ADMIN_PASSWORD="강한비밀번호"
 * npx tsx scripts/create-admin.ts
 */

import connectDB from "../lib/db/mongodb";
import User from "../models/User";
import { hashPassword } from "../lib/auth/password";
import { loadEnvLocal } from "./load-env-local";

loadEnvLocal();

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} 환경변수가 필요합니다.`);
  }
  return value;
}

async function createAdmin() {
  try {
    console.log("🔌 MongoDB 연결 중...");
    await connectDB();
    console.log("✅ MongoDB 연결 성공");

    const email = requireEnv("ADMIN_EMAIL").toLowerCase();
    const password = requireEnv("ADMIN_PASSWORD");
    const name = process.env.ADMIN_NAME?.trim() || "관리자";
    const locale = (process.env.ADMIN_LOCALE?.trim() as "kr" | "en" | "mn" | undefined) || "kr";

    const existingByEmail = await User.findOne({ email }).lean();
    if (existingByEmail) {
      throw new Error(`이미 존재하는 이메일입니다: ${email}`);
    }

    const existingAdmin = await User.findOne({ role: "admin" }).lean();
    if (existingAdmin) {
      console.log("\n⚠️ 이미 admin 계정이 존재합니다.");
      console.log(`   이메일: ${(existingAdmin as { email?: string }).email || "-"}`);
      console.log("   추가 admin 생성이 필요하면 role 정책을 먼저 검토하세요.");
      return;
    }

    console.log("👤 Admin 계정 생성 중...");
    const hashedPassword = await hashPassword(password);

    const admin = await User.create({
      email,
      password: hashedPassword,
      name,
      role: "admin",
      locale,
    });

    console.log("\n✅ Admin 계정 생성 완료!");
    console.log(`   id: ${admin._id}`);
    console.log(`   email: ${admin.email}`);
    console.log("\n⚠️ 비밀번호는 로그에 출력하지 않습니다.");
  } catch (error: any) {
    console.error("❌ Admin 계정 생성 실패:", error.message || error);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

createAdmin();
