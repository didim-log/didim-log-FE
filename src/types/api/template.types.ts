/**
 * 템플릿 관련 API 타입 정의
 */

export type TemplateType = 'SYSTEM' | 'CUSTOM';
export type TemplateCategory = 'SUCCESS' | 'FAIL' | 'BOTH';
export type TemplateDefaultCategory = 'SUCCESS' | 'FAIL';
export type SectionCategory = 'SUCCESS' | 'FAIL' | 'COMMON';

export interface Template {
    id: string;
    studentId: string | null;
    title: string;
    content: string;
    type: TemplateType;
    isDefaultSuccess: boolean; // 성공용 기본 템플릿 여부
    isDefaultFail: boolean; // 실패용 기본 템플릿 여부
    createdAt: string; // ISO 8601 형식
    updatedAt: string; // ISO 8601 형식
}

export interface TemplateSummary {
    id: string;
    studentId: string | null;
    title: string;
    type: TemplateType;
    isDefaultSuccess: boolean;
    isDefaultFail: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TemplateSectionPreset {
    title: string; // 섹션 제목 (예: "🔑 핵심 로직") - API 명세서와 일치
    guide: string; // 섹션 작성 가이드 (툴팁용) - API 명세서와 일치
    category: SectionCategory; // 섹션 카테고리 ("SUCCESS", "FAIL", "COMMON")
    markdownContent: string; // 마크다운 형식의 섹션 내용 (백엔드 제공)
    contentGuide: string | null; // 섹션 삽입 시 사용할 가이드 질문 (백엔드 제공, 없으면 null)
}

export interface TemplateRenderResponse {
    renderedContent: string;
}

export interface TemplatePreviewRequest {
    templateContent: string;
    problemId: number;
    programmingLanguage?: string | null; // 추가: 프로그래밍 언어 코드 (예: "JAVA", "KOTLIN", "PYTHON")
    code?: string | null; // 추가: 제출한 코드 (언어 자동 감지에 사용)
}

export interface TemplateCreateRequest {
    title: string;
    content: string;
}

export interface TemplateUpdateRequest {
    title: string;
    content: string;
}
