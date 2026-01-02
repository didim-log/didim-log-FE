# 📘 Code Submission & Retrospective Implementation Guide

## 개요

이 문서는 "Code Submission & Retrospective" 기능 구현 가이드를 제공합니다.  
**User Preference Persistence (Primary Language)** 와 **AI Review UI Separation** 을 포함합니다.

---

## 🎯 구현 완료 항목

### ✅ 1. User Preference: Primary Language Persistence

**파일:**
- `src/stores/user.store.ts` - Zustand 스토어 생성
- `src/features/study/components/CodeEditor.tsx` - 언어 선택 드롭다운 추가

**구현 내용:**
1. ✅ `useUserStore` 스토어 생성 (`src/stores/user.store.ts`)
   - `primaryLanguage` 상태 관리
   - `setPrimaryLanguage` 함수 제공
   - LocalStorage에 자동 저장 (Zustand persist)

2. ✅ `CodeEditor` 컴포넌트 업데이트
   - Primary Language를 기본값으로 설정
   - 언어 선택 드롭다운 추가
   - Controlled/Uncontrolled 패턴 지원

**사용 방법:**
```tsx
// Dashboard 로드 시 Primary Language 동기화
import { useUserStore } from '@/stores/user.store';
import { dashboardApi } from '@/api/endpoints/dashboard.api';

const { setPrimaryLanguage } = useUserStore();

// Dashboard 데이터 로드 후
const dashboard = await dashboardApi.getDashboard();
setPrimaryLanguage(dashboard.studentProfile.primaryLanguage);
```

---

### ✅ 2. UI Component: `<AiReviewCard />`

**파일:**
- `src/components/retrospective/AiReviewCard.tsx`
- `src/api/endpoints/log.api.ts`
- `src/types/api/log.types.ts`

**구현 내용:**
1. ✅ AI 리뷰 카드 컴포넌트
   - Google Gemini 스타일 아이콘
   - 로딩 상태 (Spinner)
   - 에러 상태 표시
   - 폴링 로직 (최대 20회, 3초 간격)

2. ✅ API 클라이언트
   - `POST /api/v1/logs/{logId}/ai-review`
   - 타입 정의 포함

**특징:**
- **비동기 폴링**: AI 생성 중일 때 자동으로 재요청
- **캐시 표시**: 캐시된 리뷰인지 표시
- **에러 처리**: 503 에러 시 재시도 안내

---

### ✅ 3. UI Component: `<RetrospectiveEditor />`

**파일:**
- `src/components/retrospective/RetrospectiveEditor.tsx`

**구현 내용:**
1. ✅ 정적 마크다운 템플릿 로드
   - `POST /api/v1/retrospectives/template/static`
   - Footer 자동 포함 (API에서 제공)

2. ✅ 에디터 기능
   - Textarea 기반 (Monaco Editor로 교체 가능)
   - 템플릿 내용 수정 가능
   - 변경사항 콜백 제공

---

### ✅ 4. Integration Page: `<RetrospectivePage />`

**파일:**
- `src/features/study/pages/RetrospectivePage.tsx`

**구현 내용:**
1. ✅ 통합 레이아웃
   - AI 리뷰 카드 (상단)
   - 구분선
   - 회고 에디터 (하단)
   - 저장 버튼

---

## 🔧 추가 구현 필요 사항

### 1. Dashboard에서 Primary Language 동기화

**위치:** Dashboard를 로드하는 컴포넌트 또는 Hook

**추가 코드:**
```tsx
// src/hooks/api/useDashboard.ts 또는 Dashboard 페이지
import { useUserStore } from '@/stores/user.store';
import { dashboardApi } from '@/api/endpoints/dashboard.api';

export const useDashboard = () => {
    const { setPrimaryLanguage } = useUserStore();
    
    const { data: dashboard } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const response = await dashboardApi.getDashboard();
            
            // Primary Language 동기화
            if (response.studentProfile.primaryLanguage) {
                setPrimaryLanguage(response.studentProfile.primaryLanguage);
            }
            
            return response;
        },
    });
    
    return { dashboard };
};
```

**또는 Dashboard 페이지 컴포넌트:**
```tsx
// src/features/dashboard/pages/DashboardPage.tsx
import { useEffect } from 'react';
import { useUserStore } from '@/stores/user.store';
import { dashboardApi } from '@/api/endpoints/dashboard.api';

export const DashboardPage: FC = () => {
    const { setPrimaryLanguage } = useUserStore();
    
    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const dashboard = await dashboardApi.getDashboard();
                if (dashboard.studentProfile.primaryLanguage) {
                    setPrimaryLanguage(dashboard.studentProfile.primaryLanguage);
                }
            } catch (error) {
                console.error('Failed to load dashboard:', error);
            }
        };
        
        loadDashboard();
    }, [setPrimaryLanguage]);
    
    // ... 나머지 코드
};
```

---

### 2. StudyPage에서 CodeEditor 사용 업데이트

**현재:** `StudyPage.tsx`에서 CodeEditor를 직접 사용

**업데이트 필요:**
```tsx
// src/features/study/pages/StudyPage.tsx
import { CodeEditor } from '../components/CodeEditor';

export const StudyPage: FC = () => {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('text'); // 이제 CodeEditor가 자동으로 설정
    
    return (
        <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            onLanguageChange={setLanguage}
        />
    );
};
```

**참고:** CodeEditor가 Primary Language를 자동으로 설정하므로, `language` state는 선택적입니다.

---

### 3. Solution 제출 후 logId 획득

**현재 상황:**
- `POST /api/v1/study/submit`은 Solution만 저장하고 Log를 생성하지 않음
- `POST /api/v1/logs/{logId}/ai-review`를 사용하려면 Log가 먼저 존재해야 함
- **Log 생성 API가 현재 없음**

**해결 방안:**

#### Option A: Log 생성 API 추가 (권장)

**백엔드에 추가할 API:**
```kotlin
// LogController.kt
@PostMapping
fun createLog(
    @RequestBody request: LogCreateRequest,
    authentication: Authentication
): ResponseEntity<LogResponse> {
    val log = logService.createLog(
        studentId = authentication.name,
        title = request.title,
        content = request.content,
        code = request.code
    )
    return ResponseEntity.ok(LogResponse.from(log))
}
```

**프론트엔드 플로우:**
```tsx
// StudyPage.tsx
const handleSubmit = async (success: boolean) => {
    // 1. Solution 제출
    const result = await submitSolutionMutation.mutateAsync({...});
    
    // 2. Log 생성 (새 API)
    const logResponse = await logApi.createLog({
        title: `Problem ${problemId} Solution`,
        content: '', // 나중에 회고로 채워짐
        code: code
    });
    
    // 3. RetrospectivePage로 이동
    navigate(`/retrospectives/${logResponse.id}`, {
        state: { code, problemId, isSuccess, logId: logResponse.id }
    });
};
```

#### Option B: Log 없이 AI 리뷰 사용 안 함 (임시)

**프론트엔드 수정:**
```tsx
// RetrospectivePage.tsx
{logId ? (
    <AiReviewCard logId={logId} />
) : (
    <div className="mb-6 text-sm text-gray-500">
        AI 리뷰를 사용할 수 없습니다. (Log ID 필요)
    </div>
)}
```

**권장:** Option A로 Log 생성 API를 추가하는 것이 가장 깔끔한 해결책입니다.

---

### 4. RetrospectivePage 라우팅 설정

**라우트 추가:**
```tsx
// src/routes/index.tsx 또는 App.tsx
import { RetrospectivePage } from '@/features/study/pages/RetrospectivePage';

<Route
    path="/study/retrospective/:logId"
    element={<RetrospectivePage />}
/>
```

**또는 모달/드로어로 표시:**
```tsx
// StudyPage.tsx
const [showRetrospective, setShowRetrospective] = useState(false);
const [logId, setLogId] = useState<string | null>(null);

// Solution 제출 후
if (result.logId) {
    setLogId(result.logId);
    setShowRetrospective(true);
}

// 모달 렌더링
{showRetrospective && logId && (
    <Modal onClose={() => setShowRetrospective(false)}>
        <RetrospectivePage
            logId={logId}
            code={code}
            problemId={problemId}
            isSuccess={isSuccess}
        />
    </Modal>
)}
```

---

### 5. 회고 저장 로직

**RetrospectivePage에서 저장:**
```tsx
// src/features/study/pages/RetrospectivePage.tsx
import { retrospectiveApi } from '@/api/endpoints/retrospective.api';
import { useAuthStore } from '@/stores/auth.store';

const handleSave = async () => {
    const { user } = useAuthStore();
    if (!user?.id || !content.trim()) return;
    
    try {
        await retrospectiveApi.createRetrospective(
            user.id,
            problemId,
            {
                content,
                summary: extractSummary(content), // 첫 줄 또는 요약 추출
                resultType: isSuccess ? 'SUCCESS' : 'FAIL',
            }
        );
        
        // 성공 시 토스트 또는 리다이렉트
        toast.success('회고가 저장되었습니다.');
        navigate('/retrospectives');
    } catch (error) {
        toast.error('회고 저장에 실패했습니다.');
    }
};
```

---

## 📁 파일 구조

```
src/
├── stores/
│   └── user.store.ts                    ✅ 생성됨
├── api/
│   └── endpoints/
│       └── log.api.ts                   ✅ 생성됨
├── types/
│   └── api/
│       └── log.types.ts                 ✅ 생성됨
├── components/
│   └── retrospective/
│       ├── AiReviewCard.tsx             ✅ 생성됨
│       └── RetrospectiveEditor.tsx      ✅ 생성됨
└── features/
    └── study/
        ├── components/
        │   └── CodeEditor.tsx           ✅ 업데이트됨
        └── pages/
            └── RetrospectivePage.tsx    ✅ 생성됨
```

---

## 🎨 UI/UX 특징

### AiReviewCard
- **배경색**: 그라데이션 (blue → indigo → purple)
- **아이콘**: Google Gemini 스타일
- **로딩**: 스피너 애니메이션
- **에러**: 빨간색 경고 박스
- **폴링**: 생성 중일 때 자동 재요청

### RetrospectiveEditor
- **에디터**: Textarea 기반 (Monaco Editor로 업그레이드 가능)
- **템플릿**: API에서 받은 마크다운 자동 로드
- **Footer**: API에서 제공 (`--- Generated by DidimLog`)

### CodeEditor
- **언어 선택**: 드롭다운 메뉴
- **기본값**: Primary Language 자동 설정
- **임시 변경**: 세션 중 변경 가능

---

## 🔍 테스트 체크리스트

- [ ] Primary Language가 Dashboard에서 로드되어 스토어에 저장되는가?
- [ ] CodeEditor가 Primary Language를 기본값으로 표시하는가?
- [ ] 언어를 변경하면 임시로 변경되는가?
- [ ] AiReviewCard가 logId를 받아 API를 호출하는가?
- [ ] AI 생성 중 폴링이 정상 작동하는가?
- [ ] RetrospectiveEditor가 템플릿을 로드하는가?
- [ ] Footer가 템플릿에 포함되어 있는가?
- [ ] RetrospectivePage가 두 컴포넌트를 통합하는가?
- [ ] 회고 저장이 정상 작동하는가?

---

## 🚨 주의사항

1. **logId 획득**: 현재 백엔드 API에 `logId`가 없으므로, 백엔드 수정 또는 대체 방법 필요
2. **에러 처리**: AI 생성 실패 시 사용자에게 명확한 안내 필요
3. **성능**: 폴링은 최대 20회로 제한되어 있음 (약 60초)
4. **타입 안정성**: 모든 API 응답 타입이 정의되어 있음

---

**작성일**: 2025-01-XX  
**작성자**: Senior Frontend Developer

