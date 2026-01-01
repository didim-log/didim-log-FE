# 버그 수정 및 개선 작업 지시서 (Fix Task List)

**작성일**: 2024  
**대상 프로젝트**: DidimLog Frontend (develop 브랜치)  
**기반 보고서**: `DESIGN_AND_ROUTING_AUDIT.md`

---

## 📋 작업 우선순위 안내

- **Priority 1 (Critical)**: 즉시 수정 필요 - 서비스 사용 불가 상태
- **Priority 2 (High)**: 1주일 내 수정 권장 - UX 저하
- **Priority 3 (Medium)**: 2주일 내 수정 권장 - 개선 사항
- **Priority 4 (Low)**: 여유 있을 때 진행 - 코드 정리

---

## 🔴 Priority 1 (Critical) - 즉시 수정 필요

### Task 1.1: 로그인 페이지 텍스트 가시성 문제 수정

**문제**: 로그인 페이지에서 배경은 흰색인데 텍스트도 흰색으로 보이지 않음

**근본 원인**: 테마 초기화가 컴포넌트 렌더링 이후에 실행되어, 초기 렌더링 시 다크모드 클래스가 적용되지 않음

**수정 파일**: `src/main.tsx`

**수정 내용**:
```tsx
// src/main.tsx 수정
// 1. RouterProvider 렌더링 전에 테마를 동기적으로 초기화

const rootElement = document.getElementById('root')!;

// persist된 테마를 동기적으로 읽어서 즉시 적용 (렌더링 전)
const savedTheme = localStorage.getItem('ui-storage');
if (savedTheme) {
    try {
        const parsed = JSON.parse(savedTheme);
        if (parsed.state?.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    } catch {
        // 기본값: 다크 모드
        document.documentElement.classList.add('dark');
    }
} else {
    // 기본값: 다크 모드
    document.documentElement.classList.add('dark');
}

// 기존 App 컴포넌트의 useEffect에서 테마 초기화 로직 제거 또는 조정
const App = () => {
    // useEffect에서 테마 초기화 로직 제거 (이미 위에서 처리)
    return <RouterProvider router={router} />;
};

createRoot(rootElement).render(
    <StrictMode>
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <Toaster position="top-center" richColors />
                <App />
            </QueryClientProvider>
        </ErrorBoundary>
    </StrictMode>
);
```

**추가 수정**: `src/features/auth/pages/LoginPage.tsx`

**수정 내용**:
```tsx
// 최상위 컨테이너에 명시적 텍스트 색상 추가 (이중 안전장치)
<div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

**검증 방법**:
1. 개발 서버 재시작
2. 브라우저 캐시 및 로컬 스토리지 클리어
3. 로그인 페이지 접속
4. 텍스트가 명확하게 보이는지 확인 (라이트 모드 및 다크 모드 모두 테스트)

**예상 소요 시간**: 30분

---

### Task 1.2: 대시보드 404 라우팅 에러 수정

**문제**: 로그인 성공 후 `/dashboard`로 이동 시 404 Not Found 에러 발생

**근본 원인**: 로그인 성공 후 상태 업데이트(`setToken`, `setUser`)와 네비게이션(`navigate`)의 타이밍 불일치

**수정 파일 1**: `src/hooks/auth/useLogin.ts`

**수정 방법 A (권장 - 간단한 방법)**:
```tsx
// src/hooks/auth/useLogin.ts 수정
onSuccess: async (data: AuthResponse) => {
    // 1. 토큰 저장
    setToken(data.token);
    
    // 2. 사용자 정보 저장
    const { decodeJwt } = await import('../../utils/jwt');
    const payload = decodeJwt(data.token);
    const user = {
        id: payload?.sub || '',
        nickname: '',
        bojId: payload?.sub || '',
        email: null,
        role: (payload?.role as 'USER' | 'ADMIN' | 'GUEST') || 'USER',
        rating: data.rating,
        tier: data.tier,
        tierLevel: data.tierLevel,
        provider: 'BOJ' as const,
    };
    setUser(user);
    
    // 3. 상태 업데이트 완료 대기 (다음 이벤트 루프 틱까지)
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // 4. 상태 확인 후 리다이렉트
    const { isAuthenticated, token: currentToken } = useAuthStore.getState();
    if (isAuthenticated && currentToken) {
        navigate('/dashboard', { replace: true });
    }
},
```

**수정 방법 B (더 확실한 방법 - subscribe 활용)**:
```tsx
// src/hooks/auth/useLogin.ts 수정 (더 복잡하지만 확실함)
onSuccess: async (data: AuthResponse) => {
    setToken(data.token);
    
    const { decodeJwt } = await import('../../utils/jwt');
    const payload = decodeJwt(data.token);
    const user = {
        // ... user 객체 생성
    };
    setUser(user);
    
    // 상태 업데이트 완료를 기다리는 Promise
    await new Promise<void>((resolve) => {
        const checkState = () => {
            const state = useAuthStore.getState();
            if (state.isAuthenticated && state.token) {
                resolve();
            } else {
                // 짧은 지연 후 다시 확인
                setTimeout(checkState, 10);
            }
        };
        checkState();
    });
    
    navigate('/dashboard', { replace: true });
},
```

**수정 파일 2**: `src/routes/PrivateRoute.tsx`

**수정 내용**: 렌더링 시점에 즉시 인증 체크 (useEffect 대신)
```tsx
// src/routes/PrivateRoute.tsx 수정
import { Navigate } from 'react-router-dom'; // 추가

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { isAuthenticated, token, _hasHydrated } = useAuthStore();
    const location = useLocation(); // navigate 제거 (Navigate 컴포넌트 사용)

    // persist 복원 중에는 로딩 표시
    if (!_hasHydrated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <Spinner />
            </div>
        );
    }

    // 인증되지 않은 경우 Navigate 컴포넌트로 리다이렉트
    if (!isAuthenticated || !token) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return <>{children}</>;
};
```

**수정 파일 3**: `src/router.tsx`

**수정 내용**: `/dashboard` 라우트에 errorElement 추가
```tsx
{
    path: '/dashboard',
    element: (
        <PrivateRoute>
            <DashboardPage />
        </PrivateRoute>
    ),
    errorElement: <NotFoundPage />, // 추가
},
```

**검증 방법**:
1. 개발 서버 재시작
2. 로그인 페이지에서 로그인 시도
3. 로그인 성공 후 `/dashboard`로 정상 이동하는지 확인
4. 브라우저 개발자 도구에서 네트워크 탭 확인 (404 에러 없어야 함)

**예상 소요 시간**: 1시간

---

## 🟡 Priority 2 (High) - 1주일 내 수정 권장

### Task 2.1: 전역 CSS와 Tailwind 클래스 충돌 해결

**문제**: `index.css`의 body color 속성이 컴포넌트 스타일과 충돌할 수 있음

**수정 파일**: `src/index.css`

**수정 내용**:
```css
/* src/index.css 수정 */
html {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  /* 텍스트 색상은 html 레벨에서 지정 (body보다 우선순위 높음) */
  color: #111827; /* text-gray-900 */
}

.dark html {
  color: #f9fafb; /* text-gray-50 */
}

body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  min-width: 320px;
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* color 제거 - html에서 상속됨 */
  background-color: #f9fafb; /* bg-gray-50 */
}

.dark body {
  /* color 제거 - html에서 상속됨 */
  background-color: #111827; /* dark:bg-gray-900 */
}
```

**검증 방법**:
1. 모든 페이지에서 텍스트 색상이 올바르게 표시되는지 확인
2. 라이트 모드 및 다크 모드 모두 테스트

**예상 소요 시간**: 30분

---

### Task 2.2: 테마 관리 시스템 통합

**문제**: `ThemeContext`와 `ui.store`가 공존하여 혼란 발생 가능

**수정 파일**: `src/contexts/ThemeContext.tsx`

**옵션 A: ThemeContext 제거 (권장)**
- `ThemeContext.tsx` 파일 삭제
- 전체 코드베이스에서 `ThemeContext` import 제거
- `ui.store`만 사용

**옵션 B: ThemeContext를 ui.store 래퍼로 변경**
```tsx
// src/contexts/ThemeContext.tsx 수정
import { useUIStore } from '../stores/ui.store';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const { theme, toggleTheme, setTheme } = useUIStore();
    
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
```

**검증 방법**:
1. 테마 토글 기능이 정상 작동하는지 확인
2. 페이지 새로고침 시 테마가 유지되는지 확인

**예상 소요 시간**: 1시간

---

## 🎨 Priority 2.5: UI/UX Visual Polish (대시보드 고도화)

### Task 2.3: 대시보드 비주얼 업그레이드

**목표**: 대시보드 UI/UX를 전면적으로 리디자인하여 시각적 완성도 및 사용자 경험 향상

**레퍼런스 스타일**:
- 전반적인 톤: 깔끔하고 여백이 있는 미니멀리즘 (White/Gray 배경)
- 티어 정보: 실제 백준 티어 이미지 사용
- 진행 바: 세련된 멀티 컬러 그라데이션 (Blue → Purple → Pink)
- 레이아웃: 카드 간 간격과 그림자 조정으로 현대적인 느낌 부여

**수정 파일 1**: `src/features/dashboard/components/TierBadge.tsx` (신규 생성)

**작업 내용**:
- **기존 Lucide 아이콘 제거**: 현재 사용 중인 텍스트/이모지 기반 아이콘 제거
- **티어 이미지 매핑**: `/public/images/tier/{tier}.svg` (또는 `.png`) 경로의 이미지를 불러오는 로직 구현
  - 예상 이미지 파일명: `bronze.svg`, `silver.svg`, `gold.svg`, `platinum.svg`, `diamond.svg`, `ruby.svg`
  - 티어명(`BRONZE`, `SILVER`, `GOLD`, `PLATINUM`, `DIAMOND`, `RUBY`)을 이미지 경로로 변환하는 매핑 함수 작성
- **Fallback 처리**: 이미지 로딩 실패 시 이모지 또는 텍스트 fallback 표시
- **크기 옵션**: `sm`, `md`, `lg` 크기 옵션 지원

**수정 파일 2**: `src/features/dashboard/components/TierProgress.tsx`

**작업 내용**:
- **TierBadge 교체**: 기존 이모지 아이콘(`getTierIcon`) 대신 `TierBadge` 컴포넌트 사용
- **CSS Gradient 적용**: 진행 바에 세련된 멀티 컬러 그라데이션 적용 (`bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500`)
- **애니메이션 효과**:
  - `transition-all duration-1000 ease-out` 적용으로 부드러운 전환 효과
  - `animate-shimmer` 애니메이션 효과 추가 (Tailwind config에 keyframes 정의 필요)
- **레이아웃 개선**: 텍스트와 게이지 바 사이의 간격 조정 (`space-y-2` 등)
- **시각적 강화**:
  - 진행 바 높이를 `h-4`에서 `h-6`으로 증가
  - 그림자 효과 강화: `shadow-inner` + `shadow-lg` 조합

**수정 파일 3**: `src/features/dashboard/pages/DashboardPage.tsx`

**작업 내용**:
- **Card 컴포넌트 스타일링**:
  - 그림자 강화: `shadow-sm` → `shadow-md` (부드러운 그림자로 현대적인 느낌)
  - `border-radius` 통일: `rounded-lg` → `rounded-xl` (더 부드러운 모서리)
  - 내부 `padding` 증가: `p-6` → `p-8` (여백 확보로 미니멀리즘 강조)
- **Grid 레이아웃 최적화**:
  - 반응형 배치: 모바일 1열, 태블릿 2열, 데스크톱 3열 (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
  - 카드 간 간격 증가: `gap-6` → `gap-8`, `space-y-6` → `space-y-8` (정보 위계 명확화)
- **폰트 위계(Hierarchy) 명확화**: 제목과 본문의 폰트 크기 및 굵기 차별화

**수정 파일 4**: `src/features/dashboard/components/QuoteCard.tsx`

**작업 내용**:
- **인용구 아이콘 스타일 변경**: 기존 이모지 또는 Lucide 아이콘을 SVG로 변경하여 모던한 느낌 부여
- **배경 디자인**: 
  - 은은한 그라데이션 또는 패턴 추가: `bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20`
  - 배경에 시각적 흥미를 주되 텍스트 가독성 유지
- **카드 스타일 통일**: `rounded-xl`, `shadow-md`, `p-6` 적용
- **아이콘 배치**: 아이콘을 원형 배경(`rounded-full`)에 배치하여 시각적 포인트 제공

**수정 파일 5**: `tailwind.config.js`

**작업 내용**:
- `shimmer` 애니메이션 keyframes 추가:
  ```js
  keyframes: {
      shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
      },
  },
  animation: {
      shimmer: 'shimmer 2s infinite',
  },
  ```

**검증 방법**:
1. 대시보드 페이지 접속 후 전체 레이아웃 확인
2. 티어 이미지가 올바르게 표시되는지 확인 (각 티어별)
3. 진행 바 그라데이션 및 shimmer 애니메이션 동작 확인
4. 카드 간 간격 및 그림자 효과 확인
5. 라이트 모드 및 다크 모드 모두 테스트
6. 반응형 레이아웃 확인 (모바일, 태블릿, 데스크톱)

**예상 소요 시간**: 4시간

---

## 🟢 Priority 3 (Medium) - 2주일 내 수정 권장

### Task 3.1: 온보딩 라우팅 구조 개선

**문제**: 온보딩이 대시보드 내 모달로만 제공되어, 건너뛰기 가능 및 플로우 일관성 부족

**수정 파일**: `src/router.tsx`

**수정 내용**: 온보딩 페이지 라우트 추가
```tsx
// src/router.tsx에 추가
import { OnboardingPage } from './features/auth/pages/OnboardingPage'; // 새로 생성 필요

{
    path: '/onboarding',
    element: (
        <PrivateRoute>
            <OnboardingPage />
        </PrivateRoute>
    ),
    errorElement: <NotFoundPage />,
},
```

**새로 생성할 파일**: `src/features/auth/pages/OnboardingPage.tsx`
- 기존 `OnboardingModal` 컴포넌트를 페이지로 변환
- 또는 새로 구현

**수정 파일**: `src/routes/RootRedirect.tsx` 또는 `src/hooks/auth/useSignup.ts`

**수정 내용**: 회원가입 완료 후 `/onboarding`으로 리다이렉트
```tsx
// 회원가입 성공 후
navigate('/onboarding', { replace: true });
```

**검증 방법**:
1. 신규 회원가입 플로우 테스트
2. 회원가입 완료 후 온보딩 페이지로 이동하는지 확인
3. 온보딩 완료 후 대시보드로 이동하는지 확인

**예상 소요 시간**: 3시간

---

### Task 3.2: 라우터 에러 처리 개선

**문제**: 모든 라우트에 errorElement가 없어서 에러 발생 시 기본 404 페이지 표시

**수정 파일**: `src/router.tsx`

**수정 내용**: 모든 PrivateRoute 라우트에 errorElement 추가
```tsx
{
    path: '/problems',
    element: (
        <PrivateRoute>
            <ProblemListPage />
        </PrivateRoute>
    ),
    errorElement: <NotFoundPage />, // 추가
},
// ... 나머지 라우트에도 동일하게 추가
```

**검증 방법**:
1. 각 라우트에서 의도적으로 에러 발생시키기 (예: 컴포넌트에서 throw)
2. NotFoundPage가 올바르게 표시되는지 확인

**예상 소요 시간**: 1시간

---

## 🔵 Priority 4 (Low) - 여유 있을 때 진행

### Task 4.1: 불필요한 스타일 코드 정리

**작업 내용**:
- 사용되지 않는 CSS 클래스 제거
- 중복된 스타일 정의 통합
- 컴포넌트별 스타일 일관성 점검

**예상 소요 시간**: 2시간

---

## ✅ 작업 체크리스트

### Priority 1 (Critical)
- [ ] **Task 1.1**: 로그인 페이지 텍스트 가시성 문제 수정
  - [ ] `src/main.tsx` 수정 (테마 동기적 초기화)
  - [ ] `src/features/auth/pages/LoginPage.tsx` 수정 (명시적 텍스트 색상)
  - [ ] 검증 완료
- [ ] **Task 1.2**: 대시보드 404 라우팅 에러 수정
  - [ ] `src/hooks/auth/useLogin.ts` 수정 (상태 업데이트 대기)
  - [ ] `src/routes/PrivateRoute.tsx` 수정 (Navigate 컴포넌트 사용)
  - [ ] `src/router.tsx` 수정 (errorElement 추가)
  - [ ] 검증 완료

### Priority 2 (High)
- [ ] **Task 2.1**: 전역 CSS와 Tailwind 클래스 충돌 해결
  - [ ] `src/index.css` 수정
  - [ ] 검증 완료
- [ ] **Task 2.2**: 테마 관리 시스템 통합
  - [ ] `ThemeContext` 제거 또는 통합
  - [ ] 검증 완료

### Priority 2.5: UI/UX Visual Polish (대시보드 고도화)
- [ ] **Task 2.3**: 대시보드 비주얼 업그레이드
  - [ ] `TierBadge` 컴포넌트 생성 및 티어 이미지 매핑 (기존 Lucide 아이콘 제거)
  - [ ] `TierProgress` 컴포넌트에 멀티 컬러 그라데이션 및 애니메이션 적용
  - [ ] `DashboardPage` 레이아웃 개선 (카드 스타일, 간격, 그림자, 반응형 배치)
  - [ ] `QuoteCard` 스타일 개선 (SVG 아이콘, 그라데이션 배경)
  - [ ] `tailwind.config.js`에 shimmer 애니메이션 추가
  - [ ] 검증 완료

### Priority 3 (Medium)
- [ ] **Task 3.1**: 온보딩 라우팅 구조 개선
  - [ ] `OnboardingPage` 생성
  - [ ] 라우트 추가
  - [ ] 리다이렉트 로직 수정
  - [ ] 검증 완료
- [ ] **Task 3.2**: 라우터 에러 처리 개선
  - [ ] 모든 라우트에 errorElement 추가
  - [ ] 검증 완료

### Priority 4 (Low)
- [ ] **Task 4.1**: 불필요한 스타일 코드 정리

---

## 📝 작업 완료 후 확인 사항

1. **기능 테스트**:
   - [ ] 로그인 페이지에서 텍스트가 명확하게 보이는지 확인 (라이트/다크 모드 모두)
   - [ ] 로그인 후 대시보드로 정상 이동하는지 확인
   - [ ] 로그아웃 후 다시 로그인해도 정상 작동하는지 확인
   - [ ] 브라우저 새로고침 후에도 테마가 유지되는지 확인

2. **에러 확인**:
   - [ ] 브라우저 콘솔에 에러가 없는지 확인
   - [ ] 네트워크 탭에서 404 에러가 없는지 확인

3. **크로스 브라우저 테스트**:
   - [ ] Chrome
   - [ ] Firefox
   - [ ] Safari
   - [ ] Edge

---

**문서 버전**: 1.0  
**최종 수정일**: 2024

