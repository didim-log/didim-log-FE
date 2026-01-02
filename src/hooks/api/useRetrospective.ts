/**
 * 회고 React Query 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retrospectiveApi } from '../../api/endpoints/retrospective.api';
import type {
    RetrospectiveRequest,
    RetrospectiveListRequest,
    TemplateRequest,
    StaticTemplateRequest,
} from '../../types/api/retrospective.types';
import { useAuthStore } from '../../stores/auth.store';
import { decodeJwt } from '../../utils/jwt';

export const useCreateRetrospective = () => {
    const queryClient = useQueryClient();
    const { user, token } = useAuthStore();

    return useMutation({
        mutationFn: ({ problemId, data }: { problemId: string; data: RetrospectiveRequest }) => {
            if (!user?.id && !token) {
                throw new Error('사용자 정보가 없습니다.');
            }
            // JWT의 sub를 studentId로 사용 (백엔드에서 JWT에서 자동 추출하지만, 쿼리 파라미터로도 전달)
            const studentId = user?.id || (token ? decodeJwt(token)?.sub : '') || '';
            if (!studentId) {
                throw new Error('사용자 ID를 찾을 수 없습니다.');
            }
            return retrospectiveApi.createRetrospective(studentId, problemId, data);
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['retrospectives'] });
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

export const useStaticTemplate = () => {
    return useMutation({
        mutationFn: (data: StaticTemplateRequest) => retrospectiveApi.getStaticTemplate(data),
    });
};

