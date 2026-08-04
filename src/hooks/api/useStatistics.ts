/**
 * 통계 React Query 훅
 */

import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from '../../api/endpoints/statistics.api';

export const useStatistics = ({ enabled = true }: { enabled?: boolean } = {}) => {
    return useQuery({
        queryKey: ['statistics'],
        queryFn: () => statisticsApi.getStatistics(),
        enabled,
        staleTime: 5 * 60 * 1000, // 5분
    });
};
