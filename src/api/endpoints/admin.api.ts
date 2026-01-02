/**
 * 관리자 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import type {
    AdminUserListRequest,
    AdminUserPageResponse,
    AdminUserUpdateDto,
    AdminMemberUpdateRequest,
    QuoteCreateRequest,
    QuotePageResponse,
    FeedbackPageResponse,
    AdminDashboardStatsResponse,
    CollectMetadataRequest,
    CollectResponse,
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
} from '../../types/api/admin.types';
import type { QuoteResponse } from '../../types/api/quote.types';
import type { FeedbackResponse, FeedbackStatusUpdateRequest } from '../../types/api/feedback.types';
import type { PageRequest } from '../../types/api/common.types';

export const adminApi = {
    /**
     * 회원 목록 조회
     */
    getUsers: async (params: AdminUserListRequest): Promise<AdminUserPageResponse> => {
        const response = await apiClient.get<AdminUserPageResponse>('/api/v1/admin/users', { params });
        return response.data;
    },

    /**
     * 회원 강제 탈퇴
     */
    deleteUser: async (studentId: string): Promise<{ message: string }> => {
        const response = await apiClient.delete<{ message: string }>(`/api/v1/admin/users/${studentId}`);
        return response.data;
    },

    /**
     * 회원 정보 수정
     */
    updateUser: async (studentId: string, data: AdminUserUpdateDto): Promise<void> => {
        await apiClient.patch(`/api/v1/admin/users/${studentId}`, data);
    },

    /**
     * 회원 닉네임/비밀번호 수정 (AdminMemberController)
     */
    updateMember: async (memberId: string, data: AdminMemberUpdateRequest): Promise<void> => {
        await apiClient.put(`/api/v1/admin/members/${memberId}`, data);
    },

    /**
     * 명언 목록 조회
     */
    getQuotes: async (params: PageRequest): Promise<QuotePageResponse> => {
        const response = await apiClient.get<QuotePageResponse>('/api/v1/admin/quotes', { params });
        return response.data;
    },

    /**
     * 명언 추가
     */
    createQuote: async (data: QuoteCreateRequest): Promise<QuoteResponse> => {
        const response = await apiClient.post<QuoteResponse>('/api/v1/admin/quotes', data);
        return response.data;
    },

    /**
     * 명언 삭제
     */
    deleteQuote: async (quoteId: string): Promise<{ message: string }> => {
        const response = await apiClient.delete<{ message: string }>(`/api/v1/admin/quotes/${quoteId}`);
        return response.data;
    },

    /**
     * 피드백 목록 조회
     */
    getFeedbacks: async (params: PageRequest): Promise<FeedbackPageResponse> => {
        const response = await apiClient.get<FeedbackPageResponse>('/api/v1/admin/feedbacks', { params });
        return response.data;
    },

    /**
     * 피드백 상태 변경
     */
    updateFeedbackStatus: async (feedbackId: string, data: FeedbackStatusUpdateRequest): Promise<FeedbackResponse> => {
        const response = await apiClient.patch<FeedbackResponse>(`/api/v1/admin/feedbacks/${feedbackId}/status`, data);
        return response.data;
    },

    /**
     * 피드백 삭제
     */
    deleteFeedback: async (feedbackId: string): Promise<void> => {
        await apiClient.delete(`/api/v1/admin/feedbacks/${feedbackId}`);
    },

    /**
     * 관리자 대시보드 통계 조회
     */
    getDashboardStats: async (): Promise<AdminDashboardStatsResponse> => {
        const response = await apiClient.get<AdminDashboardStatsResponse>('/api/v1/admin/dashboard/stats');
        return response.data;
    },

    /**
     * 관리자 대시보드 성능 메트릭 조회
     */
    getDashboardMetrics: async (minutes?: number): Promise<PerformanceMetricsResponse> => {
        const response = await apiClient.get<PerformanceMetricsResponse>('/api/v1/admin/dashboard/metrics', {
            params: { minutes },
        });
        return response.data;
    },

    /**
     * 관리자 대시보드 차트 데이터 조회
     */
    getDashboardChart: async (dataType: ChartDataType, period: ChartPeriod): Promise<ChartDataResponse> => {
        const response = await apiClient.get<ChartDataResponse>('/api/v1/admin/dashboard/chart', {
            params: { dataType, period },
        });
        return response.data;
    },

    /**
     * 유지보수 모드 토글
     */
    setMaintenanceMode: async (data: MaintenanceModeRequest): Promise<MaintenanceModeResponse> => {
        const response = await apiClient.post<MaintenanceModeResponse>('/api/v1/admin/system/maintenance', data);
        return response.data;
    },

    /**
     * AI 리뷰 생성 로그 조회
     */
    getLogs: async (params: { bojId?: string; page?: number; size?: number }): Promise<AdminLogPageResponse> => {
        const response = await apiClient.get<AdminLogPageResponse>('/api/v1/admin/logs', { params });
        return response.data;
    },

    /**
     * 특정 로그 상세 조회
     */
    getLog: async (logId: string): Promise<AdminLogResponse> => {
        const response = await apiClient.get<AdminLogResponse>(`/api/v1/admin/logs/${logId}`);
        return response.data;
    },

    /**
     * 오래된 로그 정리
     */
    cleanupLogs: async (olderThanDays: number): Promise<LogCleanupResponse> => {
        const response = await apiClient.delete<LogCleanupResponse>('/api/v1/admin/logs/cleanup', {
            params: { olderThanDays },
        });
        return response.data;
    },

    /**
     * 문제 메타데이터 수집
     */
    collectMetadata: async (params: CollectMetadataRequest): Promise<CollectResponse> => {
        const response = await apiClient.post<CollectResponse>('/api/v1/admin/problems/collect-metadata', null, { params });
        return response.data;
    },

    /**
     * 문제 상세 정보 크롤링
     */
    collectDetails: async (): Promise<CollectResponse> => {
        const response = await apiClient.post<CollectResponse>('/api/v1/admin/problems/collect-details');
        return response.data;
    },

    /**
     * AI 품질 통계 조회
     */
    getAiQualityStats: async (): Promise<AiQualityStatsResponse> => {
        const response = await apiClient.get<AiQualityStatsResponse>('/api/v1/admin/dashboard/ai-quality');
        return response.data;
    },

    /**
     * AI 서비스 상태 조회
     */
    getAiStatus: async (): Promise<AiStatusResponse> => {
        const response = await apiClient.get<AiStatusResponse>('/api/v1/admin/system/ai-status');
        return response.data;
    },

    /**
     * AI 서비스 활성화/비활성화
     */
    updateAiStatus: async (data: AiStatusUpdateRequest): Promise<AiStatusResponse> => {
        const response = await apiClient.post<AiStatusResponse>('/api/v1/admin/system/ai-status', data);
        return response.data;
    },

    /**
     * AI 사용량 제한 업데이트
     */
    updateAiLimits: async (data: AiLimitsUpdateRequest): Promise<AiStatusResponse> => {
        const response = await apiClient.post<AiStatusResponse>('/api/v1/admin/system/ai-limits', data);
        return response.data;
    },

    /**
     * 저장 공간 통계 조회
     */
    getStorageStats: async (): Promise<StorageStatsResponse> => {
        const response = await apiClient.get<StorageStatsResponse>('/api/v1/admin/system/storage');
        return response.data;
    },

    /**
     * 오래된 회고 데이터 정리
     */
    cleanupStorage: async (olderThanDays: number): Promise<StorageCleanupResponse> => {
        const response = await apiClient.delete<StorageCleanupResponse>('/api/v1/admin/system/storage/cleanup', {
            params: { olderThanDays },
        });
        return response.data;
    },

    /**
     * 관리자 작업 감사 로그 조회
     */
    getAuditLogs: async (params: AdminAuditLogRequest): Promise<AdminAuditLogPageResponse> => {
        const response = await apiClient.get<AdminAuditLogPageResponse>('/api/v1/admin/audit-logs', { params });
        return response.data;
    },
};


