import { describe, expect, it } from 'vitest';
import { formatTier, getTierLevelFromRating, getTierName, getTierStep, resolveSolvedAcTierLevel } from './tier';

describe('Solved.ac tier mapping', () => {
    it('tierLevel=1은 Bronze V로 매핑된다', () => {
        expect(getTierName(1)).toBe('Bronze');
        expect(getTierStep(1)).toBe('V');
        expect(formatTier(1)).toBe('Bronze V');
    });

    it('tierLevel=0은 Unrated로 매핑된다', () => {
        expect(getTierName(0)).toBe('Unrated');
        expect(getTierStep(0)).toBe('');
        expect(formatTier(0)).toBe('Unrated');
    });

    it('tierLevel=31은 Master로 매핑되고 step은 없다', () => {
        expect(getTierName(31)).toBe('Master');
        expect(getTierStep(31)).toBe('');
        expect(formatTier(31)).toBe('Master');
    });

    it('rating=30이면 tierLevel=1(Bronze V)로 계산된다', () => {
        expect(getTierLevelFromRating(30)).toBe(1);
        expect(formatTier(getTierLevelFromRating(30))).toBe('Bronze V');
    });

    it('resolveSolvedAcTierLevel은 tierLevel이 유효하면 우선 사용하고, 없거나 유효하지 않으면 rating으로 fallback한다', () => {
        // tierLevel이 유효한 경우 (우선 사용)
        expect(resolveSolvedAcTierLevel({ tierLevel: 1 })).toBe(1); // Bronze V
        expect(resolveSolvedAcTierLevel({ tierLevel: 5, rating: 200 })).toBe(5); // Bronze I (tierLevel 우선)
        expect(resolveSolvedAcTierLevel({ tierLevel: 0 })).toBe(0); // Unrated
        expect(resolveSolvedAcTierLevel({ tierLevel: 31 })).toBe(31); // Master

        // tierLevel이 유효하지 않은 경우 (rating으로 fallback)
        expect(resolveSolvedAcTierLevel({ tierLevel: -1, rating: 30 })).toBe(1); // rating으로 계산
        expect(resolveSolvedAcTierLevel({ tierLevel: 32, rating: 90 })).toBe(3); // rating으로 계산

        // tierLevel이 없고 rating만 있는 경우
        expect(resolveSolvedAcTierLevel({ rating: 30 })).toBe(1); // Bronze V
        expect(resolveSolvedAcTierLevel({ rating: 90 })).toBe(3); // Bronze III

        // 둘 다 없는 경우
        expect(resolveSolvedAcTierLevel({})).toBe(0); // Unrated
    });
});


