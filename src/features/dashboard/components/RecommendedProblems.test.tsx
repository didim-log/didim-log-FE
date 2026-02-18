import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import type { User } from '../../../types/domain/user.types';

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

import { RecommendedProblems } from './RecommendedProblems';

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
});
