# MentorLink 상태 점검 리포트 (2026-04-13)

이 문서는 `PROJECT_MASTER_PLAN.md`를 기준으로, 현재 코드 기준의 진행 상태를 점검하고
오늘 해야 할 작업과 전체 마무리 일정을 제시한다.

---

## 1) 한눈에 보는 현재 상태

- 제품 단계: **MVP 실행 단계 (핵심 사용자 플로우 실동작)**
- 백엔드 완성도: **약 65%**
- 프론트 완성도: **약 75%**
- 디자인 시스템 완성도: **약 55%**
- 다국어(i18n) 완성도: **약 70%**
- 운영 준비도(결제/정산/웹훅/모니터링): **약 25%**

> 결론: 주요 신청/예약/검수 플로우는 실동작한다. 결제/정산/영수증이 붙으면 수익화 MVP에 근접한다.

### 1.1 금일 구현 업데이트 요약

- 역할 전환 API + 대시보드 모드 전환 실동작
- 수강 신청 API + 내 수강 관리(완료/취소 상태 변경)
- 세션 예약 API + 내 세션 관리(완료/취소 상태 변경)
- 커뮤니티 가입 신청 + 프리랜서 지원 신청 API 실동작
- 관리자 검수 큐(조회/승인/거절) 구현
- 내 활동 페이지군(`내 수강`, `내 세션`, `내 커뮤니티`, `내 프리랜서`) 구현
- 헤더에 내 활동 메뉴 연결
- 공통 상태 UI 컴포넌트(`StatusBadge`, `LoadingState`) 적용

---

## 2) 백엔드 현재 구현 상태

## 2.1 구현된 API

- 인증
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `PATCH /api/auth/me`
- 컨텐츠 조회
  - `GET /api/mentors`, `GET /api/mentors/[id]`
  - `GET /api/lectures`, `GET /api/lectures/[id]`
  - `GET /api/community`, `GET /api/community/[id]`
  - `GET /api/freelancers`, `GET /api/freelancers/[id]`
  - `GET /api/study-info`, `GET /api/study-info/[id]`
- 일부 관리/관리자
  - `POST /api/mentors` (생성)
  - `PUT /api/mentors/[id]`, `DELETE /api/mentors/[id]`
  - `GET /api/admin/stats`
  - `GET /api/admin/users`, `DELETE /api/admin/users`
- AI
  - `POST /api/chat`

## 2.2 데이터 모델

모델은 기본 골격이 존재함:
- `User`, `Mentor`, `Lecture`, `Session`, `Message`, `Review`,
  `CommunityGroup`, `FreelancerGroup`, `StudyInfo`

## 2.3 아직 없는 핵심 API (수익/운영 관점에서 필수)

- 수강신청/등록
  - `POST /api/enrollments`, `GET /api/enrollments/me`
- 결제/환불/영수증
  - `POST /api/payments/checkout`
  - `POST /api/payments/webhook`
  - `GET /api/payments/me`
  - `GET /api/receipts/[id]`
- 역할 전환
  - `POST /api/auth/switch-role` (student <-> mentor mode)
- 라이브 webinar
  - `POST /api/webinars`, `GET /api/webinars`, `POST /api/webinars/[id]/join`
- 프리랜서 매칭 실동작
  - 공고 등록/지원/상태 변경 API

## 2.4 백엔드 리스크

- 결제 및 정산 도메인 부재 -> 매출 전환 불가
- Enrollment 부재 -> 강의 구매 이후 상태 추적 불가
- Session/Message 모델은 있으나 사용자 플로우와 API가 충분히 연결되지 않음

---

## 3) 프론트 현재 구현 상태

## 3.1 구현된 화면 라우트

- 공개/기본: 홈, 멘토 목록/상세, 강의 목록/상세, 커뮤니티 목록/상세, 프리랜서 목록/상세, 유학정보, 로그인/회원가입
- 사용자: `profile` 페이지
- 관리자: `admin/dashboard`, `admin/users`

## 3.2 현재 강점

- 주요 페이지 골격과 비주얼은 이미 존재
- API 연동된 조회형 화면 다수
- 관리자 통계 화면 1차 동작
- 챗봇 플로팅 UI와 API 연동 존재

## 3.3 미완성/가짜 동작 구간

- `dashboard`는 실제 대시보드가 아니라 `profile`로 리다이렉트
- 여러 핵심 CTA가 `alert("준비 중")` 상태
  - 멘토 상세: 세션 예약
  - 강의 상세: 수강신청/결제
  - 커뮤니티/프리랜서 상세: 가입/신청
- `profile` 내부에는 `Mock 데이터` 영역이 큼

---

## 4) 디자인/화면 반영 상태

## 4.1 반영된 것

- 컬러/그라데이션/카드 스타일은 전반적으로 존재
- 랜딩 및 상세 페이지의 1차 비주얼 구성 완료

## 4.2 문제

- 공통 UI 컴포넌트 사용률이 낮음(페이지마다 직접 스타일 작성)
- 같은 역할의 버튼/카드/탭이 페이지마다 다른 룩앤필
- 대시보드 화면 구조 표준(학생/멘토 공통 템플릿) 미정

## 4.3 판단

- "이쁜 화면 일부 있음" 단계
- "디자인 시스템으로 통일됨" 단계는 아님

---

## 5) 다국어(i18n) 상태 점검

## 5.1 좋은 점

- `kr/en/mn` 메시지 파일 존재
- locale 라우팅과 provider 적용 완료

## 5.2 부족한 점

- 페이지 내 한글 하드코딩 문자열이 여전히 많음
- 일부 페이지는 번역 훅을 쓰지만 텍스트가 완전 분리되어 있지 않음
- 즉, 구조는 준비됐지만 "완전한 3개 언어 동등 품질"은 아님

## 5.3 결론

- i18n 인프라: 완료
- i18n 콘텐츠 품질: 부분 완료

---

## 6) 마무리까지 남은 핵심 작업

## A. 수익화 핵심

1. Enrollment(수강신청) 도메인 + API + UI 연동
2. 결제 연동(최소 1개 PG) + 웹훅 + 결제 상태머신
3. 영수증/정산 내역(학생/멘토/관리자)

## B. 사용자 핵심 경험

4. 학생/멘토 대시보드 분리 구현
5. 역할 전환 토글(student <-> mentor)
6. 멘토의 강의 생성/수정/운영 화면

## C. 확장 기능

7. webinar 최소 기능(생성/참여/일정)
8. 커뮤니티/프리랜서 "실제 신청 플로우" 연결

## D. 품질/운영

9. 디자인 시스템 통일 1차
10. 다국어 하드코딩 제거
11. 테스트/에러 모니터링/로그 정비

---

## 7) 일정 추정 (현실적 버전)

가정:
- 1명 풀타임 기준, 기존 코드 유지/개선 방식
- 신규 결제/정산/웹훅까지 포함

## 7.1 MVP-수익화 가능 버전

- 예상: **5~7주**
- 범위:
  - 강의 수강신청 + 결제 + 영수증
  - 학생/멘토 대시보드 기본
  - 역할 전환
  - i18n 핵심 화면 정리

## 7.2 운영 안정화 포함 버전

- 예상: **8~12주**
- 추가 범위:
  - webinar 1차
  - 커뮤니티/프리랜서 실동작
  - 관리자 운영 기능 강화
  - QA/모니터링/리팩터링

---

## 8) 오늘 할 수 있는 일 (실행 플랜)

## 오늘 목표

"기획 상태"를 "바로 개발 시작 가능한 상태"로 만든다.

## 오늘 수행 항목 (권장)

1. `docs/PRD.md` 작성
   - 범위/비범위, 사용자 시나리오, 완료 기준 확정
2. `docs/API_SPEC.md` 작성
   - Enrollment/Payment/SwitchRole/Webinar API 우선 정의
3. `docs/DASHBOARD_SPEC.md` 작성
   - 학생/멘토 KPI, 카드, 탭, 데이터 소스 정의
4. DB 스키마 초안 작성
   - Enrollment, Payment, Payout, Receipt, Webinar 모델
5. 첫 구현 시작
   - `auth/switch-role`
   - 대시보드 모드 토글 UI

## 오늘 완료 기준

- 문서 3종 + 데이터모델 초안 + 역할전환 기능 1차 코드가 존재하면 성공

---

## 9) 즉시 의사결정이 필요한 항목

1. 결제 게이트웨이 후보 (국내/해외)
2. webinar 방식 (외부 링크 연동 vs 내장)
3. 환불/취소 정책 기준
4. 멘토 심사 정책(자동/수동)
5. 정산 주기(주간/월간)

---

## 10) 기술 메모

- 현재 `npm run lint`는 초기 ESLint 설정 프롬프트가 떠서 비대화형 실행이 불가한 상태
- 즉, 코드 품질 자동 점검 루틴도 함께 세팅 필요

---

## 최종 판단

MentorLink는 이미 "보여줄 수 있는 프로토타입"은 갖췄다.
하지만 "수익이 발생하는 운영 플랫폼"이 되려면,
**Enrollment/Payment/Payout/Dashboard 전환** 4개 축을 먼저 완성해야 한다.
