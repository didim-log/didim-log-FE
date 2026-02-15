/**
 * 통계 페이지 (One-Page Dashboard)
 * Activity Heatmap 제거: 렌더링 성능 및 레이아웃 안정성 개선
 */

import { Suspense, lazy, useMemo } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStatistics } from '../../../hooks/api/useStatistics';
import { StatCard } from '../components/StatCard';
import { WeaknessAnalysisCard } from '../components/WeaknessAnalysisCard';
import { Spinner } from '../../../components/ui/Spinner';
import { Layout } from '../../../components/layout/Layout';
import { BookOpen, FileText, Clock, Target } from 'lucide-react';
import { formatDuration } from '../../../utils/dateUtils';

const CategoryAnalysisCard = lazy(() =>
    import('../components/CategoryAnalysisCard').then((module) => ({ default: module.CategoryAnalysisCard }))
);
const AlgorithmChart = lazy(() =>
    import('../components/AlgorithmChart').then((module) => ({ default: module.AlgorithmChart }))
);

const ChartFallback = () => (
    <div className="h-[420px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse" />
);

export const StatisticsPage: FC = () => {
    const navigate = useNavigate();
    const { data: statistics, isLoading, error } = useStatistics();

    // 레이더 차트 데이터 준비
    // 백엔드에서 이미 집계된 categoryStats를 사용하여 레이더 차트 데이터 생성
    // CRITICAL: 모든 hooks는 early return 전에 호출되어야 함 (React Hooks 규칙)
    const radarData = useMemo(() => {
        if (!statistics?.categoryStats || statistics.categoryStats.length === 0) {
            return [];
        }

        // 상위 8개만 사용 (레이더 차트가 너무 복잡해지지 않도록)
        const topCategories = statistics.categoryStats.slice(0, 8);
        const maxCount =
            topCategories.length > 0 ? Math.max(...topCategories.map((item) => item.count)) : 1;

        // 백엔드에서 이미 정렬되어 있으므로 그대로 사용
        return topCategories.map((item) => ({
            category: item.category,
            value: maxCount > 0 ? Math.round((item.count / maxCount) * 100) : 0,
        }));
    }, [statistics?.categoryStats]);

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center flex-1">
                    <Spinner />
                </div>
            </Layout>
        );
    }

    if (error || !statistics) {
        return (
            <Layout>
                <div className="flex items-center justify-center flex-1">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">오류가 발생했습니다</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {error instanceof Error ? error.message : '통계를 불러올 수 없습니다.'}
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-full bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">통계</h1>
                        <button
                            onClick={() => navigate(-1)}
                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                        >
                            ← 이전
                        </button>
                    </div>
                    {/* CSS Grid 레이아웃: 12열 그리드 */}
                    <div className="grid grid-cols-12 gap-4">
                        {/* Row 1: KPI Cards (Span 12) - 모바일: 2열, 데스크톱: 4열 */}
                        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <StatCard
                                title="총 풀이 수"
                                value={statistics.totalSolved ?? 0}
                                icon={BookOpen}
                                iconColor="text-blue-600 dark:text-blue-400"
                                bgColor="bg-blue-100 dark:bg-blue-900/30"
                                borderColor="border-blue-200 dark:border-blue-800"
                            />
                            <StatCard
                                title="총 회고 수"
                                value={statistics.totalRetrospectives ?? 0}
                                icon={FileText}
                                iconColor="text-indigo-600 dark:text-indigo-400"
                                bgColor="bg-indigo-100 dark:bg-indigo-900/30"
                                borderColor="border-indigo-200 dark:border-indigo-800"
                            />
                            <StatCard
                                title="평균 풀이 시간"
                                value={formatDuration(statistics.averageSolveTime ?? 0)}
                                icon={Clock}
                                iconColor="text-purple-600 dark:text-purple-400"
                                bgColor="bg-purple-100 dark:bg-purple-900/30"
                                borderColor="border-purple-200 dark:border-purple-800"
                            />
                            <StatCard
                                title="성공률"
                                value={`${(statistics.successRate ?? 0).toFixed(1)}%`}
                                icon={Target}
                                iconColor="text-green-600 dark:text-green-400"
                                bgColor="bg-green-100 dark:bg-green-900/30"
                                borderColor="border-green-200 dark:border-green-800"
                            />
                        </div>

                        {/* Row 2: Main Analysis (3-column layout) - 확대된 차트 */}
                        {/* Left: Radar Chart (Span 4) */}
                        <div className="col-span-12 lg:col-span-4">
                            <Suspense fallback={<ChartFallback />}>
                                <CategoryAnalysisCard radarData={radarData} />
                            </Suspense>
                        </div>

                        {/* Center: Algorithm Bar Chart (Span 4) */}
                        <div className="col-span-12 lg:col-span-4">
                            <Suspense fallback={<ChartFallback />}>
                                <AlgorithmChart categoryStats={statistics.categoryStats || []} />
                            </Suspense>
                        </div>

                        {/* Right: Weakness Analysis (Span 4) */}
                        <div className="col-span-12 lg:col-span-4">
                            <WeaknessAnalysisCard />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
