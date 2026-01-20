/**
 * 알고리즘 차트 컴포넌트 (확대 버전)
 * 쉼표로 구분된 태그를 분리하여 개별 알고리즘으로 카운트
 * 높이 350px
 */

import { useMemo } from 'react';
import type { FC } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { CategoryStatResponse } from '../../../types/api/statistics.types';

interface AlgorithmChartProps {
    categoryStats: CategoryStatResponse[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#06b6d4'];

export const AlgorithmChart: FC<AlgorithmChartProps> = ({ categoryStats }) => {
    // 백엔드에서 이미 집계된 categoryStats를 사용하여 Bar Chart 데이터 생성
    // Top 6으로 제한하고 부족한 경우 더미 데이터로 패딩
    const processedData = useMemo(() => {
        // categoryStats가 없거나 빈 배열인 경우 처리
        if (!categoryStats || categoryStats.length === 0) {
            // 빈 데이터로 6개 패딩
            return Array(6).fill(null).map(() => ({ name: '', count: 0 }));
        }

        // Top 6으로 제한 (백엔드에서 이미 정렬되어 있음)
        const top6 = categoryStats.slice(0, 6).map((item) => ({
            name: item.category,
            count: item.count,
        }));

        // 부족한 경우 더미 데이터로 패딩 (최대 6개)
        const paddedData = [...top6];
        while (paddedData.length < 6) {
            paddedData.push({ name: '', count: 0 });
        }

        return paddedData;
    }, [categoryStats]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 h-[420px] flex flex-col">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                알고리즘 사용 빈도
            </h2>
            
            {processedData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        데이터가 없습니다.
                    </p>
                </div>
            ) : (
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                            data={processedData}
                            layout="vertical"
                            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                        >
                            <XAxis
                                type="number"
                                tick={{ fontSize: 11 }}
                                className="dark:[&_text]:fill-gray-400"
                                tickFormatter={(value) => `${value}회`}
                                domain={[0, 'dataMax']}
                                allowDecimals={false}
                                interval={0}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={100}
                                tick={{ fontSize: 11 }}
                                className="dark:[&_text]:fill-gray-400"
                                tickFormatter={(value) => (value || '').trim() || ''} // 빈 문자열 필터링
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                                labelStyle={{ color: '#374151', fontWeight: 600 }}
                                formatter={(value: unknown) => {
                                    const numValue = typeof value === 'number' ? value : 0;
                                    return [`${numValue}회`, '사용 횟수'];
                                }}
                            />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
                                {processedData.map((item, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={item.count > 0 ? COLORS[index % COLORS.length] : 'transparent'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};
