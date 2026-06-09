# MentorLink Master Plan v2 — 유학생 생활 비서 플랫폼

> **v2 전환 (2026-06)**  
> 포지셔닝: 멘토+강의 플랫폼 → **유학생 생활 비서 플랫폼**  
> 기존 기능(강의·멘토·커뮤니티·관리자)은 **삭제하지 않고** UX·IA·사용자 흐름만 개편

---

## 1) 핵심 철학

**"정보를 보여주는 플랫폼이 아니라, 사용자가 다음 행동을 할 수 있도록 도와주는 플랫폼"**

- 사용자는 강의를 보러 오는 것이 아니라 **한국 생활 문제를 해결**하러 온다
- AI 비서는 답변이 아니라 **행동 생성** (Roadmap · 일정 · 멘토 연결)
- Home은 SNS 피드가 아닌 **상태 기반 Control Center**

한 문장 정의:
**"유학생의 비자·일정·생활을 비서처럼 관리하고, 필요할 때 멘토·강의로 연결하는 플랫폼"**

---

## 2) 로그인 후 IA (5탭)

| 탭 | 경로 | 역할 |
|----|------|------|
| Home | `/home` | Control Center — 상태·알림·로드맵·오늘 일정·추천 액션 |
| Assistant | `/assistant` | Action 기반 AI 비서 |
| Calendar | `/calendar` → `/my/schedule` | 생활 운영 캘린더 (수업·알바·월세·비자·로드맵) |
| Roadmap | `/roadmap` | 목표 기반 행동 관리 |
| My | `/my/*` | 프로필·수강·결제·멘토 신청·문의 |

**멘토 스튜디오**: 승인된 멘토는 `/my/lectures`, `/my/dashboard`(멘토 모드) 기존 유지

---

## 3) 회원가입 (v2)

- 가입 시 역할 선택 **제거** → 모든 사용자 `user`
- 멘토는 가입 후 **신청 → 관리자 승인**
- **순서**: ① 한국 거주 여부 → ② (거주 시) 비자 종류·만료일 → ③ 기본 정보 → 저장
- 한국 **미거주** 시 비자 필드 **표시·저장 안 함**

### User Profile 필드

| 필드 | 설명 |
|------|------|
| nationality | 국적 |
| university | 학교 |
| region | 거주 지역 |
| visaType | 비자 종류 (한국 거주 시) |
| visaExpireDate | 비자 만료일 |
| countryStatus | `unknown` \| `planning_arrival` \| `residing_korea` \| `leaving_korea` \| `graduated_staying` \| `abroad` |
| onboardingStatus | `pending` \| `profile_complete` \| `completed` |

### 역할

| role | 설명 |
|------|------|
| user | 기본 (레거시 `mentee`는 API에서 `user`로 정규화) |
| mentor | 관리자 승인 후 |
| admin | 운영 |

---

## 4) Home Control Center 섹션

1. **사용자 상태 카드** — 이름·학교·국적·비자·D-Day
2. **긴급 알림** — 비자 D-30 등 (`UserAlert` + 자동 생성)
3. **진행 중 Roadmap** — 진행률·다음 단계·계속하기
4. **오늘 일정** — 캘린더·세션·로드맵 일정 통합
5. **추천 액션** — 외국인등록·비자 연장·보험 확인 등

---

## 5) Roadmap 시스템

### 모델

- **Roadmap**: id, userId, title, description, progress, priority, dueDate, status, templateKey
- **RoadmapStep**: id, roadmapId, title, description, completed, dueDate, sortOrder, active

### 템플릿 (P0)

- `visa_extension` — 비자 연장 준비
- `settling_korea` — 한국 정착
- `moving` — 이사 준비
- `job_prep` — 취업 준비
- `d10_prep` — D-10 준비

### 기능

- 진행률 자동 계산
- 단계 완료 시 다음 단계 활성화
- 로드맵 일정 → Calendar 연동 (`category: roadmap`)

---

## 6) Assistant (Action 기반)

- 단순 챗봇 금지 → **create_roadmap**, **open_calendar**, **open_mentors** 액션
- API: `POST /api/assistant/actions` (suggest / execute)
- Chat API: 의도 감지 시 assistant 모드 응답

---

## 7) Calendar 카테고리 (확장)

`class` | `parttime` | `rent` | `insurance` | `visa` | `roadmap` | `general` (+ 레거시 personal/work/health/other)

`roadmapId`, `roadmapStepId` 선택 연동

---

## 8) API (v2 추가·변경)

### Auth

| Method | Path | 변경 |
|--------|------|------|
| POST | `/api/auth/signup` | role 제거, 프로필 필드 추가, 자동 로그인 토큰 |
| GET/PATCH | `/api/auth/me` | 프로필·비자 필드 확장 |
| POST | `/api/auth/switch-role` | `user` \| `mentor` |

### Home & Alerts

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/me/home` | Control Center 데이터 |
| GET/PATCH | `/api/me/alerts` | 긴급 알림 목록·해제 |

### Roadmap

| Method | Path | 설명 |
|--------|------|------|
| GET/POST | `/api/roadmaps` | 목록·생성(템플릿/커스텀) |
| GET/PATCH/DELETE | `/api/roadmaps/[id]` | 상세·수정·삭제 |
| PATCH | `/api/roadmaps/[id]/steps/[stepId]` | 단계 완료·수정 |

### Assistant

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/assistant/actions` | 액션 제안·실행 |

### 기존 유지

강의·멘토·수강·커뮤니티·프리랜서·관리자·결제 Mock 등 **전부 유지**

---

## 9) 비로그인 헤더

홈 · 로드맵 · 비서 · 멘토 · 한국생활 | 로그인 · 시작하기

---

## 10) 이번 단계 개발 금지

실시간 멘토 채팅 · 부동산 · 중고거래 · 자체 구인구직 · SNS 피드 · 고급 가계부

---

## 11) 우선순위

### P0 (진행 중)

1. ✅ 회원가입 구조 수정 (`user` 단일)
2. ✅ 사용자 상태 저장 (User 필드 확장)
3. ✅ Home Control Center (`/home`, `/api/me/home`)
4. ✅ Roadmap 시스템 (모델·API·UI)
5. ✅ Calendar 연동 (카테고리 확장·로드맵 링크)
6. ✅ Assistant UX (액션 기반)
7. ⏳ Mentor 전환 구조 (기존 신청 플로우 유지, UI 정리)

### P1

- 문서함 (Document Vault)
- 가이드 콘텐츠 → Roadmap Step 내 연동
- Roadmap AI 자동 생성 고도화

### P2

- 커뮤니티 확장 · 추천 시스템 · 제휴

---

## 12) 구현 로그 (2026-06-08)

### 데이터 모델

- `User`: nationality, university, region, visaType, visaExpireDate, countryStatus, onboardingStatus, role `user` 추가
- `Roadmap`, `RoadmapStep`, `UserAlert` 신규
- `PersonalCalendarEvent`: 카테고리 확장, roadmapId/roadmapStepId

### API

- signup/me/home/alerts/roadmaps/assistant/actions 구현
- chat API assistant 모드 연동

### UI

- 회원가입 3단계
- `/home`, `/roadmap`, `/assistant`, `/calendar`
- 하단 네비 (모바일)
- 헤더 메뉴 비서 플랫폼 IA로 변경

### 마이그레이션

- DB `mentee` 역할 문서는 API 응답 시 `user`로 정규화
- 신규 가입은 `role: user` 고정

---

## 13) 다음 작업

1. My Page IA 개편 (내 정보 / 내 활동 / 커뮤니티 활동 / 문의 / 멘토)
2. 온보딩 90초 — 가입 직후 첫 Roadmap 자동 제안
3. `docs/API_SPEC.md` v2 스키마 문서화
4. 대시보드 → Home 데이터 소스 통합
5. i18n 미번역·문구 교정
