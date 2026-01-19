/**
 * 알고리즘 카테고리 상수 정의
 * 문제 분류 및 회고 필터링에 사용됩니다.
 */

export const ALGORITHM_CATEGORIES = [
    { value: 'BFS', label: 'BFS' },
    { value: 'DFS', label: 'DFS' },
    { value: 'DP', label: 'DP' },
    { value: 'Greedy', label: 'Greedy' },
    { value: 'Graph', label: 'Graph' },
    { value: 'String', label: 'String' },
    { value: 'Implementation', label: 'Implementation' },
    { value: 'BruteForce', label: 'Brute Force' },
    { value: 'BinarySearch', label: 'Binary Search' },
    { value: 'TwoPointers', label: 'Two Pointers' },
    { value: 'Sorting', label: 'Sorting' },
    { value: 'Math', label: 'Math' },
    { value: 'Backtracking', label: 'Backtracking' },
    { value: 'Simulation', label: 'Simulation' },
    { value: 'Tree', label: 'Tree' },
    { value: 'Hash', label: 'Hash' },
    { value: 'Stack', label: 'Stack' },
    { value: 'Queue', label: 'Queue' },
    { value: 'Heap', label: 'Heap' },
    { value: 'UnionFind', label: 'Union Find' },
] as const;

/**
 * 카테고리 값 타입
 */
export type AlgorithmCategory = typeof ALGORITHM_CATEGORIES[number]['value'];

/**
 * 카테고리 표시명을 가져옵니다.
 */
export const getCategoryLabel = (value: string): string => {
    const category = ALGORITHM_CATEGORIES.find((cat) => cat.value === value);
    return category?.label || value;
};


/**
 * 애플리케이션 전역 상수
 */

// 회고 관련 상수
export const RETROSPECTIVE_OLD_DAYS = 180; // 180일 이상 된 회고를 "오래된 회고"로 간주

// 대시보드 통계 관련 상수
export const DASHBOARD_TOP_CATEGORIES_COUNT = 5; // 상위 카테고리 개수
export const DASHBOARD_RADAR_MAX_VALUE = 100; // 레이더 차트 최대값
export const DASHBOARD_MOCK_TOTAL_RETROSPECTIVES = 42; // Mock 데이터: 총 회고 수
export const DASHBOARD_MOCK_AVERAGE_SOLVE_TIME = 35; // Mock 데이터: 평균 풀이 시간 (분)
export const DASHBOARD_MOCK_SUCCESS_RATE = 72; // Mock 데이터: 성공률 (퍼센트)

// API 요청 관련 상수
export const LOGIN_DEBOUNCE_MS = 1200; // 로그인 API 중복 요청 방지 대기 시간 (1.2초)
export const SCROLL_DELAY_MS = 100; // 스크롤 애니메이션 지연 시간 (100ms)
