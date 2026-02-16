/**
 * 회고 관련 API 타입 정의
 */

import type { Page } from './common.types';

export type ProblemResult = 'SUCCESS' | 'FAIL' | 'TIME_OVER';

export interface RetrospectiveRequest {
    content: string;
    summary: string; // 한 줄 요약 (필수)
    resultType?: ProblemResult | null;
    solvedCategory?: string | null;
    solveTime?: string | null; // 풀이 소요 시간 (예: "15m 30s" 또는 초 단위 문자열)
}

export interface RetrospectiveResponse {
    id: string;
    studentId: string;
    isOwner: boolean;
    problemId: string;
    problemTitle: string | null;
    content: string;
    summary: string | null;
    createdAt: string; // ISO 8601 형식
    isBookmarked: boolean;
    mainCategory: string | null;
    solutionResult: string | null;
    solvedCategory: string | null;
    solveTime: string | null; // 풀이 소요 시간 (예: "15m 30s" 또는 초 단위 문자열)
    timeTaken?: number | null; // 풀이 소요 시간 (초) - 백엔드에서 제공하는 경우 (deprecated: solveTime 사용 권장)
}

export interface RetrospectiveListRequest {
    keyword?: string;
    category?: string;
    solvedCategory?: string; // 풀이 전략 태그 (부분 일치 검색)
    isBookmarked?: boolean;
    page?: number;
    size?: number;
    sort?: string;
}

export type RetrospectivePageResponse = Page<RetrospectiveResponse>;

export interface BookmarkToggleResponse {
    isBookmarked: boolean;
}

export interface TemplateRequest {
    problemId: number;
    resultType: ProblemResult;
}

export interface TemplateResponse {
    template: string;
}
