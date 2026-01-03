/**
 * 통계 React Query 훅
 */

import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from '../../api/endpoints/statistics.api';

export const useStatistics = () => {
    return useQuery({
        queryKey: ['statistics'],
        queryFn: () => statisticsApi.getStatistics(),
        staleTime: 5 * 60 * 1000, // 5분
    });
};




