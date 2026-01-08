import { describe, expect, it } from 'vitest';
import { getCategoryDisplayLabel, mapCategoryToApiValue } from './categoryMapping';

describe('mapCategoryToApiValue', () => {
    it('매핑이 있으면 englishName으로 변환한다', () => {
        expect(mapCategoryToApiValue('BinarySearch')).toBe('Binary Search');
        expect(mapCategoryToApiValue('DataStructures')).toBe('Data Structures');
        expect(mapCategoryToApiValue('TwoPointer')).toBe('Two-pointer');
    });

    it('매핑이 없으면 원본을 그대로 반환한다', () => {
        expect(mapCategoryToApiValue('Greedy')).toBe('Greedy');
    });
});

describe('getCategoryDisplayLabel', () => {
    it('표시용 라벨이 있으면 라벨로 변환한다', () => {
        expect(getCategoryDisplayLabel('BinarySearch')).toBe('Binary Search');
        expect(getCategoryDisplayLabel('BruteForce')).toBe('Brute Force');
    });

    it('표시용 라벨이 없으면 원본을 그대로 반환한다', () => {
        expect(getCategoryDisplayLabel('DP')).toBe('DP');
    });
});
