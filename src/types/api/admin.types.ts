/**
 * 관리자 관련 API 타입 정의
 */

import type { Page } from './common.types';
import type { QuoteResponse } from './quote.types';
import type { FeedbackResponse } from './feedback.types';

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
    aiMetrics?: {
        averageDurationMillis: number | null;
        averageDurationSeconds: number | null;
        totalGeneratedCount: number;
        timeoutCount: number;
        timeoutRate: number;
    };
}

export interface CollectMetadataRequest {
    start: number;
    end: number;
}

export interface CollectResponse {
    message: string;
    range?: string;
}

export interface ProblemStatsResponse {
    totalCount: number;
    minProblemId: number | null;
    maxProblemId: number | null;
}

export interface PerformanceMetricsResponse {
    rpm: number;
    averageResponseTime: number;
    timeRangeMinutes: number;
    rpmTimeSeries: TimeSeriesPoint[];
    latencyTimeSeries: TimeSeriesPoint[];
}

export interface TimeSeriesPoint {
    timestamp: number; // Unix timestamp (초)
    value: number;
}

export interface ChartDataResponse {
    data: ChartDataItem[];
}

export interface ChartDataItem {
    date: string;
    value: number;
}

export type ChartDataType = 'USER' | 'SOLUTION' | 'RETROSPECTIVE';
export type ChartPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface MaintenanceModeRequest {
    enabled: boolean;
    startTime?: string | null; // ISO 8601 형식 (yyyy-MM-ddTHH:mm:ss)
    endTime?: string | null;   // ISO 8601 형식 (yyyy-MM-ddTHH:mm:ss)
    noticeId?: string | null;  // 관련 공지사항 ID
}

export interface MaintenanceModeResponse {
    enabled: boolean;
    message: string;
}

export interface AdminLogResponse {
    id: string;
    bojId: string | null;
    title: string;
    content: string;
    code: string;
    aiReview: string | null;
    aiReviewStatus: string | null;
    aiReviewDurationMillis: number | null;
    createdAt: string;
}

export interface AdminLogPageResponse extends Page<AdminLogResponse> {}

export interface AdminMemberUpdateRequest {
    nickname?: string;
    password?: string;
}

export interface LogCleanupResponse {
    message: string;
    deletedCount: number;
}

export interface AiStatusResponse {
    isEnabled: boolean;
    todayGlobalUsage: number;
    globalLimit: number;
    userLimit: number;
}

export interface AiStatusUpdateRequest {
    enabled: boolean;
}

export interface AiLimitsUpdateRequest {
    globalLimit: number;
    userLimit: number;
}

export interface StorageStatsResponse {
    totalCount: number;
    estimatedSizeKb: number;
    oldestRecordDate: string; // ISO 8601 형식 (YYYY-MM-DD)
}

export interface StorageCleanupResponse {
    message: string;
    deletedCount: number;
}

export interface AiQualityStatsResponse {
    totalFeedbackCount: number;
    positiveRate: number;
    negativeReasons: Record<string, number>;
    recentNegativeLogs: RecentNegativeLogResponse[];
}

export interface RecentNegativeLogResponse {
    id: string;
    aiReview: string;
    codeSnippet: string;
}

export type AdminActionType =
    | 'STORAGE_CLEANUP'
    | 'NOTICE_CREATE'
    | 'NOTICE_UPDATE'
    | 'NOTICE_DELETE'
    | 'AI_SERVICE_TOGGLE'
    | 'AI_LIMITS_UPDATE'
    | 'USER_DELETE'
    | 'USER_UPDATE'
    | 'QUOTE_CREATE'
    | 'QUOTE_DELETE'
    | 'FEEDBACK_STATUS_UPDATE'
    | 'FEEDBACK_DELETE'
    | 'MAINTENANCE_MODE_TOGGLE';

export interface AdminAuditLogResponse {
    id: string;
    adminId: string;
    action: AdminActionType;
    details: string;
    ipAddress: string;
    createdAt: string;
}

export interface AdminAuditLogPageResponse extends Page<AdminAuditLogResponse> {}

export interface AdminAuditLogRequest {
    page?: number;
    size?: number;
    adminId?: string;
    action?: AdminActionType;
    startDate?: string; // ISO 8601 형식
    endDate?: string; // ISO 8601 형식
}


