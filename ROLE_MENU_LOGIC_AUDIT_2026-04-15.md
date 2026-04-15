# 역할·메뉴·권한 로직 감사 문서 (2026-04-15)

이 문서는 현재 코드 기준으로 **학생/멘토/관리자 UX와 실제 권한 로직이 어떻게 매핑되는지**를 정리한 운영 기준 문서다.  
목표는 기능 추가가 아니라, 지금 상태를 정확히 파악하고 이후 리팩터링/정책 수정을 위한 기준선을 만드는 것이다.

---

## 1) 현재 라우트 구조 핵심

### 공개/공통 영역
- `app/[locale]/page.tsx`
- `app/[locale]/mentors/*`
- `app/[locale]/lectures/*`
- `app/[locale]/community/*`
- `app/[locale]/freelancers/*`
- `app/[locale]/study-in-korea/*`

### 개인 영역 (My Space)
- `app/[locale]/my/layout.tsx` 아래:
  - `my/dashboard`, `my/profile`, `my/schedule`, `my/courses`, `my/receipts`
  - `my/activity`, `my/notifications`, `my/inquiries`
  - `my/community`, `my/freelancers`, `my/sessions`, `my/enrollments`
  - `my/lectures` (멘토/관리자 메뉴 노출)

### `dashboard` / `profile` 중복처럼 보이는 이유
- `app/[locale]/my/dashboard/page.tsx`는 현재 `app/[locale]/dashboard/page.tsx`를 재export한다.
- `app/[locale]/my/profile/page.tsx`는 현재 `app/[locale]/profile/page.tsx`를 재export한다.
- 즉 **기능 로직 파일은 1개**이고, URL만 `/dashboard`와 `/my/dashboard`(또는 `/profile`, `/my/profile`)로 나뉜 상태다.
- `/my/*` 경로는 `my/layout.tsx`를 통해 사이드바 UI를 붙이는 역할도 있으므로, 단순 삭제 시 동선이 깨질 수 있다.

### 관리자 영역
- `app/[locale]/admin/dashboard/page.tsx`
- `app/[locale]/admin/users/page.tsx`
- `app/[locale]/admin/moderation/page.tsx`

---

## 2) 역할별 메뉴 정리

## 학생(mentee)

**헤더/공개 메뉴**
- 멘토, 강의, 커뮤니티, 프리랜서, 유학 정보

**마이 스페이스**
- 대시보드, 나의 정보, 일정·달력, 내 강의·학습, 영수증·결제
- 활동·게시, 알림, 문의·지원

**학생 주 기능**
- 멘토 탐색/상담 예약, 강의 수강신청
- 커뮤니티/프리랜서 그룹 가입
- 그룹 글·댓글 작성
- 개인 일정/생활 가계 입력

## 멘토(mentor)

학생 기능 + 아래 추가:
- `my/lectures` (본인 강의 관리)
- `mentor/lectures/new` (강의 개설)
- 대시보드 멘토 모드 카드(강의/프로필/운영 링크)

## 관리자(admin)

관리자 전용:
- `admin/dashboard`: 지표 및 운영 진입
- `admin/users`: 사용자/권한 관리
- `admin/moderation`: 멘토 승인 + 그룹 게시글 관리(삭제/사유)

참고:
- 현재 헤더에는 `admin/dashboard`, `admin/moderation`만 강하게 드러나며, `admin/users`는 대시보드 내부 링크로 접근하는 흐름이다.

---

## 3) 권한 체크 지점 (클라이언트 vs API)

## 클라이언트 가드
- `my/*` 대부분: 로그인 없으면 `/login` 이동
- `admin/*`: `user.role !== admin`이면 `/login` 이동
- `mentor/lectures/new`: UI에서 mentor/admin만 허용

## API 가드 (실권한)
- 공통 인증: `authenticateRequest`, `authenticateRequestDb`
- 관리자 API: `api/admin/*`에서 role=admin 필수
- 강의 생성/내 강의 API: `canManageOwnLectures` 사용
  - DB role이 mentor/admin이거나
  - 승인된 mentor profile이면 허용

핵심 포인트:
- UI 메뉴/페이지 가드와 API 실권한이 일부 케이스에서 완전히 동일하지 않을 수 있다.

---

## 4) 메뉴 ↔ API ↔ 데이터 모델 매핑

## 대시보드/내 학습
- 화면: `dashboard`, `my/courses`, `my/sessions`, `my/enrollments`
- API: `api/lectures*`, `api/enrollments*`, `api/sessions*`
- 모델: `Lecture`, `Enrollment`, `Session`, `Mentor`, `User`

## 커뮤니티/프리랜서
- 화면: `community/*`, `freelancers/*`, `my/community`, `my/freelancers`, `my/activity`
- API:
  - 가입: `api/community/[id]/join`, `api/freelancers/[id]/apply`
  - 내 신청: `api/community-memberships`, `api/freelancer-applications`
  - 글/댓글: `api/community/[id]/posts*`, `api/freelancers/[id]/posts*`
- 모델:
  - 그룹: `CommunityGroup`, `FreelancerGroup`
  - 가입: `CommunityMembership`, `FreelancerApplication`
  - 피드: `ChannelPost`, `ChannelComment`

## 운영/신고성 조치
- 화면: `admin/moderation`, `my/notifications`
- API:
  - 검수/변경: `api/admin/moderation`
  - 게시글 관리: `api/admin/channel-posts*`
  - 사용자 알림: `api/me/notifications`
- 모델: `Mentor`, `CommunityMembership`, `FreelancerApplication`, `UserNotification`

## 문의/지원
- 화면: `my/inquiries`
- API: `api/inquiries*`
- 모델: `Inquiry`

---

## 5) 현재 정책 상태 (중요)

## 그룹 가입/참여
- 커뮤니티 가입은 즉시 `approved` 처리
- 프리랜서 참여는 즉시 `accepted` 처리
- 의미: "승인 대기 후 글 작성" 모델이 아니라 "즉시 참여 + 사후 운영 관리" 모델

## 게시글 정책
- 커뮤니티/프리랜서 글은 즉시 게시
- 관리자는 게시글 삭제 가능
- 삭제 시 작성자에게 사유 포함 알림 생성

---

## 6) 현재 불일치/리스크

1. **`my/inquiries` 메뉴와 API 권한 정책 충돌 가능성**
- 메뉴는 마이 스페이스 공통 노출
- API는 관리자 사용 제한 정책이 있어 admin 계정에서 UX 혼선 가능

2. **멘토 권한 판정 기준 이원화**
- 일부는 `user.role` 중심(UI)
- 일부는 `mentor profile 승인 상태`까지 포함(API)
- 기준 통일 문서가 없으면 버그 재발 가능

3. **검수 큐 의미 축소**
- 커뮤니티/프리랜서가 즉시 승인 구조이므로
- `admin/moderation`의 pending 처리 탭은 점차 비게 됨
- 대신 게시글 관리 탭의 비중이 커지는 구조

---

## 7) 권장 운영 기준 (문서 합의용)

아래를 팀 정책으로 확정하면 이후 구현 정합성이 좋아진다.

1) **권한 단일 기준**
- "UI/라우팅/API 모두 동일한 권한 함수"를 사용하도록 통일

2) **그룹 운영 기준**
- 가입은 즉시 허용, 게시는 즉시 공개
- 운영 개입은 게시글 단위(삭제 + 사유 통지)

3) **검수 큐 역할 재정의**
- 멘토 승인 중심으로 유지할지
- 아니면 운영 모니터링(게시글/신고) 중심으로 전환할지 결정

---

## 8) 다음 단계 (사용자 수정용)

사용자(기획자) 검토 시 이 문서에서 먼저 결정하면 좋다.

- 역할별 메뉴에서 "보여줄 메뉴/숨길 메뉴" 확정
- 멘토 권한 판정 기준(role vs 승인상태) 확정
- admin moderation 페이지의 최종 목적(승인 큐 vs 운영 센터) 확정
- 문의 메뉴의 admin 노출 여부 확정

위 결정이 끝나면, 그 다음 단계에서 코드 반영 시 변경 범위를 최소화할 수 있다.

