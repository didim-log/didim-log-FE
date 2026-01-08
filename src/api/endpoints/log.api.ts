/**
 * 로그 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import type { AiReviewResponse, AiUsageResponse, LogCreateRequest, LogFeedbackRequest, LogFeedbackResponse, LogResponse, LogTemplateResponse } from '../../types/api/log.types';

export const logApi = {
    /**
     * 로그 생성 (AI 리뷰를 위한 선행 단계)
     */
    createLog: async (data: LogCreateRequest): Promise<LogResponse> => {
        const response = await apiClient.post<LogResponse>('/logs', data);
        return response.data;
    },

    /**
     * 로그 템플릿 조회 (백엔드 제공 시 사용)
     */
    getLogTemplate: async (logId: string): Promise<LogTemplateResponse> => {
        const response = await apiClient.get<LogTemplateResponse>(`/logs/${logId}/template`);
        return response.data;
    },

    /**
     * AI 한 줄 리뷰 생성/조회
     * @param logId 로그 ID
     * @returns AI 리뷰 응답 (리뷰 텍스트 또는 생성 중 메시지)
     */
    getAiReview: async (logId: string): Promise<AiReviewResponse> => {
        const response = await apiClient.post<AiReviewResponse>(
            `/logs/${logId}/ai-review`
        );
        return response.data;
    },

    /**
     * AI 리뷰 피드백 제출
     * @param logId 로그 ID
     * @param feedback 피드백 정보
     * @returns 피드백 제출 응답
     */
    submitFeedback: async (logId: string, feedback: LogFeedbackRequest): Promise<LogFeedbackResponse> => {
        const response = await apiClient.post<LogFeedbackResponse>(
            `/logs/${logId}/feedback`,
            feedback
        );
        return response.data;
    },
    
    /**
     * AI 사용량 조회
     * @returns AI 사용량 정보
     */
    getAiUsage: async (): Promise<AiUsageResponse> => {
        const response = await apiClient.get<AiUsageResponse>('/logs/ai-usage/me');
        return response.data;
    },
};
