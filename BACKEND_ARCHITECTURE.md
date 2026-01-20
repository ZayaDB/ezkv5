# MentorLink 백엔드 아키텍처 제안

## 📊 현재 상황 분석

**프론트엔드**: Next.js 14 (App Router) + TypeScript
**현재 데이터**: 로컬 스토리지 기반 (Mock)
**필요한 엔티티**:
- User (멘토/멘티/관리자)
- Mentor
- Lecture
- CommunityGroup
- FreelancerGroup
- StudyInfo
- Session (멘토링 세션)
- Message (메시지)
- Review (리뷰)

---

## 🎯 추천 옵션 3가지

### 옵션 1: **Supabase** (가장 추천 ⭐⭐⭐⭐⭐)

**왜 추천?**
- ✅ **무료 티어 제공** (개발/소규모 프로덕션 충분)
- ✅ **인증 내장** (이메일, 소셜 로그인)
- ✅ **PostgreSQL 데이터베이스** (강력하고 안정적)
- ✅ **실시간 기능** (메시지, 알림)
- ✅ **파일 스토리지** (프로필 이미지, 강의 자료)
- ✅ **자동 API 생성** (REST + GraphQL)
- ✅ **Next.js 통합 쉬움**

**구조:**
```
프론트엔드 (Next.js)
    ↓
Supabase Client (JavaScript SDK)
    ↓
Supabase (PostgreSQL + Auth + Storage + Realtime)
```

**비용:**
- 무료: 500MB DB, 1GB Storage, 50,000 월간 활성 사용자
- Pro: $25/월 (8GB DB, 100GB Storage)

**적합한 경우:**
- 빠른 프로토타입 → 프로덕션 전환
- 소규모~중규모 서비스
- 실시간 기능 필요 (메시지, 알림)
- 별도 서버 관리 불필요

---

### 옵션 2: **Next.js API Routes + Prisma + PostgreSQL** (전통적 방식 ⭐⭐⭐⭐)

**왜 추천?**
- ✅ **완전한 제어권** (모든 것을 직접 관리)
- ✅ **Prisma ORM** (타입 안전, 마이그레이션 쉬움)
- ✅ **PostgreSQL** (강력한 관계형 DB)
- ✅ **Next.js와 완벽 통합** (같은 프로젝트)
- ✅ **확장성 좋음**

**구조:**
```
프론트엔드 (Next.js Pages)
    ↓
Next.js API Routes (/app/api/*)
    ↓
Prisma Client
    ↓
PostgreSQL (로컬 또는 클라우드: Railway, Neon, Supabase)
```

**비용:**
- Railway: $5/월 (1GB DB)
- Neon: 무료 티어 (3GB)
- Supabase: 무료 티어 (PostgreSQL만 사용)

**적합한 경우:**
- 완전한 제어가 필요한 경우
- 복잡한 비즈니스 로직
- 커스텀 인증 시스템
- 장기적으로 확장 계획

---

### 옵션 3: **Next.js API Routes + MongoDB + Mongoose** (NoSQL 선호 시 ⭐⭐⭐)

**왜 추천?**
- ✅ **유연한 스키마** (변경이 쉬움)
- ✅ **MongoDB Atlas 무료 티어** (512MB)
- ✅ **JSON 형태로 직관적**
- ✅ **수평 확장 용이**

**구조:**
```
프론트엔드 (Next.js Pages)
    ↓
Next.js API Routes (/app/api/*)
    ↓
Mongoose ODM
    ↓
MongoDB Atlas (클라우드)
```

**비용:**
- MongoDB Atlas: 무료 티어 (512MB)
- M0: 무료 (512MB, 공유 클러스터)

**적합한 경우:**
- NoSQL 선호
- 유연한 데이터 구조 필요
- 빠른 프로토타이핑

---

## 🏆 최종 추천: **Supabase**

### 이유:
1. **개발 속도**: 인증, DB, 스토리지, 실시간 기능이 모두 내장
2. **비용 효율**: 무료 티어로 시작 가능
3. **운영 편의성**: 서버 관리 불필요
4. **확장성**: 프로덕션까지 충분
5. **Next.js 통합**: 공식 지원, 예제 많음

---

## 📐 Supabase 아키텍처 상세

### 1. 데이터베이스 스키마 (PostgreSQL)

```sql
-- Users 테이블 (Supabase Auth와 연동)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('mentee', 'mentor', 'admin')),
  avatar_url TEXT,
  locale TEXT DEFAULT 'kr',
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Mentors 테이블
CREATE TABLE mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  languages TEXT[] DEFAULT '{}',
  specialties TEXT[] DEFAULT '{}',
  price DECIMAL(10,2) DEFAULT 0,
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'limited', 'unavailable')),
  photo_url TEXT,
  verified BOOLEAN DEFAULT false,
  bio TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lectures 테이블
CREATE TABLE lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  instructor_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('online', 'offline')),
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration TEXT NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions 테이블 (멘토링 세션)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES mentors(id),
  mentee_id UUID REFERENCES profiles(id),
  date TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL, -- 분 단위
  type TEXT NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages 테이블
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id UUID REFERENCES profiles(id),
  to_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews 테이블
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES mentors(id),
  mentee_id UUID REFERENCES profiles(id),
  session_id UUID REFERENCES sessions(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Community Groups 테이블
CREATE TABLE community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  members_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Freelancer Groups 테이블
CREATE TABLE freelancer_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image_url TEXT,
  members_count INTEGER DEFAULT 0,
  jobs_posted INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Study Info 테이블
CREATE TABLE study_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('visa', 'housing', 'hospital', 'lifeTips')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. 인증 플로우

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 회원가입
async function signUp(email: string, password: string, name: string, role: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role }
    }
  })
  return { data, error }
}

// 로그인
async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}
```

### 3. API 구조

```
app/api/
├── auth/
│   ├── signup/route.ts
│   ├── login/route.ts
│   └── logout/route.ts
├── mentors/
│   ├── route.ts (GET: 목록, POST: 생성)
│   └── [id]/route.ts (GET: 상세, PUT: 수정, DELETE: 삭제)
├── lectures/
│   ├── route.ts
│   └── [id]/route.ts
├── sessions/
│   ├── route.ts
│   └── [id]/route.ts
├── messages/
│   ├── route.ts
│   └── [id]/route.ts
└── chat/
    └── route.ts (기존 유지)
```

---

## 🚀 구현 단계별 가이드

### Phase 1: Supabase 설정 (1일)

1. **Supabase 프로젝트 생성**
   - https://supabase.com 가입
   - 새 프로젝트 생성
   - Database URL, Anon Key 복사

2. **환경 변수 설정**
   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Supabase 클라이언트 설치**
   ```bash
   npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
   ```

4. **스키마 생성**
   - Supabase Dashboard → SQL Editor
   - 위의 SQL 스크립트 실행

### Phase 2: 인증 마이그레이션 (2일)

1. **기존 localStorage 인증 → Supabase Auth로 교체**
2. **회원가입/로그인 API 구현**
3. **프로필 생성 로직 추가**

### Phase 3: 데이터 API 구현 (3-5일)

1. **Mentors API** (CRUD)
2. **Lectures API** (CRUD)
3. **Sessions API** (예약 시스템)
4. **Messages API** (실시간 메시징)
5. **Reviews API**

### Phase 4: 파일 업로드 (1일)

1. **Supabase Storage 설정**
2. **이미지 업로드 API**
3. **프로필/강의 이미지 업로드**

### Phase 5: 실시간 기능 (1-2일)

1. **메시지 실시간 업데이트**
2. **세션 알림**

---

## 💰 비용 비교

| 옵션 | 무료 티어 | 유료 시작 | 확장성 |
|------|----------|----------|--------|
| Supabase | 500MB DB, 1GB Storage | $25/월 | ⭐⭐⭐⭐⭐ |
| Prisma + PostgreSQL | DB 호스팅 필요 | $5-10/월 | ⭐⭐⭐⭐ |
| MongoDB Atlas | 512MB | $9/월 | ⭐⭐⭐⭐ |

---

## 📝 다음 단계

1. **Supabase 프로젝트 생성** (지금 바로 가능)
2. **스키마 설계 검토** (위의 SQL 수정/보완)
3. **인증 마이그레이션** (localStorage → Supabase)
4. **API 엔드포인트 구현** (단계별로)

원하시면 바로 Supabase 설정부터 시작할 수 있습니다! 🚀

