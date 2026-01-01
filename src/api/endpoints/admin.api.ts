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
    FeedbackStatusUpdateRequest,
    AdminDashboardStatsResponse,
    CollectMetadataRequest,
    CollectResponse,
} from '../../types/api/admin.types';
import type { QuoteResponse } from '../../types/api/quote.types';
import type { FeedbackResponse } from '../../types/api/feedback.types';
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
};


