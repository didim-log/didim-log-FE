# 프론트엔드 구현 격차 분석 보고서

## 📋 개요

본 보고서는 백엔드 API 명세서(`DOCS/API_SPECIFICATION.md`)를 기준으로 프론트엔드에서 아직 구현되지 않은 기능과 수정이 필요한 컴포넌트를 분석한 문서입니다.

**작성일**: 2025-01-XX  
**대상**: DidimLog 프론트엔드 프로젝트  
**기준 문서**: `/Users/dh/Desktop/Code/didim-log/DOCS/API_SPECIFICATION.md`

---

## 🔴 완전 누락 기능 (High Priority)

### 1. AiAnalysisController - AI 분석 기능

**API 엔드포인트:**
- `POST /api/v1/ai/analyze` - AI 회고록 생성

**현재 상태:**
- ❌ API 클라이언트 파일 없음 (`src/api/endpoints/ai.api.ts`)
- ❌ 타입 정의 없음 (`src/types/api/ai.types.ts`)
- ❌ 컴포넌트 없음

**필요 작업:**
1. API 클라이언트 생성
   - 파일: `src/api/endpoints/ai.api.ts`
   - 함수: `analyzeCode(data: AiAnalyzeRequest): Promise<AiAnalyzeResponse>`
2. 타입 정의 추가
   - 파일: `src/types/api/ai.types.ts`
   - 타입: `AiAnalyzeRequest`, `AiAnalyzeResponse`
3. 컴포넌트 구현
   - 파일: `src/features/study/components/AiAnalysisModal.tsx` 또는 유사한 컴포넌트
   - 기능: 코드 입력, 풀이 성공 여부 선택, AI 분석 결과 표시

**연관 기능:**
- StudyPage에서 문제 풀이 완료 후 AI 분석 옵션 제공
- 회고 작성 시 AI 생성 템플릿 대신 AI 분석 결과 활용

---

### 2. LogController - 코딩 로그 기능

**API 엔드포인트:**
- `GET /api/v1/logs/{logId}/template` - 로그 템플릿 생성
- `POST /api/v1/logs/{logId}/ai-review` - AI 한 줄 리뷰 생성/조회

**현재 상태:**
- ❌ API 클라이언트 파일 없음 (`src/api/endpoints/log.api.ts`)
- ❌ 타입 정의 없음 (`src/types/api/log.types.ts`)
- ❌ 컴포넌트 없음

**필요 작업:**
1. API 클라이언트 생성
   - 파일: `src/api/endpoints/log.api.ts`
   - 함수:
     - `getLogTemplate(logId: string): Promise<LogTemplateResponse>`
     - `getAiReview(logId: string): Promise<AiReviewResponse>`
2. 타입 정의 추가
   - 파일: `src/types/api/log.types.ts`
   - 타입: `LogTemplateResponse`, `AiReviewResponse`
3. 컴포넌트 구현 (필요 시)
   - 로그 템플릿 표시 컴포넌트
   - AI 리뷰 표시 컴포넌트

**참고사항:**
- Log 기능의 전체 플로우 확인 필요 (로그 생성 방법, 로그 ID 획득 방법 등)

---

### 3. MemberController - 회원 닉네임 관리

**API 엔드포인트:**
- `GET /api/v1/members/check-nickname` - 닉네임 중복/유효성 검사
- `PATCH /api/v1/members/me/nickname` - 내 닉네임 변경

**현재 상태:**
- ❌ API 클라이언트 파일 없음 (`src/api/endpoints/member.api.ts`)
- ❌ 타입 정의 없음 (`src/types/api/member.types.ts`)
- ⚠️ StudentController의 `updateProfile` API에 닉네임 변경 기능 포함되어 있으나, 별도 API 필요할 수 있음

**필요 작업:**
1. API 클라이언트 생성
   - 파일: `src/api/endpoints/member.api.ts`
   - 함수:
     - `checkNickname(nickname: string): Promise<boolean>`
     - `updateMyNickname(nickname: string): Promise<void>`
2. 타입 정의 추가
   - 파일: `src/types/api/member.types.ts`
   - 타입: `UpdateMyNicknameRequest`
3. 컴포넌트 수정
   - `src/components/mypage/EditProfileForm.tsx` 또는 유사 컴포넌트에서 닉네임 중복 검사 추가
   - 실시간 닉네임 유효성 검증 추가

**참고사항:**
- `StudentController.updateProfile`에서도 닉네임 변경 가능하므로, 어떤 API를 사용할지 결정 필요

---

### 4. NoticeController - 공지사항 기능

**API 엔드포인트:**
- `GET /api/v1/notices` - 공지사항 목록 조회
- `GET /api/v1/notices/{noticeId}` - 공지사항 상세 조회
- `PATCH /api/v1/notices/{noticeId}` - 공지사항 수정 (ADMIN)
- `DELETE /api/v1/notices/{noticeId}` - 공지사항 삭제 (ADMIN)
- `POST /api/v1/admin/notices` - 공지사항 작성 (ADMIN)

**현재 상태:**
- ❌ API 클라이언트 파일 없음 (`src/api/endpoints/notice.api.ts`)
- ❌ 타입 정의 없음 (`src/types/api/notice.types.ts`)
- ❌ 컴포넌트 없음

**필요 작업:**
1. API 클라이언트 생성
   - 파일: `src/api/endpoints/notice.api.ts`
   - 함수:
     - `getNotices(params: NoticeListRequest): Promise<NoticePageResponse>`
     - `getNotice(noticeId: string): Promise<NoticeResponse>`
     - `createNotice(data: NoticeCreateRequest): Promise<NoticeResponse>` (ADMIN)
     - `updateNotice(noticeId: string, data: NoticeUpdateRequest): Promise<NoticeResponse>` (ADMIN)
     - `deleteNotice(noticeId: string): Promise<void>` (ADMIN)
2. 타입 정의 추가
   - 파일: `src/types/api/notice.types.ts`
   - 타입: `NoticeResponse`, `NoticeListRequest`, `NoticePageResponse`, `NoticeCreateRequest`, `NoticeUpdateRequest`
3. 컴포넌트 구현
   - 파일: `src/features/notice/pages/NoticeListPage.tsx` - 공지사항 목록 페이지
   - 파일: `src/features/notice/pages/NoticeDetailPage.tsx` - 공지사항 상세 페이지
   - 파일: `src/features/admin/components/NoticeManagement.tsx` - 관리자 공지사항 관리 컴포넌트
4. 라우팅 추가
   - 공지사항 목록 페이지 라우트
   - 공지사항 상세 페이지 라우트
5. 네비게이션 추가
   - 헤더 또는 사이드바에 공지사항 메뉴 추가

---

## 🟡 부분 구현 기능 (Medium Priority)

### 5. AuthController - BOJ ID 중복 확인

**API 엔드포인트:**
- `GET /api/v1/auth/check-duplicate?bojId={bojId}` - BOJ ID 중복 확인

**현재 상태:**
- ⚠️ `src/api/endpoints/auth.api.ts`에 `checkIdDuplicate` 함수가 있으나 TODO 상태
- ❌ 실제 API 엔드포인트 연결 안 됨

**필요 작업:**
1. `auth.api.ts`의 `checkIdDuplicate` 함수 수정
   ```typescript
   checkIdDuplicate: async (bojId: string): Promise<{ isDuplicate: boolean; message: string }> => {
       const response = await apiClient.get<{ isDuplicate: boolean; message: string }>(
           `/api/v1/auth/check-duplicate`,
           { params: { bojId } }
       );
       return response.data;
   }
   ```
2. 타입 정의 추가
   - `BojIdDuplicateCheckResponse` 타입 정의
3. 컴포넌트에서 활용
   - 회원가입/프로필 수정 시 BOJ ID 입력 시 실시간 중복 확인

---

### 6. RetrospectiveController - 회고 수정 API

**API 엔드포인트:**
- `PATCH /api/v1/retrospectives/{retrospectiveId}` - 회고 수정

**현재 상태:**
- ⚠️ `src/api/endpoints/retrospective.api.ts`에 수정 API 없음
- ❌ 회고 수정 기능 없음

**필요 작업:**
1. API 클라이언트 추가
   - `retrospective.api.ts`에 `updateRetrospective` 함수 추가
   ```typescript
   updateRetrospective: async (
       retrospectiveId: string,
       data: RetrospectiveRequest
   ): Promise<RetrospectiveResponse> => {
       const response = await apiClient.patch<RetrospectiveResponse>(
           `/api/v1/retrospectives/${retrospectiveId}`,
           data
       );
       return response.data;
   }
   ```
2. 컴포넌트 수정
   - 회고 상세 페이지에서 수정 기능 추가
   - 회고 작성/수정 모달 통합

---

### 7. AdminController - 공지사항 작성 API

**API 엔드포인트:**
- `POST /api/v1/admin/notices` - 공지사항 작성 (ADMIN)

**현재 상태:**
- ❌ `admin.api.ts`에 공지사항 작성 API 없음
- ⚠️ NoticeController 항목과 함께 구현 필요

**필요 작업:**
1. `admin.api.ts`에 추가
   ```typescript
   createNotice: async (data: NoticeCreateRequest): Promise<NoticeResponse> => {
       const response = await apiClient.post<NoticeResponse>('/api/v1/admin/notices', data);
       return response.data;
   }
   ```
2. 관리자 페이지에 공지사항 작성 UI 추가

---

### 8. AdminDashboardController - 성능 메트릭 API

**API 엔드포인트:**
- `GET /api/v1/admin/dashboard/metrics?minutes={minutes}` - 성능 메트릭 조회

**현재 상태:**
- ❌ `admin.api.ts`에 성능 메트릭 API 없음

**필요 작업:**
1. API 클라이언트 추가
   - `admin.api.ts`에 `getDashboardMetrics` 함수 추가
   ```typescript
   getDashboardMetrics: async (minutes?: number): Promise<PerformanceMetricsResponse> => {
       const response = await apiClient.get<PerformanceMetricsResponse>(
           '/api/v1/admin/dashboard/metrics',
           { params: { minutes } }
       );
       return response.data;
   }
   ```
2. 타입 정의 추가
   - `PerformanceMetricsResponse` 타입 정의
3. 관리자 대시보드에 성능 메트릭 차트 추가

---

### 9. SystemController - 유지보수 모드

**API 엔드포인트:**
- `POST /api/v1/admin/system/maintenance` - 유지보수 모드 활성화/비활성화

**현재 상태:**
- ❌ API 클라이언트 없음
- ❌ 관리자 페이지에 UI 없음

**필요 작업:**
1. API 클라이언트 추가
   - `admin.api.ts`에 `setMaintenanceMode` 함수 추가
   ```typescript
   setMaintenanceMode: async (enabled: boolean): Promise<MaintenanceModeResponse> => {
       const response = await apiClient.post<MaintenanceModeResponse>(
           '/api/v1/admin/system/maintenance',
           { enabled }
       );
       return response.data;
   }
   ```
2. 타입 정의 추가
   - `MaintenanceModeRequest`, `MaintenanceModeResponse` 타입 정의
3. 관리자 페이지에 유지보수 모드 토글 UI 추가
   - 파일: `src/features/admin/components/SystemSettings.tsx`

---

### 10. AdminMemberController - 회원 정보 강제 수정

**API 엔드포인트:**
- `PUT /api/v1/admin/members/{memberId}` - 관리자가 회원 정보 수정

**현재 상태:**
- ⚠️ `admin.api.ts`에 `updateUser` 함수는 있으나 `PATCH /api/v1/admin/users/{studentId}` 사용
- ❌ `PUT /api/v1/admin/members/{memberId}` API 미구현

**필요 작업:**
1. API 클라이언트 추가 또는 수정
   - `admin.api.ts`에 별도 함수 추가 또는 기존 함수 수정
   ```typescript
   updateMember: async (memberId: string, data: AdminMemberUpdateRequest): Promise<void> => {
       await apiClient.put(`/api/v1/admin/members/${memberId}`, data);
   }
   ```
2. 타입 정의 추가
   - `AdminMemberUpdateRequest` 타입 정의
3. 관리자 회원 관리 페이지에서 활용

---

## 🟢 기능 개선 사항 (Low Priority)

### 11. 회고 수정 기능 UI 개선

**현재 상태:**
- ⚠️ 회고 수정 API 연결 필요 (위 항목 6 참고)
- 회고 수정 UI 개선 필요

**개선 사항:**
- 회고 상세 페이지에서 수정 버튼 추가
- 회고 작성/수정 모달 통합
- 수정 권한 확인 (본인만 수정 가능)

---

### 12. 에러 처리 개선

**현재 상태:**
- ⚠️ 일부 API 호출 시 에러 처리 미흡할 수 있음

**개선 사항:**
- 유지보수 모드(503) 에러 처리 추가
- AI 생성 실패(503) 에러 처리 추가
- 공통 에러 핸들링 컴포넌트 개선

---

### 13. 관리자 페이지 기능 보완

**현재 상태:**
- ✅ 기본 관리자 기능 구현됨 (회원 관리, 명언 관리, 피드백 관리)
- ❌ 공지사항 관리 미구현
- ❌ 시스템 설정 미구현
- ❌ 성능 메트릭 표시 미구현

**개선 사항:**
- 공지사항 관리 페이지 추가
- 시스템 설정 페이지 추가 (유지보수 모드 등)
- 성능 메트릭 대시보드 추가

---

## 📊 구현 우선순위

### Phase 1: 핵심 기능 (즉시 구현)
1. ✅ NoticeController - 공지사항 기능 (사용자 경험에 중요)
2. ✅ MemberController - 닉네임 관리 (프로필 관리 필수)
3. ✅ RetrospectiveController - 회고 수정 API 연결

### Phase 2: 관리자 기능 (단기)
4. ✅ AdminController - 공지사항 작성 API
5. ✅ SystemController - 유지보수 모드
6. ✅ AdminDashboardController - 성능 메트릭
7. ✅ AdminMemberController - 회원 정보 강제 수정

### Phase 3: 고급 기능 (중기)
8. ✅ AiAnalysisController - AI 분석 기능
9. ✅ LogController - 코딩 로그 기능
10. ✅ AuthController - BOJ ID 중복 확인 개선

---

## 📝 구현 체크리스트

### API 클라이언트 파일 생성
- [ ] `src/api/endpoints/ai.api.ts`
- [ ] `src/api/endpoints/log.api.ts`
- [ ] `src/api/endpoints/member.api.ts`
- [ ] `src/api/endpoints/notice.api.ts`

### 타입 정의 파일 생성
- [ ] `src/types/api/ai.types.ts`
- [ ] `src/types/api/log.types.ts`
- [ ] `src/types/api/member.types.ts`
- [ ] `src/types/api/notice.types.ts`

### 컴포넌트 구현
- [ ] AI 분석 모달/컴포넌트
- [ ] 공지사항 목록 페이지
- [ ] 공지사항 상세 페이지
- [ ] 관리자 공지사항 관리 컴포넌트
- [ ] 관리자 시스템 설정 컴포넌트
- [ ] 성능 메트릭 차트 컴포넌트

### 기능 수정
- [ ] `auth.api.ts` - BOJ ID 중복 확인 API 연결
- [ ] `retrospective.api.ts` - 회고 수정 API 추가
- [ ] `admin.api.ts` - 공지사항 작성, 성능 메트릭, 유지보수 모드 API 추가
- [ ] 회고 상세 페이지 - 수정 기능 추가
- [ ] 프로필 편집 페이지 - 닉네임 중복 확인 추가

### 라우팅 추가
- [ ] 공지사항 목록 라우트
- [ ] 공지사항 상세 라우트

### 네비게이션 업데이트
- [ ] 헤더/사이드바에 공지사항 메뉴 추가

---

## 🔗 참고 사항

### API 명세서
- 경로: `/Users/dh/Desktop/Code/didim-log/DOCS/API_SPECIFICATION.md`
- 모든 API 엔드포인트의 상세 스펙은 위 문서를 참고하세요.

### 기존 구현 패턴
- API 클라이언트: `src/api/endpoints/*.api.ts`
- 타입 정의: `src/types/api/*.types.ts`
- 컴포넌트: `src/features/*/` 또는 `src/components/`

### 주의사항
1. **인증 처리**: 대부분의 API는 JWT 토큰이 필요합니다. `apiClient`에서 자동으로 처리되는지 확인하세요.
2. **권한 확인**: ADMIN 권한이 필요한 API는 권한 확인 후 UI를 표시하세요.
3. **에러 처리**: 각 API 호출 시 적절한 에러 처리를 추가하세요.
4. **로딩 상태**: API 호출 중 로딩 상태를 표시하세요.

---

**작성자**: AI Assistant  
**최종 업데이트**: 2025-01-XX

