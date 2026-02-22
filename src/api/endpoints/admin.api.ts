/**
 * 관리자 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import type {
    AdminUserListRequest,
    AdminUserPageResponse,
    AdminUserUpdateDto,
    QuoteCreateRequest,
    QuotePageResponse,
    FeedbackPageResponse,
    AdminDashboardStatsResponse,
    MaintenanceModeRequest,
    MaintenanceModeResponse,
    PerformanceMetricsResponse,
    AdminLogPageResponse,
    AdminLogResponse,
    ChartDataResponse,
    ChartDataType,
    ChartPeriod,
    LogCleanupResponse,
    AiQualityStatsResponse,
    AiStatusResponse,
    AiStatusUpdateRequest,
    AiLimitsUpdateRequest,
    StorageStatsResponse,
    StorageCleanupResponse,
    AdminAuditLogRequest,
    AdminAuditLogPageResponse,
    ProblemStatsResponse,
    LogCleanupMode,
    LogCleanupPreviewResponse,
} from '../../types/api/admin.types';
import type { QuoteResponse } from '../../types/api/quote.types';
import type { FeedbackResponse, FeedbackStatusUpdateRequest } from '../../types/api/feedback.types';
import type { PageRequest } from '../../types/api/common.types';

const normalizeAuditDateRange = (params: AdminAuditLogRequest): AdminAuditLogRequest => {
    const { startDate, endDate, ...rest } = params;
    if (!startDate && !endDate) {
        return rest;
    }
    if (!startDate || !endDate) {
        return rest;
    }
    return {
        ...rest,
        startDate,
        endDate,
    };
};

const DAY_MS = 24 * 60 * 60 * 1000;

const buildCutoffAt = (referenceDays: number): string =>
    new Date(Date.now() - referenceDays * DAY_MS).toISOString();

const shouldUseLegacyCleanupRequest = (error: unknown): boolean => {
    const status = (error as { response?: { status?: number } })?.response?.status;
    return status === 400 || status === 404 || status === 405 || status === 422;
};

const normalizeCleanupResponse = (
    mode: LogCleanupMode,
    referenceDays: number,
    raw: Partial<LogCleanupResponse> | undefined
): LogCleanupResponse => {
    return {
        message: raw?.message ?? '로그 정리가 완료되었습니다.',
        mode: raw?.mode ?? mode,
        referenceDays: raw?.referenceDays ?? referenceDays,
        cutoffAt: raw?.cutoffAt ?? buildCutoffAt(referenceDays),
        deletedCount: raw?.deletedCount ?? 0,
    };
};

export const adminApi = {
    /**
     * 회원 목록 조회
     */
    getUsers: async (params: AdminUserListRequest): Promise<AdminUserPageResponse> => {
        const response = await apiClient.get<AdminUserPageResponse>('/admin/users', { params });
        return response.data;
    },

    /**
     * 회원 강제 탈퇴
     */
    deleteUser: async (studentId: string): Promise<{ message: string }> => {
        const response = await apiClient.delete<{ message: string }>(`/admin/users/${studentId}`);
        return response.data;
    },

    /**
     * 회원 정보 수정
     */
    updateUser: async (studentId: string, data: AdminUserUpdateDto): Promise<void> => {
        await apiClient.patch(`/admin/users/${studentId}`, data);
    },

    /**
     * 명언 목록 조회
     */
    getQuotes: async (params: PageRequest): Promise<QuotePageResponse> => {
        const response = await apiClient.get<QuotePageResponse>('/admin/quotes', { params });
        return response.data;
    },

    /**
     * 명언 추가
     */
    createQuote: async (data: QuoteCreateRequest): Promise<QuoteResponse> => {
        const response = await apiClient.post<QuoteResponse>('/admin/quotes', data);
        return response.data;
    },

    /**
     * 명언 삭제
     */
    deleteQuote: async (quoteId: string): Promise<{ message: string }> => {
        const response = await apiClient.delete<{ message: string }>(`/admin/quotes/${quoteId}`);
        return response.data;
    },

    /**
     * 피드백 목록 조회
     */
    getFeedbacks: async (params: PageRequest): Promise<FeedbackPageResponse> => {
        const response = await apiClient.get<FeedbackPageResponse>('/admin/feedbacks', { params });
        return response.data;
    },

    /**
     * 피드백 상태 변경
     */
    updateFeedbackStatus: async (feedbackId: string, data: FeedbackStatusUpdateRequest): Promise<FeedbackResponse> => {
        const response = await apiClient.patch<FeedbackResponse>(`/admin/feedbacks/${feedbackId}/status`, data);
        return response.data;
    },

    /**
     * 피드백 삭제
     */
    deleteFeedback: async (feedbackId: string): Promise<void> => {
        await apiClient.delete(`/admin/feedbacks/${feedbackId}`);
    },

    /**
     * 관리자 대시보드 통계 조회
     */
    getDashboardStats: async (): Promise<AdminDashboardStatsResponse> => {
        const response = await apiClient.get<AdminDashboardStatsResponse>('/admin/dashboard/stats');
        return response.data;
    },

    /**
     * 관리자 대시보드 성능 메트릭 조회
     */
    getDashboardMetrics: async (minutes?: number): Promise<PerformanceMetricsResponse> => {
        const response = await apiClient.get<PerformanceMetricsResponse>('/admin/dashboard/metrics', {
            params: { minutes },
        });
        return response.data;
    },

    /**
     * 관리자 대시보드 차트 데이터 조회
     */
    getDashboardChart: async (dataType: ChartDataType, period: ChartPeriod): Promise<ChartDataResponse> => {
        const response = await apiClient.get<ChartDataResponse>('/admin/dashboard/chart', {
            params: { dataType, period },
        });
        return response.data;
    },

    /**
     * 유지보수 모드 토글
     */
    setMaintenanceMode: async (data: MaintenanceModeRequest): Promise<MaintenanceModeResponse> => {
        const response = await apiClient.post<MaintenanceModeResponse>('/admin/system/maintenance', data);
        return response.data;
    },

    /**
     * AI 리뷰 생성 로그 조회
     */
    getLogs: async (params: { bojId?: string; page?: number; size?: number }): Promise<AdminLogPageResponse> => {
        const response = await apiClient.get<AdminLogPageResponse>('/admin/logs', { params });
        return response.data;
    },

    /**
     * 특정 로그 상세 조회
     */
    getLog: async (logId: string): Promise<AdminLogResponse> => {
        const response = await apiClient.get<AdminLogResponse>(`/admin/logs/${logId}`);
        return response.data;
    },

    /**
     * 오래된 로그 정리
     */
    getLogCleanupPreview: async (mode: LogCleanupMode, referenceDays: number): Promise<LogCleanupPreviewResponse> => {
        const params =
            mode === 'KEEP_RECENT_DAYS'
                ? { mode, keepDays: referenceDays }
                : { mode, olderThanDays: referenceDays };
        try {
            const response = await apiClient.get<LogCleanupPreviewResponse>('/admin/logs/cleanup/preview', {
                params,
            });
            return {
                mode: response.data.mode ?? mode,
                referenceDays: response.data.referenceDays ?? referenceDays,
                cutoffAt: response.data.cutoffAt ?? buildCutoffAt(referenceDays),
                deletableCount: response.data.deletableCount ?? 0,
                statusBreakdown: response.data.statusBreakdown ?? {},
            };
        } catch (error: unknown) {
            if (!shouldUseLegacyCleanupRequest(error)) {
                throw error;
            }
            // 구버전 백엔드(미리보기 미지원)도 실제 정리 동작은 가능하도록 안전 fallback
            return {
                mode,
                referenceDays,
                cutoffAt: buildCutoffAt(referenceDays),
                deletableCount: 0,
                statusBreakdown: {},
            };
        }
    },

    cleanupLogs: async (mode: LogCleanupMode, referenceDays: number): Promise<LogCleanupResponse> => {
        const params =
            mode === 'KEEP_RECENT_DAYS'
                ? { mode, keepDays: referenceDays }
                : { mode, olderThanDays: referenceDays };
        try {
            const response = await apiClient.delete<LogCleanupResponse>('/admin/logs/cleanup', {
                params,
            });
            return normalizeCleanupResponse(mode, referenceDays, response.data);
        } catch (error: unknown) {
            if (!shouldUseLegacyCleanupRequest(error)) {
                throw error;
            }

            // 레거시 API 하위호환: olderThanDays 단일 파라미터만 지원하는 경우
            const legacyResponse = await apiClient.delete<Partial<LogCleanupResponse>>('/admin/logs/cleanup', {
                params: { olderThanDays: referenceDays },
            });
            return normalizeCleanupResponse(mode, referenceDays, legacyResponse.data);
        }
    },

    /**
     * AI 품질 통계 조회
     */
    getAiQualityStats: async (): Promise<AiQualityStatsResponse> => {
        const response = await apiClient.get<AiQualityStatsResponse>('/admin/dashboard/ai-quality');
        return response.data;
    },

    /**
     * AI 서비스 상태 조회
     */
    getAiStatus: async (): Promise<AiStatusResponse> => {
        const response = await apiClient.get<AiStatusResponse>('/admin/system/ai-status');
        return response.data;
    },

    /**
     * AI 서비스 활성화/비활성화
     */
    updateAiStatus: async (data: AiStatusUpdateRequest): Promise<AiStatusResponse> => {
        const response = await apiClient.post<AiStatusResponse>('/admin/system/ai-status', data);
        return response.data;
    },

    /**
     * AI 사용량 제한 업데이트
     */
    updateAiLimits: async (data: AiLimitsUpdateRequest): Promise<AiStatusResponse> => {
        const response = await apiClient.post<AiStatusResponse>('/admin/system/ai-limits', data);
        return response.data;
    },

    /**
     * 저장 공간 통계 조회
     */
    getStorageStats: async (): Promise<StorageStatsResponse> => {
        const response = await apiClient.get<StorageStatsResponse>('/admin/system/storage');
        return response.data;
    },

    /**
     * 오래된 회고 데이터 정리
     */
    cleanupStorage: async (olderThanDays: number): Promise<StorageCleanupResponse> => {
        const response = await apiClient.delete<StorageCleanupResponse>('/admin/system/storage/cleanup', {
            params: { olderThanDays },
        });
        return response.data;
    },

    /**
     * 관리자 작업 감사 로그 조회
     */
    getAuditLogs: async (params: AdminAuditLogRequest): Promise<AdminAuditLogPageResponse> => {
        const response = await apiClient.get<AdminAuditLogPageResponse>('/admin/audit-logs', {
            params: normalizeAuditDateRange(params),
        });
        return response.data;
    },

    /**
     * 문제 통계 조회
     */
    getProblemStats: async (): Promise<ProblemStatsResponse> => {
        const response = await apiClient.get<ProblemStatsResponse>('/admin/problems/stats');
        return response.data;
    },

};
