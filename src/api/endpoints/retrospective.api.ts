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
     * 백엔드에서 JWT 토큰에서 자동으로 사용자 정보를 추출하므로 studentId는 전달하지 않습니다.
     */
    createRetrospective: async (
        problemId: string,
        data: RetrospectiveRequest
    ): Promise<RetrospectiveResponse> => {
        const response = await apiClient.post<RetrospectiveResponse>(
            `/retrospectives?problemId=${problemId}`,
            data
        );
        return response.data;
    },

    /**
     * 회고 목록 조회
     */
    getRetrospectives: async (params: RetrospectiveListRequest): Promise<RetrospectivePageResponse> => {
        const response = await apiClient.get<RetrospectivePageResponse>('/retrospectives', { params });
        return response.data;
    },

    /**
     * 회고 상세 조회
     */
    getRetrospective: async (retrospectiveId: string): Promise<RetrospectiveResponse> => {
        const response = await apiClient.get<RetrospectiveResponse>(`/retrospectives/${retrospectiveId}`);
        return response.data;
    },

    /**
     * 북마크 토글
     */
    toggleBookmark: async (retrospectiveId: string): Promise<BookmarkToggleResponse> => {
        const response = await apiClient.post<BookmarkToggleResponse>(
            `/retrospectives/${retrospectiveId}/bookmark`
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
            `/retrospectives/${retrospectiveId}`,
            data
        );
        return response.data;
    },

    /**
     * 회고 삭제
     */
    deleteRetrospective: async (retrospectiveId: string): Promise<void> => {
        await apiClient.delete(`/retrospectives/${retrospectiveId}`);
    },

    /**
     * 템플릿 조회
     */
    getTemplate: async (params: TemplateRequest): Promise<TemplateResponse> => {
        const response = await apiClient.get<TemplateResponse>('/retrospectives/template', { params });
        return response.data;
    },

    /**
     * 정적 템플릿 조회
     */
    getStaticTemplate: async (data: StaticTemplateRequest): Promise<TemplateResponse> => {
        const response = await apiClient.post<TemplateResponse>('/retrospectives/template/static', data);
        return response.data;
    },
};
