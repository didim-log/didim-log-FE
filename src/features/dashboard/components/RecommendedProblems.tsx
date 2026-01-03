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

/**
 * 추천 문제 태그 필터 목록 (대기업 코딩 테스트 출제 빈도 순)
 * 백엔드 TagUtils가 자동으로 공식 전체 이름으로 변환하므로 축약형을 그대로 전송
 */
const RECOMMENDED_TAGS = [
    'Implementation',  // 1. 구현 (가장 많이 출제)
    'Greedy',          // 2. 그리디
    'BFS',             // 3. 너비 우선 탐색
    'DFS',             // 4. 깊이 우선 탐색
    'DP',              // 5. 동적 프로그래밍
    'String',          // 6. 문자열 처리
    'TwoPointer',      // 7. 투 포인터
    'BinarySearch',    // 8. 이진 탐색
    'Simulation',      // 9. 시뮬레이션
    'Graph',           // 10. 그래프
    'Tree',            // 11. 트리
    'DataStructures',  // 12. 자료구조
    'BruteForce',      // 13. 완전 탐색
    'Dijkstra',        // 14. 다익스트라
] as const;

interface RecommendedProblemsProps {
    count?: number;
    category?: string;
}

export const RecommendedProblems: FC<RecommendedProblemsProps> = ({ count = 4, category: initialCategory }) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
    const [onlyKorean, setOnlyKorean] = useState<boolean>(false);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    // 백엔드 @Min(1) 변경으로 count만큼 직접 요청 가능 (최적화)
    const { data: problems, isLoading, error, refetch } = useProblemRecommend({ 
        count, 
        category: selectedCategory || undefined,
        language: onlyKorean ? 'ko' : undefined
    });
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    // 디버그 로그 (개발 환경에서만)
    useEffect(() => {
        if (import.meta.env.DEV) {
            console.log('Recommended Problems Data:', { problems, isLoading, error, count, category: selectedCategory });
            if (error) {
                console.error('Recommended Problems API Error:', error);
                // Axios 에러인 경우 상세 정보 출력
                if (error && typeof error === 'object' && 'response' in error) {
                    console.error('API Error Response:', (error as any).response?.data);
                    console.error('API Error Status:', (error as any).response?.status);
                }
            }
        }
    }, [problems, isLoading, error, count, selectedCategory]);

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

    // 최외곽 컨테이너에 타겟 클래스 추가 (항상 렌더링됨)
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 tour-recommend-problems">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">추천 문제</h3>
                <div className="flex items-center gap-3">
                    {/* 한국어만 보기 토글 */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={onlyKorean}
                            onChange={(e) => setOnlyKorean(e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">한국어 문제만</span>
                    </label>
                    <Link
                        to="/problems"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        더보기 &gt;
                    </Link>
                </div>
            </div>

            {/* 카테고리 칩 버튼 그룹 - 항상 표시 */}
            {!isLoading && (
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
                    {RECOMMENDED_TAGS.map((category) => (
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
            )}

            {/* 로딩 상태 */}
            {isLoading && (
                <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">문제를 불러오는 중...</p>
                </div>
            )}

            {/* 에러/빈 상태 또는 문제 목록 */}
            {!isLoading && (
                <>
                    {/* 에러 상태 */}
                    {error ? (
                <div className="text-center py-6 px-4">
                    <div className="mb-4">
                        <svg
                            className="w-16 h-16 mx-auto text-red-400 dark:text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                        추천 문제를 불러오는 중 오류가 발생했습니다.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mb-4">
                        네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.
                    </p>
                    <button
                        onClick={() => refetch()}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        {isLoading ? '불러오는 중...' : '다시 시도'}
                    </button>
                </div>
            ) : !problems || problems.length === 0 ? (
                <div className="text-center py-8 px-4">
                    <div className="mb-4">
                        <svg
                            className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                        아직 풀이 기록이 부족해요!
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mb-4">
                        먼저 기초 문제를 풀어보세요. 문제를 풀면 실력에 맞는 추천을 받을 수 있어요.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Link
                            to="/problems"
                            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            문제 목록 보기
                        </Link>
                        <a
                            href="https://solved.ac/class/1"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                        >
                            Solved.ac Class 1 문제
                        </a>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {problems.map((problem: ProblemResponse) => (
                        <ProblemCard key={problem.id} problem={problem} />
                    ))}
                </div>
                    )}
                </>
            )}
        </div>
    );
};

interface ProblemCardProps {
    problem: ProblemResponse;
}

const ProblemCard: FC<ProblemCardProps> = ({ problem }) => {
    const difficultyDisplay = formatTierFromDifficulty(problem.difficulty, problem.difficultyLevel);
    const isEnglish = problem.language === 'en';

    return (
        <Link
            to={`/problems/${problem.id}`}
            className="block border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md hover:border-blue-500 dark:hover:border-blue-400 transition-all"
        >
            <div className="flex items-start justify-between mb-1.5">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">#{problem.id}</p>
                        {/* EN 배지 */}
                        {isEnglish && (
                            <span 
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                title="This is an English problem"
                            >
                                🇺🇸 EN
                            </span>
                        )}
                    </div>
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
