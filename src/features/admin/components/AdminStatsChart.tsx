/**
 * 관리자 통계 차트 컴포넌트
 */

import { useState } from 'react';
import type { FC } from 'react';
import { TrendingUp } from 'lucide-react';
import type { AdminDashboardStatsResponse } from '../../../types/api/admin.types';
import { StatsChartModal } from './StatsChartModal';
import type { ChartDataType } from '../../../types/api/admin.types';

interface AdminStatsChartProps {
    stats: AdminDashboardStatsResponse;
}

export const AdminStatsChart: FC<AdminStatsChartProps> = ({ stats }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDataType, setSelectedDataType] = useState<ChartDataType | null>(null);
    const [selectedTitle, setSelectedTitle] = useState('');

    const handleCardClick = (dataType: ChartDataType, title: string) => {
        setSelectedDataType(dataType);
        setSelectedTitle(title);
        setModalOpen(true);
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <button
                    onClick={() => handleCardClick('USER', '총 회원 수')}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer text-left group"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">총 회원 수</div>
                        <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers.toLocaleString()}</div>
                </button>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">오늘 가입자</div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.todaySignups.toLocaleString()}</div>
                </div>
                <button
                    onClick={() => handleCardClick('SOLUTION', '총 해결된 문제')}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer text-left group"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">총 해결된 문제</div>
                        <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                    </div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {stats.totalSolvedProblems.toLocaleString()}
                    </div>
                </button>
                <button
                    onClick={() => handleCardClick('RETROSPECTIVE', '오늘 작성된 회고')}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer text-left group"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">오늘 작성된 회고</div>
                        <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                    </div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {stats.todayRetrospectives.toLocaleString()}
                    </div>
                </button>
            </div>

            {selectedDataType && (
                <StatsChartModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    dataType={selectedDataType}
                    title={selectedTitle}
                />
            )}
        </>
    );
};


