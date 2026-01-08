/**
 * 공지사항 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import type {
    NoticeCreateRequest,
    NoticeListRequest,
    NoticePageResponse,
    NoticeResponse,
    NoticeUpdateRequest,
} from '../../types/api/notice.types';

export const noticeApi = {
    /**
     * 공지사항 목록 조회
     */
    getNotices: async (params: NoticeListRequest): Promise<NoticePageResponse> => {
        const response = await apiClient.get<NoticePageResponse>('/notices', { params });
        return response.data;
    },

    /**
     * 공지사항 상세 조회
     */
    getNotice: async (noticeId: string): Promise<NoticeResponse> => {
        const response = await apiClient.get<NoticeResponse>(`/notices/${noticeId}`);
        return response.data;
    },

    /**
     * 공지사항 작성 (ADMIN)
     */
    createNotice: async (data: NoticeCreateRequest): Promise<NoticeResponse> => {
        const response = await apiClient.post<NoticeResponse>('/admin/notices', data);
        return response.data;
    },

    /**
     * 공지사항 수정 (ADMIN)
     */
    updateNotice: async (noticeId: string, data: NoticeUpdateRequest): Promise<NoticeResponse> => {
        const response = await apiClient.patch<NoticeResponse>(`/notices/${noticeId}`, data);
        return response.data;
    },

    /**
     * 공지사항 삭제 (ADMIN)
     */
    deleteNotice: async (noticeId: string): Promise<void> => {
        await apiClient.delete(`/notices/${noticeId}`);
    },
};
