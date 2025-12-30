/**
 * 통계 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import type { StatisticsResponse } from '../../types/api/statistics.types';

export const statisticsApi = {
    /**
     * 통계 정보 조회
     */
    getStatistics: async (): Promise<StatisticsResponse> => {
        const response = await apiClient.get<StatisticsResponse>('/api/v1/statistics');
        return response.data;
    },
};

