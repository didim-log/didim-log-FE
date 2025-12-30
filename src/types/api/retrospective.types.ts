/**
 * 회고 관련 API 타입 정의
 */

import type { Page } from './common.types';

export type ProblemResult = 'SUCCESS' | 'FAIL' | 'TIME_OVER';

export interface RetrospectiveRequest {
    content: string;
    summary?: string | null;
    resultType?: ProblemResult | null;
    solvedCategory?: string | null;
}

export interface RetrospectiveResponse {
    id: string;
    studentId: string;
    problemId: string;
    content: string;
    summary: string | null;
    createdAt: string; // ISO 8601 형식
    isBookmarked: boolean;
    mainCategory: string | null;
    solutionResult: string | null;
    solvedCategory: string | null;
    timeTaken?: number | null; // 풀이 소요 시간 (초) - 백엔드에서 제공하는 경우
}

export interface RetrospectiveListRequest {
    keyword?: string;
    category?: string;
    isBookmarked?: boolean;
    studentId?: string;
    page?: number;
    size?: number;
    sort?: string;
}

export interface RetrospectivePageResponse extends Page<RetrospectiveResponse> {}

export interface BookmarkToggleResponse {
    isBookmarked: boolean;
}

export interface TemplateRequest {
    problemId: string;
    resultType: ProblemResult;
}

export interface TemplateResponse {
    template: string;
}

export interface StaticTemplateRequest {
    code: string;
    problemId: string;
    isSuccess: boolean;
    errorMessage?: string | null;
}

