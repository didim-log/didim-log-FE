import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import type { User } from '../../../types/domain/user.types';
import type { ProblemCategoryMetaResponse, ProblemResponse } from '../../../types/api/problem.types';

const { mockUseProblemRecommend, mockUseProblemCategoryMeta, mockUseAuthStore } = vi.hoisted(() => {
    return {
        mockUseProblemRecommend: vi.fn(),
        mockUseProblemCategoryMeta: vi.fn(),
        mockUseAuthStore: vi.fn(),
    };
});

vi.mock('../../../hooks/api/useProblem', () => {
    return {
        useProblemRecommend: mockUseProblemRecommend,
        useProblemCategoryMeta: mockUseProblemCategoryMeta,
    };
});

vi.mock('../../../stores/auth.store', () => {
    return {
        useAuthStore: mockUseAuthStore,
    };
});

import { filterDemoProblems, RecommendedProblems } from './RecommendedProblems';

const createUser = (override?: Partial<User>): User => {
    return {
        id: 'user-1',
        nickname: 'tester',
        bojId: 'tester',
        email: 'tester@example.com',
        role: 'USER',
        rating: 0,
        tier: 'UNRATED',
        tierLevel: 0,
        provider: 'BOJ',
        ...override,
    };
};

describe('RecommendedProblems', () => {
    it('Unrated(tierLevel=0) + 빈 배열이면 브론즈 5 달성 안내 Empty State와 step 링크를 노출한다', () => {
        mockUseAuthStore.mockReturnValue({ user: createUser({ rating: 0, tierLevel: 0 }) });
        mockUseProblemCategoryMeta.mockReturnValue({ data: [] });
        mockUseProblemRecommend.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });

        const html = renderToStaticMarkup(
            <MemoryRouter>
                <RecommendedProblems count={4} />
            </MemoryRouter>
        );

        expect(html).toContain('아직 분석할 데이터가 부족해요!');
        expect(html).toContain('Bronze V');
        expect(html).toContain('백준 문제 풀러 가기');
        expect(html).toContain('href="https://www.acmicpc.net/step"');
        expect(html).not.toContain('아직 풀이 기록이 부족해요!');
    });

    it('티어가 있는데(>0) 빈 배열이면 기존 "기록 부족" Empty State를 유지한다', () => {
        mockUseAuthStore.mockReturnValue({ user: createUser({ rating: 1000, tierLevel: 5, tier: 'BRONZE' }) });
        mockUseProblemCategoryMeta.mockReturnValue({ data: [] });
        mockUseProblemRecommend.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });

        const html = renderToStaticMarkup(
            <MemoryRouter>
                <RecommendedProblems count={4} />
            </MemoryRouter>
        );

        expect(html).toContain('아직 풀이 기록이 부족해요!');
        expect(html).toContain('href="/problems?minLevel=3&amp;maxLevel=7"');
        expect(html).not.toContain('아직 분석할 데이터가 부족해요!');
    });

    it('데모 데이터는 연관 카테고리와 한국어 조건을 메모리에서 적용한다', () => {
        const categoryMeta: ProblemCategoryMetaResponse[] = [
            {
                canonical: 'GRAPH',
                englishName: 'Graph',
                koreanName: '그래프',
                aliases: [],
                parents: [],
                children: [],
                related: ['BFS'],
            },
            {
                canonical: 'BFS',
                englishName: 'BFS',
                koreanName: '너비 우선 탐색',
                aliases: [],
                parents: ['GRAPH'],
                children: [],
                related: [],
            },
        ];
        const problems: ProblemResponse[] = [
            {
                id: '1260',
                title: 'DFS와 BFS',
                category: 'GRAPH',
                normalizedTags: ['BFS'],
                difficulty: 'SILVER',
                difficultyLevel: 7,
                url: 'https://www.acmicpc.net/problem/1260',
                language: 'ko',
            },
            {
                id: '7576',
                title: 'Tomato',
                category: 'GRAPH',
                normalizedTags: ['BFS'],
                difficulty: 'GOLD',
                difficultyLevel: 9,
                url: 'https://www.acmicpc.net/problem/7576',
                language: 'en',
            },
            {
                id: '9251',
                title: 'LCS',
                category: 'DP',
                normalizedTags: ['DP'],
                difficulty: 'GOLD',
                difficultyLevel: 10,
                url: 'https://www.acmicpc.net/problem/9251',
                language: 'ko',
            },
        ];

        const relatedProblems = filterDemoProblems({
            problems,
            categoryMeta,
            category: 'Graph',
            onlyKorean: false,
            excludedProblemIds: ['1260'],
        });
        const koreanProblems = filterDemoProblems({
            problems,
            categoryMeta,
            category: 'Graph',
            onlyKorean: true,
            excludedProblemIds: ['1260'],
        });

        expect(relatedProblems.map((problem) => problem.id)).toEqual(['7576']);
        expect(koreanProblems).toEqual([]);
    });

    it('데모 렌더링은 문제 query를 끄고 데모 상세 경로를 사용한다', () => {
        const demoProblem: ProblemResponse = {
            id: '9251',
            title: 'LCS',
            category: 'DP',
            normalizedTags: ['DP'],
            difficulty: 'GOLD',
            difficultyLevel: 10,
            url: 'https://www.acmicpc.net/problem/9251',
            language: 'ko',
        };
        mockUseAuthStore.mockReturnValue({ user: createUser({ rating: 1200, tierLevel: 10 }) });
        mockUseProblemCategoryMeta.mockReturnValue({ data: undefined });
        mockUseProblemRecommend.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });

        const html = renderToStaticMarkup(
            <MemoryRouter>
                <RecommendedProblems
                    count={4}
                    category="DP"
                    demoMode
                    demoProblems={[demoProblem]}
                    demoCategoryMeta={[]}
                    userOverride={{ rating: 1200, tierLevel: 10 }}
                    problemPath={(id) => `/demo/problems/${id}`}
                />
            </MemoryRouter>
        );

        expect(mockUseProblemCategoryMeta).toHaveBeenLastCalledWith({ enabled: false });
        expect(mockUseProblemRecommend).toHaveBeenLastCalledWith(
            expect.objectContaining({ category: 'DP', filterMode: 'RELATED' }),
            { enabled: false },
        );
        expect(html).toContain('LCS');
        expect(html).toContain('href="/demo/problems/9251"');
        expect(html).not.toContain('더보기');
    });
});
