/**
 * 로그 관련 API 타입 정의
 */

export interface AiReviewResponse {
    review: string;  // AI 한 줄 리뷰 또는 "AI review is being generated. Please retry shortly."
    cached: boolean; // 캐시 히트 여부
}

export interface LogCreateRequest {
    title: string;
    content: string;
    code: string;
    isSuccess?: boolean | null;
}

export interface LogResponse {
    id: string;
}

export interface LogTemplateResponse {
    template: string;
}

export interface LogFeedbackRequest {
    status: 'LIKE' | 'DISLIKE';
    reason?: string;
}

export interface LogFeedbackResponse {
    message: string;
}

