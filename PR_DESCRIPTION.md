# 크롤링 타임아웃 처리 및 checkpoint 재시작 기능 추가

## 📋 변경 사항

### 1. 타임아웃 처리 로직 개선
- 타임아웃 발생 시 `jobId` 확인하여 상태 조회 API 호출
- `lastCheckpointId`가 있으면 `RUNNING` 상태로 설정하고 폴링 시작
- 타임아웃 발생해도 백엔드 작업이 계속 진행 중이면 자동으로 이어서 진행

### 2. 실패 상태 처리 개선
- 실패 시 `lastCheckpointId` 확인하여 checkpoint 정보 표시
- 에러 메시지에 마지막 처리 위치 포함
- 재시작 버튼에 checkpoint 정보 표시

### 3. 재시작 로직 개선
- **메타데이터 수집**: `lastCheckpointId + 1`부터 시작하도록 수정
- **상세 정보/언어 업데이트**: 백엔드가 자동으로 checkpoint부터 이어서 진행

### 4. UI/UX 개선
- 재시작 버튼에 checkpoint 정보 표시
- 에러 메시지에 마지막 처리 위치 표시
- 상세 정보 크롤링 시작 번호 표시 개선 (`minNullDescriptionHtmlProblemId` 사용)
- 언어 정보 업데이트 시작 번호 표시 개선 (`minNullLanguageProblemId` 사용)

### 5. 타입 정의 업데이트
- `JobStatusResponse`에 `lastCheckpointId` 필드 추가
- `ProblemStatsResponse`에 `minNullDescriptionHtmlProblemId`, `minNullLanguageProblemId` 필드 추가
- `CrawlerState`에 `lastCheckpointId` 필드 추가

### 6. 코드 정리
- 불필요한 import 제거 (`FeedbackForm.tsx`)
- 에러 처리 로직 개선 (`getErrorMessage` 통일)
- 주석 정리

## 🔧 기술적 세부사항

### 타임아웃 처리 흐름
1. POST 요청 타임아웃 발생 시 `error.response?.data?.jobId` 확인
2. `jobId`가 있으면 상태 조회 API 호출하여 `lastCheckpointId` 확인
3. `lastCheckpointId`가 있으면 `RUNNING` 상태로 설정하고 폴링 시작

### 재시작 로직
- **메타데이터 수집**: `lastCheckpointId + 1`부터 시작하도록 새로운 파라미터 생성
- **상세 정보/언어 업데이트**: 같은 API를 다시 호출하면 백엔드가 checkpoint부터 자동으로 이어서 진행

## 📝 변경된 파일

- `src/types/api/admin.types.ts`: 타입 정의 추가
- `src/hooks/useCrawler.ts`: 타임아웃 처리 및 재시작 로직 개선
- `src/features/admin/components/ProblemCollector.tsx`: UI 개선
- `src/components/feedback/FeedbackForm.tsx`: 불필요한 import 제거
- `src/api/endpoints/crawler.api.ts`: (이전 작업에서 완료)

## ✅ 테스트

- [x] 빌드 성공 확인
- [x] 타입 체크 통과
- [x] 린터 에러 없음

## 🎯 기대 효과

- 타임아웃 발생 시에도 작업이 중단되지 않고 checkpoint부터 자동으로 재시작
- 실패 시 checkpoint 정보를 명확히 표시하여 사용자가 재시작 가능 여부를 쉽게 파악
- 시작 번호 표시 개선으로 사용자가 작업 범위를 명확히 이해


