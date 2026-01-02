/**
 * 알고리즘 차트 컴포넌트 (확대 버전)
 * 쉼표로 구분된 태그를 분리하여 개별 알고리즘으로 카운트
 * 높이 350px
 */

import type { FC } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { TopUsedAlgorithmResponse } from '../../../types/api/statistics.types';

interface AlgorithmChartProps {
    topAlgorithms: TopUsedAlgorithmResponse[];
    distribution: Record<string, number>;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#06b6d4'];

export const AlgorithmChart: FC<AlgorithmChartProps> = ({ topAlgorithms, distribution }) => {
    // 백엔드에서 이미 쉼표로 구분된 태그를 분리하여 집계했으므로, 그대로 사용
    // distribution은 이미 개별 알고리즘별로 카운트되어 있음 (예: "BFS" -> 2, "DP" -> 1, "Hash" -> 1)
    const processAlgorithmDistribution = (): Array<{ name: string; count: number }> => {
        const algorithmCounts = new Map<string, number>();

        // distribution 맵을 그대로 사용 (이미 백엔드에서 개별 알고리즘별로 집계됨)
        Object.entries(distribution).forEach(([algorithm, count]) => {
            algorithmCounts.set(algorithm, count);
        });

        // topAlgorithms도 추가 (중복 제거)
        topAlgorithms.forEach((algo) => {
            if (!algorithmCounts.has(algo.name)) {
                algorithmCounts.set(algo.name, algo.count);
            }
        });

        return Array.from(algorithmCounts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    };

    const processedData = processAlgorithmDistribution();

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
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                                labelStyle={{ color: '#374151', fontWeight: 600 }}
                                formatter={(value: number) => [`${value}회`, '사용 횟수']}
                            />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                {processedData.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
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
