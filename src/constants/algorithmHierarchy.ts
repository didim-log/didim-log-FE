/**
 * 알고리즘 카테고리 계층 구조 상수
 * 백엔드의 카테고리 계층 구조 검색 로직과 대칭되는 UI 힌트용 매핑
 *
 * 상위 카테고리를 선택하면 하위 태그들도 함께 검색됩니다.
 */

export const CATEGORY_HIERARCHY_HINTS: Record<string, string[]> = {
  // 그래프 이론 관련
  GRAPH: [
    "BFS",
    "DFS",
    "다익스트라",
    "MST",
    "플로이드-와샬",
    "위상 정렬",
    "최단 경로",
  ],
  GRAPH_THEORY: [
    "BFS",
    "DFS",
    "다익스트라",
    "MST",
    "플로이드-와샬",
    "위상 정렬",
    "최단 경로",
  ],

  // 동적 프로그래밍 관련
  DP: [
    "LCS",
    "LIS",
    "Knapsack",
    "배낭 문제",
    "최장 공통 부분 수열",
    "최장 증가 부분 수열",
  ],
  DYNAMIC_PROGRAMMING: [
    "LCS",
    "LIS",
    "Knapsack",
    "배낭 문제",
    "최장 공통 부분 수열",
    "최장 증가 부분 수열",
  ],

  // 자료구조 관련
  DATA_STRUCTURES: [
    "스택",
    "큐",
    "트리",
    "힙",
    "해시",
    "Union Find",
    "세그먼트 트리",
  ],
  DATA_STRUCTURE: [
    "스택",
    "큐",
    "트리",
    "힙",
    "해시",
    "Union Find",
    "세그먼트 트리",
  ],

  // 그래프 탐색 관련
  BFS: ["너비 우선 탐색", "Breadth-first Search"],
  DFS: ["깊이 우선 탐색", "Depth-first Search", "백트래킹"],

  // 문자열 처리 관련
  STRING: ["KMP", "라빈-카프", "트라이", "문자열 매칭"],

  // 트리 관련
  TREE: ["이진 트리", "트리 순회", "LCA", "세그먼트 트리"],

  // 탐색 관련
  BINARY_SEARCH: ["이분 탐색", "Binary Search", "파라메트릭 서치"],
  BinarySearch: ["이분 탐색", "Binary Search", "파라메트릭 서치"],

  // 정렬 관련
  SORTING: ["정렬", "Sorting", "병합 정렬", "퀵 정렬"],

  // 수학 관련
  MATHEMATICS: ["수학", "Math", "조합론", "정수론", "기하학"],
  Math: ["수학", "조합론", "정수론", "기하학"],

  // 구현 관련
  IMPLEMENTATION: ["구현", "Implementation", "시뮬레이션"],
  Implementation: ["구현", "시뮬레이션"],

  // 그리디 관련
  GREEDY: ["그리디", "Greedy", "탐욕 알고리즘"],
  Greedy: ["그리디", "탐욕 알고리즘"],

  // 시뮬레이션 관련
  SIMULATION: ["시뮬레이션", "Simulation"],
  Simulation: ["시뮬레이션"],

  // 완전 탐색 관련
  BruteForce: ["완전 탐색", "Brute Force", "브루트 포스"],

  // 투 포인터 관련
  TwoPointers: ["투 포인터", "Two Pointers", "슬라이딩 윈도우"],
  TwoPointer: ["투 포인터", "Two Pointers", "슬라이딩 윈도우"],

  // 백트래킹 관련
  Backtracking: ["백트래킹", "Backtracking"],
};

/**
 * 선택된 카테고리에 대한 하위 태그 힌트를 반환합니다.
 * @param category 선택된 카테고리 값
 * @returns 하위 태그 배열 (없으면 빈 배열)
 */
const normalizeCategoryKey = (value: string): string =>
  value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

export const getCategoryHierarchyHints = (categoryValue?: string | null): string[] => {
  if (!categoryValue) return [];
  const normalizedKey = normalizeCategoryKey(categoryValue);
  return CATEGORY_HIERARCHY_HINTS[normalizedKey] ?? [];
};
