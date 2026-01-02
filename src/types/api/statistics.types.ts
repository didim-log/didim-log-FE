/**
 * 통계 관련 API 타입 정의
 */

export interface HeatmapDataResponse {
    date: string; // ISO 8601 형식
    count: number;
    problemIds: string[];
}

export interface TopUsedAlgorithmResponse {
    name: string;
    count: number;
}

export interface TagStatResponse {
    tag: string;
    count: number;
    fullMark: number;
}

export interface CategoryFailureResponse {
    category: string;
    count: number;
}

export interface WeaknessAnalysisResponse {
    totalFailures: number;
    topCategory: string | null;
    topCategoryCount: number;
    topReason: string | null; // 'FAIL' | 'TIME_OVER'
    categoryFailures: CategoryFailureResponse[];
}

export interface StatisticsResponse {
    monthlyHeatmap: HeatmapDataResponse[];
    categoryDistribution: Record<string, number>;
    algorithmCategoryDistribution: Record<string, number>;
    topUsedAlgorithms: TopUsedAlgorithmResponse[];
    totalSolvedCount: number;
    totalRetrospectives: number;
    averageSolveTime: number; // 초 단위
    successRate: number; // 0.0 ~ 100.0
    tagRadarData: TagStatResponse[];
    weaknessAnalysis: WeaknessAnalysisResponse | null;
}

