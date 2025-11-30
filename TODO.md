# 🚀 DidimLog Frontend Development Roadmap

이 문서는 AI 기반 자동화 개발(Cursor + Gemini)을 위한 마일스톤 관리 문서입니다.
각 체크박스는 하나의 독립적인 작업 단위(Commit)를 의미합니다.

---

## Phase 4: Frontend & Interaction (Week 7-8)
> **Goal:** React 기반 UI 및 인터랙션 구현

### 4-1. 프로젝트 초기 설정
- [x] **[Setup]** React(Vite) + TypeScript 프로젝트 세팅
- [x] **[Setup]** 필수 패키지 설치 (react-router-dom, @tanstack/react-query, axios, tailwindcss)
- [x] **[Setup]** Tailwind CSS 설정 및 폴더 구조 생성
- [ ] **[Setup]** Firebase Hosting 설정
- [ ] **[Config]** React Query Provider 설정
- [x] **[Config]** React Router 설정 및 기본 라우팅 구성

### 4-2. 인증 및 사용자 관리
- [x] **[FE]** 로그인 페이지 UI 구현 (BOJ ID 입력)
- [x] **[FE]** BOJ ID 검증 로직 구현
- [ ] **[FE]** 사용자 정보 조회 API 연동
- [ ] **[FE]** 로그인 상태 관리 (Context 또는 React Query)

### 4-3. 메인 대시보드
- [x] **[FE]** 대시보드 레이아웃 컴포넌트 구현
- [x] **[FE]** 현재 티어 표시 컴포넌트
- [x] **[FE]** 최근 풀이 그래프 컴포넌트 (Chart.js 또는 Recharts)
- [x] **[FE]** 추천 문제 요약 카드 컴포넌트
- [ ] **[FE]** 대시보드 API 연동 (@tanstack/react-query)

### 4-4. 문제 풀이 화면
- [x] **[FE]** 문제 상세 페이지 UI 구현
- [x] **[FE]** 타이머 기능 구현 (시작/일시정지/종료)
- [ ] **[FE]** 문제 풀이 결과 제출 API 연동
- [x] **[FE]** 종료 시 모달 팝업 구현 (성공/실패 결과 표시)

### 4-5. 인터랙션 효과
- [x] **[FE]** 성공 시 `canvas-confetti` 이펙트 구현
- [x] **[FE]** 실패 시 Shake 애니메이션 구현 (Tailwind CSS)
- [x] **[FE]** 로딩 상태 UI 구현 (Skeleton 또는 Spinner)

### 4-6. 회고 작성 기능
- [x] **[FE]** Markdown 에디터 컴포넌트 구현 (react-markdown 또는 CodeMirror)
- [x] **[FE]** 회고 작성 페이지 UI 구현
- [x] **[FE]** 회고 템플릿 자동 생성 기능
- [ ] **[FE]** 회고 CRUD API 연동
- [ ] **[FE]** 회고 목록 및 상세 페이지 구현

### 4-7. 문제 추천 시스템 UI
- [x] **[FE]** 추천 문제 목록 페이지 구현
- [x] **[FE]** 문제 필터링 기능 (난이도, 카테고리)
- [x] **[FE]** 문제 상세 정보 모달/페이지 구현

### 4-8. 공통 컴포넌트
- [x] **[FE]** Button 컴포넌트 (variants, sizes)
- [x] **[FE]** Input 컴포넌트
- [x] **[FE]** Card 컴포넌트
- [x] **[FE]** Modal 컴포넌트
- [x] **[FE]** Loading 컴포넌트
- [x] **[FE]** Error Boundary 구현

### 4-9. 스타일링 및 UX 개선
- [x] **[FE]** 다크모드 지원 (선택사항)
- [x] **[FE]** 반응형 디자인 적용 (Mobile, Tablet, Desktop)
- [x] **[FE]** Toast 알림 시스템 구현 (sonner)
- [ ] **[FE]** 접근성 개선 (ARIA 속성, 키보드 네비게이션)
- [x] **[FE]** 에러 처리 및 사용자 피드백 개선

### 4-10. 최적화 및 배포
- [ ] **[FE]** 코드 스플리팅 및 라우트 레이지 로딩
- [ ] **[FE]** 이미지 최적화
- [ ] **[FE]** 성능 최적화 (React.memo, useMemo, useCallback)
- [ ] **[FE]** Firebase Hosting 배포 설정
- [ ] **[FE]** 환경 변수 설정 (.env)
