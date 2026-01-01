/**
 * 통계 페이지 (Bento Grid 레이아웃)
 */

import type { FC } from 'react';
import { useStatistics } from '../../../hooks/api/useStatistics';
import { StatCard } from '../components/StatCard';
import { RadarChartCard } from '../components/RadarChartCard';
import { AlgorithmChart } from '../components/AlgorithmChart';
import { ActivityHeatmap } from '../../dashboard/components/ActivityHeatmap';
import { Spinner } from '../../../components/ui/Spinner';
import { Layout } from '../../../components/layout/Layout';
import { BookOpen, FileText, Clock, Target } from 'lucide-react';

export const StatisticsPage: FC = () => {
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

    // 시간 포맷 유틸리티 함수 (초 단위를 "MM분 SS초" 또는 "MM분" 형식으로 변환)
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

    // 레이더 차트 데이터 준비 (tagRadarData 사용)
    const prepareRadarData = () => {
        if (statistics?.tagRadarData && statistics.tagRadarData.length > 0) {
            return statistics.tagRadarData.map((item) => ({
                category: item.tag,
                value: item.fullMark > 0 ? Math.round((item.count / item.fullMark) * 100) : 0,
            }));
        }
        // Fallback: algorithmCategoryDistribution 사용 (기존 로직)
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
            <div className="bg-gray-50 dark:bg-gray-900 py-2 px-4">
                <div className="max-w-7xl mx-auto space-y-2">
                    {/* Zone 1: 핵심 지표 요약 (Top Row) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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

                    {/* Zone 2: 상세 분석 차트 (Middle Row) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                        {/* Left Column: 레이더 차트 */}
                        <div className="lg:col-span-1">
                            <RadarChartCard data={radarData} />
                        </div>

                        {/* Right Column: 알고리즘 사용 빈도 */}
                        <div className="lg:col-span-2">
                            <AlgorithmChart
                                topAlgorithms={statistics.topUsedAlgorithms}
                                distribution={statistics.algorithmCategoryDistribution}
                            />
                        </div>
                    </div>

                    {/* Zone 3: 지속성 히트맵 (Bottom Row) */}
                    <div className="w-full">
                        <ActivityHeatmap />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

