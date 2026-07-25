import { describe, expect, it } from 'vitest';
import { buildRepresentativeCategories } from './problemCategory';

describe('buildRepresentativeCategories', () => {
    it('알려진 카테고리 별칭은 화면용 대표값으로 정규화한다', () => {
        expect(
            buildRepresentativeCategories('Graph Theory', ['Dynamic Programming'])
        ).toEqual(['Graph', 'DP']);
    });

    it('대표 카테고리에 없는 정규화 태그도 누락하지 않는다', () => {
        expect(
            buildRepresentativeCategories('Graph Theory', [
                'TOPOLOGICAL_SORTING',
                'Dynamic Programming',
            ])
        ).toEqual(['Graph', 'Topological Sorting', 'DP']);
    });
});
