/**
 * 피드백 관련 API 타입 정의
 */

export type FeedbackType = 'BUG' | 'SUGGESTION';
export type FeedbackStatus = 'PENDING' | 'COMPLETED';

export interface FeedbackCreateRequest {
    content: string;
    type: FeedbackType;
}

export interface FeedbackResponse {
    id: string;
    writerId: string;
    bojId: string | null;
    content: string;
    type: FeedbackType;
    status: FeedbackStatus;
    createdAt: string; // ISO 8601 형식
    updatedAt: string; // ISO 8601 형식
}

export interface FeedbackStatusUpdateRequest {
    status: FeedbackStatus;
}


