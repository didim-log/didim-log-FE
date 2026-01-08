/**
 * 잔디 차트 컴포넌트
 */

import type { FC } from 'react';
import type { HeatmapDataResponse } from '../../../types/api/statistics.types';

interface HeatmapChartProps {
    data: HeatmapDataResponse[];
}

export const HeatmapChart: FC<HeatmapChartProps> = ({ data }) => {
    const getIntensity = (count: number) => {
        if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
        if (count <= 2) return 'bg-green-200 dark:bg-green-900';
        if (count <= 5) return 'bg-green-400 dark:bg-green-700';
        if (count <= 10) return 'bg-green-600 dark:bg-green-600';
        return 'bg-green-800 dark:bg-green-500';
    };

    // 최근 12개월 데이터를 그리드로 표시
    const months = data.reduce((acc, item) => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[monthKey]) {
            acc[monthKey] = [];
        }
        acc[monthKey].push(item);
        return acc;
    }, {} as Record<string, HeatmapDataResponse[]>);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">활동 히트맵</h2>
            <div className="space-y-4">
                {Object.entries(months).map(([month, items]) => (
                    <div key={month} className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{month}</p>
                        <div className="flex flex-wrap gap-1">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className={`w-3 h-3 rounded ${getIntensity(item.count)}`}
                                    title={`${item.date}: ${item.count}문제`}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {data.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">데이터가 없습니다.</p>
            )}
        </div>
    );
};
