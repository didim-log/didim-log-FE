/**
 * 활동 히트맵 컴포넌트 (연도별 표시 기능 추가)
 * 연도별로 히트맵을 표시하고, 연도별 잔디 채우기 통계를 제공
 */

import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { useStatistics } from '../../../hooks/api/useStatistics';
import { Spinner } from '../../../components/ui/Spinner';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface ActivityHeatmapProps {
    // Props 없음 - API에서 데이터 가져옴
}

interface HeatmapCell {
    date: string;
    count: number;
    dateObj: Date;
}

export const ActivityHeatmap: FC<ActivityHeatmapProps> = () => {
    const { data: statistics, isLoading, error } = useStatistics();
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

    // 사용 가능한 연도 목록 추출
    const availableYears = useMemo(() => {
        if (!statistics?.monthlyHeatmap || statistics.monthlyHeatmap.length === 0) {
            return [new Date().getFullYear()];
        }

        const years = new Set<number>();
        statistics.monthlyHeatmap.forEach((item) => {
            const date = new Date(item.date);
            if (!isNaN(date.getTime())) {
                years.add(date.getFullYear());
            }
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [statistics]);

    // 선택된 연도가 사용 가능한지 확인
    const currentYear = new Date().getFullYear();
    if (!availableYears.includes(selectedYear)) {
        setSelectedYear(availableYears[0] || currentYear);
    }

    const getIntensityColor = (count: number) => {
        if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
        if (count === 1) return 'bg-green-200 dark:bg-green-900/50';
        if (count <= 3) return 'bg-green-400 dark:bg-green-700';
        if (count <= 5) return 'bg-green-600 dark:bg-green-600';
        return 'bg-green-800 dark:bg-green-500';
    };

    // 날짜를 YYYY-MM-DD 형식으로 정규화
    const normalizeDate = (dateStr: string): string => {
        if (!dateStr) return '';
        if (dateStr.includes('T')) {
            return dateStr.split('T')[0];
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
        }
        try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
        } catch {
            // 파싱 실패
        }
        return dateStr;
    };

    // 선택된 연도의 히트맵 데이터 생성
    const generateYearHeatmap = (year: number): HeatmapCell[][] => {
        if (!statistics?.monthlyHeatmap || statistics.monthlyHeatmap.length === 0) {
            return [];
        }

        // 선택된 연도의 시작일과 종료일 계산
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31);
        const today = new Date();
        const endDate = yearEnd > today ? today : yearEnd;

        // 날짜별 데이터 맵 생성
        const dataMap = new Map<string, number>();
        statistics.monthlyHeatmap.forEach((item) => {
            const normalizedDate = normalizeDate(item.date);
            if (normalizedDate) {
                const date = new Date(normalizedDate);
                if (date >= yearStart && date <= endDate) {
                    const existingCount = dataMap.get(normalizedDate) || 0;
                    dataMap.set(normalizedDate, existingCount + item.count);
                }
            }
        });

        // 연도 전체 날짜 데이터 생성
        const allDays: HeatmapCell[] = [];
        const startDate = new Date(yearStart);
        const daysInYear = Math.ceil((endDate.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        for (let i = 0; i < daysInYear; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
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
        const firstDay = allDays[0]?.dateObj.getDay() || 0;
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

    const weeks = generateYearHeatmap(selectedYear);

    // 연도별 통계 계산
    const yearStats = useMemo(() => {
        if (!statistics?.monthlyHeatmap) {
            return { totalDays: 0, activeDays: 0, totalProblems: 0 };
        }

        const yearStart = new Date(selectedYear, 0, 1);
        const yearEnd = new Date(selectedYear, 11, 31);
        const today = new Date();
        const endDate = yearEnd > today ? today : yearEnd;

        let activeDays = 0;
        let totalProblems = 0;

        statistics.monthlyHeatmap.forEach((item) => {
            const normalizedDate = normalizeDate(item.date);
            if (normalizedDate) {
                const date = new Date(normalizedDate);
                if (date >= yearStart && date <= endDate) {
                    activeDays += 1;
                    totalProblems += item.count;
                }
            }
        });

        const totalDays = Math.ceil((endDate.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const completionRate = totalDays > 0 ? ((activeDays / totalDays) * 100).toFixed(1) : '0.0';

        return { totalDays, activeDays, totalProblems, completionRate };
    }, [statistics, selectedYear]);

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

    const handlePrevYear = () => {
        const currentIndex = availableYears.indexOf(selectedYear);
        if (currentIndex < availableYears.length - 1) {
            setSelectedYear(availableYears[currentIndex + 1]);
        }
    };

    const handleNextYear = () => {
        const currentIndex = availableYears.indexOf(selectedYear);
        if (currentIndex > 0) {
            setSelectedYear(availableYears[currentIndex - 1]);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 border border-gray-200 dark:border-gray-700 h-40 flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    활동 히트맵
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevYear}
                        disabled={availableYears.indexOf(selectedYear) >= availableYears.length - 1}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="이전 연도"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[60px] text-center">
                        {selectedYear}
                    </span>
                    <button
                        onClick={handleNextYear}
                        disabled={availableYears.indexOf(selectedYear) <= 0}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="다음 연도"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* 연도별 통계 */}
            <div className="flex items-center gap-3 mb-2 text-[9px] text-gray-600 dark:text-gray-400">
                <span>활동일: {yearStats.activeDays}일</span>
                <span>•</span>
                <span>풀이: {yearStats.totalProblems}개</span>
                <span>•</span>
                <span>완성도: {yearStats.completionRate}%</span>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Spinner />
                </div>
            ) : error || !statistics ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        활동 데이터를 불러올 수 없습니다.
                    </p>
                </div>
            ) : weeks.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">활동 데이터가 없습니다.</p>
                </div>
            ) : (
                <div className="flex-1 min-h-0 flex flex-col">
                    {/* 히트맵 */}
                    <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
                        <div className="inline-block h-full">
                            {/* 월 라벨 */}
                            <div className="flex mb-1 relative h-4" style={{ paddingLeft: '18px' }}>
                                {monthLabels.map((label, index) => {
                                    const left = label.weekIndex * 10;
                                    return (
                                        <div
                                            key={index}
                                            className="absolute text-[9px] text-gray-600 dark:text-gray-400 whitespace-nowrap"
                                            style={{ left: `${left}px` }}
                                        >
                                            {label.month}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* 히트맵 그리드 */}
                            <div className="flex gap-0.5 h-full">
                                {/* 요일 라벨 */}
                                <div className="flex flex-col gap-0.5 pt-4">
                                    {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, index) => (
                                        <div
                                            key={index}
                                            className="w-2 h-2 text-[8px] text-gray-500 dark:text-gray-400 text-right pr-0.5"
                                            style={{ lineHeight: '8px' }}
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* 히트맵 셀들 */}
                                <div className="flex flex-col gap-0.5">
                                    {weeks.map((week, weekIndex) => (
                                        <div key={`week-${weekIndex}`} className="flex gap-0.5">
                                            {week.map((day, dayIndex) => {
                                                if (day.date === '') {
                                                    return (
                                                        <div
                                                            key={`empty-${weekIndex}-${dayIndex}`}
                                                            className="w-2 h-2 rounded"
                                                        />
                                                    );
                                                }
                                                return (
                                                    <div
                                                        key={`day-${day.date}`}
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
                    <div className="flex items-center justify-end gap-1.5 text-[9px] text-gray-600 dark:text-gray-400 mt-1 flex-shrink-0">
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
