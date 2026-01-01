/**
 * 대시보드 React Query 훅
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/endpoints/dashboard.api';

export const useDashboard = () => {
    return useQuery({
        queryKey: ['dashboard'],
        queryFn: () => dashboardApi.getDashboard(),
        staleTime: 1 * 60 * 1000, // 1분
    });
};


