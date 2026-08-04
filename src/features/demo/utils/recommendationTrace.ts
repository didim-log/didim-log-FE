import {
    DEMO_CATEGORY_OPTIONS,
    DEMO_PROBLEMS,
    DEMO_PROFILE,
    DEMO_SOLVED_PROBLEM_IDS,
    type DemoCategoryKey,
    type DemoProblem,
    type DemoProblemCategory,
} from '../data/demo.fixture';

export interface DemoRecommendationInput {
    category?: DemoCategoryKey;
    onlyKorean?: boolean;
}

export type DemoRecommendationStepId = 'tier' | 'category' | 'solved' | 'language' | 'sort';

export interface DemoRecommendationStep {
    id: DemoRecommendationStepId;
    label: string;
    description: string;
    inputCount: number;
    outputCount: number;
}

export interface DemoRecommendationTrace {
    selectedCategory: DemoCategoryKey;
    language: 'all' | 'ko';
    tierRange: {
        min: number;
        max: number;
    };
    expandedCategories: readonly DemoProblemCategory[];
    steps: readonly DemoRecommendationStep[];
    problems: readonly DemoProblem[];
    totalCount: number;
}

const RELATED_CATEGORIES: Readonly<Record<DemoCategoryKey, readonly DemoProblemCategory[]>> = {
    ALL: [],
    GRAPH: ['GRAPH', 'BFS', 'DFS'],
    DP: ['DP'],
    GREEDY: ['GREEDY'],
};

const SOLVED_PROBLEM_IDS = new Set<number>(DEMO_SOLVED_PROBLEM_IDS);

const hasRelatedCategory = (
    problem: DemoProblem,
    expandedCategories: readonly DemoProblemCategory[],
): boolean => expandedCategories.some((category) => problem.categories.includes(category));

export const buildDemoRecommendationTrace = ({
    category = 'ALL',
    onlyKorean = false,
}: DemoRecommendationInput = {}): DemoRecommendationTrace => {
    const tierRange = {
        min: Math.max(1, DEMO_PROFILE.tierLevel - 2),
        max: Math.min(31, DEMO_PROFILE.tierLevel + 2),
    };
    const expandedCategories = RELATED_CATEGORIES[category];
    const categoryLabel = DEMO_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category;

    const tierCandidates = DEMO_PROBLEMS.filter(
        (problem) => problem.tierLevel >= tierRange.min && problem.tierLevel <= tierRange.max,
    );
    const categoryCandidates = category === 'ALL'
        ? tierCandidates
        : tierCandidates.filter((problem) => hasRelatedCategory(problem, expandedCategories));
    const unsolvedCandidates = categoryCandidates.filter(
        (problem) => !SOLVED_PROBLEM_IDS.has(problem.id),
    );
    const languageCandidates = onlyKorean
        ? unsolvedCandidates.filter((problem) => problem.language === 'ko')
        : unsolvedCandidates;
    const problems = [...languageCandidates].sort((left, right) => left.id - right.id);

    const steps: DemoRecommendationStep[] = [
        {
            id: 'tier',
            label: '티어 범위 적용',
            description: `${DEMO_PROFILE.tierLabel} 기준 ±2단계(${tierRange.min}~${tierRange.max})만 남깁니다.`,
            inputCount: DEMO_PROBLEMS.length,
            outputCount: tierCandidates.length,
        },
        {
            id: 'category',
            label: 'RELATED 카테고리 확장',
            description: category === 'ALL'
                ? '카테고리 제한 없이 모든 유형을 대상으로 합니다.'
                : `${categoryLabel} 선택을 ${expandedCategories.join(' · ')} 범위로 확장합니다.`,
            inputCount: tierCandidates.length,
            outputCount: categoryCandidates.length,
        },
        {
            id: 'solved',
            label: '푼 문제 제외',
            description: `${DEMO_PROFILE.bojId}가 이미 푼 문제를 후보에서 제외합니다.`,
            inputCount: categoryCandidates.length,
            outputCount: unsolvedCandidates.length,
        },
        {
            id: 'language',
            label: '언어 필터 적용',
            description: onlyKorean ? '한국어 문제만 남깁니다.' : '한국어와 영어 문제를 모두 포함합니다.',
            inputCount: unsolvedCandidates.length,
            outputCount: languageCandidates.length,
        },
        {
            id: 'sort',
            label: '결과 순서 고정',
            description: '데모를 다시 실행해도 같은 결과가 나오도록 문제 번호순으로 정렬합니다.',
            inputCount: languageCandidates.length,
            outputCount: problems.length,
        },
    ];

    return {
        selectedCategory: category,
        language: onlyKorean ? 'ko' : 'all',
        tierRange,
        expandedCategories,
        steps,
        problems,
        totalCount: problems.length,
    };
};
