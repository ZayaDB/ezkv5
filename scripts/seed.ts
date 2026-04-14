/**
 * 데이터베이스 시드 — 로컬/스테이징용 풍부한 샘플 데이터
 * 실행: npx tsx scripts/seed.ts  또는  npm run seed
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Mentor from '../models/Mentor';
import Lecture from '../models/Lecture';
import CommunityGroup from '../models/CommunityGroup';
import FreelancerGroup from '../models/FreelancerGroup';
import StudyInfo from '../models/StudyInfo';
import { loadEnvLocal } from './load-env-local';

loadEnvLocal();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mentorlink';

async function seed() {
  try {
    console.log('🔌 MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    console.log('🗑️  기존 데이터 삭제 중...');
    await User.deleteMany({});
    await Mentor.deleteMany({});
    await Lecture.deleteMany({});
    await CommunityGroup.deleteMany({});
    await FreelancerGroup.deleteMany({});
    await StudyInfo.deleteMany({});

    const seedUserPassword = process.env.SEED_USER_PASSWORD?.trim();
    if (!seedUserPassword) {
      throw new Error("SEED_USER_PASSWORD 환경변수가 필요합니다. (예: SEED_USER_PASSWORD='강한비밀번호')");
    }
    const hashedPassword = await bcrypt.hash(seedUserPassword, 10);

    console.log('👤 사용자 생성 중...');
    const users = await User.insertMany([
      {
        email: 'mentee@example.com',
        password: hashedPassword,
        name: '김멘티',
        role: 'mentee',
        locale: 'kr',
        bio: '부산에서 언어연수 준비 중입니다.',
        location: '부산',
        languages: ['한국어', '영어'],
      },
      {
        email: 'mentor@example.com',
        password: hashedPassword,
        name: '박멘토',
        role: 'mentor',
        locale: 'kr',
        bio: '출입국·비자 실무 10년.',
        location: '서울',
        languages: ['한국어', '영어', '중국어'],
      },
      {
        email: 'sarah.mentor@example.com',
        password: hashedPassword,
        name: 'Sarah Kim',
        role: 'mentor',
        locale: 'en',
        bio: 'Immigration attorney, former intl. student.',
        location: '서울 강남',
        languages: ['English', 'Korean', 'Mandarin'],
      },
      {
        email: 'minjun@example.com',
        password: hashedPassword,
        name: '박민준',
        role: 'mentor',
        locale: 'kr',
        location: '판교',
        languages: ['한국어', '영어'],
      },
      {
        email: 'yuki@example.com',
        password: hashedPassword,
        name: 'Yuki Tanaka',
        role: 'mentor',
        locale: 'en',
        location: '부산',
        languages: ['日本語', '한국어', 'English'],
      },
      {
        email: 'housing@example.com',
        password: hashedPassword,
        name: '이주거',
        role: 'mentor',
        locale: 'kr',
        location: '서울',
        languages: ['한국어', 'English'],
      },
    ]);

    const [, uM1, uSarah, uMinjun, uYuki, uHousing] = users;

    console.log(`✅ ${users.length}명의 사용자 생성 완료`);

    console.log('🎓 멘토 프로필 생성 중...');
    await Mentor.insertMany([
      {
        userId: uM1._id,
        title: '비자·체류 전문 상담사',
        location: '서울',
        languages: ['한국어', '영어', '중국어'],
        specialties: ['비자 신청', '서류 준비', '연장 신청', '출입국'],
        price: 55000,
        availability: 'available',
        bio: '대학 국제처 및 출입국 업무 경험을 바탕으로 D-2 비자, 시간제 취업 허가, 졸업 후 체류(구직 등)까지 단계별로 안내합니다. 서류 체크리스트와 면접/등록 일정 조율도 도와드립니다.',
        verified: true,
        approvalStatus: 'approved',
        rating: 4.9,
        reviewCount: 203,
      },
      {
        userId: uSarah._id,
        title: 'Immigration Lawyer | Ex-International Student',
        location: '서울',
        languages: ['English', 'Korean', 'Mandarin'],
        specialties: ['Visa', 'Legal', 'Career', '비자'],
        price: 89000,
        availability: 'limited',
        bio: 'I studied in Korea before practicing law. I help with document review, university compliance letters, and communicating with immigration in Korean and English.',
        verified: true,
        approvalStatus: 'approved',
        rating: 4.95,
        reviewCount: 178,
      },
      {
        userId: uMinjun._id,
        title: '네이버 출신 SW 엔지니어 · 커리어 멘토',
        location: '경기 성남',
        languages: ['한국어', 'English'],
        specialties: ['IT', '취업', '이력서', '면접', 'Career'],
        price: 45000,
        availability: 'available',
        bio: '외국인 개발자 채용 프로세스와 코딩 테스트 준비, 한국형 이력서/자기소개서 구조를 알려드립니다. 스타트업·중견기업 네트워킹 팁도 공유합니다.',
        verified: true,
        approvalStatus: 'approved',
        rating: 4.8,
        reviewCount: 96,
      },
      {
        userId: uYuki._id,
        title: '대학 교수 · 기숙사·자취 상담',
        location: '부산',
        languages: ['日本語', '한국어', 'English'],
        specialties: ['기숙사', '주거', '학업', 'Daily Life'],
        price: 40000,
        availability: 'available',
        bio: '지역별 월세 시세, 계약서 특약, 보증금 반환 분쟁 예방 등 주거 전반을 돕습니다. 신입생 오리엔테이션과 수강신청 전략도 상담 가능합니다.',
        verified: true,
        approvalStatus: 'approved',
        rating: 4.7,
        reviewCount: 74,
      },
      {
        userId: uHousing._id,
        title: '공인중개사 협력 · 서울 주거 매칭',
        location: '서울 마포',
        languages: ['한국어', 'English'],
        specialties: ['주거', '전세', '월세', 'housing'],
        price: 60000,
        availability: 'available',
        bio: '고시원·원룸·쉐어하우스 비교부터 전입신고, 관리비 구조 설명까지 실무 중심으로 안내합니다. 사기 의심 매물 필터링 체크리스트를 제공합니다.',
        verified: true,
        approvalStatus: 'approved',
        rating: 4.85,
        reviewCount: 141,
      },
    ]);

    console.log('✅ 멘토 프로필 생성 완료');

    console.log('📚 강의 생성 중...');
    await Lecture.insertMany([
      {
        instructorId: uM1._id,
        title: '한국어 초급 (온라인 라이브)',
        type: 'online',
        category: '언어',
        price: 120000,
        duration: '10주',
        description:
          '한글 자모·기본 문형·일상 회화.\n• 주 2회 라이브\n• 녹화 제공\n• 과제 피드백',
        rating: 4.6,
        students: 520,
      },
      {
        instructorId: uSarah._id,
        title: 'D-2 비자 워크숍 (오프라인)',
        type: 'offline',
        category: '비자',
        price: 80000,
        duration: '1일 (4시간)',
        description:
          '표준증명서, 재정증명, 입학허가서 취합 순서.\n• Q&A 세션\n• 서류 사본 점검',
        rating: 4.95,
        students: 890,
      },
      {
        instructorId: uMinjun._id,
        title: '한국 IT 취업 A to Z',
        type: 'online',
        category: '커리어',
        price: 159000,
        duration: '6주',
        description:
          '포지션 탐색, LinkedIn/원티드 프로필, 기술면접 대비.\n• 모의 면접 1회 포함',
        rating: 4.8,
        students: 410,
      },
      {
        instructorId: uYuki._id,
        title: '부산 생활 정착 가이드',
        type: 'offline',
        category: '생활',
        price: 35000,
        duration: '3시간',
        description: '교통카드, 병원 예약, 마트·전통시장 이용 팁.\n• 현장 워킹 포함',
        rating: 4.75,
        students: 220,
      },
      {
        instructorId: uHousing._id,
        title: '처음 하는 한국 월세 계약',
        type: 'online',
        category: '주거',
        price: 49000,
        duration: '2주',
        description:
          '특약 사항, 확정일자, 전입신고.\n• 샘플 계약서 해설\n• 질의응답',
        rating: 4.9,
        students: 670,
      },
      {
        instructorId: uM1._id,
        title: '시간제취업 허가 (E-7 외) 설명회',
        type: 'online',
        category: '비자',
        price: 0,
        duration: '90분',
        description:
          '유학생 시간제 범위, 신청 포털, 제한 업종.\n• 최신 고시 반영',
        rating: 4.7,
        students: 1200,
      },
    ]);

    console.log('✅ 강의 생성 완료');

    console.log('👥 커뮤니티 그룹 생성 중...');
    await CommunityGroup.insertMany([
      {
        name: '서울 국제학생 네트워크',
        description: '서울권 대학 유학생 모임 · 정기 오프라인 커피챗 · 정보 공유.',
        category: '일반',
        members: 5230,
        tags: ['Seoul', 'Students', 'Social'],
      },
      {
        name: '몽골 유학생 in Korea',
        description: '몽골어·한국어 병행 안내, 장학·비자 팁을 나눕니다.',
        category: '국적',
        members: 1890,
        tags: ['Mongolian', '비자', '친목'],
      },
      {
        name: 'Tech Students Korea',
        description: '해커톤, 스터디, 채용 설명회 정보.',
        category: '관심사',
        members: 3200,
        tags: ['Tech', 'Programming', 'Career'],
      },
      {
        name: '부산·경남 유학생',
        description: '지역 생활, 알바, 주거 정보.',
        category: '지역',
        members: 980,
        tags: ['Busan', '생활', '주거'],
      },
      {
        name: '여성 유학생 안전·멘탈 케어',
        description: '심리 상담 리소스, 야간 귀가, 신고 절차 공유.',
        category: '지원',
        members: 2100,
        tags: ['Safety', 'Wellbeing', 'Support'],
      },
    ]);

    console.log('✅ 커뮤니티 그룹 생성 완료');

    console.log('💼 프리랜서 그룹 생성 중...');
    await FreelancerGroup.insertMany([
      {
        name: 'KO↔EN 번역·통역',
        description: '학술·비즈니스 문서, 행사 통역.',
        category: '번역',
        members: 2100,
        jobsPosted: 48,
      },
      {
        name: '웹·앱 개발 프리랜서',
        description: 'React, Next.js, 모바일 소규모 프로젝트.',
        category: '개발',
        members: 3800,
        jobsPosted: 132,
      },
      {
        name: '콘텐츠·SNS 마케팅',
        description: '쇼츠, 블로그, 인플루언서 협찬.',
        category: '마케팅',
        members: 1650,
        jobsPosted: 71,
      },
      {
        name: '과외·튜터링 매칭',
        description: 'TOPIK, 수능 영어, 코딩 입시.',
        category: '교육',
        members: 2900,
        jobsPosted: 95,
      },
      {
        name: '디자인·브랜딩',
        description: '로고, PPT, 포트폴리오 리뷰.',
        category: '디자인',
        members: 1340,
        jobsPosted: 56,
      },
    ]);

    console.log('✅ 프리랜서 그룹 생성 완료');

    console.log('📖 한국 유학 정보 생성 중...');
    await StudyInfo.insertMany([
      {
        category: 'visa',
        title: 'D-2 유학비자 준비 체크리스트',
        content:
          '1) 표준입학허가서(CoS) 및 입학허가서\n2) 재정증명(본인·부모 등) — 금액은 교육부·대학 기준 확인\n3) 여권, 사진, 신원보증서/수수료\n4) 체류지 증빙(기숙사 계약 등)\n5) 건강검진(요청 시)\n\n출입국 사무소 방문 전 온라인 예약(하이코리아)을 확인하세요. 서류는 최신 양식을 대학 국제처에서 받는 것이 안전합니다.',
        tags: ['D-2', '서류', '체크리스트'],
      },
      {
        category: 'visa',
        title: '비자 갱신·출국 재입국 시 주의',
        content:
          '학점 미달·휴학은 체류 자격에 영향을 줄 수 있습니다. 갱신은 만료 4개월 전부터 준비하는 것을 권장합니다. 여행 시 재입국 허가(필요한 경우)와 비자 유효기간을 반드시 확인하세요.',
        tags: ['갱신', '재입국', '체류'],
      },
      {
        category: 'housing',
        title: '기숙사 vs 원룸 vs 쉐어',
        content:
          '기숙사: 규칙이 명확하고 커뮤니티 형성에 유리. 원룸: 사생활과 요리 자유. 쉐어: 비용 절감 but 룸메이트 규칙 합의가 중요합니다. 계약 시 특약(수선, 해지 통지 기간)을 꼭 기입하세요.',
        tags: ['기숙사', '원룸', '쉐어'],
      },
      {
        category: 'housing',
        title: '전입신고와 확정일자',
        content:
          '전입신고는 주민센터 또는 온라인으로 가능합니다. 확정일자를 받으면 보증금 우선변제권이 강화됩니다. 중개수수료 상한과 계약서 필수 기재 사항을 확인하세요.',
        tags: ['전입신고', '확정일자', '계약'],
      },
      {
        category: 'hospital',
        title: '국민건강보험 가입',
        content:
          '유학생은 입국 후 일정 기간 내 지역 건강보험에 가입합니다. 외국인건강보험과 병행 여부는 학교 안내를 따르세요. 응급실은 중증도에 따라 진료비가 달라질 수 있습니다.',
        tags: ['보험', '건강', '응급'],
      },
      {
        category: 'hospital',
        title: '병원 예약·진료 흐름',
        content:
          '1차는 보통 가까운 의원(내과·이비인후과)에서 시작합니다. 대학병원은 예약제가 일반적입니다. 증상을 간단한 한국어/영어로 메모해 가면 진료에 도움이 됩니다.',
        tags: ['진료', '예약', '의원'],
      },
      {
        category: 'lifeTips',
        title: '교통·결제 앱',
        content:
          'T-money·Cashbee 교통카드는 지하철·버스·택시에 사용 가능합니다. 카카오페이·토스 등 간편결제는 많은 매장에서 쓰입니다. 해외 카드는 가맹점마다 제한이 있을 수 있습니다.',
        tags: ['교통', '결제', '앱'],
      },
      {
        category: 'lifeTips',
        title: '은행 계좌 개설',
        content:
          '여권, 외국인등록증(또는 유학 비자 관련 서류), 학생증·재학증명을 준비하세요. 비대면 앱 가입 한도와 오프라인 지점 요구 서류가 다를 수 있습니다.',
        tags: ['은행', '계좌', '서류'],
      },
    ]);

    console.log('✅ 한국 유학 정보 생성 완료');

    console.log('\n🎉 시드 데이터 삽입 완료!');
    console.log('\n테스트 계정:');
    console.log('  멘티: mentee@example.com');
    console.log('  멘토: mentor@example.com');
    console.log('  추가 멘토: sarah.mentor@example.com, minjun@example.com, yuki@example.com, housing@example.com');
    console.log('  비밀번호: SEED_USER_PASSWORD 환경변수 값');
    console.log('  관리자 계정은 시드에서 생성하지 않습니다. scripts/create-admin.ts를 사용하세요.');

    await mongoose.disconnect();
    console.log('\n👋 MongoDB 연결 종료');
  } catch (error) {
    console.error('❌ 시드 데이터 삽입 실패:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
