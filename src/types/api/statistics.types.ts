/**
 * 통계 관련 API 타입 정의
 * 백엔드에서 모든 집계 로직을 처리하여 프론트엔드에 전달합니다.
 */

export interface HeatmapDataResponse {
    date: string; // ISO 8601 형식
    count: number;
    problemIds: string[];
}

/**
 * 카테고리별 통계 응답
 * 백엔드에서 쉼표로 구분된 태그를 개별 카테고리로 분리하여 집계한 결과입니다.
 */
export interface CategoryStatResponse {
    category: string;
    count: number;
}

/**
 * 통계 응답
 * 백엔드에서 모든 집계 로직을 처리하여 프론트엔드에 전달합니다.
 */
export interface StatisticsResponse {
    monthlyHeatmap: HeatmapDataResponse[];
    totalSolved: number;
    totalRetrospectives: number;
    totalFailures: number; // 실패한 회고 문서 개수 (FAIL 또는 TIME_OVER)
    averageSolveTime: number; // 초 단위
    successRate: number; // 0.0 ~ 100.0
    categoryStats: CategoryStatResponse[]; // 성공한 문제의 카테고리별 통계 (Radar/Bar Chart용)
    weaknessStats: CategoryStatResponse[]; // 실패한 문제의 카테고리별 통계 (Weakness Analysis용)
}
