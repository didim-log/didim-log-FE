# 프론트엔드 재구축 실행 계획서

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [디렉토리 구조](#디렉토리-구조)
3. [API 매핑 및 타입 전략](#api-매핑-및-타입-전략)
4. [상태 관리 전략](#상태-관리-전략)
5. [핵심 로직 설계](#핵심-로직-설계)
6. [단계별 구현 순서](#단계별-구현-순서)
7. [기술 스택](#기술-스택)

---

## 프로젝트 개요

### 목표
- `API_SPECIFICATION.md`를 진실의 원천(Source of Truth)으로 삼아 완벽한 프론트엔드 구조 구축
- 기존 버그(로그인 리다이렉트 루프, 타입 불일치) 완전 제거
- 확장 가능하고 유지보수하기 쉬운 아키텍처 설계
- **직관적인 UI/UX**: 텍스트 입력 대신 버튼 기반 카테고리 선택으로 사용자 경험 개선

### 핵심 원칙
1. **타입 안정성**: 모든 API 응답/요청에 대한 TypeScript 타입 정의
2. **단방향 데이터 흐름**: React Query (Server State) + Zustand (Client State) 명확한 분리
3. **동기적 인증 처리**: 토큰 저장 → Axios 헤더 설정 → 상태 업데이트가 완료된 후에만 리다이렉트
4. **Feature-based 구조**: 도메인별로 기능을 그룹화하여 확장성 확보
5. **UI/UX 일관성**: 카테고리 선택은 가로 스크롤 Select 또는 텍스트 입력 + 자동완성 방식으로 통일하여 공간 절약 및 깔끔한 UI 제공

---

## 디렉토리 구조

### 전체 구조

```
didim-log-FE/
├── public/
├── src/
│   ├── api/                    # API 클라이언트 및 엔드포인트 정의
│   │   ├── client.ts           # Axios 인스턴스 설정
│   │   ├── interceptors.ts    # 요청/응답 인터셉터
│   │   └── endpoints/          # 엔드포인트별 API 함수
│   │       ├── auth.api.ts
│   │       ├── problem.api.ts
│   │       ├── study.api.ts
│   │       ├── retrospective.api.ts
│   │       ├── dashboard.api.ts
│   │       ├── student.api.ts
│   │       ├── quote.api.ts
│   │       ├── statistics.api.ts
│   │       ├── ranking.api.ts
│   │       ├── admin.api.ts
│   │       ├── feedback.api.ts
│   │       └── ai.api.ts
│   │
│   ├── types/                   # TypeScript 타입 정의
│   │   ├── api/                # API 요청/응답 타입
│   │   │   ├── auth.types.ts
│   │   │   ├── problem.types.ts
│   │   │   ├── study.types.ts
│   │   │   ├── retrospective.types.ts
│   │   │   ├── dashboard.types.ts
│   │   │   ├── student.types.ts
│   │   │   ├── quote.types.ts
│   │   │   ├── statistics.types.ts
│   │   │   ├── ranking.types.ts
│   │   │   ├── admin.types.ts
│   │   │   ├── feedback.types.ts
│   │   │   └── ai.types.ts
│   │   ├── domain/             # 도메인 엔티티 타입
│   │   │   ├── student.types.ts
│   │   │   ├── problem.types.ts
│   │   │   ├── retrospective.types.ts
│   │   │   └── common.types.ts
│   │   └── index.ts            # 타입 재export
│   │
│   ├── stores/                  # Zustand 스토어 (Client State)
│   │   ├── auth.store.ts       # 인증 상태 (토큰, 사용자 정보)
│   │   ├── ui.store.ts         # UI 상태 (모달, 사이드바 등)
│   │   └── index.ts
│   │
│   ├── hooks/                   # Custom Hooks
│   │   ├── api/                # React Query 훅
│   │   │   ├── useAuth.ts
│   │   │   ├── useProblem.ts
│   │   │   ├── useStudy.ts
│   │   │   ├── useRetrospective.ts
│   │   │   ├── useDashboard.ts
│   │   │   ├── useStudent.ts
│   │   │   ├── useStatistics.ts
│   │   │   ├── useRanking.ts
│   │   │   ├── useAdmin.ts
│   │   │   └── useFeedback.ts
│   │   ├── auth/                # 인증 관련 훅
│   │   │   ├── useLogin.ts
│   │   │   ├── useSignup.ts
│   │   │   ├── useOAuth.ts
│   │   │   └── useAuthGuard.ts
│   │   └── common/              # 공통 훅
│   │       ├── useDebounce.ts
│   │       └── useLocalStorage.ts
│   │
│   ├── components/              # 공통 컴포넌트
│   │   ├── layout/             # 레이아웃 컴포넌트
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   ├── ui/                 # 재사용 가능한 UI 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   └── forms/              # 폼 컴포넌트
│   │       ├── LoginForm.tsx
│   │       ├── SignupForm.tsx
│   │       └── ProfileForm.tsx
│   │
│   ├── features/                # Feature-based 기능 모듈
│   │   ├── auth/               # 인증 기능
│   │   │   ├── components/
│   │   │   │   ├── OAuthButton.tsx
│   │   │   │   ├── FindIdForm.tsx
│   │   │   │   └── FindPasswordForm.tsx
│   │   │   └── pages/
│   │   │       ├── LoginPage.tsx
│   │   │       ├── SignupPage.tsx
│   │   │       ├── OAuthCallbackPage.tsx
│   │   │       └── SignupFinalizePage.tsx
│   │   │
│   │   ├── dashboard/           # 대시보드 기능
│   │   │   ├── components/
│   │   │   │   ├── TodaySolvedList.tsx
│   │   │   │   ├── TierProgress.tsx
│   │   │   │   └── QuoteCard.tsx
│   │   │   └── pages/
│   │   │       └── DashboardPage.tsx
│   │   │
│   │   ├── problem/            # 문제 관련 기능
│   │   │   ├── components/
│   │   │   │   ├── ProblemCard.tsx
│   │   │   │   ├── ProblemDetail.tsx
│   │   │   │   ├── ProblemRecommend.tsx
│   │   │   │   └── ProblemSearch.tsx
│   │   │   └── pages/
│   │   │       ├── ProblemListPage.tsx
│   │   │       └── ProblemDetailPage.tsx
│   │   │
│   │   ├── study/              # 학습 기능
│   │   │   ├── components/
│   │   │   │   ├── CodeEditor.tsx
│   │   │   │   ├── SubmitForm.tsx
│   │   │   │   └── ResultDisplay.tsx
│   │   │   └── pages/
│   │   │       └── StudyPage.tsx
│   │   │
│   │   ├── retrospective/      # 회고 기능
│   │   │   ├── components/
│   │   │   │   ├── RetrospectiveCard.tsx
│   │   │   │   ├── RetrospectiveEditor.tsx
│   │   │   │   ├── RetrospectiveList.tsx
│   │   │   │   └── TemplateSelector.tsx
│   │   │   └── pages/
│   │   │       ├── RetrospectiveListPage.tsx
│   │   │       ├── RetrospectiveDetailPage.tsx
│   │   │       └── RetrospectiveWritePage.tsx
│   │   │
│   │   ├── statistics/         # 통계 기능
│   │   │   ├── components/
│   │   │   │   ├── HeatmapChart.tsx
│   │   │   │   ├── CategoryChart.tsx
│   │   │   │   └── AlgorithmChart.tsx
│   │   │   └── pages/
│   │   │       └── StatisticsPage.tsx
│   │   │
│   │   ├── ranking/            # 랭킹 기능
│   │   │   ├── components/
│   │   │   │   └── Leaderboard.tsx
│   │   │   └── pages/
│   │   │       └── RankingPage.tsx
│   │   │
│   │   ├── profile/            # 프로필 기능
│   │   │   ├── components/
│   │   │   │   ├── ProfileCard.tsx
│   │   │   │   └── ProfileEditForm.tsx
│   │   │   └── pages/
│   │   │       └── ProfilePage.tsx
│   │   │
│   │   └── admin/              # 관리자 기능
│   │       ├── components/
│   │       │   ├── UserManagement.tsx
│   │       │   ├── QuoteManagement.tsx
│   │       │   └── FeedbackManagement.tsx
│   │       └── pages/
│   │           ├── AdminDashboardPage.tsx
│   │           └── AdminUsersPage.tsx
│   │
│   ├── routes/                  # 라우팅 설정
│   │   ├── routes.tsx          # 라우트 정의
│   │   ├── PublicRoute.tsx     # 공개 라우트
│   │   ├── PrivateRoute.tsx    # 인증 필요 라우트
│   │   └── AdminRoute.tsx      # 관리자 전용 라우트
│   │
│   ├── utils/                   # 유틸리티 함수
│   │   ├── storage.ts          # localStorage 관리
│   │   ├── validation.ts       # 유효성 검사
│   │   ├── formatters.ts       # 포맷팅 함수
│   │   └── constants.ts        # 상수 정의
│   │
│   ├── lib/                     # 외부 라이브러리 설정
│   │   ├── react-query.ts      # React Query 설정
│   │   └── react-router.ts     # React Router 설정
│   │
│   ├── styles/                  # 스타일 파일
│   │   ├── globals.css
│   │   └── theme.ts
│   │
│   ├── App.tsx                  # 루트 컴포넌트
│   ├── main.tsx                 # 진입점
│   └── vite-env.d.ts
│
├── .env                         # 환경 변수
├── .env.local                   # 로컬 환경 변수
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### 디렉토리 역할 정의

#### `api/`
- **역할**: 백엔드 API와의 통신 담당
- **구성**:
  - `client.ts`: Axios 인스턴스 생성 및 기본 설정
  - `interceptors.ts`: 요청/응답 인터셉터 (토큰 주입, 에러 처리)
  - `endpoints/*.api.ts`: 각 도메인별 API 함수 정의

#### `types/`
- **역할**: TypeScript 타입 정의
- **구성**:
  - `api/*.types.ts`: API 요청/응답 DTO 타입
  - `domain/*.types.ts`: 도메인 엔티티 타입
  - `index.ts`: 타입 재export로 import 경로 단순화

#### `stores/`
- **역할**: 클라이언트 상태 관리 (Zustand)
- **관리 대상**:
  - 인증 상태 (토큰, 사용자 정보)
  - UI 상태 (모달 열림/닫힘, 사이드바 상태 등)
  - **제외**: 서버 데이터는 React Query로 관리

#### `hooks/`
- **역할**: 재사용 가능한 로직 캡슐화
- **구성**:
  - `api/*.ts`: React Query 훅 (서버 데이터 조회/변경)
  - `auth/*.ts`: 인증 관련 훅 (로그인, 회원가입, OAuth)
  - `common/*.ts`: 공통 유틸리티 훅

#### `components/`
- **역할**: 재사용 가능한 공통 컴포넌트
- **구성**:
  - `layout/`: 레이아웃 컴포넌트
  - `ui/`: 기본 UI 컴포넌트 (Button, Input 등)
  - `forms/`: 폼 컴포넌트

#### `features/`
- **역할**: Feature-based 기능 모듈
- **구성**: 각 기능별로 `components/`와 `pages/`를 포함
- **장점**: 기능별로 독립적으로 관리 가능, 확장성 높음

#### `routes/`
- **역할**: 라우팅 및 접근 제어
- **구성**:
  - `routes.tsx`: 라우트 정의
  - `PublicRoute.tsx`: 인증 불필요한 라우트
  - `PrivateRoute.tsx`: 인증 필요 라우트
  - `AdminRoute.tsx`: 관리자 전용 라우트

---

## API 매핑 및 타입 전략

### API 엔드포인트 → 타입 매핑

#### 1. AuthController

| 엔드포인트 | 요청 타입 | 응답 타입 | 파일 |
|-----------|---------|---------|------|
| `POST /api/v1/auth/signup` | `SignupRequest` | `AuthResponse` | `types/api/auth.types.ts` |
| `POST /api/v1/auth/login` | `LoginRequest` | `AuthResponse` | `types/api/auth.types.ts` |
| `POST /api/v1/auth/super-admin` | `SuperAdminRequest` | `AuthResponse` | `types/api/auth.types.ts` |
| `POST /api/v1/auth/signup/finalize` | `SignupFinalizeRequest` | `AuthResponse` | `types/api/auth.types.ts` |
| `POST /api/v1/auth/find-account` | `FindAccountRequest` | `FindAccountResponse` | `types/api/auth.types.ts` |
| `POST /api/v1/auth/find-id` | `FindIdRequest` | `FindIdPasswordResponse` | `types/api/auth.types.ts` |
| `POST /api/v1/auth/find-password` | `FindPasswordRequest` | `FindIdPasswordResponse` | `types/api/auth.types.ts` |
| `POST /api/v1/auth/reset-password` | `ResetPasswordRequest` | `FindIdPasswordResponse` | `types/api/auth.types.ts` |
| `POST /api/v1/auth/boj/code` | 없음 | `BojCodeIssueResponse` | `types/api/auth.types.ts` |
| `POST /api/v1/auth/boj/verify` | `BojVerifyRequest` | `BojVerifyResponse` | `types/api/auth.types.ts` |

#### 2. ProblemController

| 엔드포인트 | 요청 타입 | 응답 타입 | 파일 |
|-----------|---------|---------|------|
| `GET /api/v1/problems/recommend` | Query: `RecommendRequest` | `ProblemResponse[]` | `types/api/problem.types.ts` |
| `GET /api/v1/problems/{problemId}` | Path: `problemId` | `ProblemDetailResponse` | `types/api/problem.types.ts` |
| `GET /api/v1/problems/search` | Query: `SearchRequest` | `ProblemDetailResponse` | `types/api/problem.types.ts` |

#### 3. StudyController

| 엔드포인트 | 요청 타입 | 응답 타입 | 파일 |
|-----------|---------|---------|------|
| `POST /api/v1/study/submit` | `SolutionSubmitRequest` | `SolutionSubmitResponse` | `types/api/study.types.ts` |

#### 4. RetrospectiveController

| 엔드포인트 | 요청 타입 | 응답 타입 | 파일 |
|-----------|---------|---------|------|
| `POST /api/v1/retrospectives` | `RetrospectiveRequest` | `RetrospectiveResponse` | `types/api/retrospective.types.ts` |
| `GET /api/v1/retrospectives` | Query: `RetrospectiveListRequest` | `RetrospectivePageResponse` | `types/api/retrospective.types.ts` |
| `GET /api/v1/retrospectives/{id}` | Path: `id` | `RetrospectiveResponse` | `types/api/retrospective.types.ts` |
| `POST /api/v1/retrospectives/{id}/bookmark` | Path: `id` | `BookmarkToggleResponse` | `types/api/retrospective.types.ts` |
| `DELETE /api/v1/retrospectives/{id}` | Path: `id` | `204 No Content` | `types/api/retrospective.types.ts` |
| `GET /api/v1/retrospectives/template` | Query: `TemplateRequest` | `TemplateResponse` | `types/api/retrospective.types.ts` |
| `POST /api/v1/retrospectives/template/static` | `StaticTemplateRequest` | `TemplateResponse` | `types/api/retrospective.types.ts` |

#### 5. DashboardController

| 엔드포인트 | 요청 타입 | 응답 타입 | 파일 |
|-----------|---------|---------|------|
| `GET /api/v1/dashboard` | 없음 | `DashboardResponse` | `types/api/dashboard.types.ts` |

#### 6. StudentController

| 엔드포인트 | 요청 타입 | 응답 타입 | 파일 |
|-----------|---------|---------|------|
| `PATCH /api/v1/students/me` | `UpdateProfileRequest` | `204 No Content` | `types/api/student.types.ts` |
| `DELETE /api/v1/students/me` | 없음 | `204 No Content` | `types/api/student.types.ts` |

#### 7. QuoteController

| 엔드포인트 | 요청 타입 | 응답 타입 | 파일 |
|-----------|---------|---------|------|
| `GET /api/v1/quotes/random` | 없음 | `QuoteResponse \| null` | `types/api/quote.types.ts` |

#### 8. StatisticsController

| 엔드포인트 | 요청 타입 | 응답 타입 | 파일 |
|-----------|---------|---------|------|
| `GET /api/v1/statistics` | 없음 | `StatisticsResponse` | `types/api/statistics.types.ts` |

#### 9. RankingController

| 엔드포인트 | 요청 타입 | 응답 타입 | 파일 |
|-----------|---------|---------|------|
| `GET /api/v1/ranks` | Query: `RankingRequest` | `LeaderboardResponse[]` | `types/api/ranking.types.ts` |

#### 10. AdminController

| 엔드포인트 | 요청 타입 | 응답 타입 | 파일 |
|-----------|---------|---------|------|
| `GET /api/v1/admin/users` | Query: `AdminUserListRequest` | `Page<AdminUserResponse>` | `types/api/admin.types.ts` |
| `DELETE /api/v1/admin/users/{id}` | Path: `id` | `DeleteResponse` | `types/api/admin.types.ts` |
| `PATCH /api/v1/admin/users/{id}` | `AdminUserUpdateDto` | `204 No Content` | `types/api/admin.types.ts` |
| `GET /api/v1/admin/quotes` | Query: `PageRequest` | `Page<QuoteResponse>` | `types/api/admin.types.ts` |
| `POST /api/v1/admin/quotes` | `QuoteCreateRequest` | `QuoteResponse` | `types/api/admin.types.ts` |
| `DELETE /api/v1/admin/quotes/{id}` | Path: `id` | `DeleteResponse` | `types/api/admin.types.ts` |
| `GET /api/v1/admin/feedbacks` | Query: `PageRequest` | `Page<FeedbackResponse>` | `types/api/admin.types.ts` |
| `PATCH /api/v1/admin/feedbacks/{id}/status` | `FeedbackStatusUpdateRequest` | `FeedbackResponse` | `types/api/admin.types.ts` |
| `DELETE /api/v1/admin/feedbacks/{id}` | Path: `id` | `204 No Content` | `types/api/admin.types.ts` |

#### 11. AdminDashboardController

| 엔드포인트 | 요청 타입 | 응답 타입 | 파일 |
|-----------|---------|---------|------|
| `GET /api/v1/admin/dashboard/stats` | 없음 | `AdminDashboardStatsResponse` | `types/api/admin.types.ts` |

#### 12. ProblemCollectorController

| 엔드포인트 | 요청 타입 | 응답 타입 | 파일 |
|-----------|---------|---------|------|
| `POST /api/v1/admin/problems/collect-metadata` | Query: `CollectMetadataRequest` | `CollectResponse` | `types/api/admin.types.ts` |
| `POST /api/v1/admin/problems/collect-details` | 없음 | `CollectResponse` | `types/api/admin.types.ts` |

#### 13. FeedbackController

| 엔드포인트 | 요청 타입 | 응답 타입 | 파일 |
|-----------|---------|---------|------|
| `POST /api/v1/feedback` | `FeedbackCreateRequest` | `FeedbackResponse` | `types/api/feedback.types.ts` |

#### 14. AiAnalysisController

| 엔드포인트 | 요청 타입 | 응답 타입 | 파일 |
|-----------|---------|---------|------|
| `POST /api/v1/ai/analyze` | `AiAnalyzeRequest` | `AiAnalyzeResponse` | `types/api/ai.types.ts` |

### 타입 정의 예시

```typescript
// types/api/auth.types.ts
export interface SignupRequest {
  bojId: string;
  password: string;
  email: string;
}

export interface LoginRequest {
  bojId: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  message: string;
  rating: number;
  tier: string;
  tierLevel: number;
}

export interface SignupFinalizeRequest {
  email: string;
  provider: 'GOOGLE' | 'GITHUB' | 'NAVER';
  providerId: string;
  nickname: string;
  bojId?: string | null;
  isAgreedToTerms: boolean;
  // 호환성을 위해 termsAgreed도 지원
  termsAgreed?: boolean;
}

// types/api/common.types.ts
export interface ErrorResponse {
  status: number;
  error: string;
  code: string;
  message: string;
}

export interface PageRequest {
  page?: number;
  size?: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
```

---

## 상태 관리 전략

### React Query (Server State)

**관리 대상:**
- 서버에서 가져온 데이터 (문제 목록, 회고 목록, 통계 등)
- 캐싱, 자동 리프레시, 에러 처리 담당

**사용 예시:**
```typescript
// hooks/api/useProblem.ts
export const useProblemRecommend = (params: RecommendRequest) => {
  return useQuery({
    queryKey: ['problems', 'recommend', params],
    queryFn: () => problemApi.recommend(params),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useSubmitSolution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: problemApi.submit,
    onSuccess: () => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
};
```

### Zustand (Client State)

**관리 대상:**
- 인증 상태 (토큰, 사용자 정보)
- UI 상태 (모달, 사이드바 등)
- 폼 상태 (임시 저장 등)

**사용 예시:**
```typescript
// stores/auth.store.ts
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  setToken: (token) => set({ token, isAuthenticated: true }),
  setUser: (user) => set({ user }),
  logout: () => set({ token: null, user: null, isAuthenticated: false }),
}));
```

### 상태 관리 분리 원칙

| 데이터 종류 | 관리 도구 | 이유 |
|-----------|---------|------|
| 서버 데이터 (문제, 회고, 통계) | React Query | 캐싱, 자동 리프레시, 에러 처리 |
| 인증 상태 (토큰, 사용자) | Zustand | 전역 상태, 페이지 새로고침 시 유지 필요 |
| UI 상태 (모달, 사이드바) | Zustand | 클라이언트 전용 상태 |
| 폼 상태 | React State | 컴포넌트 내부 상태 |

---

## 핵심 로직 설계

### 1. 인증 플로우 (로그인 리다이렉트 버그 방지)

#### 문제점 분석
- 기존: 비동기 처리로 인해 토큰 저장 전에 리다이렉트 발생
- 결과: 리다이렉트 루프 또는 인증 실패

#### 해결 방안

**`hooks/auth/useLogin.ts` 설계:**

```typescript
export const useLogin = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const { setAuthHeader } = useApiClient();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data: AuthResponse) => {
      // 1. 토큰 저장 (동기적)
      setToken(data.token);
      
      // 2. Axios 헤더 설정 (동기적)
      setAuthHeader(data.token);
      
      // 3. 사용자 정보 저장 (동기적)
      // 토큰에서 사용자 정보 추출 또는 별도 API 호출
      const user = extractUserFromToken(data.token);
      setUser(user);
      
      // 4. 모든 상태 업데이트 완료 후 리다이렉트
      // Promise.all을 사용하여 모든 비동기 작업 완료 보장
      await Promise.all([
        // 필요한 경우 추가 초기화 작업
      ]);
      
      // 5. 리다이렉트 (동기적 상태 업데이트 완료 후)
      navigate('/dashboard', { replace: true });
    },
    onError: (error) => {
      // 에러 처리
      console.error('Login failed:', error);
    },
  });

  return {
    login: loginMutation.mutate,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  };
};
```

**`api/client.ts` 설계:**

```typescript
// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 헤더 설정 함수 (동기적)
export const setAuthHeader = (token: string) => {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// 토큰 헤더 제거 함수
export const removeAuthHeader = () => {
  delete apiClient.defaults.headers.common['Authorization'];
};

// 요청 인터셉터: 토큰 자동 주입
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 에러 시 자동 로그아웃
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      removeAuthHeader();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**핵심 포인트:**
1. 토큰 저장 → 헤더 설정 → 사용자 정보 저장이 **순차적으로 동기적으로** 실행
2. 모든 상태 업데이트가 완료된 후에만 `navigate()` 호출
3. `Promise.all()`을 사용하여 필요한 비동기 작업 완료 보장

### 2. OAuth 플로우

**`hooks/auth/useOAuth.ts` 설계:**

```typescript
export const useOAuth = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const { setAuthHeader } = useApiClient();

  // OAuth 콜백 처리
  const handleOAuthCallback = useCallback(async (searchParams: URLSearchParams) => {
    const error = searchParams.get('error');
    if (error) {
      // 에러 처리
      navigate('/login', { state: { error } });
      return;
    }

    const isNewUser = searchParams.get('isNewUser') === 'true';
    
    if (isNewUser) {
      // 신규 유저: 회원가입 마무리 페이지로 이동
      const email = searchParams.get('email') || '';
      const provider = searchParams.get('provider') || '';
      const providerId = searchParams.get('providerId') || '';
      
      navigate('/signup/finalize', {
        state: { email, provider, providerId },
        replace: true,
      });
    } else {
      // 기존 유저: 토큰 저장 및 대시보드로 이동
      const token = searchParams.get('token');
      if (!token) {
        navigate('/login', { state: { error: '토큰이 없습니다.' } });
        return;
      }
      
      // 동기적 처리 (useLogin과 동일)
      setToken(token);
      setAuthHeader(token);
      const user = extractUserFromToken(token);
      setUser(user);
      
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, setToken, setUser, setAuthHeader]);

  return { handleOAuthCallback };
};
```

### 3. 라우팅 설계

**`routes/PrivateRoute.tsx`:**

```typescript
interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, token } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      // 로그인 페이지로 리다이렉트 (원래 경로 저장)
      navigate('/login', {
        state: { from: location.pathname },
        replace: true,
      });
    }
  }, [isAuthenticated, token, navigate, location]);

  if (!isAuthenticated || !token) {
    return <Spinner />; // 로딩 중 표시
  }

  return <>{children}</>;
};
```

**`routes/AdminRoute.tsx`:**

```typescript
export const AdminRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, token, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login', { replace: true });
      return;
    }

    if (user?.role !== 'ADMIN') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, token, user, navigate]);

  if (!isAuthenticated || !token || user?.role !== 'ADMIN') {
    return <Spinner />;
  }

  return <>{children}</>;
};
```

**`routes/routes.tsx`:**

```typescript
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      <Route path="/signup/finalize" element={<SignupFinalizePage />} />
      
      {/* Private Routes */}
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/problems" element={<PrivateRoute><ProblemListPage /></PrivateRoute>} />
      <Route path="/problems/:problemId" element={<PrivateRoute><ProblemDetailPage /></PrivateRoute>} />
      <Route path="/study/:problemId" element={<PrivateRoute><StudyPage /></PrivateRoute>} />
      <Route path="/retrospectives" element={<PrivateRoute><RetrospectiveListPage /></PrivateRoute>} />
      <Route path="/retrospectives/:id" element={<PrivateRoute><RetrospectiveDetailPage /></PrivateRoute>} />
      <Route path="/retrospectives/write" element={<PrivateRoute><RetrospectiveWritePage /></PrivateRoute>} />
      <Route path="/statistics" element={<PrivateRoute><StatisticsPage /></PrivateRoute>} />
      <Route path="/ranking" element={<PrivateRoute><RankingPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
      
      {/* 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
```

**`routes/PublicRoute.tsx`:**

```typescript
interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 이미 로그인한 사용자가 로그인/회원가입 페이지에 접근하면 대시보드로 리다이렉트
    if (isAuthenticated) {
      const from = (location.state as { from?: string })?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  return <>{children}</>;
};
```

**리다이렉트 정책 요약:**

| 라우트 타입 | 인증 상태 | 동작 |
|-----------|---------|------|
| `PublicRoute` | 인증됨 | 대시보드로 리다이렉트 (원래 경로 저장) |
| `PublicRoute` | 미인증 | 페이지 표시 |
| `PrivateRoute` | 인증됨 | 페이지 표시 |
| `PrivateRoute` | 미인증 | 로그인 페이지로 리다이렉트 (원래 경로 저장) |
| `AdminRoute` | 인증됨 + ADMIN | 페이지 표시 |
| `AdminRoute` | 인증됨 + USER | 대시보드로 리다이렉트 |
| `AdminRoute` | 미인증 | 로그인 페이지로 리다이렉트 |

---

## 단계별 구현 순서

### Phase 1: 인프라 구축 & 인증 시스템 (1-2주)

**목표:** 프로젝트 기반 구조 완성 및 인증 플로우 완벽 구현

#### 1.1 프로젝트 초기 설정
- [ ] Vite + React + TypeScript 프로젝트 생성
- [ ] ESLint, Prettier 설정
- [ ] 기본 디렉토리 구조 생성
- [ ] 환경 변수 설정 (`.env`, `.env.local`)

#### 1.2 타입 시스템 구축
- [ ] `types/api/common.types.ts` - 공통 타입 (ErrorResponse, Page 등)
- [ ] `types/api/auth.types.ts` - 인증 관련 타입 정의
- [ ] `types/domain/` - 도메인 엔티티 타입 정의
- [ ] `types/index.ts` - 타입 재export 설정

#### 1.3 API 클라이언트 구축
- [ ] `api/client.ts` - Axios 인스턴스 생성
- [ ] `api/interceptors.ts` - 요청/응답 인터셉터 구현
  - 요청 인터셉터: 토큰 자동 주입
  - 응답 인터셉터: 401 에러 처리, 에러 포맷팅
- [ ] `api/endpoints/auth.api.ts` - 인증 API 함수 구현
  - `signup`, `login`, `signupFinalize`, `findId`, `findPassword`, `resetPassword`, `bojCode`, `bojVerify`

#### 1.4 상태 관리 구축
- [ ] `stores/auth.store.ts` - Zustand 인증 스토어
  - `token`, `user`, `isAuthenticated` 상태
  - `setToken`, `setUser`, `logout` 액션
  - localStorage 동기화
- [ ] `stores/ui.store.ts` - UI 상태 스토어 (모달, 사이드바 등)
- [ ] `lib/react-query.ts` - React Query 설정 (QueryClient, 기본 옵션)

#### 1.5 인증 훅 구현
- [ ] `hooks/auth/useLogin.ts` - 로그인 훅 (동기적 처리 보장)
- [ ] `hooks/auth/useSignup.ts` - 회원가입 훅
- [ ] `hooks/auth/useOAuth.ts` - OAuth 콜백 처리 훅
- [ ] `hooks/auth/useAuthGuard.ts` - 인증 가드 훅
- [ ] `utils/storage.ts` - localStorage 유틸리티
- [ ] `utils/validation.ts` - 유효성 검사 함수
- [ ] `utils/constants.ts` - **알고리즘 카테고리 상수 정의**
  - 주요 알고리즘 카테고리 목록: BFS, DFS, DP, Greedy, Graph, String, Implementation, BruteForce, BinarySearch, TwoPointers, Sorting, Math 등
  - 카테고리 표시명(한글) 및 영문 표준명 매핑
  - `types/domain/category.types.ts`에 타입 정의 (선택사항)

#### 1.6 라우팅 시스템 구축
- [ ] `routes/PublicRoute.tsx` - 공개 라우트 컴포넌트
- [ ] `routes/PrivateRoute.tsx` - 인증 필요 라우트 컴포넌트
- [ ] `routes/AdminRoute.tsx` - 관리자 전용 라우트 컴포넌트
- [ ] `routes/routes.tsx` - 라우트 정의
- [ ] `lib/react-router.ts` - React Router 설정

#### 1.7 인증 페이지 구현
- [ ] `features/auth/pages/LoginPage.tsx` - 로그인 페이지
- [ ] `features/auth/pages/SignupPage.tsx` - **3단계 회원가입 위저드 페이지**
  - Step 1: 약관 동의 (Terms Agreement)
  - Step 2: BOJ 아이디 인증 (소유권 검증 API 활용)
    - `POST /api/v1/auth/boj/code` - 인증 코드 발급
    - `POST /api/v1/auth/boj/verify` - BOJ 프로필 페이지에서 코드 확인
  - Step 3: 이메일, 닉네임, 비밀번호 입력 및 가입 완료
- [ ] `features/auth/pages/OAuthCallbackPage.tsx` - OAuth 콜백 페이지
- [ ] `features/auth/pages/SignupFinalizePage.tsx` - 회원가입 마무리 페이지 (소셜 로그인용)
- [ ] `features/auth/components/OAuthButton.tsx` - OAuth 버튼 컴포넌트
- [ ] `features/auth/components/FindIdForm.tsx` - 아이디 찾기 폼
- [ ] `features/auth/components/FindPasswordForm.tsx` - 비밀번호 찾기 폼
- [ ] `features/auth/components/SignupWizard.tsx` - 3단계 회원가입 위저드 컴포넌트
- [ ] `features/auth/components/TermsStep.tsx` - 약관 동의 단계 컴포넌트
- [ ] `features/auth/components/BojVerifyStep.tsx` - BOJ 인증 단계 컴포넌트
- [ ] `features/auth/components/SignupFormStep.tsx` - 회원가입 폼 단계 컴포넌트
- [ ] `features/auth/components/OnboardingModal.tsx` - 신규 유저 온보딩 모달
- [ ] `components/forms/LoginForm.tsx` - 로그인 폼 컴포넌트

#### 1.8 공통 컴포넌트
- [ ] `components/ui/Button.tsx` - 버튼 컴포넌트
- [ ] `components/ui/Input.tsx` - 입력 컴포넌트
- [ ] `components/ui/Spinner.tsx` - 로딩 스피너
- [ ] `components/ui/ErrorBoundary.tsx` - 에러 바운더리
- [ ] `components/ui/CategorySelect.tsx` - **카테고리 선택 컴포넌트 (가로 스크롤 가능한 Select 또는 텍스트 입력 + 자동완성)**
  - 공간 절약을 위해 버튼 그룹 대신 Select/Dropdown 또는 Autocomplete 방식 사용
- [ ] `components/layout/Layout.tsx` - 기본 레이아웃
- [ ] `components/layout/Header.tsx` - 헤더 컴포넌트
- [ ] `components/layout/Sidebar.tsx` - 사이드바 컴포넌트

#### 1.9 신규 유저 온보딩
- [ ] `hooks/auth/useOnboarding.ts` - 온보딩 상태 관리 훅
- [ ] `stores/onboarding.store.ts` - 온보딩 상태 스토어 (Zustand)
  - `isNewUser` 플래그 확인
  - 온보딩 완료 여부 저장
- [ ] `features/auth/components/OnboardingModal.tsx` - 서비스 안내 모달/튜토리얼
  - 최초 진입 시 서비스 소개
  - 주요 기능 안내 (문제 풀이, 회고 작성 등)

#### 1.10 테스트 및 검증
- [ ] 로그인 플로우 E2E 테스트 (토큰 저장 → 헤더 설정 → 리다이렉트)
- [ ] OAuth 플로우 테스트 (기존 유저, 신규 유저)
- [ ] 3단계 회원가입 위저드 테스트
- [ ] BOJ 인증 플로우 테스트
- [ ] 라우트 가드 테스트 (인증 필요 페이지 접근)
- [ ] 401 에러 처리 테스트
- [ ] 신규 유저 온보딩 테스트

**완료 기준:**
- ✅ 로그인/회원가입이 정상적으로 동작
- ✅ **3단계 회원가입 위저드가 정상 동작 (약관 동의 → BOJ 인증 → 정보 입력)**
- ✅ **BOJ 소유권 인증이 정상 동작**
- ✅ **신규 유저 온보딩 모달/튜토리얼이 표시됨**
- ✅ 리다이렉트 루프 없음
- ✅ 토큰이 정상적으로 저장되고 API 요청에 포함됨
- ✅ OAuth 로그인이 정상 동작

---

### Phase 2: 대시보드 & 마이페이지 (1주)

**목표:** 데이터 조회 중심 기능 구현

#### 2.0 공통 유틸리티 구현 (필수)
- [ ] `utils/date.ts` (또는 `utils/formatters.ts`) - **시간대 변환 유틸리티**
  - `formatDateToKST(dateString: string): string` 함수 구현
  - MongoDB UTC 시간을 한국 시간(KST, UTC+9)으로 변환
  - `date-fns` 또는 `Intl.DateTimeFormat` 사용 권장
  - 모든 시간 표시 컴포넌트에서 이 함수를 사용하도록 명시

#### 2.1 대시보드 API 및 타입
- [ ] `types/api/dashboard.types.ts` - 대시보드 타입 정의
- [ ] `api/endpoints/dashboard.api.ts` - 대시보드 API 함수
- [ ] `hooks/api/useDashboard.ts` - 대시보드 React Query 훅

#### 2.2 대시보드 페이지 구현
- [ ] `features/dashboard/pages/DashboardPage.tsx` - 대시보드 페이지
- [ ] `features/dashboard/components/TodaySolvedList.tsx` - 오늘 푼 문제 목록
  - **`formatDateToKST` 함수를 사용하여 UTC 시간을 KST로 변환하여 표시**
  - `solvedAt` 필드의 시간을 한국 시간으로 포맷팅
- [ ] `features/dashboard/components/TierProgress.tsx` - **티어 진행률 시각화 컴포넌트**
  - 현재 티어 이미지 표시
  - 다음 레벨까지 남은 Rating 표시
  - 진행률(%) ProgressBar 그래프
- [ ] `features/dashboard/components/RecommendedProblems.tsx` - **추천 문제 카드 (4개)**
  - 문제 번호, 제목, 티어 표시
  - 바로가기 버튼
- [ ] `features/dashboard/components/ActivitySummary.tsx` - **활동 요약 컴포넌트**
  - 최근 풀이 활동 (잔디/Heatmap)
  - 가장 많이 푼 카테고리 통계
  - 오늘 푼 문제 목록
- [ ] `features/dashboard/components/QuoteCard.tsx` - **코드 명언 위젯**
  - 랜덤 명언 표시
  - **저자(`author`)가 'Unknown' (대소문자 무관)인 경우 카드를 렌더링하지 않음 (숨김 처리)**

#### 2.3 학생 프로필 API 및 타입
- [ ] `types/api/student.types.ts` - 학생 프로필 타입 정의
- [ ] `api/endpoints/student.api.ts` - 학생 프로필 API 함수
- [ ] `hooks/api/useStudent.ts` - 학생 프로필 React Query 훅

#### 2.4 프로필 페이지 구현 (마이페이지)
- [ ] `features/profile/pages/ProfilePage.tsx` - **마이페이지**
  - 회고 목록 확인
  - 닉네임/비밀번호 변경
  - 주 언어 설정
  - 내 코드 보기
- [ ] `features/profile/components/ProfileCard.tsx` - 프로필 카드
- [ ] `features/profile/components/ProfileEditForm.tsx` - 프로필 수정 폼
- [ ] `features/profile/components/MyRetrospectives.tsx` - **내 회고 목록 컴포넌트**
  - **카테고리별 필터링 기능 제공 (가로 스크롤 Select 또는 Autocomplete)**
  - 내가 작성한 회고를 알고리즘 주제별로 모아볼 수 있도록 구현
  - **회고 아이템 표시 정보:**
    - **제목:** 문제 번호 + 문제 제목
    - **한 줄 요약:** 제목 아래에 짧게 표시 (필수)
    - **메타 정보:** 성공/실패 여부(Badge), 소요 시간(`timeTaken`), 문제 카테고리(Badge)
    - **스타일:** 깔끔한 Card 리스트 형태 유지
- [ ] `features/profile/components/MyCodes.tsx` - **내 코드 보기 컴포넌트**
- [ ] `components/forms/ProfileForm.tsx` - 프로필 폼 컴포넌트

#### 2.5 명언 API
- [ ] `types/api/quote.types.ts` - 명언 타입 정의
- [ ] `api/endpoints/quote.api.ts` - 명언 API 함수
- [ ] `hooks/api/useQuote.ts` - 명언 React Query 훅

**완료 기준:**
- ✅ 대시보드에서 오늘의 활동, 티어 정보, 명언이 정상 표시됨
- ✅ **모든 시간 표시가 한국 시간(KST)으로 정확하게 변환되어 표시됨**
- ✅ **명언 카드에서 'Unknown' 저자는 필터링되어 표시되지 않음**
- ✅ 프로필 수정이 정상 동작함
- ✅ **프로필 페이지에서 내 회고를 카테고리별로 필터링할 수 있음**
- ✅ **프로필 페이지의 '나의 회고' 섹션에서 회고 아이템이 제목, 한 줄 요약, 메타 정보(성공/실패, 소요 시간, 카테고리)를 명확하게 표시함**
- ✅ 데이터 로딩 상태 및 에러 처리가 적절함

---

### Phase 3: 문제 풀이 & 회고 (2주)

**목표:** 핵심 비즈니스 로직 구현

#### 3.1 문제 관련 API 및 타입
- [ ] `types/api/problem.types.ts` - 문제 타입 정의
- [ ] `api/endpoints/problem.api.ts` - 문제 API 함수
  - `recommend`, `getProblemDetail`, `search`
- [ ] `hooks/api/useProblem.ts` - 문제 React Query 훅

#### 3.2 문제 페이지 구현
- [ ] `features/problem/pages/ProblemListPage.tsx` - 문제 목록 페이지
  - **상단에 가로 스크롤 가능한 Select 박스 또는 텍스트 입력 + 자동완성(Autocomplete) 방식의 카테고리 필터 배치**
  - 카테고리 선택 시 해당 카테고리의 문제만 필터링 (`/api/v1/problems/recommend?category={category}`)
  - 공간 절약 및 깔끔한 UI 제공
- [ ] `features/problem/pages/ProblemDetailPage.tsx` - **문제 상세 페이지**
  - 문제 내용은 기본적으로 표시 (Blur 제거)
  - **"문제 풀기 시작" 버튼은 타이머 시작 및 StudyPage 이동만 수행**
- [ ] `features/problem/components/ProblemCard.tsx` - 문제 카드 컴포넌트
- [ ] `features/problem/components/ProblemDetail.tsx` - 문제 상세 컴포넌트
- [ ] `features/problem/components/ProblemCategoryFilter.tsx` - **카테고리 필터 컴포넌트 (가로 스크롤 Select 또는 Autocomplete)**
- [ ] `features/problem/components/ProblemRecommend.tsx` - 문제 추천 컴포넌트
- [ ] `features/problem/components/ProblemSearch.tsx` - 문제 검색 컴포넌트

#### 3.3 학습 관련 API 및 타입
- [ ] `types/api/study.types.ts` - 학습 타입 정의
- [ ] `api/endpoints/study.api.ts` - 학습 API 함수
  - `submitSolution`
- [ ] `hooks/api/useStudy.ts` - 학습 React Query 훅

#### 3.4 학습 페이지 구현
- [ ] `features/study/pages/StudyPage.tsx` - 학습 페이지
- [ ] `features/study/components/CodeEditor.tsx` - 코드 에디터 컴포넌트
- [ ] `features/study/components/SubmitForm.tsx` - 제출 폼 컴포넌트
- [ ] `features/study/components/ResultDisplay.tsx` - 결과 표시 컴포넌트
- [ ] `features/study/components/RetrospectivePrompt.tsx` - **회고 작성 유도 컴포넌트**
  - 코드 제출 성공/실패 후 즉시 표시
  - "회고 작성 여부" 체크
  - 정적 템플릿(성공/실패용)이 적용된 회고 작성 페이지로 이동 유도

#### 3.5 회고 관련 API 및 타입
- [ ] `types/api/retrospective.types.ts` - 회고 타입 정의
- [ ] `api/endpoints/retrospective.api.ts` - 회고 API 함수
  - `createRetrospective`, `getRetrospectives`, `getRetrospective`, `toggleBookmark`, `deleteRetrospective`, `getTemplate`, `getStaticTemplate`
- [ ] `hooks/api/useRetrospective.ts` - 회고 React Query 훅

#### 3.6 AI 분석 API 및 타입
- [ ] `types/api/ai.types.ts` - AI 분석 타입 정의
- [ ] `api/endpoints/ai.api.ts` - AI 분석 API 함수
  - `analyze`
- [ ] `hooks/api/useAi.ts` - AI 분석 React Query 훅

#### 3.7 회고 페이지 구현
- [ ] `features/retrospective/pages/RetrospectiveListPage.tsx` - 회고 목록 페이지
  - 검색창 아래에 **가로 스크롤 가능한 Select 박스 또는 텍스트 입력 + 자동완성(Autocomplete) 방식의 카테고리 필터** 배치
  - 알고리즘 주제별로 내가 쓴 회고를 쉽게 모아볼 수 있도록 필터링 기능 제공
  - 선택된 카테고리로 `/api/v1/retrospectives?category={category}` API 호출
- [ ] `features/retrospective/pages/RetrospectiveDetailPage.tsx` - 회고 상세 페이지
- [ ] `features/retrospective/pages/RetrospectiveWritePage.tsx` - 회고 작성 페이지
  - **'풀이 카테고리' 입력란을 가로 스크롤 가능한 Select 박스 또는 텍스트 입력 + 자동완성(Autocomplete) 방식으로 변경**
  - 선택된 카테고리는 `solvedCategory` 필드로 저장
  - **마크다운 클립보드 복사 기능:**
    - "Markdown 복사" 버튼 클릭 시 작성된 회고 내용 전체를 클립보드에 복사
    - 복사되는 마크다운의 맨 마지막 줄에 `> _Generated by DidimLog_` 출처 푸터 자동 추가
    - 템플릿에서 `AI Generated` 관련 문구 완전 제거
- [ ] `features/retrospective/components/RetrospectiveCard.tsx` - 회고 카드 컴포넌트
- [ ] `features/retrospective/components/RetrospectiveEditor.tsx` - 회고 에디터 컴포넌트
  - **카테고리 선택 UI 통합 (CategorySelect 컴포넌트 재사용)**
  - **마크다운 클립보드 복사 기능 통합**
- [ ] `features/retrospective/components/RetrospectiveList.tsx` - 회고 목록 컴포넌트
- [ ] `features/retrospective/components/CategoryFilter.tsx` - **회고 목록용 카테고리 필터 컴포넌트 (Select 또는 Autocomplete)**
- [ ] `features/retrospective/components/TemplateSelector.tsx` - 템플릿 선택 컴포넌트

**완료 기준:**
- ✅ 문제 추천, 검색, 상세 조회가 정상 동작
- ✅ **문제 목록 페이지에서 카테고리 Select/Autocomplete로 필터링이 정상 동작**
- ✅ 코드 제출 및 결과 저장이 정상 동작
- ✅ 회고 작성, 조회, 수정, 삭제가 정상 동작
- ✅ **회고 작성 시 카테고리를 Select/Autocomplete로 선택할 수 있음**
- ✅ **회고 작성 페이지에서 마크다운 클립보드 복사 기능이 정상 동작 (출처 푸터 포함)**
- ✅ **템플릿에서 AI Generated 문구가 제거됨**
- ✅ **회고 목록에서 카테고리 필터로 검색이 정상 동작**
- ✅ AI 분석 기능이 정상 동작
- ✅ 템플릿 생성이 정상 동작

---

### Phase 4: 랭킹, 통계 & 관리자 페이지 (1-2주)

**목표:** 부가 기능 및 관리자 기능 구현

#### 4.1 통계 API 및 타입
- [ ] `types/api/statistics.types.ts` - 통계 타입 정의
- [ ] `api/endpoints/statistics.api.ts` - 통계 API 함수
- [ ] `hooks/api/useStatistics.ts` - 통계 React Query 훅

#### 4.2 통계 페이지 구현
- [ ] `features/statistics/pages/StatisticsPage.tsx` - 통계 페이지
- [ ] `features/statistics/components/HeatmapChart.tsx` - 잔디 차트 컴포넌트
- [ ] `features/statistics/components/CategoryChart.tsx` - 카테고리 차트 컴포넌트
- [ ] `features/statistics/components/AlgorithmChart.tsx` - 알고리즘 차트 컴포넌트

#### 4.3 랭킹 API 및 타입
- [ ] `types/api/ranking.types.ts` - 랭킹 타입 정의
- [ ] `api/endpoints/ranking.api.ts` - 랭킹 API 함수
- [ ] `hooks/api/useRanking.ts` - 랭킹 React Query 훅

#### 4.4 랭킹 페이지 구현
- [ ] `features/ranking/pages/RankingPage.tsx` - 랭킹 페이지
- [ ] `features/ranking/components/Leaderboard.tsx` - 리더보드 컴포넌트
- [ ] `features/ranking/components/RankingFilter.tsx` - **랭킹 필터 컴포넌트**
  - "회고 작성 횟수" 기준
  - 월별/일별 필터링 제공
  - Top 100 표시

#### 4.5 피드백 API 및 타입
- [ ] `types/api/feedback.types.ts` - 피드백 타입 정의
- [ ] `api/endpoints/feedback.api.ts` - 피드백 API 함수
- [ ] `hooks/api/useFeedback.ts` - 피드백 React Query 훅

#### 4.6 관리자 API 및 타입
- [ ] `types/api/admin.types.ts` - 관리자 타입 정의
- [ ] `api/endpoints/admin.api.ts` - 관리자 API 함수
  - 사용자 관리, 명언 관리, 피드백 관리, 대시보드 통계, 문제 수집
- [ ] `hooks/api/useAdmin.ts` - 관리자 React Query 훅

#### 4.7 관리자 페이지 구현
- [ ] `features/admin/pages/AdminDashboardPage.tsx` - **관리자 대시보드 페이지**
  - 총 사용자 수, 일일 가입자 수 등을 **그래프(Line/Bar Chart)**로 시각화
- [ ] `features/admin/pages/AdminUsersPage.tsx` - 사용자 관리 페이지
- [ ] `features/admin/components/UserManagement.tsx` - 사용자 관리 컴포넌트
- [ ] `features/admin/components/QuoteManagement.tsx` - 명언 관리 컴포넌트
- [ ] `features/admin/components/FeedbackManagement.tsx` - 피드백 관리 컴포넌트
- [ ] `features/admin/components/ProblemCollector.tsx` - **문제 크롤링(수집) 제어 페이지**
- [ ] `features/admin/components/AdminStatsChart.tsx` - **관리자 통계 차트 컴포넌트**
  - Line Chart (일일 가입자 추이)
  - Bar Chart (총 사용자 수 등)

**완료 기준:**
- ✅ 통계 페이지에서 잔디, 카테고리 분포가 정상 표시됨
- ✅ 랭킹 페이지가 정상 동작함
- ✅ 관리자 페이지에서 사용자, 명언, 피드백 관리가 정상 동작함
- ✅ 모든 권한 체크가 정상 동작함

---

## 기술 스택

### 핵심 라이브러리

| 카테고리 | 라이브러리 | 버전 | 용도 |
|---------|----------|------|------|
| **프레임워크** | React | ^18.2.0 | UI 라이브러리 |
| **빌드 도구** | Vite | ^5.0.0 | 번들러 및 개발 서버 |
| **언어** | TypeScript | ^5.0.0 | 타입 안정성 |
| **라우팅** | React Router | ^6.20.0 | 클라이언트 사이드 라우팅 |
| **상태 관리** | Zustand | ^4.4.0 | 클라이언트 상태 관리 |
| **서버 상태** | React Query (TanStack Query) | ^5.0.0 | 서버 데이터 캐싱 및 동기화 |
| **HTTP 클라이언트** | Axios | ^1.6.0 | API 통신 |
| **폼 관리** | React Hook Form | ^7.48.0 | 폼 상태 관리 및 유효성 검사 |
| **유효성 검사** | Zod | ^3.22.0 | 스키마 기반 유효성 검사 |

### 개발 도구

| 도구 | 용도 |
|------|------|
| **ESLint** | 코드 린팅 |
| **Prettier** | 코드 포맷팅 |
| **TypeScript** | 타입 체크 |
| **Vitest** | 단위 테스트 (선택사항) |

### 스타일링 (선택사항)

| 라이브러리 | 용도 |
|----------|------|
| **Tailwind CSS** | 유틸리티 기반 CSS (권장) |
| 또는 **CSS Modules** | 컴포넌트 스코프 CSS |
| 또는 **Styled Components** | CSS-in-JS |

### 추가 라이브러리 (필요 시)

| 라이브러리 | 용도 |
|----------|------|
| **react-markdown** | 마크다운 렌더링 (회고 내용 표시) |
| **react-syntax-highlighter** | 코드 하이라이팅 |
| **date-fns** | 날짜 포맷팅 |
| **recharts** | 차트 라이브러리 (통계 페이지) |
| **react-hot-toast** | 토스트 알림 |

### 프로젝트 구조 요약

```
didim-log-FE/
├── package.json          # 의존성 관리
├── tsconfig.json         # TypeScript 설정
├── vite.config.ts        # Vite 설정
├── .eslintrc.json        # ESLint 설정
├── .prettierrc           # Prettier 설정
├── .env                  # 환경 변수
└── src/
    ├── api/              # API 클라이언트
    ├── types/            # TypeScript 타입
    ├── stores/           # Zustand 스토어
    ├── hooks/            # Custom Hooks
    ├── components/       # 공통 컴포넌트
    ├── features/         # Feature 모듈
    ├── routes/           # 라우팅
    ├── utils/            # 유틸리티
    ├── lib/              # 라이브러리 설정
    ├── styles/           # 스타일
    ├── App.tsx           # 루트 컴포넌트
    └── main.tsx          # 진입점
```

---

## 구현 체크리스트

### Phase 1 체크리스트
- [ ] 프로젝트 초기 설정 완료
- [ ] 타입 시스템 구축 완료
- [ ] API 클라이언트 구축 완료
- [ ] 상태 관리 구축 완료
- [ ] 인증 훅 구현 완료
- [ ] 라우팅 시스템 구축 완료
- [ ] 인증 페이지 구현 완료
- [ ] 공통 컴포넌트 구현 완료
- [ ] 로그인 플로우 테스트 통과
- [ ] OAuth 플로우 테스트 통과

### Phase 2 체크리스트
- [ ] 대시보드 API 및 타입 완료
- [ ] 대시보드 페이지 구현 완료
- [ ] 프로필 API 및 타입 완료
- [ ] 프로필 페이지 구현 완료
- [ ] 명언 API 완료

### Phase 3 체크리스트
- [ ] 문제 관련 API 및 타입 완료
- [ ] 문제 페이지 구현 완료
- [ ] **카테고리 필터 컴포넌트 구현 완료**
- [ ] 학습 관련 API 및 타입 완료
- [ ] 학습 페이지 구현 완료
- [ ] 회고 관련 API 및 타입 완료
- [ ] 회고 페이지 구현 완료
- [ ] **회고 작성 시 카테고리 Select/Autocomplete 선택 기능 완료**
- [ ] **회고 작성 페이지에서 마크다운 클립보드 복사 기능 완료**
- [ ] AI 분석 API 완료

### Phase 4 체크리스트
- [ ] 통계 API 및 타입 완료
- [ ] 통계 페이지 구현 완료
- [ ] 랭킹 API 및 타입 완료
- [ ] 랭킹 페이지 구현 완료
- [ ] 피드백 API 완료
- [ ] 관리자 API 및 타입 완료
- [ ] 관리자 페이지 구현 완료

---

## 주의사항

### 1. 타입 안정성
- 모든 API 요청/응답에 타입을 정의해야 합니다.
- `any` 타입 사용을 최대한 지양합니다.
- API 명세서와 타입이 일치해야 합니다.

### 2. 에러 처리
- 모든 API 호출에 에러 처리를 구현해야 합니다.
- 사용자에게 명확한 에러 메시지를 표시해야 합니다.
- 네트워크 에러, 401, 403, 404 등 각 상황에 맞는 처리가 필요합니다.

### 3. 로딩 상태
- 모든 비동기 작업에 로딩 상태를 표시해야 합니다.
- React Query의 `isLoading`, `isPending` 상태를 활용합니다.

### 4. 인증 플로우
- 토큰 저장 → 헤더 설정 → 상태 업데이트가 **동기적으로** 완료된 후에만 리다이렉트합니다.
- `Promise.all()`을 사용하여 필요한 비동기 작업 완료를 보장합니다.

### 5. 코드 품질
- 컴포넌트는 단일 책임 원칙을 따릅니다.
- 재사용 가능한 컴포넌트는 `components/`에 배치합니다.
- Feature별 컴포넌트는 `features/`에 배치합니다.

### 6. 카테고리 선택 UI/UX
- **원칙**: 공간 절약 및 깔끔한 UI를 위해 가로 스크롤 가능한 Select 박스 또는 텍스트 입력 + 자동완성(Autocomplete) 방식을 사용합니다.
- **상수 정의**: `utils/constants.ts`에 주요 알고리즘 카테고리 목록을 상수로 정의합니다.
  - 예: BFS, DFS, DP, Greedy, Graph, String, Implementation, BruteForce, BinarySearch, TwoPointers, Sorting, Math 등
- **재사용성**: `CategorySelect` 컴포넌트를 공통 컴포넌트로 구현하여 여러 페이지에서 재사용합니다.
- **일관성**: 문제 목록, 회고 작성, 회고 목록에서 동일한 카테고리 선택 UI를 사용합니다.

### 7. 마크다운 클립보드 복사 기능
- **원칙**: 파일 다운로드 대신 클립보드 복사 방식을 사용하여 사용자 편의성 향상.
- **구현**: `navigator.clipboard.writeText()` API를 사용하여 마크다운 내용을 클립보드에 복사.
- **출처 푸터**: 복사되는 마크다운의 맨 마지막 줄에 `> _Generated by DidimLog_` 자동 추가.
- **템플릿 정리**: 템플릿에서 `AI Generated` 관련 문구를 완전히 제거하여 깔끔한 내용 제공.

---

## 다음 단계

이 계획서가 승인되면, **Phase 1**부터 순차적으로 코드를 작성하겠습니다.

각 Phase 완료 후에는 다음을 수행합니다:
1. 코드 리뷰 및 검증
2. 버그 수정
3. 사용자 승인 후 다음 Phase 진행
