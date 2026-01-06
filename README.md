<div align="center">

  <img src="./public/logo.svg" width="200" height="200" alt="DidimLog Logo"/>

# DidimLog : Frontend Web Client

**"PS(Problem Solving) 알고리즘 학습의 길잡이, 디딤로그"**

  <br>

디딤로그(DidimLog)의 **프론트엔드 웹 클라이언트** 저장소입니다.<br>
사용자 친화적인 UI/UX를 통해 알고리즘 문제 풀이 경험을 시각화하고,<br>
**AI 분석 리포트**와 **성장 지표**를 직관적인 대시보드로 제공합니다.

  <br>

  <img src="https://img.shields.io/badge/Project-DidimLog-0078FF?style=flat-square&logo=github" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Library-React%2018-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Build-Vite-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Style-Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />

</div>

<br>

## ✅ Core Features (핵심 기능)

### 1) **인터랙티브 대시보드**
- 학습 지속성(히트맵) / 알고리즘 강약점(차트) 등 시각화
- 추천 문제 위젯(필터 포함) 제공

### 2) **AI 기반 회고 에디터**
- Markdown 기반 회고 작성
- 코드/풀이 결과 기반 템플릿 생성 및 AI 피드백 UI 제공

### 3) **문제 탐색 및 추천**
- 카테고리 기반 추천 문제 조회
- 카테고리 필터는 백엔드 `ProblemCategory.englishName` 규칙에 맞게 매핑하여 전송

### 4) **인증 & 사용자 관리**
- Access/Refresh Token 관리 + Silent Refresh(Interceptor)
- Google/GitHub/Naver 소셜 로그인 및 콜백 처리(`/oauth/callback`)

<br>

## 🛠 Tech Stack

| Category | Technology |
| --- | --- |
| Language | TypeScript |
| Framework | React 18 |
| Build Tool | Vite (rolldown-vite) |
| Styling | Tailwind CSS |
| State | TanStack Query |
| Router | React Router DOM |
| HTTP | Axios |
| UI Utils | clsx, tailwind-merge |

<br>

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### 1) Install

```bash
npm install
```

### 2) Environment Setup (중요)

이 프로젝트는 **환경 혼선을 방지**하기 위해 `VITE_API_URL`을 기준으로 API 연결을 통일합니다.

- **로컬 프론트 → 로컬 백엔드**
  - `.env.development` (프로젝트 루트, git ignore)

```properties
VITE_API_URL=http://localhost:8080
```

- **배포 프론트 → 배포 백엔드**
  - `.env.production` (프로젝트 루트, git ignore)

```properties
VITE_API_URL=https://YOUR_API_HOST
```

> `.env`, `.env.*`는 `.gitignore`에 의해 커밋되지 않습니다.  
> 템플릿은 `DOCS/env/`에 있습니다: `DOCS/env/env.development.template`, `DOCS/env/env.production.template`

### 3) Run

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`로 접속합니다.

<br>

## 📦 Build & Deploy

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

### SPA Rewrite (Firebase Hosting)
`firebase.json`에 모든 경로가 `index.html`로 rewrite 되도록 설정되어 있어 새로고침 404를 방지합니다.

<br>

## 📂 Directory Structure

```text
src/
├── api/            # Axios 인스턴스 및 API endpoint 함수
├── components/     # 재사용 가능한 UI 컴포넌트
├── constants/      # 상수/매핑 테이블
├── contexts/       # Context (theme 등)
├── features/       # 도메인 단위 기능(페이지/컴포넌트)
├── hooks/          # Custom Hooks (React Query 포함)
├── lib/            # 공통 라이브러리 설정(react-query 등)
├── pages/          # 전역 페이지(예: Maintenance, OAuthCallbackPage 등)
├── routes/         # Route guards (Private/Public/Admin)
├── stores/         # Zustand 스토어
├── types/          # TypeScript 타입 정의
└── utils/          # 유틸리티
```

<br>

## 📝 Related Documents
- `DOCS/PR_GUIDE.md`
- `DOCS/COMMIT_CONVENTION.md`

<div align="center">
Copyright © 2025 DidimLog Team. All rights reserved.
</div>
