/**
 * 회고 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import type {
    RetrospectiveRequest,
    RetrospectiveResponse,
    RetrospectiveListRequest,
    RetrospectivePageResponse,
    BookmarkToggleResponse,
    TemplateRequest,
    TemplateResponse,
    StaticTemplateRequest,
} from '../../types/api/retrospective.types';

export const retrospectiveApi = {
    /**
     * 회고 작성/수정
     */
    createRetrospective: async (
        studentId: string,
        problemId: string,
        data: RetrospectiveRequest
    ): Promise<RetrospectiveResponse> => {
        const response = await apiClient.post<RetrospectiveResponse>(
            `/api/v1/retrospectives?studentId=${studentId}&problemId=${problemId}`,
            data
        );
        return response.data;
    },

    /**
     * 회고 목록 조회
     */
    getRetrospectives: async (params: RetrospectiveListRequest): Promise<RetrospectivePageResponse> => {
        const response = await apiClient.get<RetrospectivePageResponse>('/api/v1/retrospectives', { params });
        return response.data;
    },

    /**
     * 회고 상세 조회
     */
    getRetrospective: async (retrospectiveId: string): Promise<RetrospectiveResponse> => {
        const response = await apiClient.get<RetrospectiveResponse>(`/api/v1/retrospectives/${retrospectiveId}`);
        return response.data;
    },

    /**
     * 북마크 토글
     */
    toggleBookmark: async (retrospectiveId: string): Promise<BookmarkToggleResponse> => {
        const response = await apiClient.post<BookmarkToggleResponse>(
            `/api/v1/retrospectives/${retrospectiveId}/bookmark`
        );
        return response.data;
    },

    /**
     * 회고 수정
     */
    updateRetrospective: async (
        retrospectiveId: string,
        data: RetrospectiveRequest
    ): Promise<RetrospectiveResponse> => {
        const response = await apiClient.patch<RetrospectiveResponse>(
            `/api/v1/retrospectives/${retrospectiveId}`,
            data
        );
        return response.data;
    },

    /**
     * 회고 삭제
     */
    deleteRetrospective: async (retrospectiveId: string): Promise<void> => {
        await apiClient.delete(`/api/v1/retrospectives/${retrospectiveId}`);
    },

    /**
     * 템플릿 조회
     */
    getTemplate: async (params: TemplateRequest): Promise<TemplateResponse> => {
        const response = await apiClient.get<TemplateResponse>('/api/v1/retrospectives/template', { params });
        return response.data;
    },

    /**
     * 정적 템플릿 조회
     */
    getStaticTemplate: async (data: StaticTemplateRequest): Promise<TemplateResponse> => {
        const response = await apiClient.post<TemplateResponse>('/api/v1/retrospectives/template/static', data);
        return response.data;
    },
};


