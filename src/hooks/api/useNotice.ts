/**
 * 공지사항 React Query 훅
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { noticeApi } from '../../api/endpoints/notice.api';
import type { NoticeCreateRequest, NoticeListRequest, NoticeUpdateRequest } from '../../types/api/notice.types';

export const useNotices = (params: NoticeListRequest) => {
    return useQuery({
        queryKey: ['notices', 'list', params],
        queryFn: () => noticeApi.getNotices(params),
        staleTime: 30 * 1000, // 30초
    });
};

export const useNotice = (noticeId: string) => {
    return useQuery({
        queryKey: ['notices', noticeId],
        queryFn: () => noticeApi.getNotice(noticeId),
        enabled: !!noticeId,
        staleTime: 30 * 1000, // 30초
    });
};

export const useCreateNotice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: NoticeCreateRequest) => noticeApi.createNotice(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notices'] });
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        },
    });
};

export const useUpdateNotice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ noticeId, data }: { noticeId: string; data: NoticeUpdateRequest }) =>
            noticeApi.updateNotice(noticeId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['notices'] });
            queryClient.invalidateQueries({ queryKey: ['notices', variables.noticeId] });
        },
    });
};

export const useDeleteNotice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (noticeId: string) => noticeApi.deleteNotice(noticeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notices'] });
        },
    });
};


