/**
 * UI 카테고리 키 → 백엔드 ProblemCategory.englishName 매핑
 *
 * - UI는 띄어쓰기 없는 키(`BinarySearch`)를 사용하기도 한다.
 * - 백엔드는 englishName(`Binary Search`)을 기대한다.
 */

export const CATEGORY_API_MAP: Record<string, string> = {
    BinarySearch: 'Binary Search',
    DataStructures: 'Data Structures',
    GraphTheory: 'Graph Theory',
    DynamicProgramming: 'Dynamic Programming',
    NumberTheory: 'Number Theory',
    TwoPointer: 'Two-pointer',
    TwoPointers: 'Two-pointer',

    // 자주 쓰이는 축약/별칭 보정
    DP: 'Dynamic Programming',
    Graph: 'Graph Theory',
    BruteForce: 'Bruteforcing',
    Math: 'Mathematics',
    Hash: 'Hashing',
    UnionFind: 'Disjoint Set',
    Dijkstra: "Dijkstra's",
    BFS: 'Breadth-first Search',
    DFS: 'Depth-first Search',
    Heap: 'Priority Queue',
};

export const mapCategoryToApiValue = (category: string): string => {
    const mapped = CATEGORY_API_MAP[category];
    if (!mapped) {
        return category;
    }
    return mapped;
};

/**
 * UI 표시용 라벨 (가독성 개선)
 * - API 매핑과 달리, 사용자에게 자연스러운 표기(예: Brute Force)를 우선한다.
 */
export const CATEGORY_DISPLAY_MAP: Record<string, string> = {
    BinarySearch: 'Binary Search',
    DataStructures: 'Data Structures',
    GraphTheory: 'Graph Theory',
    DynamicProgramming: 'Dynamic Programming',
    NumberTheory: 'Number Theory',
    TwoPointer: 'Two Pointer',
    TwoPointers: 'Two Pointers',
    BruteForce: 'Brute Force',
};

export const getCategoryDisplayLabel = (category: string): string => {
    const label = CATEGORY_DISPLAY_MAP[category];
    if (!label) {
        return category;
    }
    return label;
};
