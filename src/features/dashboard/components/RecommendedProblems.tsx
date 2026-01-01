/**
 * 추천 문제 카드 컴포넌트
 */

import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { useProblemRecommend } from '../../../hooks/api/useProblem';
import type { ProblemResponse } from '../../../types/api/problem.types';

const ALGORITHM_CATEGORIES = [
    'Implementation',
    'DP',
    'Graph',
    'DataStructures',
    'Greedy',
    'String',
    'BruteForce',
    'Tree',
    'Search',
    'BFS',
    'DFS',
    'Dijkstra',
    'Backtracking',
    'Bitmask',
    'Simulation',
    'TwoPointer',
    'NumberTheory',
] as const;

interface RecommendedProblemsProps {
    count?: number;
    category?: string;
}

export const RecommendedProblems: FC<RecommendedProblemsProps> = ({ count = 4, category: initialCategory }) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
    const { data: problems, isLoading, error } = useProblemRecommend({ count, category: selectedCategory || undefined });
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    // 선택된 카테고리가 변경되면 해당 버튼으로 스크롤
    useEffect(() => {
        if (selectedCategory === null) {
            // "전체" 버튼으로 스크롤
            const allButton = buttonRefs.current['all'];
            if (allButton && scrollContainerRef.current) {
                allButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        } else {
            // 선택된 카테고리 버튼으로 스크롤
            const selectedButton = buttonRefs.current[selectedCategory];
            if (selectedButton && scrollContainerRef.current) {
                selectedButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [selectedCategory]);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">추천 문제</h3>
                </div>
                <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">추천 문제</h3>
                <Link
                    to="/problems"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    더보기 &gt;
                </Link>
            </div>

            {/* 카테고리 칩 버튼 그룹 - 항상 표시 */}
            <div className="mb-4">
                <div 
                    ref={scrollContainerRef}
                    className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1"
                >
                    {/* 전체 버튼 */}
                    <button
                        ref={(el) => (buttonRefs.current['all'] = el)}
                        onClick={() => setSelectedCategory(null)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            selectedCategory === null
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        전체
                    </button>

                    {/* 카테고리 칩 버튼들 */}
                    {ALGORITHM_CATEGORIES.map((category) => (
                        <button
                            key={category}
                            ref={(el) => (buttonRefs.current[category] = el)}
                            onClick={() => setSelectedCategory(category)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                selectedCategory === category
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* 문제 목록 또는 에러/빈 상태 */}
            {error || !problems || problems.length === 0 ? (
                <div className="text-center py-6">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">추천할 문제가 없습니다.</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">현재 DB에 등록된 문제만 추천됩니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {problems.map((problem: ProblemResponse) => (
                        <ProblemCard key={problem.id} problem={problem} />
                    ))}
                </div>
            )}
        </div>
    );
};

interface ProblemCardProps {
    problem: ProblemResponse;
}

const ProblemCard: FC<ProblemCardProps> = ({ problem }) => {
    const getTierColor = (tier: string) => {
        const tierColors: Record<string, string> = {
            BRONZE: 'bg-amber-600 text-white',
            SILVER: 'bg-gray-400 text-white',
            GOLD: 'bg-yellow-500 text-white',
            PLATINUM: 'bg-cyan-400 text-white',
            DIAMOND: 'bg-blue-500 text-white',
            RUBY: 'bg-red-500 text-white',
            UNRATED: 'bg-gray-300 text-gray-700',
        };
        return tierColors[tier] || 'bg-gray-300 text-gray-700';
    };

    // 티어 범위 정의 (Solved.ac 레벨 시스템 기준)
    const tierRanges: Record<string, { min: number; max: number }> = {
        BRONZE: { min: 1, max: 5 },
        SILVER: { min: 6, max: 10 },
        GOLD: { min: 11, max: 15 },
        PLATINUM: { min: 16, max: 20 },
        DIAMOND: { min: 21, max: 25 },
        RUBY: { min: 26, max: 30 },
    };

    // 레벨을 로마 숫자로 변환하는 함수
    const getRomanNumeral = (tier: string, level: number): string => {
        const range = tierRanges[tier];
        if (!range || tier === 'UNRATED') {
            return '';
        }

        // 티어 내에서의 위치 계산 (높은 레벨 = 낮은 로마 숫자)
        // 예: GOLD (11-15)에서 레벨 15 = V, 레벨 11 = I
        const index = range.max - level;
        const romanNumerals = ['V', 'IV', 'III', 'II', 'I'];
        return romanNumerals[index] || '';
    };

    // "GOLD I" 형식으로 난이도 문자열 생성
    const getDifficultyDisplay = (tier: string, level: number): string => {
        if (tier === 'UNRATED') {
            return 'UNRATED';
        }
        const roman = getRomanNumeral(tier, level);
        return roman ? `${tier} ${roman}` : tier;
    };

    const difficultyDisplay = getDifficultyDisplay(problem.difficulty, problem.difficultyLevel);

    return (
        <Link
            to={`/problems/${problem.id}`}
            className="block border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md hover:border-blue-500 dark:hover:border-blue-400 transition-all"
        >
            <div className="flex items-start justify-between mb-1.5">
                <div className="flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400">#{problem.id}</p>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{problem.title}</h4>
                    {/* 카테고리 정보 표시 */}
                    {problem.category && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                            {problem.category}
                        </p>
                    )}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${getTierColor(problem.difficulty)}`}>
                    {difficultyDisplay}
                </span>
            </div>
        </Link>
    );
};
