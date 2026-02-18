/**
 * 문제 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import type {
    ProblemResponse,
    ProblemDetailResponse,
    ProblemCategoryMetaResponse,
    RecommendRequest,
    SearchRequest,
} from '../../types/api/problem.types';
import { mapCategoryToApiValue } from '../../constants/categoryMapping';

export const problemApi = {
    /**
     * 문제 추천
     */
    recommend: async (params: RecommendRequest): Promise<ProblemResponse[]> => {
        const category = params.category ? mapCategoryToApiValue(params.category) : undefined;
        const mappedParams: RecommendRequest = { ...params, category };
        const response = await apiClient.get<ProblemResponse[]>('/problems/recommend', { params: mappedParams });
        return response.data;
    },

    /**
     * 카테고리 정규화 메타 조회
     */
    getCategoryMeta: async (): Promise<ProblemCategoryMetaResponse[]> => {
        const response = await apiClient.get<ProblemCategoryMetaResponse[]>('/problems/categories/meta');
        return response.data;
    },

    /**
     * 문제 상세 조회
     */
    getProblemDetail: async (problemId: string): Promise<ProblemDetailResponse> => {
        const response = await apiClient.get<ProblemDetailResponse>(`/problems/${problemId}`);
        return response.data;
    },

    /**
     * 문제 검색
     */
    search: async (params: SearchRequest): Promise<ProblemDetailResponse> => {
        const response = await apiClient.get<ProblemDetailResponse>('/problems/search', { params });
        return response.data;
    },
};
