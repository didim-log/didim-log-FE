/**
 * 랭킹 React Query 훅
 */

import { useQuery } from '@tanstack/react-query';
import { rankingApi } from '../../api/endpoints/ranking.api';
import type { RankingRequest } from '../../types/api/ranking.types';

export const useRanking = (params: RankingRequest) => {
    return useQuery({
        queryKey: ['ranking', params],
        queryFn: () => rankingApi.getRanking(params),
        staleTime: 2 * 60 * 1000, // 2분
    });
};





