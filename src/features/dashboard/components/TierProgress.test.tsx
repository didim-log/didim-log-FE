import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { DashboardResponse } from '../../../types/api/dashboard.types';

const { mockUseSyncBojProfile } = vi.hoisted(() => ({
    mockUseSyncBojProfile: vi.fn(),
}));

vi.mock('../../../hooks/api/useStudent', () => ({
    useSyncBojProfile: mockUseSyncBojProfile,
}));

import { TierProgress } from './TierProgress';

const dashboard: DashboardResponse = {
    studentProfile: {
        nickname: 'pDemo',
        bojId: 'pDemo',
        currentTier: 'SILVER',
        currentTierLevel: 8,
        consecutiveSolveDays: 7,
        primaryLanguage: 'KOTLIN',
        isOnboardingFinished: true,
    },
    todaySolvedCount: 1,
    todaySolvedProblems: [],
    quote: null,
    currentTierTitle: 'Silver III',
    nextTierTitle: 'Silver II',
    currentRating: 800,
    requiredRatingForNextTier: 900,
    progressPercentage: 50,
};

describe('TierProgress', () => {
    it('실제 모드에서는 BOJ 동기화 버튼을 유지한다', () => {
        mockUseSyncBojProfile.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });

        const html = renderToStaticMarkup(<TierProgress dashboard={dashboard} />);

        expect(html).toContain('aria-label="BOJ 정보 동기화"');
    });

    it('데모 모드에서는 BOJ 동기화 동작을 노출하지 않는다', () => {
        mockUseSyncBojProfile.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });

        const html = renderToStaticMarkup(<TierProgress dashboard={dashboard} demoMode />);

        expect(html).not.toContain('BOJ 정보 동기화');
        expect(html).toContain('pDemo');
    });
});
