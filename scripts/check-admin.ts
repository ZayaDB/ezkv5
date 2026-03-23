/**
 * Admin 계정 확인 스크립트
 * 데이터베이스에 admin 계정이 있는지 확인합니다.
 * 
 * 실행 방법:
 * npx tsx scripts/check-admin.ts
 */

import connectDB from '../lib/db/mongodb';
import User from '../models/User';
import { comparePassword } from '../lib/auth/password';

async function checkAdmin() {
  try {
    console.log('🔌 MongoDB 연결 중...');
    await connectDB();
    console.log('✅ MongoDB 연결 성공\n');

    // 모든 admin 계정 확인
    const admins = await User.find({ role: 'admin' }).select('email name role createdAt');
    
    if (admins.length === 0) {
      console.log('❌ Admin 계정이 없습니다.');
      console.log('   create-admin.ts 스크립트를 실행하여 계정을 생성하세요.');
      return;
    }

    console.log(`✅ ${admins.length}개의 Admin 계정을 찾았습니다:\n`);
    
    for (const admin of admins) {
      console.log(`   이메일: ${admin.email}`);
      console.log(`   이름: ${admin.name}`);
      console.log(`   역할: ${admin.role}`);
      console.log(`   생성일: ${admin.createdAt}`);
      console.log('');
    }

    // admin@example.com 계정이 있는지 확인
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (adminUser) {
      console.log('🔐 비밀번호 검증 테스트...');
      const testPassword = 'admin123';
      const isValid = await comparePassword(testPassword, adminUser.password);
      
      if (isValid) {
        console.log('✅ 비밀번호 "admin123"이 올바릅니다.');
      } else {
        console.log('❌ 비밀번호 "admin123"이 일치하지 않습니다.');
        console.log('   실제 비밀번호 해시:', adminUser.password.substring(0, 20) + '...');
      }
    }

  } catch (error: any) {
    console.error('❌ 오류 발생:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

checkAdmin();

