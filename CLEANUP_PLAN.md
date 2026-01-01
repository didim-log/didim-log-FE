# 프론트엔드 코드 정리 계획

## 목표
1. 불필요한 MD 파일 정리
2. 불필요한 import 문 정리
3. 클린코드 원칙에 맞춰 코드 정리 (기능 변경 없음)

## 단계별 작업 계획

### Phase 1: 문서 정리 (MD 파일) ✅ 완료
- [x] `DESIGN_AUDIT.md` 삭제
- [x] `DESIGN_AND_ROUTING_AUDIT.md` → `DOCS/ARCHIVE/`로 이동
- [x] `FIX_TASK_LIST.md` → `DOCS/ARCHIVE/`로 이동

### Phase 2: Import 문 정리 ✅ 주요 작업 완료
#### 2.1 중복 Import 제거 ✅
- [x] `ApiErrorResponse` 중복 import 제거 (모두 `utils/errorHandler`로 통일)
  - `SettingsTab.tsx`, `EditProfileForm.tsx`, `RetrospectiveCard.tsx`, `AdminPage.tsx`, `SignupWizard.tsx` 수정

#### 2.2 React Import 정리 ✅
- [x] 불필요한 `React` import 제거 (React 17+ JSX Transform 활용)
- [x] `React.FC` → `FC`로 변경 및 `import type { FC }` 사용
- [x] 주요 컴포넌트 파일들 수정:
  - Layout, Footer, StatisticsPage, DashboardPage 등
  - TierProgress, QuoteCard, TodaySolvedList, RecommendedProblems 등
  - AlgorithmChart, RadarChartCard, StatCard 등

#### 2.3 추가 작업 완료 ✅
- [x] 모든 라우팅 파일들 수정 완료 (PrivateRoute, PublicRoute, AdminRoute, RootRedirect)
- [x] 모든 UI 컴포넌트 수정 완료 (Button, Input, Spinner, Layout, Header, Footer, TagInput, CreatableMultiSelect, CategorySelect)
- [x] 모든 Auth 페이지들 수정 완료 (LoginPage, SignupPage, FindIdPage, FindPasswordPage, ResetPasswordPage, OAuthCallbackPage, SignupFinalizePage)
- [x] 모든 Auth 컴포넌트들 수정 완료 (SignupWizard, SignupFormStep, BojVerifyStep, TermsStep, OnboardingTour, OnboardingModal)
- [x] 모든 Dashboard 컴포넌트들 수정 완료
- [x] 모든 Problem 컴포넌트들 수정 완료 (ProblemListPage, ProblemDetailPage, ProblemDetail, ProblemBlur)
- [x] 모든 Retrospective 컴포넌트들 수정 완료 (RetrospectiveListPage, RetrospectiveDetailPage, RetrospectiveWritePage, RetrospectiveEditor, RetrospectiveCard)
- [x] 모든 Profile 컴포넌트들 수정 완료 (ProfilePage, ProfileCard, ProfileEditForm, MyRetrospectiveCard)
- [x] 모든 Ranking 컴포넌트들 수정 완료 (RankingPage, Leaderboard, TopRankPodium)
- [x] 모든 Study 컴포넌트들 수정 완료 (StudyPage, Timer, CodeEditor, ResultDisplay)
- [x] 모든 Statistics 컴포넌트들 수정 완료 (StatisticsPage, AlgorithmChart, RadarChartCard, StatCard, CategoryChart, HeatmapChart)
- [x] 모든 Admin 컴포넌트들 수정 완료 (AdminDashboardPage, AdminUsersPage, UserManagement, QuoteManagement, FeedbackManagement, ProblemCollector, AdminStatsChart)

**총 수정 파일 수: 50개 이상**
  - `TierBadge.tsx`, `TagInput.tsx`, `CreatableMultiSelect.tsx`, `CategorySelect.tsx` 등
  - `ProblemDetail.tsx`, `ProblemListPage.tsx` 등
  - `RetrospectiveCard.tsx`, `RetrospectiveListPage.tsx`, `RetrospectiveDetailPage.tsx` 등
  - `ProfileCard.tsx`, `ProfileEditForm.tsx`, `ProfilePage.tsx` 등
  - `RankingPage.tsx`, `Leaderboard.tsx`, `TopRankPodium.tsx` 등
  - `StudyPage.tsx`, `Timer.tsx`, `CodeEditor.tsx`, `ResultDisplay.tsx` 등
  - `AdminDashboardPage.tsx`, `AdminUsersPage.tsx` 등
  - `OnboardingTour.tsx`, `OnboardingModal.tsx`, `SignupWizard.tsx` 등
- [ ] Hook 파일들 확인

### Phase 3: 클린코드 원칙 적용 (기능 변경 없음) ⏸️ 보류
> 사용자 요청: "파일의 기능들은 최대한 건들지 말아줘"
- [ ] else 예약어 제거 (Early Return 패턴 적용) - 기능 변경 포함될 수 있어 보류
- [ ] 중첩 depth 1 이하로 유지 - 기능 변경 포함될 수 있어 보류
- [ ] 메서드/함수는 한 가지 일만 수행하도록 분리 - 기능 변경 포함될 수 있어 보류
- [ ] 사용하지 않는 변수/함수 제거 - 린터에서 확인됨 (일부 수정 가능)

### Phase 4: 최종 검증
- [x] 린터 실행 (일부 경고 발견 - 기능 변경 필요로 보류)
  - 발견된 이슈:
    - `auth.api.ts`: 사용하지 않는 변수 `bojId`
    - `any` 타입 사용 (여러 파일)
    - `Input.tsx`, `QuoteWidget.tsx`: `Math.random()` 렌더링 중 호출
    - `ResultModal.tsx`: useEffect 내부 동기적 setState
- [ ] 빌드 확인 (사용자 확인 필요)
- [ ] 주요 기능 테스트 (사용자 확인 필요)

