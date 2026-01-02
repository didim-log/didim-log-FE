/**
 * 추천 문제 카드 컴포넌트
 */

import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProblemRecommend } from '../../../hooks/api/useProblem';
import { formatTierFromDifficulty, getTierColor } from '../../../utils/tier';
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
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const { data: problems, isLoading, error } = useProblemRecommend({ count, category: selectedCategory || undefined });
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    // 스크롤 위치에 따라 화살표 버튼 표시/숨김
    const updateArrowVisibility = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1); // 1px 여유를 두어 부동소수점 오차 방지
    };

    // 스크롤 이벤트 리스너
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        // 초기 상태 확인
        updateArrowVisibility();

        // 스크롤 이벤트 리스너 추가
        container.addEventListener('scroll', updateArrowVisibility);
        
        // 리사이즈 이벤트 리스너 추가 (컨테이너 크기 변경 시)
        const resizeObserver = new ResizeObserver(() => {
            updateArrowVisibility();
        });
        resizeObserver.observe(container);

        return () => {
            container.removeEventListener('scroll', updateArrowVisibility);
            resizeObserver.disconnect();
        };
    }, []);

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
        // 스크롤 후 화살표 상태 업데이트
        setTimeout(updateArrowVisibility, 300); // 스크롤 애니메이션 완료 후 업데이트
    }, [selectedCategory]);

    // 좌우 스크롤 함수
    const scrollLeft = () => {
        const container = scrollContainerRef.current;
        if (container) {
            container.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        const container = scrollContainerRef.current;
        if (container) {
            container.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

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
            <div className="mb-4 relative">
                {/* 왼쪽 화살표 버튼 */}
                {showLeftArrow && (
                    <button
                        onClick={scrollLeft}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all backdrop-blur-sm"
                        aria-label="왼쪽으로 스크롤"
                    >
                        <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                )}

                {/* 오른쪽 화살표 버튼 */}
                {showRightArrow && (
                    <button
                        onClick={scrollRight}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all backdrop-blur-sm"
                        aria-label="오른쪽으로 스크롤"
                    >
                        <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                )}

                <div 
                    ref={scrollContainerRef}
                    className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1"
                    style={{
                        scrollPaddingLeft: showLeftArrow ? '40px' : '0',
                        scrollPaddingRight: showRightArrow ? '40px' : '0',
                    }}
                >
                    {/* 전체 버튼 */}
                    <button
                        ref={(el) => { buttonRefs.current['all'] = el; }}
                        onClick={() => setSelectedCategory(null)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                            selectedCategory === null
                                ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-md border-blue-600 dark:border-blue-600'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        전체
                    </button>

                    {/* 카테고리 칩 버튼들 */}
                    {ALGORITHM_CATEGORIES.map((category) => (
                        <button
                            key={category}
                            ref={(el) => { buttonRefs.current[category] = el; }}
                            onClick={() => setSelectedCategory(category)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                                selectedCategory === category
                                    ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-md border-blue-600 dark:border-blue-600'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
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
    const difficultyDisplay = formatTierFromDifficulty(problem.difficulty, problem.difficultyLevel);

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
