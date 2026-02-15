# FE API/성능 업데이트 가이드

## 1) API 계약 정리
### 템플릿 카테고리
- 기본 템플릿 카테고리는 `SUCCESS | FAIL`만 사용합니다.
- 레거시 값 `FAILURE`는 제거했습니다.

### FE에서 사용하는 템플릿 API
- `GET /templates`
- `GET /templates/summaries`
- `GET /templates/presets`
- `POST /templates/preview`
- `GET /templates/{id}/render`
- `POST /templates`
- `PUT /templates/{id}`
- `PUT /templates/{id}/default?category=SUCCESS|FAIL`
- `DELETE /templates/{id}`

### 제거된 FE 레거시
- 미사용 API 헬퍼 제거: `getDefaultTemplateSummary`, `getDefaultTemplate`
- 미사용 훅 제거: `useDefaultTemplate`

## 2) UI 성능 최적화
- 라우트 단위 lazy loading 적용
- 통계/관리자 탭 컴포넌트 lazy loading 적용
- 템플릿 빌더 렌더 최적화(`memo`, `useMemo`, O(1) 프리셋 매칭)
- `MarkdownViewer` 경량화(PrismLight + 필요한 언어만 등록)

## 3) 성능 측정 방법(개발 모드)
- 라우트 렌더/입력 지연 수집이 기본 활성화됩니다.
- 브라우저 콘솔에서 아래를 실행해 요약 확인:

```js
window.__printDidimPerf()
```

## 4) 검증 체크리스트
- [ ] 템플릿 생성/수정/삭제/기본설정 동작
- [ ] 템플릿 프리셋 로딩(`title`, `guide`, `contentGuide`)
- [ ] 회고 작성 시 템플릿 렌더링 동작
- [ ] 통계/관리자 페이지 최초 진입 및 탭 전환 로딩 상태 확인
