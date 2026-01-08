/**
 * 통계 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import type { StatisticsResponse, HeatmapDataResponse } from '../../types/api/statistics.types';

export const statisticsApi = {
    /**
     * 통계 정보 조회
     */
    getStatistics: async (): Promise<StatisticsResponse> => {
        const response = await apiClient.get<StatisticsResponse>('/statistics');
        return response.data;
    },

    /**
     * 연도별 히트맵 조회
     * @param year 조회할 연도 (기본값: 현재 연도)
     */
    getHeatmapByYear: async (year?: number): Promise<HeatmapDataResponse[]> => {
        const yearParam = year || new Date().getFullYear();
        const response = await apiClient.get<HeatmapDataResponse[]>(
            `/statistics/heatmap?year=${yearParam}`
        );
        return response.data;
    },
};
