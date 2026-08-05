/**
 * 문제 React Query 훅
 */

import { useQuery } from '@tanstack/react-query';
import { problemApi } from '../../api/endpoints/problem.api';
import type { RecommendRequest, SearchRequest } from '../../types/api/problem.types';

interface ProblemQueryOptions {
    enabled?: boolean;
}

export const useProblemRecommend = (
    params: RecommendRequest,
    { enabled = true }: ProblemQueryOptions = {},
) => {
    return useQuery({
        queryKey: ['problems', 'recommend', params],
        queryFn: () => problemApi.recommend(params),
        enabled,
        staleTime: 5 * 60 * 1000, // 5분
    });
};

export const useProblemDetail = (
    problemId: string,
    { enabled = true }: ProblemQueryOptions = {},
) => {
    return useQuery({
        queryKey: ['problems', problemId],
        queryFn: () => problemApi.getProblemDetail(problemId),
        enabled: enabled && !!problemId,
        staleTime: 10 * 60 * 1000, // 10분
    });
};

export const useProblemSearch = (
    params: SearchRequest,
    { enabled = true }: ProblemQueryOptions = {},
) => {
    return useQuery({
        queryKey: ['problems', 'search', params],
        queryFn: () => problemApi.search(params),
        enabled: enabled && !!params.q,
        staleTime: 5 * 60 * 1000, // 5분
    });
};

export const useProblemCategoryMeta = ({ enabled = true }: ProblemQueryOptions = {}) => {
    return useQuery({
        queryKey: ['problems', 'categories', 'meta'],
        queryFn: () => problemApi.getCategoryMeta(),
        enabled,
        staleTime: 30 * 60 * 1000, // 30분
    });
};
