/**
 * 통계 페이지 (One-Page Dashboard)
 * 히트맵 제거, 차트 확대, Footer 하단 고정
 */

import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStatistics } from '../../../hooks/api/useStatistics';
import { StatCard } from '../components/StatCard';
import { CategoryAnalysisCard } from '../components/CategoryAnalysisCard';
import { AlgorithmChart } from '../components/AlgorithmChart';
import { WeaknessAnalysisCard } from '../components/WeaknessAnalysisCard';
import { Spinner } from '../../../components/ui/Spinner';
import { Layout } from '../../../components/layout/Layout';
import { BookOpen, FileText, Clock, Target } from 'lucide-react';

export const StatisticsPage: FC = () => {
    const navigate = useNavigate();
    const { data: statistics, isLoading, error } = useStatistics();

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

    // 시간 포맷 유틸리티 함수
    const formatTime = (seconds: number): string => {
        if (seconds === 0) return '0분';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        
        if (minutes === 0) {
            return `${remainingSeconds}초`;
        }
        if (remainingSeconds === 0) {
            return `${minutes}분`;
        }
        return `${minutes}분 ${remainingSeconds}초`;
    };

    // 레이더 차트 데이터 준비
    const prepareRadarData = () => {
        if (statistics?.tagRadarData && statistics.tagRadarData.length > 0) {
            return statistics.tagRadarData.map((item) => ({
                category: item.tag,
                value: item.fullMark > 0 ? Math.round((item.count / item.fullMark) * 100) : 0,
            }));
        }
        if (statistics?.algorithmCategoryDistribution && Object.keys(statistics.algorithmCategoryDistribution).length > 0) {
            const entries = Object.entries(statistics.algorithmCategoryDistribution)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5);

            const maxCount = Math.max(...entries.map(([, count]) => count));
            return entries.map(([name, count]) => ({
                category: name,
                value: maxCount > 0 ? Math.round((count / maxCount) * 100) : 0,
            }));
        }
        return [];
    };

    const radarData = prepareRadarData();

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
                        {/* Row 1: KPI Cards (Span 12) */}
                        <div className="col-span-12 grid grid-cols-4 gap-3">
                            <StatCard
                                title="총 풀이 수"
                                value={statistics.totalSolvedCount}
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
                                value={formatTime(statistics.averageSolveTime ?? 0)}
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
                            <CategoryAnalysisCard
                                radarData={radarData}
                                distributionData={statistics.algorithmCategoryDistribution || {}}
                            />
                        </div>

                        {/* Center: Algorithm Bar Chart (Span 4) */}
                        <div className="col-span-12 lg:col-span-4">
                            <AlgorithmChart
                                topAlgorithms={statistics.topUsedAlgorithms}
                                distribution={statistics.algorithmCategoryDistribution}
                            />
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
