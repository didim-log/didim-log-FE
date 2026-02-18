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

export type AdminUserPageResponse = Page<AdminUserResponse>;

export interface QuoteCreateRequest {
    content: string;
    author: string;
}

export type QuotePageResponse = Page<QuoteResponse>;

export type FeedbackPageResponse = Page<FeedbackResponse>;

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

export interface RefreshDetailsRequest {
    start?: number;
    end?: number;
}

export interface ProblemStatsResponse {
    totalCount: number;
    minProblemId: number | null;
    maxProblemId: number | null;
    minNullDescriptionHtmlProblemId: number | null; // descriptionHtml이 null인 문제의 최소 ID
    minNullLanguageProblemId: number | null; // language가 null이거나 "other"인 문제의 최소 ID
}

/**
 * 비동기 작업 시작 응답 (메타데이터 수집, 언어 정보 업데이트)
 */
export interface JobStartResponse {
    message: string;
    jobId: string;
    range?: string; // 메타데이터/상세 강제 재수집의 경우
}

/**
 * 작업 상태 조회 응답
 */
export type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type JobType = 'COLLECT_METADATA' | 'COLLECT_DETAILS' | 'REFRESH_DETAILS' | 'UPDATE_LANGUAGE';
export type JobMetricsWindow = 'DAY' | 'WEEK' | 'MONTH';

export interface JobStatusResponse {
    jobId: string;
    jobType: JobType;
    status: JobStatus;
    queuedAt: number; // Unix timestamp (초)
    totalCount: number;
    processedCount: number;
    successCount: number;
    failCount: number;
    progressPercentage: number;
    estimatedRemainingSeconds: number | null;
    queuePosition: number | null;
    startedAt: number | null; // Unix timestamp (초)
    lastHeartbeatAt: number | null; // Unix timestamp (초)
    completedAt: number | null; // Unix timestamp (초)
    range: {
        start?: number | null;
        end?: number | null;
    } | null;
    createdBy: string;
    errorCode: string | null;
    errorMessage: string | null;
    lastCheckpointId: string | null;
}

export interface JobPageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface JobListRequest {
    type?: JobType;
    status?: JobStatus;
    from?: number; // Unix timestamp (초)
    to?: number; // Unix timestamp (초)
    page?: number;
    size?: number;
}

export type JobListResponse = JobPageResponse<JobStatusResponse>;

export interface JobMetricsResponse {
    window: JobMetricsWindow;
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    cancelledJobs: number;
    averageDurationSeconds: number;
    averageFailureRate: number;
    topErrorCodes: Array<{
        code: string;
        count: number;
    }>;
}

export interface ProblemJobAuditResponse {
    jobId: string;
    jobType: JobType;
    status: JobStatus;
    createdBy: string;
    queuedAt: number; // Unix timestamp (초)
    startedAt: number | null; // Unix timestamp (초)
    completedAt: number | null; // Unix timestamp (초)
    range: {
        start?: number | null;
        end?: number | null;
    } | null;
    totalCount: number;
    successCount: number;
    failCount: number;
    errorCode: string | null;
    errorMessage: string | null;
}

export type ProblemJobAuditPageResponse = JobPageResponse<ProblemJobAuditResponse>;

export interface PerformanceMetricsResponse {
    rpm: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    maxResponseTime: number;
    totalRequests: number;
    errorRequests: number;
    serverErrorRequests: number;
    errorRate: number;
    serverErrorRate: number;
    slowRequestRate: number;
    timeRangeMinutes: number;
    statusCodeSummary: StatusCodeSummary[];
    rpmTimeSeries: TimeSeriesPoint[];
    latencyTimeSeries: TimeSeriesPoint[];
    errorRateTimeSeries: TimeSeriesPoint[];
}

export interface StatusCodeSummary {
    statusCode: number;
    count: number;
    ratio: number;
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

export type AdminLogPageResponse = Page<AdminLogResponse>;

export interface AdminMemberUpdateRequest {
    nickname?: string;
    password?: string;
}

export interface LogCleanupResponse {
    message: string;
    mode: LogCleanupMode;
    referenceDays: number;
    cutoffAt: string; // ISO 8601
    deletedCount: number;
}

export type LogCleanupMode = 'OLDER_THAN_DAYS' | 'KEEP_RECENT_DAYS';

export interface LogCleanupPreviewResponse {
    mode: LogCleanupMode;
    referenceDays: number;
    cutoffAt: string; // ISO 8601
    deletableCount: number;
    statusBreakdown: Record<string, number>;
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
    | 'AI_REVIEW_POLICY_UPDATE'
    | 'USER_DELETE'
    | 'USER_UPDATE'
    | 'QUOTE_CREATE'
    | 'QUOTE_DELETE'
    | 'FEEDBACK_STATUS_UPDATE'
    | 'FEEDBACK_DELETE'
    | 'MAINTENANCE_MODE_TOGGLE'
    | 'PROBLEM_JOB_CREATE'
    | 'PROBLEM_JOB_CANCEL'
    | 'PROBLEM_JOB_RETRY';

export interface AdminAuditLogResponse {
    id: string;
    adminId: string;
    action: AdminActionType;
    details: string;
    ipAddress: string;
    createdAt: string;
}

export type AdminAuditLogPageResponse = Page<AdminAuditLogResponse>;

export interface AdminAuditLogRequest {
    page?: number;
    size?: number;
    adminId?: string;
    action?: AdminActionType;
    startDate?: string; // ISO 8601 형식
    endDate?: string; // ISO 8601 형식
}
