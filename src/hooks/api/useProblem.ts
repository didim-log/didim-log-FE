/**
 * 문제 React Query 훅
 */

import { useQuery } from '@tanstack/react-query';
import { problemApi } from '../../api/endpoints/problem.api';
import type { RecommendRequest, SearchRequest } from '../../types/api/problem.types';

export const useProblemRecommend = (params: RecommendRequest) => {
    return useQuery({
        queryKey: ['problems', 'recommend', params],
        queryFn: () => problemApi.recommend(params),
        staleTime: 5 * 60 * 1000, // 5분
    });
};

export const useProblemDetail = (problemId: string) => {
    return useQuery({
        queryKey: ['problems', problemId],
        queryFn: () => problemApi.getProblemDetail(problemId),
        enabled: !!problemId,
        staleTime: 10 * 60 * 1000, // 10분
    });
};

export const useProblemSearch = (params: SearchRequest) => {
    return useQuery({
        queryKey: ['problems', 'search', params],
        queryFn: () => problemApi.search(params),
        enabled: !!params.q,
        staleTime: 5 * 60 * 1000, // 5분
    });
};





