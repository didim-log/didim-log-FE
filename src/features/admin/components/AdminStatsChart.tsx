/**
 * 관리자 통계 차트 컴포넌트
 */

import type { FC } from 'react';
import type { AdminDashboardStatsResponse } from '../../../types/api/admin.types';

interface AdminStatsChartProps {
    stats: AdminDashboardStatsResponse;
}

export const AdminStatsChart: FC<AdminStatsChartProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">총 회원 수</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers.toLocaleString()}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">오늘 가입자</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.todaySignups.toLocaleString()}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">총 해결된 문제</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {stats.totalSolvedProblems.toLocaleString()}
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">오늘 작성된 회고</div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.todayRetrospectives.toLocaleString()}
                </div>
            </div>
        </div>
    );
};

