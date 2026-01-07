/**
 * 대시보드 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import type { DashboardResponse } from '../../types/api/dashboard.types';

export const dashboardApi = {
    /**
     * 대시보드 정보 조회
     */
    getDashboard: async (): Promise<DashboardResponse> => {
        const response = await apiClient.get<DashboardResponse>('/dashboard');
        return response.data;
    },
};














