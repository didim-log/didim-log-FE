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













