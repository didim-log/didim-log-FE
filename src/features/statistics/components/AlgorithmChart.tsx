/**
 * 알고리즘 차트 컴포넌트
 */

import type { FC } from 'react';
import type { TopUsedAlgorithmResponse } from '../../../types/api/statistics.types';

interface AlgorithmChartProps {
    topAlgorithms: TopUsedAlgorithmResponse[];
    distribution: Record<string, number>;
}

export const AlgorithmChart: FC<AlgorithmChartProps> = ({ topAlgorithms, distribution }) => {
    const entries = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
    const maxCount = entries.length > 0 ? entries[0][1] : 1;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 border border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">알고리즘 사용 빈도</h2>
            
            {/* 상위 3개 알고리즘 */}
            {topAlgorithms.length > 0 && (
                <div className="mb-3">
                    <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">가장 많이 사용한 알고리즘</h3>
                    <div className="flex gap-1.5">
                        {topAlgorithms.map((algo, index) => (
                            <div
                                key={algo.name}
                                className="flex-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2 border border-blue-200 dark:border-blue-800"
                            >
                                <div className="text-[10px] text-blue-600 dark:text-blue-400 mb-0.5">#{index + 1}</div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">{algo.name}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">{algo.count}회</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 전체 분포 */}
            {entries.length > 0 ? (
                <div className="space-y-2">
                    <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">전체 분포</h3>
                    {entries.map(([algorithm, count]) => (
                        <div key={algorithm} className="space-y-0.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{algorithm}</span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">{count}회</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div
                                    className="bg-green-600 dark:bg-green-500 h-1.5 rounded-full transition-all"
                                    style={{ width: `${(count / maxCount) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                        아직 데이터가 충분하지 않습니다.
                    </p>
                </div>
            )}
        </div>
    );
};

