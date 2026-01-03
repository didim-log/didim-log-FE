/**
 * 문제 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import type {
    ProblemResponse,
    ProblemDetailResponse,
    RecommendRequest,
    SearchRequest,
} from '../../types/api/problem.types';

export const problemApi = {
    /**
     * 문제 추천
     */
    recommend: async (params: RecommendRequest): Promise<ProblemResponse[]> => {
        const response = await apiClient.get<ProblemResponse[]>('/api/v1/problems/recommend', { params });
        return response.data;
    },

    /**
     * 문제 상세 조회
     */
    getProblemDetail: async (problemId: string): Promise<ProblemDetailResponse> => {
        const response = await apiClient.get<ProblemDetailResponse>(`/api/v1/problems/${problemId}`);
        return response.data;
    },

    /**
     * 문제 검색
     */
    search: async (params: SearchRequest): Promise<ProblemDetailResponse> => {
        const response = await apiClient.get<ProblemDetailResponse>('/api/v1/problems/search', { params });
        return response.data;
    },
};




