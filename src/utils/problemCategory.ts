import { getCategoryHierarchyHints } from '../constants/algorithmHierarchy';
import { ALGORITHM_CATEGORIES } from './constants';

const normalizeKey = (value: string): string =>
    value
        .trim()
        .toLowerCase()
        .replace(/['`]/g, '')
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ');

const CATEGORY_ALIAS_MAP: Record<string, string> = {
    bfs: 'BFS',
    'breadth first search': 'BFS',
    dfs: 'DFS',
    'depth first search': 'DFS',
    backtracking: 'Backtracking',
    'dynamic programming': 'DP',
    dp: 'DP',
    greedy: 'Greedy',
    'graph theory': 'Graph',
    'graph traversal': 'Graph',
    graph: 'Graph',
    string: 'String',
    implementation: 'Implementation',
    simulation: 'Simulation',
    bruteforcing: 'BruteForce',
    'brute force': 'BruteForce',
    'binary search': 'BinarySearch',
    'two pointer': 'TwoPointers',
    'two pointers': 'TwoPointers',
    sorting: 'Sorting',
    mathematics: 'Math',
    math: 'Math',
    tree: 'Tree',
    hashing: 'Hash',
    hash: 'Hash',
    stack: 'Stack',
    queue: 'Queue',
    'priority queue': 'Heap',
    heap: 'Heap',
    'disjoint set': 'UnionFind',
    'union find': 'UnionFind',
    'number theory': 'Math',
    geometry: 'Math',
    combinatorics: 'Math',
};

const canonicalCategoryValues = ALGORITHM_CATEGORIES.map((category) => category.value);

const toCanonicalCategory = (value?: string | null): string | null => {
    if (!value) {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    const directMatch = canonicalCategoryValues.find(
        (item) => item.toLowerCase() === trimmed.toLowerCase()
    );
    if (directMatch) {
        return directMatch;
    }

    const normalized = normalizeKey(trimmed);
    return CATEGORY_ALIAS_MAP[normalized] ?? null;
};

const addIfUnique = (target: string[], value: string | null): void => {
    if (!value) {
        return;
    }
    if (!target.includes(value)) {
        target.push(value);
    }
};

export const buildRepresentativeCategories = (
    category?: string | null,
    tags?: string[] | null,
    maxCount = 8
): string[] => {
    const sources = [...(tags ?? []), ...(category ? [category] : [])].filter(Boolean);
    const result: string[] = [];

    sources.forEach((source) => {
        addIfUnique(result, toCanonicalCategory(source));
        getCategoryHierarchyHints(source).forEach((hint) => {
            addIfUnique(result, toCanonicalCategory(hint));
        });
    });

    return result.slice(0, maxCount);
};

interface ProblemCategorySource {
    category?: string | null;
    primaryCategory?: string | null;
    secondaryCategories?: string[] | null;
    normalizedTags?: string[] | null;
    tags?: string[] | null;
}

export const buildRepresentativeCategoriesFromSource = (
    source: ProblemCategorySource,
    maxCount = 8
): string[] => {
    const mergedTags = [
        ...(source.normalizedTags ?? []),
        ...(source.secondaryCategories ?? []),
        ...(source.tags ?? []),
    ];

    const primary = source.primaryCategory ?? source.category ?? null;
    return buildRepresentativeCategories(primary, mergedTags, maxCount);
};
