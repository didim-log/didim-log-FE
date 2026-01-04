/**
 * 학습 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import type { SolutionSubmitRequest, SolutionSubmitResponse } from '../../types/api/study.types';

export const studyApi = {
    /**
     * 문제 풀이 결과 제출
     */
    submitSolution: async (data: SolutionSubmitRequest): Promise<SolutionSubmitResponse> => {
        const response = await apiClient.post<SolutionSubmitResponse>('/api/v1/study/submit', data);
        return response.data;
    },
};













