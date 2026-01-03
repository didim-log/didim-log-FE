/**
 * 통계 미리보기 카드 컴포넌트 (대시보드용)
 */

import { Link } from 'react-router-dom';
import type { FC } from 'react';
import { useStatistics } from '../../../hooks/api/useStatistics';
import { Spinner } from '../../../components/ui/Spinner';
import { BookOpen, Clock, Target, TrendingUp } from 'lucide-react';

export const StatisticsPreview: FC = () => {
    const { data: statistics, isLoading } = useStatistics();

    // 시간 포맷 유틸리티 함수 (초 단위를 "MM분" 형식으로 변환)
    const formatTime = (seconds: number): string => {
        if (seconds === 0) return '0분';
        const minutes = Math.floor(seconds / 60);
        if (minutes === 0) {
            return `${Math.floor(seconds)}초`;
        }
        return `${minutes}분`;
    };

    // 핵심 지표 계산 (실제 API 데이터 사용)
    const getMetrics = () => {
        if (!statistics) {
            return {
                totalRetrospectives: 0,
                averageSolveTime: '0분',
                successRate: '0.0',
            };
        }

        return {
            totalRetrospectives: statistics.totalRetrospectives ?? 0,
            averageSolveTime: formatTime(statistics.averageSolveTime ?? 0),
            successRate: (statistics.successRate ?? 0).toFixed(1),
        };
    };

    const metrics = getMetrics();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 tour-statistics">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">통계</h3>
                <Link
                    to="/statistics"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
                >
                    더보기
                    <TrendingUp className="w-4 h-4" />
                </Link>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-6">
                    <Spinner />
                </div>
            ) : (
                <div className="space-y-2.5">
                    {/* 총 회고 수 */}
                    <div className="flex items-center justify-between p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">총 회고 수</span>
                        </div>
                        <span className="text-base font-bold text-gray-900 dark:text-white">
                            {metrics.totalRetrospectives}
                        </span>
                    </div>

                    {/* 평균 풀이 시간 */}
                    <div className="flex items-center justify-between p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">평균 풀이 시간</span>
                        </div>
                        <span className="text-base font-bold text-gray-900 dark:text-white">
                            {metrics.averageSolveTime}
                        </span>
                    </div>

                    {/* 성공률 */}
                    <div className="flex items-center justify-between p-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">성공률</span>
                        </div>
                        <span className="text-base font-bold text-gray-900 dark:text-white">
                            {metrics.successRate}%
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

