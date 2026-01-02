# Log ID 획득 방법 분석

## 🔍 현재 상황 분석

### 백엔드 구조 확인 결과

1. **Solution 엔티티**
   - `Student` 엔티티 내부의 `Solutions` 컬렉션에 저장됨 (일급 컬렉션)
   - `POST /api/v1/study/submit` 호출 시 Solution만 저장
   - Solution에는 ID가 없음 (Student 내부 컬렉션)

2. **Log 엔티티**
   - 별도의 MongoDB 컬렉션 (`logs`)
   - 필드: `id`, `title`, `content`, `code`, `aiReview`, `aiReviewStatus`
   - `POST /api/v1/logs/{logId}/ai-review` API는 **Log가 이미 존재해야 함**

3. **현재 API 상태**
   - ❌ Log 생성 API 없음 (`POST /api/v1/logs` 없음)
   - ❌ Solution → Log 변환 API 없음
   - ✅ Log 조회/리뷰 API만 존재

---

## 💡 해결 방안 (백엔드 수정 불필요)

### Option 1: Log 생성 API 추가 (권장)

**백엔드에 추가할 API:**
```
POST /api/v1/logs
Request Body: {
  title: string,
  content: string,
  code: string
}
Response: {
  id: string  // logId
}
```

**프론트엔드 플로우:**
1. Solution 제출 (`POST /api/v1/study/submit`)
2. **Log 생성** (`POST /api/v1/logs` - 새로 추가 필요)
3. AI 리뷰 요청 (`POST /api/v1/logs/{logId}/ai-review`)

---

### Option 2: Solution 제출 시 Log 자동 생성 (백엔드 수정 필요)

**백엔드 수정:**
- `StudyService.submitSolution()`에서 Log도 함께 생성
- `SolutionSubmitResponse`에 `logId` 추가

**프론트엔드 플로우:**
1. Solution 제출 (`POST /api/v1/study/submit`) → `logId` 받음
2. AI 리뷰 요청 (`POST /api/v1/logs/{logId}/ai-review`)

---

### Option 3: Log 없이 AI 리뷰 사용 안 함 (임시)

**프론트엔드 수정:**
- `AiReviewCard` 컴포넌트를 조건부 렌더링
- `logId`가 없으면 AI 리뷰 카드 숨김

```tsx
{logId && <AiReviewCard logId={logId} />}
```

---

## 🎯 권장 사항

**Option 1 (Log 생성 API 추가)**을 권장합니다:
- ✅ 백엔드 수정 최소화 (새 API만 추가)
- ✅ 기존 로직 변경 없음
- ✅ 명확한 책임 분리 (Solution ≠ Log)

**구현 예시:**
```kotlin
// LogController.kt에 추가
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

---

## 📝 결론

**백엔드 수정이 필요한 이유:**
- 현재 Log 생성 API가 없어서 `logId`를 얻을 수 없음
- `POST /api/v1/logs/{logId}/ai-review`를 사용하려면 Log가 먼저 존재해야 함

**대안:**
- Option 3으로 임시 구현 후, 나중에 Log 생성 API 추가 가능
- 또는 회고 작성 시점에 Log를 생성하는 방식으로 변경

