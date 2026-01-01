/**
 * 레이더 차트 카드 컴포넌트
 */

import type { FC } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface RadarChartCardProps {
    data: Array<{ category: string; value: number }>;
}

export const RadarChartCard: FC<RadarChartCardProps> = ({ data }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                카테고리별 실력 분석
            </h3>
            {data.length === 0 ? (
                <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                        아직 데이터가 충분하지 않습니다.
                    </p>
                </div>
            ) : (
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={data}>
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
    );
};

