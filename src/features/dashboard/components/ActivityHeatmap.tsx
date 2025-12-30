/**
 * 활동 히트맵 컴포넌트 (GitHub 스타일 1년치)
 */

import React, { useState } from 'react';
import { useStatistics } from '../../../hooks/api/useStatistics';
import { Spinner } from '../../../components/ui/Spinner';

interface ActivityHeatmapProps {
    // Props 없음 - API에서 데이터 가져옴
}

interface HeatmapCell {
    date: string;
    count: number;
    dateObj: Date;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = () => {
    const { data: statistics, isLoading, error } = useStatistics();
    const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

    const getIntensityColor = (count: number) => {
        if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
        if (count === 1) return 'bg-green-200 dark:bg-green-900/50';
        if (count <= 3) return 'bg-green-400 dark:bg-green-700';
        if (count <= 5) return 'bg-green-600 dark:bg-green-600';
        return 'bg-green-800 dark:bg-green-500';
    };

    // GitHub 스타일 1년치 히트맵 데이터 생성
    const generateYearHeatmap = (): HeatmapCell[][] => {
        if (!statistics?.monthlyHeatmap) return [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 364); // 365일 전 (오늘 포함)

        // 날짜별 데이터 맵 생성
        const dataMap = new Map<string, number>();
        statistics.monthlyHeatmap.forEach((item) => {
            dataMap.set(item.date, item.count);
        });

        // 365일 데이터 생성
        const allDays: HeatmapCell[] = [];
        for (let i = 0; i < 365; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            allDays.push({
                date: dateStr,
                count: dataMap.get(dateStr) || 0,
                dateObj: date,
            });
        }

        // 주 단위로 그룹화 (일요일부터 시작)
        const weeks: HeatmapCell[][] = [];
        let currentWeek: HeatmapCell[] = [];

        // 첫 주의 시작일을 일요일로 맞추기
        const firstDay = allDays[0].dateObj.getDay();
        for (let i = 0; i < firstDay; i++) {
            currentWeek.push({
                date: '',
                count: 0,
                dateObj: new Date(),
            });
        }

        allDays.forEach((day) => {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });

        // 마지막 주 채우기
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push({
                    date: '',
                    count: 0,
                    dateObj: new Date(),
                });
            }
            weeks.push(currentWeek);
        }

        return weeks;
    };

    const weeks = generateYearHeatmap();

    // 월 라벨 위치 계산
    const getMonthLabels = () => {
        if (weeks.length === 0) return [];

        const labels: Array<{ month: string; weekIndex: number }> = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const seenMonths = new Set<number>();

        weeks.forEach((week, weekIndex) => {
            const firstDay = week.find((day) => day.date !== '');
            if (firstDay) {
                const month = firstDay.dateObj.getMonth();
                const day = firstDay.dateObj.getDate();
                // 각 월의 첫 번째 주만 표시 (1일~7일 사이)
                if (!seenMonths.has(month) && day <= 7) {
                    seenMonths.add(month);
                    labels.push({
                        month: monthNames[month],
                        weekIndex,
                    });
                }
            }
        });

        return labels;
    };

    const monthLabels = getMonthLabels();

    const formatDate = (dateStr: string): string => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center py-8">
                    <Spinner />
                </div>
            </div>
        );
    }

    if (error || !statistics) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">활동 히트맵</h3>
                </div>
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        활동 데이터를 불러올 수 없습니다.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">활동 히트맵</h3>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-6">
                    <Spinner />
                </div>
            ) : error || !statistics ? (
                <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                        활동 데이터를 불러올 수 없습니다.
                    </p>
                </div>
            ) : weeks.length === 0 ? (
                <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">활동 데이터가 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {/* 히트맵 */}
                    <div className="overflow-x-auto -mx-3 px-3">
                        <div className="inline-block">
                            {/* 월 라벨 */}
                            <div className="flex mb-1 relative" style={{ paddingLeft: '18px' }}>
                                {monthLabels.map((label, index) => {
                                    const left = label.weekIndex * 10; // 각 주의 너비 (w-2 + gap-0.5 = 10px)
                                    return (
                                        <div
                                            key={index}
                                            className="absolute text-[10px] text-gray-600 dark:text-gray-400 whitespace-nowrap"
                                            style={{ left: `${left}px` }}
                                        >
                                            {label.month}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* 히트맵 그리드 */}
                            <div className="flex gap-0.5">
                                {/* 요일 라벨 */}
                                <div className="flex flex-col gap-0.5 pt-4">
                                    {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, index) => (
                                        <div
                                            key={index}
                                            className="w-2 h-2 text-[9px] text-gray-500 dark:text-gray-400 text-right pr-0.5"
                                            style={{ lineHeight: '8px' }}
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* 히트맵 셀들 */}
                                <div className="flex flex-col gap-0.5">
                                    {weeks.map((week, weekIndex) => (
                                        <div key={weekIndex} className="flex gap-0.5">
                                            {week.map((day, dayIndex) => {
                                                if (day.date === '') {
                                                    return (
                                                        <div
                                                            key={dayIndex}
                                                            className="w-2 h-2 rounded"
                                                        />
                                                    );
                                                }
                                                return (
                                                    <div
                                                        key={dayIndex}
                                                        className={`w-2 h-2 rounded ${getIntensityColor(day.count)} transition-colors hover:ring-1 hover:ring-blue-500 dark:hover:ring-blue-400 cursor-pointer`}
                                                        onMouseEnter={(e) => {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            setTooltip({
                                                                x: rect.left + rect.width / 2,
                                                                y: rect.top - 10,
                                                                text: `${formatDate(day.date)}: ${day.count}개 해결`,
                                                            });
                                                        }}
                                                        onMouseLeave={() => setTooltip(null)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 툴팁 */}
                    {tooltip && (
                        <div
                            className="fixed z-50 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg pointer-events-none"
                            style={{
                                left: `${tooltip.x}px`,
                                top: `${tooltip.y}px`,
                                transform: 'translate(-50%, -100%)',
                            }}
                        >
                            {tooltip.text}
                        </div>
                    )}

                    {/* 범례 */}
                    <div className="flex items-center justify-end gap-1.5 text-[9px] text-gray-600 dark:text-gray-400 mt-1">
                        <span>Less</span>
                        <div className="flex gap-0.5">
                            {[0, 1, 3, 5, 7].map((count) => (
                                <div
                                    key={count}
                                    className={`w-2 h-2 rounded ${getIntensityColor(count)}`}
                                />
                            ))}
                        </div>
                        <span>More</span>
                    </div>
                </div>
            )}
        </div>
    );
};

