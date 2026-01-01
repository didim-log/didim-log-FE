/**
 * 학습 관련 API 타입 정의
 */

export interface SolutionSubmitRequest {
    problemId: string;
    timeTaken: number; // 초 단위
    isSuccess: boolean;
}

export interface SolutionSubmitResponse {
    message: string;
    currentTier: string;
    currentTierLevel: number;
}


