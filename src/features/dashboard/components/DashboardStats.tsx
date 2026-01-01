/**
 * 대시보드 통계 섹션 컴포넌트 (Bento Grid 스타일)
 */

import type { FC } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useStatistics } from '../../../hooks/api/useStatistics';
import { Spinner } from '../../../components/ui/Spinner';
import { BookOpen, Clock, Target } from 'lucide-react';

interface DashboardStatsProps {
    // Props 없음 - API에서 데이터 가져옴
}

// Mock 데이터 (API에 데이터가 없을 때 사용)
const mockCategoryData = [
    { category: 'BFS', value: 80 },
    { category: 'DP', value: 60 },
    { category: '구현', value: 40 },
    { category: '그래프', value: 35 },
    { category: '그리디', value: 25 },
];

const mockMetrics = {
    totalRetrospectives: 42,
    averageSolveTime: 35, // 분
    successRate: 72, // 퍼센트
};

export const DashboardStats: FC<DashboardStatsProps> = () => {
    const { data: statistics, isLoading, error } = useStatistics();

    // 카테고리 레이더 차트 데이터 준비
    const prepareRadarData = () => {
        if (statistics?.algorithmCategoryDistribution && Object.keys(statistics.algorithmCategoryDistribution).length > 0) {
            // 상위 5개 카테고리 추출
            const entries = Object.entries(statistics.algorithmCategoryDistribution)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5);

            // 최대값 기준으로 100점 만점으로 정규화
            const maxCount = Math.max(...entries.map(([, count]) => count));
            return entries.map(([name, count]) => ({
                category: name,
                value: Math.round((count / maxCount) * 100),
            }));
        }
        return mockCategoryData;
    };

    const radarData = prepareRadarData();

    // 핵심 지표 계산
    const calculateMetrics = () => {
        if (statistics) {
            // 총 회고 수는 totalSolvedCount 사용 (또는 별도 API 필요)
            const totalRetrospectives = statistics.totalSolvedCount || mockMetrics.totalRetrospectives;
            
            // 평균 풀이 시간과 성공률은 현재 API에 없으므로 mock 데이터 사용
            // TODO: 백엔드 API에 추가 필요
            return {
                totalRetrospectives,
                averageSolveTime: mockMetrics.averageSolveTime,
                successRate: mockMetrics.successRate,
            };
        }
        return mockMetrics;
    };

    const metrics = calculateMetrics();

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center py-8">
                    <Spinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                    통계 데이터를 불러올 수 없습니다.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* 핵심 지표 카드 - 컴팩트한 사이즈 */}
            <div className="space-y-3">
                {/* 총 회고 수 */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                총 회고 수
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {metrics.totalRetrospectives}
                            </p>
                        </div>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                {/* 평균 풀이 시간 */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                평균 풀이 시간
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {metrics.averageSolveTime}
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">분</span>
                            </p>
                        </div>
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

                {/* 성공률 */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                성공률
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {metrics.successRate}
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">%</span>
                            </p>
                        </div>
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 카테고리 레이더 차트 - 컴팩트한 사이즈 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    카테고리별 실력 분석
                </h3>
                {radarData.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                            카테고리 데이터가 없습니다.
                        </p>
                    </div>
                ) : (
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis
                                    dataKey="category"
                                    tick={{ fill: '#6b7280', fontSize: 10 }}
                                    className="dark:[&_text]:fill-gray-400"
                                />
                                <PolarRadiusAxis
                                    angle={90}
                                    domain={[0, 100]}
                                    tick={{ fill: '#6b7280', fontSize: 8 }}
                                    className="dark:[&_text]:fill-gray-400"
                                />
                                <Radar
                                    name="실력"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    fill="#6366f1"
                                    fillOpacity={0.6}
                                    strokeWidth={2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

