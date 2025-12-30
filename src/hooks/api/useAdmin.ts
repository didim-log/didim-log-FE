/**
 * 관리자 React Query 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints/admin.api';
import type {
    AdminUserListRequest,
    AdminUserUpdateDto,
    QuoteCreateRequest,
    FeedbackStatusUpdateRequest,
    CollectMetadataRequest,
} from '../../types/api/admin.types';
import type { PageRequest } from '../../types/api/common.types';

export const useAdminUsers = (params: AdminUserListRequest) => {
    return useQuery({
        queryKey: ['admin', 'users', params],
        queryFn: () => adminApi.getUsers(params),
        staleTime: 1 * 60 * 1000, // 1분
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (studentId: string) => adminApi.deleteUser(studentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ studentId, data }: { studentId: string; data: AdminUserUpdateDto }) =>
            adminApi.updateUser(studentId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
    });
};

export const useAdminQuotes = (params: PageRequest) => {
    return useQuery({
        queryKey: ['admin', 'quotes', params],
        queryFn: () => adminApi.getQuotes(params),
        staleTime: 5 * 60 * 1000, // 5분
    });
};

export const useCreateQuote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: QuoteCreateRequest) => adminApi.createQuote(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'quotes'] });
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
        },
    });
};

export const useDeleteQuote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (quoteId: string) => adminApi.deleteQuote(quoteId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'quotes'] });
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
        },
    });
};

export const useAdminFeedbacks = (params: PageRequest) => {
    return useQuery({
        queryKey: ['admin', 'feedbacks', params],
        queryFn: () => adminApi.getFeedbacks(params),
        staleTime: 1 * 60 * 1000, // 1분
    });
};

export const useUpdateFeedbackStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ feedbackId, data }: { feedbackId: string; data: FeedbackStatusUpdateRequest }) =>
            adminApi.updateFeedbackStatus(feedbackId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'feedbacks'] });
        },
    });
};

export const useDeleteFeedback = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (feedbackId: string) => adminApi.deleteFeedback(feedbackId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'feedbacks'] });
        },
    });
};

export const useAdminDashboardStats = () => {
    return useQuery({
        queryKey: ['admin', 'dashboard', 'stats'],
        queryFn: () => adminApi.getDashboardStats(),
        staleTime: 1 * 60 * 1000, // 1분
    });
};

export const useCollectMetadata = () => {
    return useMutation({
        mutationFn: (params: CollectMetadataRequest) => adminApi.collectMetadata(params),
    });
};

export const useCollectDetails = () => {
    return useMutation({
        mutationFn: () => adminApi.collectDetails(),
    });
};

