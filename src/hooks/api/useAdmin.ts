/**
 * 관리자 React Query 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints/admin.api';
import type {
    AdminUserListRequest,
    AdminUserUpdateDto,
    AdminMemberUpdateRequest,
    QuoteCreateRequest,
    CollectMetadataRequest,
    MaintenanceModeRequest,
    ChartDataType,
    ChartPeriod,
    AdminAuditLogRequest,
    AiStatusUpdateRequest,
    AiLimitsUpdateRequest,
} from '../../types/api/admin.types';
import type { FeedbackStatusUpdateRequest } from '../../types/api/feedback.types';
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

export const useUpdateMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ memberId, data }: { memberId: string; data: AdminMemberUpdateRequest }) =>
            adminApi.updateMember(memberId, data),
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

export const useAiQualityStats = () => {
    return useQuery({
        queryKey: ['admin', 'ai-quality'],
        queryFn: () => adminApi.getAiQualityStats(),
        staleTime: 5 * 60 * 1000, // 5분
    });
};

export const useAdminDashboardStats = () => {
    return useQuery({
        queryKey: ['admin', 'dashboard', 'stats'],
        queryFn: () => adminApi.getDashboardStats(),
        staleTime: 1 * 60 * 1000, // 1분
    });
};

export const useAdminDashboardMetrics = (minutes?: number) => {
    return useQuery({
        queryKey: ['admin', 'dashboard', 'metrics', minutes ?? 30],
        queryFn: () => adminApi.getDashboardMetrics(minutes),
        staleTime: 30 * 1000,
        refetchInterval: 30 * 1000,
    });
};

export const useAdminDashboardChart = (dataType: ChartDataType, period: ChartPeriod) => {
    return useQuery({
        queryKey: ['admin', 'dashboard', 'chart', dataType, period],
        queryFn: () => adminApi.getDashboardChart(dataType, period),
        enabled: !!dataType && !!period,
    });
};

export const useSetMaintenanceMode = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: MaintenanceModeRequest) => adminApi.setMaintenanceMode(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
        },
    });
};

export const useAdminLogs = (params: { bojId?: string; page?: number; size?: number }) => {
    return useQuery({
        queryKey: ['admin', 'logs', params],
        queryFn: () => adminApi.getLogs(params),
        staleTime: 15 * 1000,
    });
};

export const useAdminLog = (logId: string) => {
    return useQuery({
        queryKey: ['admin', 'logs', logId],
        queryFn: () => adminApi.getLog(logId),
        enabled: !!logId,
        staleTime: 15 * 1000,
    });
};

export const useCleanupLogs = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (olderThanDays: number) => adminApi.cleanupLogs(olderThanDays),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'logs'] });
        },
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

export const useAiStatus = () => {
    return useQuery({
        queryKey: ['admin', 'ai-status'],
        queryFn: () => adminApi.getAiStatus(),
        staleTime: 10 * 1000, // 10초
        refetchInterval: 30 * 1000, // 30초마다 자동 갱신
        refetchOnWindowFocus: true, // 창 포커스 시 자동 갱신
    });
};

export const useUpdateAiStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: AiStatusUpdateRequest) => adminApi.updateAiStatus(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'ai-status'] });
        },
    });
};

export const useUpdateAiLimits = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: AiLimitsUpdateRequest) => adminApi.updateAiLimits(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'ai-status'] });
        },
    });
};

export const useStorageStats = () => {
    return useQuery({
        queryKey: ['admin', 'storage-stats'],
        queryFn: () => adminApi.getStorageStats(),
        staleTime: 60 * 1000, // 1분
    });
};

export const useCleanupStorage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (olderThanDays: number) => adminApi.cleanupStorage(olderThanDays),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'storage-stats'] });
        },
    });
};

export const useAdminAuditLogs = (params: AdminAuditLogRequest) => {
    return useQuery({
        queryKey: ['admin', 'audit-logs', params],
        queryFn: () => adminApi.getAuditLogs(params),
        staleTime: 1 * 60 * 1000, // 1분
    });
};

export const useProblemStats = () => {
    return useQuery({
        queryKey: ['admin', 'problem-stats'],
        queryFn: () => adminApi.getProblemStats(),
        staleTime: 30 * 1000, // 30초
    });
};


