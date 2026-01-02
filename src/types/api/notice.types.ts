/**
 * 공지사항 관련 API 타입 정의
 */

import type { Page } from './common.types';

export interface NoticeResponse {
    id: string;
    title: string;
    content: string;
    isPinned: boolean;
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
}

export interface NoticeListRequest {
    page?: number;
    size?: number;
}

export interface NoticePageResponse extends Page<NoticeResponse> {}

export interface NoticeCreateRequest {
    title: string;
    content: string;
    isPinned?: boolean;
}

export interface NoticeUpdateRequest {
    title?: string | null;
    content?: string | null;
    isPinned?: boolean | null;
}


