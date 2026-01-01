/**
 * 관리자 관련 API 타입 정의
 */

import type { Page } from './common.types';
import type { QuoteResponse } from './quote.types';
import type { FeedbackResponse, FeedbackStatus } from './feedback.types';

export interface AdminUserListRequest {
    page?: number;
    size?: number;
    search?: string;
    startDate?: string; // ISO 8601 형식
    endDate?: string; // ISO 8601 형식
}

export interface AdminUserResponse {
    id: string;
    nickname: string;
    bojId: string | null;
    email: string | null;
    provider: string;
    role: string;
    rating: number;
    currentTier: string;
    consecutiveSolveDays: number;
}

export interface AdminUserUpdateDto {
    role?: string;
    nickname?: string;
    bojId?: string;
}

export interface AdminUserPageResponse extends Page<AdminUserResponse> {}

export interface QuoteCreateRequest {
    content: string;
    author: string;
}

export interface QuotePageResponse extends Page<QuoteResponse> {}

export interface FeedbackPageResponse extends Page<FeedbackResponse> {}

export interface AdminDashboardStatsResponse {
    totalUsers: number;
    todaySignups: number;
    totalSolvedProblems: number;
    todayRetrospectives: number;
}

export interface CollectMetadataRequest {
    start: number;
    end: number;
}

export interface CollectResponse {
    message: string;
    range?: string;
}


