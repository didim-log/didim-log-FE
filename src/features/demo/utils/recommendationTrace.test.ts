import { describe, expect, it } from 'vitest';
import {
    DEMO_PROBLEMS,
    DEMO_PROFILE,
    DEMO_SOLVED_PROBLEM_IDS,
} from '../data/demo.fixture';
import { buildDemoRecommendationTrace } from './recommendationTrace';

const problemIds = (category?: Parameters<typeof buildDemoRecommendationTrace>[0]) =>
    buildDemoRecommendationTrace(category).problems.map((problem) => problem.id);

describe('buildDemoRecommendationTrace', () => {
    it('프로필 티어 ±2 범위의 전체 후보를 단계별 개수와 함께 반환한다', () => {
        const trace = buildDemoRecommendationTrace();

        expect(DEMO_PROFILE).toMatchObject({ bojId: 'pDemo', rating: 800, tierLevel: 8 });
        expect(trace.tierRange).toEqual({ min: 6, max: 10 });
        expect(trace.totalCount).toBe(7);
        expect(trace.steps.map(({ id, inputCount, outputCount }) => ({ id, inputCount, outputCount }))).toEqual([
            { id: 'tier', inputCount: 10, outputCount: 9 },
            { id: 'category', inputCount: 9, outputCount: 9 },
            { id: 'solved', inputCount: 9, outputCount: 7 },
            { id: 'language', inputCount: 7, outputCount: 7 },
            { id: 'sort', inputCount: 7, outputCount: 7 },
        ]);
        expect(trace.problems.every((problem) => problem.tierLevel >= 6 && problem.tierLevel <= 10)).toBe(true);
    });

    it('그래프 선택을 RELATED 카테고리인 GRAPH·BFS·DFS로 확장한다', () => {
        const trace = buildDemoRecommendationTrace({ category: 'GRAPH' });

        expect(trace.expandedCategories).toEqual(['GRAPH', 'BFS', 'DFS']);
        expect(trace.steps.find((step) => step.id === 'category')).toMatchObject({
            label: 'RELATED 카테고리 확장',
            inputCount: 9,
            outputCount: 5,
        });
        expect(trace.problems.map((problem) => problem.id)).toEqual([1012, 2178, 7576, 10026]);
    });

    it('한국어 필터가 영어 문제를 제외한다', () => {
        const trace = buildDemoRecommendationTrace({ onlyKorean: true });

        expect(trace.language).toBe('ko');
        expect(trace.totalCount).toBe(4);
        expect(trace.problems.every((problem) => problem.language === 'ko')).toBe(true);
        expect(trace.steps.find((step) => step.id === 'language')).toMatchObject({
            inputCount: 7,
            outputCount: 4,
        });
    });

    it('풀이한 문제 ID는 모든 추천 결과에서 제외한다', () => {
        const allIds = problemIds();
        const graphIds = problemIds({ category: 'GRAPH' });

        expect(allIds).not.toEqual(expect.arrayContaining([...DEMO_SOLVED_PROBLEM_IDS]));
        expect(graphIds).not.toContain(1260);
    });

    it('fixture 순서와 무관하게 문제 번호 오름차순의 결정적 결과를 만든다', () => {
        expect(DEMO_PROBLEMS.map((problem) => problem.id)).not.toEqual(
            [...DEMO_PROBLEMS].sort((left, right) => left.id - right.id).map((problem) => problem.id),
        );

        const first = problemIds({ category: 'GRAPH', onlyKorean: true });
        const second = problemIds({ category: 'GRAPH', onlyKorean: true });

        expect(first).toEqual([2178, 10026]);
        expect(second).toEqual(first);
    });
});
