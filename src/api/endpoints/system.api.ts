/**
 * 시스템 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import type { SystemStatusResponse } from '../../types/api/system.types';

export const systemApi = {
    /**
     * 시스템 상태 조회 (Public)
     */
    getSystemStatus: async (): Promise<SystemStatusResponse> => {
        const response = await apiClient.get<SystemStatusResponse>('/api/v1/system/status');
        return response.data;
    },
};

