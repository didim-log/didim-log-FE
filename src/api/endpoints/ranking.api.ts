/**
 * 랭킹 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import type { RankingRequest, LeaderboardResponse } from '../../types/api/ranking.types';

export const rankingApi = {
    /**
     * 랭킹 조회
     */
    getRanking: async (params: RankingRequest): Promise<LeaderboardResponse[]> => {
        const response = await apiClient.get<LeaderboardResponse[]>('/api/v1/ranks', { params });
        return response.data;
    },
};





