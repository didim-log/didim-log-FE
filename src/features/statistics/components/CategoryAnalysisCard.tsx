/**
 * 카테고리 분석 카드 컴포넌트 (확대 버전)
 * 레이더 차트만 표시 (높이 350px)
 */

import type { FC } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface CategoryAnalysisCardProps {
    radarData: Array<{ category: string; value: number }>;
}

export const CategoryAnalysisCard: FC<CategoryAnalysisCardProps> = ({ radarData }) => {
    const hasData = radarData.length > 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 h-[420px] flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    카테고리별 실력 분석
                </h3>
            </div>

            {!hasData ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            데이터가 없습니다
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 min-h-0 flex flex-col">
                    {/* 레이더 차트 (확대) */}
                    {radarData.length > 0 ? (
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height={350}>
                                <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                                    <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                                    <PolarAngleAxis
                                        dataKey="category"
                                        tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                                        className="dark:[&_text]:fill-gray-400"
                                        tickFormatter={(value: string) => {
                                            // 긴 레이블은 10자로 제한하고 말줄임표 추가
                                            if (value.length > 10) {
                                                return `${value.substring(0, 10)}...`;
                                            }
                                            return value;
                                        }}
                                    />
                                    <PolarRadiusAxis
                                        angle={90}
                                        domain={[0, 100]}
                                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                                        className="dark:[&_text]:fill-gray-500"
                                        tickCount={6}
                                    />
                                    <Radar
                                        name="실력"
                                        dataKey="value"
                                        stroke="#6366f1"
                                        fill="#6366f1"
                                        fillOpacity={0.3}
                                        strokeWidth={2}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                레이더 차트 데이터가 없습니다
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
