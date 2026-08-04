export type DemoCategoryKey = 'ALL' | 'GRAPH' | 'DP' | 'GREEDY';

export type DemoProblemCategory = 'GRAPH' | 'BFS' | 'DFS' | 'DP' | 'GREEDY';
export type DemoProblemLanguage = 'ko' | 'en';

export interface DemoProblem {
    id: number;
    title: string;
    tierLevel: number;
    language: DemoProblemLanguage;
    categories: readonly DemoProblemCategory[];
    url: string;
}

export interface DemoCategoryOption {
    value: DemoCategoryKey;
    label: string;
    description: string;
}

export const DEMO_PROBLEMS = [
    {
        id: 9251,
        title: 'LCS',
        tierLevel: 10,
        language: 'en',
        categories: ['DP'],
        url: 'https://www.acmicpc.net/problem/9251',
    },
    {
        id: 1260,
        title: 'DFS와 BFS',
        tierLevel: 7,
        language: 'ko',
        categories: ['GRAPH', 'BFS', 'DFS'],
        url: 'https://www.acmicpc.net/problem/1260',
    },
    {
        id: 1931,
        title: '회의실 배정',
        tierLevel: 9,
        language: 'ko',
        categories: ['GREEDY'],
        url: 'https://www.acmicpc.net/problem/1931',
    },
    {
        id: 7576,
        title: 'Tomato',
        tierLevel: 9,
        language: 'en',
        categories: ['GRAPH', 'BFS'],
        url: 'https://www.acmicpc.net/problem/7576',
    },
    {
        id: 2748,
        title: '피보나치 수 2',
        tierLevel: 6,
        language: 'ko',
        categories: ['DP'],
        url: 'https://www.acmicpc.net/problem/2748',
    },
    {
        id: 12865,
        title: 'Ordinary Knapsack',
        tierLevel: 11,
        language: 'en',
        categories: ['DP'],
        url: 'https://www.acmicpc.net/problem/12865',
    },
    {
        id: 2178,
        title: '미로 탐색',
        tierLevel: 8,
        language: 'ko',
        categories: ['GRAPH', 'BFS'],
        url: 'https://www.acmicpc.net/problem/2178',
    },
    {
        id: 2839,
        title: '설탕 배달',
        tierLevel: 6,
        language: 'ko',
        categories: ['GREEDY'],
        url: 'https://www.acmicpc.net/problem/2839',
    },
    {
        id: 1012,
        title: 'Organic Cabbage',
        tierLevel: 7,
        language: 'en',
        categories: ['GRAPH', 'DFS'],
        url: 'https://www.acmicpc.net/problem/1012',
    },
    {
        id: 10026,
        title: '적록색약',
        tierLevel: 10,
        language: 'ko',
        categories: ['GRAPH', 'DFS'],
        url: 'https://www.acmicpc.net/problem/10026',
    },
] as const satisfies readonly DemoProblem[];

export type DemoProblemId = (typeof DEMO_PROBLEMS)[number]['id'];

export const DEMO_SOLVED_PROBLEM_IDS = [1260, 2839] as const satisfies readonly DemoProblemId[];

export const DEMO_PROFILE = {
    bojId: 'pDemo',
    displayName: 'pDemo',
    rating: 800,
    tierLevel: 8,
    tierLabel: 'Silver III',
    preferredLanguage: 'ko',
    solvedProblemIds: DEMO_SOLVED_PROBLEM_IDS,
} as const;

export const DEMO_CATEGORY_OPTIONS = [
    {
        value: 'ALL',
        label: '전체',
        description: '티어 범위 안의 모든 유형',
    },
    {
        value: 'GRAPH',
        label: '그래프 탐색',
        description: 'RELATED 관계인 그래프·BFS·DFS를 함께 탐색',
    },
    {
        value: 'DP',
        label: '동적 계획법',
        description: '동적 계획법 문제만 탐색',
    },
    {
        value: 'GREEDY',
        label: '그리디',
        description: '그리디 문제만 탐색',
    },
] as const satisfies readonly DemoCategoryOption[];
