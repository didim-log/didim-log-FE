/**
 * 연도별 히트맵 React Query 훅
 */

import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from '../../api/endpoints/statistics.api';

export const useHeatmapByYear = (year?: number) => {
    const targetYear = year || new Date().getFullYear();
    
    return useQuery({
        queryKey: ['heatmap', targetYear],
        queryFn: () => statisticsApi.getHeatmapByYear(targetYear),
        staleTime: 5 * 60 * 1000, // 5분
    });
};


