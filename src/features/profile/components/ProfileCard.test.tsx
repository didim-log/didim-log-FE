import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProfileCard } from './ProfileCard';
import type { DashboardResponse } from '../../../types/api/dashboard.types';

const createDashboard = (override?: Partial<DashboardResponse>): DashboardResponse => {
    return {
        studentProfile: {
            nickname: 'tester',
            bojId: 'tester',
            currentTier: 'UNRATED',
            currentTierLevel: 0,
            consecutiveSolveDays: 0,
            primaryLanguage: null,
            isOnboardingFinished: false,
        },
        todaySolvedCount: 0,
        todaySolvedProblems: [],
        quote: null,
        currentTierTitle: 'Bronze V',
        nextTierTitle: 'Bronze IV',
        currentRating: 0,
        requiredRatingForNextTier: 0,
        progressPercentage: 0,
        ...override,
    };
};

describe('ProfileCard', () => {
    it('언랭(UNRATED) 사용자는 브론즈 V가 아닌 Unrated로 표시하고 tier-0 배지를 사용한다', () => {
        const html = renderToStaticMarkup(
            <ProfileCard dashboard={createDashboard()} primaryLanguage={null} onEdit={() => undefined} />
        );

        expect(html).toContain('Unrated');
        expect(html).toContain('src="/tier-0.svg"');
        expect(html).not.toContain('Bronze V');
    });
});

