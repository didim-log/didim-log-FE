/**
 * 피드백 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import type { FeedbackCreateRequest, FeedbackResponse } from '../../types/api/feedback.types';

export const feedbackApi = {
    /**
     * 피드백 생성
     */
    createFeedback: async (data: FeedbackCreateRequest): Promise<FeedbackResponse> => {
        const response = await apiClient.post<FeedbackResponse>('/api/v1/feedback', data);
        return response.data;
    },
};

