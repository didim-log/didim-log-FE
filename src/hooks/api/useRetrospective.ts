/**
 * 회고 React Query 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retrospectiveApi } from '../../api/endpoints/retrospective.api';
import type {
    RetrospectiveRequest,
    RetrospectiveListRequest,
    TemplateRequest,
} from '../../types/api/retrospective.types';
import { useAuthStore } from '../../stores/auth.store';

export const useCreateRetrospective = () => {
    const queryClient = useQueryClient();
    const { token } = useAuthStore();

    return useMutation({
        mutationFn: ({ problemId, data }: { problemId: string; data: RetrospectiveRequest }) => {
            // 백엔드에서 JWT 토큰에서 자동으로 사용자 정보를 추출하므로 studentId는 전달하지 않습니다.
            if (!token) {
                throw new Error('로그인이 필요합니다.');
            }
            return retrospectiveApi.createRetrospective(problemId, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['retrospectives'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

export const useRetrospectives = (params: RetrospectiveListRequest) => {
    return useQuery({
        queryKey: ['retrospectives', 'list', params],
        queryFn: () => retrospectiveApi.getRetrospectives(params),
        staleTime: 1 * 60 * 1000, // 1분
    });
};

export const useRetrospective = (retrospectiveId: string) => {
    return useQuery({
        queryKey: ['retrospectives', retrospectiveId],
        queryFn: () => retrospectiveApi.getRetrospective(retrospectiveId),
        enabled: !!retrospectiveId,
        staleTime: 5 * 60 * 1000, // 5분
    });
};

export const useToggleBookmark = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (retrospectiveId: string) => retrospectiveApi.toggleBookmark(retrospectiveId),
        onSuccess: (_, retrospectiveId) => {
            queryClient.invalidateQueries({ queryKey: ['retrospectives', retrospectiveId] });
            queryClient.invalidateQueries({ queryKey: ['retrospectives', 'list'] });
        },
    });
};

export const useUpdateRetrospective = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ retrospectiveId, data }: { retrospectiveId: string; data: RetrospectiveRequest }) => {
            return retrospectiveApi.updateRetrospective(retrospectiveId, data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['retrospectives', variables.retrospectiveId] });
            queryClient.invalidateQueries({ queryKey: ['retrospectives', 'list'] });
        },
    });
};

export const useDeleteRetrospective = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (retrospectiveId: string) => retrospectiveApi.deleteRetrospective(retrospectiveId),
        onSuccess: (_, retrospectiveId) => {
            // 목록 쿼리 무효화 (모든 파라미터 조합에 대해)
            queryClient.invalidateQueries({ queryKey: ['retrospectives', 'list'] });
            // 개별 회고 쿼리도 무효화
            queryClient.invalidateQueries({ queryKey: ['retrospectives', retrospectiveId] });
        },
    });
};

export const useTemplate = (params: TemplateRequest) => {
    return useQuery({
        queryKey: ['retrospectives', 'template', params],
        queryFn: () => retrospectiveApi.getTemplate(params),
        enabled: !!params.problemId && !!params.resultType,
        staleTime: 10 * 60 * 1000, // 10분
    });
};
