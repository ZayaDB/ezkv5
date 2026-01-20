# MongoDB 로컬 설정 가이드

## 📋 현재 설정

- **호스트**: localhost:27017
- **데이터베이스**: mentorlink
- **MongoDB 버전**: 7.0.11 Community

## 🚀 시작하기

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
MONGODB_URI=mongodb://localhost:27017/mentorlink
JWT_SECRET=your-super-secret-jwt-key-change-in-production
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. 패키지 설치

```bash
npm install
```

설치되는 패키지:
- `mongoose`: MongoDB ODM
- `bcryptjs`: 비밀번호 해싱
- `jsonwebtoken`: JWT 토큰 생성/검증

### 3. 데이터베이스 연결 확인

MongoDB가 실행 중인지 확인하세요:

```bash
# Windows
net start MongoDB

# 또는 MongoDB Compass에서 확인
```

### 4. 시드 데이터 삽입 (선택사항)

초기 테스트 데이터를 삽입하려면:

```bash
npm run seed
```

이 명령어는 다음을 생성합니다:
- 테스트 사용자 3명 (멘티, 멘토, 관리자)
- 샘플 멘토 프로필
- 샘플 강의
- 샘플 커뮤니티 그룹
- 샘플 프리랜서 그룹
- 샘플 한국 유학 정보

**테스트 계정:**
- 멘티: `mentee@example.com` / `password123`
- 멘토: `mentor@example.com` / `password123`
- 관리자: `admin@example.com` / `password123`

## 📊 데이터베이스 구조

### Collections

1. **users** - 사용자 정보
2. **mentors** - 멘토 프로필
3. **lectures** - 강의 정보
4. **sessions** - 멘토링 세션
5. **messages** - 메시지
6. **reviews** - 리뷰
7. **communitygroups** - 커뮤니티 그룹
8. **freelancergroups** - 프리랜서 그룹
9. **studyinfos** - 한국 유학 정보

## 🔌 API 엔드포인트

### 인증
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인

### 멘토
- `GET /api/mentors` - 멘토 목록 조회
- `GET /api/mentors/[id]` - 멘토 상세 조회
- `POST /api/mentors` - 멘토 프로필 생성 (인증 필요)
- `PUT /api/mentors/[id]` - 멘토 프로필 수정 (인증 필요)
- `DELETE /api/mentors/[id]` - 멘토 프로필 삭제 (인증 필요)

## 🧪 테스트 방법

### 1. 회원가입 테스트

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "테스트 사용자",
    "role": "mentee",
    "locale": "kr"
  }'
```

### 2. 로그인 테스트

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. 멘토 목록 조회

```bash
curl http://localhost:3000/api/mentors
```

### 4. 인증이 필요한 API 호출

```bash
curl -X POST http://localhost:3000/api/mentors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "비자 전문 상담사",
    "location": "서울",
    "bio": "10년 경력의 비자 전문가입니다.",
    "specialties": ["비자 신청", "서류 준비"]
  }'
```

## 🔍 MongoDB Compass에서 확인

1. MongoDB Compass 실행
2. 연결: `mongodb://localhost:27017`
3. `mentorlink` 데이터베이스 선택
4. Collections 확인

## 📝 다음 단계

1. ✅ MongoDB 연결 설정 완료
2. ✅ 기본 모델 생성 완료
3. ✅ 인증 API 구현 완료
4. ✅ 멘토 API 구현 완료
5. ⏳ 강의 API 구현 필요
6. ⏳ 세션 API 구현 필요
7. ⏳ 메시지 API 구현 필요
8. ⏳ 프론트엔드 연동 필요

## 🐛 문제 해결

### MongoDB 연결 오류

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**해결 방법:**
1. MongoDB 서비스가 실행 중인지 확인
2. 포트가 27017인지 확인
3. 방화벽 설정 확인

### 모델 중복 정의 오류

```
Cannot overwrite model User once compiled
```

**해결 방법:**
- 개발 모드에서 Hot Reload 시 발생할 수 있음
- 서버 재시작으로 해결

## 💡 팁

- MongoDB Compass를 사용하면 데이터를 시각적으로 확인할 수 있습니다
- 인덱스가 자동으로 생성되어 검색 성능이 향상됩니다
- `lean()` 메서드를 사용하면 Mongoose 문서 대신 일반 객체를 반환하여 성능이 향상됩니다

