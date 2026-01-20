/**
 * 데이터베이스 시드 스크립트
 * 개발용 초기 데이터 삽입
 * 
 * 실행 방법:
 * npx tsx scripts/seed.ts
 * 또는
 * npm run seed
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Mentor from '../models/Mentor';
import Lecture from '../models/Lecture';
import CommunityGroup from '../models/CommunityGroup';
import FreelancerGroup from '../models/FreelancerGroup';
import StudyInfo from '../models/StudyInfo';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mentorlink';

async function seed() {
  try {
    console.log('🔌 MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 기존 데이터 삭제 (선택사항)
    console.log('🗑️  기존 데이터 삭제 중...');
    await User.deleteMany({});
    await Mentor.deleteMany({});
    await Lecture.deleteMany({});
    await CommunityGroup.deleteMany({});
    await FreelancerGroup.deleteMany({});
    await StudyInfo.deleteMany({});

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 사용자 생성
    console.log('👤 사용자 생성 중...');
    const users = await User.insertMany([
      {
        email: 'mentee@example.com',
        password: hashedPassword,
        name: '김멘티',
        role: 'mentee',
        locale: 'kr',
      },
      {
        email: 'mentor@example.com',
        password: hashedPassword,
        name: '박멘토',
        role: 'mentor',
        locale: 'kr',
      },
      {
        email: 'admin@example.com',
        password: hashedPassword,
        name: '관리자',
        role: 'admin',
        locale: 'kr',
      },
    ]);

    console.log(`✅ ${users.length}명의 사용자 생성 완료`);

    // 멘토 프로필 생성
    console.log('🎓 멘토 프로필 생성 중...');
    const mentors = await Mentor.insertMany([
      {
        userId: users[1]._id, // mentor@example.com
        title: '비자 전문 상담사',
        location: '서울',
        languages: ['한국어', '영어', '중국어'],
        specialties: ['비자 신청', '서류 준비', '연장 신청'],
        price: 50000,
        availability: 'available',
        bio: '10년 이상의 경험을 가진 비자 전문 상담사입니다. 다양한 국가의 학생들을 도왔습니다.',
        verified: true,
        rating: 4.8,
        reviewCount: 120,
      },
    ]);

    console.log(`✅ ${mentors.length}개의 멘토 프로필 생성 완료`);

    // 강의 생성
    console.log('📚 강의 생성 중...');
    const lectures = await Lecture.insertMany([
      {
        instructorId: users[1]._id,
        title: '한국어 초급 강의',
        type: 'online',
        category: '언어',
        price: 100000,
        duration: '10주',
        description: '한국어를 처음 배우는 분들을 위한 초급 강의입니다.',
        rating: 4.5,
        students: 50,
      },
      {
        instructorId: users[1]._id,
        title: '비자 신청 가이드',
        type: 'offline',
        category: '비자',
        price: 50000,
        duration: '2시간',
        description: 'D-2 비자 신청 절차와 필요한 서류를 설명합니다.',
        rating: 4.9,
        students: 200,
      },
    ]);

    console.log(`✅ ${lectures.length}개의 강의 생성 완료`);

    // 커뮤니티 그룹 생성
    console.log('👥 커뮤니티 그룹 생성 중...');
    const communities = await CommunityGroup.insertMany([
      {
        name: '한국 유학생 모임',
        description: '한국에서 공부하는 유학생들을 위한 커뮤니티입니다.',
        category: '일반',
        members: 500,
        tags: ['유학생', '정보공유', '친목'],
      },
      {
        name: '비자 정보 공유',
        description: '비자 관련 정보를 공유하는 그룹입니다.',
        category: '비자',
        members: 300,
        tags: ['비자', '정보', '도움'],
      },
    ]);

    console.log(`✅ ${communities.length}개의 커뮤니티 그룹 생성 완료`);

    // 프리랜서 그룹 생성
    console.log('💼 프리랜서 그룹 생성 중...');
    const freelancers = await FreelancerGroup.insertMany([
      {
        name: '번역 프리랜서',
        description: '번역 일을 찾는 프리랜서 그룹입니다.',
        category: '번역',
        members: 150,
        jobsPosted: 30,
      },
      {
        name: '튜터링',
        description: '과외 및 튜터링 일자리를 찾는 그룹입니다.',
        category: '교육',
        members: 200,
        jobsPosted: 50,
      },
    ]);

    console.log(`✅ ${freelancers.length}개의 프리랜서 그룹 생성 완료`);

    // 한국 유학 정보 생성
    console.log('📖 한국 유학 정보 생성 중...');
    const studyInfos = await StudyInfo.insertMany([
      {
        category: 'visa',
        title: 'D-2 비자 신청 가이드',
        content: 'D-2 비자는 한국에서 학업을 목적으로 체류하는 외국인을 위한 비자입니다...',
        tags: ['비자', 'D-2', '신청'],
      },
      {
        category: 'housing',
        title: '기숙사 vs 자취 비교',
        content: '한국에서 유학할 때 기숙사와 자취 중 어떤 것을 선택해야 할까요?...',
        tags: ['주거', '기숙사', '자취'],
      },
      {
        category: 'hospital',
        title: '한국 병원 이용 가이드',
        content: '한국에서 병원을 이용하는 방법과 건강보험에 대해 알아봅시다...',
        tags: ['병원', '건강보험', '의료'],
      },
    ]);

    console.log(`✅ ${studyInfos.length}개의 한국 유학 정보 생성 완료`);

    console.log('\n🎉 시드 데이터 삽입 완료!');
    console.log('\n테스트 계정:');
    console.log('  멘티: mentee@example.com / password123');
    console.log('  멘토: mentor@example.com / password123');
    console.log('  관리자: admin@example.com / password123');

    await mongoose.disconnect();
    console.log('\n👋 MongoDB 연결 종료');
  } catch (error) {
    console.error('❌ 시드 데이터 삽입 실패:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();

