/**
 * 활동 히트맵 컴포넌트 (GitHub 스타일 전체 연도 그리드)
 * 항상 1월 1일부터 12월 31일까지 전체 연도를 표시하며, 빈 셀은 회색으로 표시
 */

import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { useHeatmapByYear } from '../../../hooks/api/useHeatmap';
import { Spinner } from '../../../components/ui/Spinner';
import { ChevronLeft, ChevronRight, Calendar, HelpCircle } from 'lucide-react';

interface ActivityHeatmapProps {
    // Props 없음 - API에서 데이터 가져옴
}

interface HeatmapCell {
    date: string;
    count: number;
    dateObj: Date;
}

export const ActivityHeatmap: FC<ActivityHeatmapProps> = () => {
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
    
    // 연도별 히트맵 데이터 조회
    const { data: heatmapData, isLoading, error } = useHeatmapByYear(selectedYear);

    // 사용 가능한 연도 목록 (가입 연도부터 현재 연도까지)
    const currentYear = new Date().getFullYear();
    const availableYears = useMemo(() => {
        // 가입일 정보가 없으므로 최근 5년만 표시합니다.
        // (추후 user.createdAt 제공 시: startYear를 가입 연도로 계산하도록 변경)
        const startYear = currentYear - 5;
        const years: number[] = [];
        for (let i = currentYear; i >= startYear; i--) {
            years.push(i);
        }
        return years;
    }, [currentYear]);

    const getIntensityColor = (count: number) => {
        // GitHub 스타일: 빈 셀은 항상 회색으로 표시
        if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
        if (count === 1) return 'bg-green-200 dark:bg-green-900/50';
        if (count <= 3) return 'bg-green-400 dark:bg-green-700';
        if (count <= 5) return 'bg-green-600 dark:bg-green-600';
        return 'bg-green-800 dark:bg-green-500';
    };

    /**
     * 연도 전체 날짜 데이터를 생성하는 유틸리티 함수
     * 타임존 오류를 방지하기 위해 로컬 날짜 문자열(YYYY-MM-DD)만 사용
     * 
     * @param year 연도
     * @returns { date: string, count: number }[] 형태의 배열 (365 또는 366일)
     */
    const generateYearData = (year: number): Array<{ date: string; count: number }> => {
        const yearData: Array<{ date: string; count: number }> = [];
        
        // 1월 1일부터 시작
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);
        
        // 로컬 날짜 문자열만 사용하여 타임존 오류 방지
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const yearStr = String(currentDate.getFullYear()).padStart(4, '0');
            const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
            const dayStr = String(currentDate.getDate()).padStart(2, '0');
            const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
            
            yearData.push({
                date: dateStr,
                count: 0, // 초기값은 0
            });
            
            // 다음 날로 이동
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return yearData;
    };

    /**
     * API 데이터를 날짜별로 매핑하는 유틸리티
     * 
     * @param apiData API에서 받은 히트맵 데이터
     * @returns Map<date: string, count: number>
     */
    const createDataMap = (apiData: Array<{ date: string; count: number }>): Map<string, number> => {
        const dataMap = new Map<string, number>();
        
        apiData.forEach((item) => {
            // 날짜 정규화: ISO 형식이면 날짜 부분만 추출
            let normalizedDate = item.date;
            if (normalizedDate.includes('T')) {
                normalizedDate = normalizedDate.split('T')[0];
            }
            if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
                // 유효하지 않은 형식은 건너뛰기
                return;
            }
            
            // 기존 count가 있으면 합산
            const existingCount = dataMap.get(normalizedDate) || 0;
            dataMap.set(normalizedDate, existingCount + item.count);
        });
        
        return dataMap;
    };

    /**
     * 전체 연도 데이터와 API 데이터를 병합
     * 
     * @param yearData 전체 연도 데이터 (365 또는 366일, 모두 count: 0)
     * @param apiDataMap API 데이터 맵
     * @returns 병합된 데이터 배열
     */
    const mergeYearData = (
        yearData: Array<{ date: string; count: number }>,
        apiDataMap: Map<string, number>
    ): Array<{ date: string; count: number }> => {
        return yearData.map((day) => {
            const apiCount = apiDataMap.get(day.date);
            return {
                date: day.date,
                count: apiCount !== undefined ? apiCount : 0, // API 데이터가 있으면 사용, 없으면 0
            };
        });
    };

    // 선택된 연도의 히트맵 데이터 생성 (GitHub 스타일: 항상 전체 연도 표시)
    const generateYearHeatmap = (year: number): HeatmapCell[][] => {
        const currentYearValue = new Date().getFullYear();
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        // 1. 전체 연도 데이터 생성 (365 또는 366일, 모두 count: 0)
        const fullYearData = generateYearData(year);
        
        // 2. 현재 연도인 경우 오늘 이후 날짜 필터링
        const filteredYearData = year === currentYearValue
            ? fullYearData.filter((day) => day.date <= todayStr)
            : fullYearData;
        
        // 3. API 데이터를 Map으로 변환
        const apiDataMap = heatmapData && heatmapData.length > 0
            ? createDataMap(heatmapData)
            : new Map<string, number>();
        
        // 4. 전체 연도 데이터와 API 데이터 병합
        const mergedData = mergeYearData(filteredYearData, apiDataMap);
        
        // 5. HeatmapCell 형식으로 변환 (dateObj 추가)
        const allDays: HeatmapCell[] = mergedData.map((day) => {
            // 날짜 문자열을 Date 객체로 변환 (로컬 시간대)
            const [yearStr, monthStr, dayStr] = day.date.split('-');
            const dateObj = new Date(
                parseInt(yearStr, 10),
                parseInt(monthStr, 10) - 1,
                parseInt(dayStr, 10)
            );
            
            return {
                date: day.date,
                count: day.count,
                dateObj,
            };
        });

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

    // 연도별 통계 계산 (GitHub 스타일: 항상 전체 연도 기준)
    const yearStats = useMemo(() => {
        const currentYearValue = new Date().getFullYear();
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        // 전체 연도 데이터 생성
        const fullYearData = generateYearData(selectedYear);
        
        // 현재 연도인 경우 오늘 이후 날짜 필터링
        const filteredYearData = selectedYear === currentYearValue
            ? fullYearData.filter((day) => day.date <= todayStr)
            : fullYearData;
        
        const totalDays = filteredYearData.length;
        
        // API 데이터에서 통계 계산
        let activeDays = 0;
        let totalProblems = 0;
        
        if (heatmapData && heatmapData.length > 0) {
            const apiDataMap = createDataMap(heatmapData);
            
            filteredYearData.forEach((day) => {
                const apiCount = apiDataMap.get(day.date);
                if (apiCount !== undefined && apiCount > 0) {
                    activeDays += 1;
                    totalProblems += apiCount;
                }
            });
        }
        
        const completionRate = totalDays > 0 ? ((activeDays / totalDays) * 100).toFixed(1) : '0.0';

        return { totalDays, activeDays, totalProblems, completionRate };
    }, [heatmapData, selectedYear]);

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

    // 연도가 변경되면 자동으로 데이터 재조회 (useHeatmapByYear가 자동 처리)

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
                <div className="flex items-center gap-1 group relative">
                    <span>완성도: {yearStats.completionRate}%</span>
                    <HelpCircle className="w-3 h-3 text-gray-400 dark:text-gray-500 cursor-help" />
                    {/* 툴팁 */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-[8px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        <div className="text-center">
                            <div className="font-semibold mb-0.5">완성도란?</div>
                            <div className="text-gray-300">
                                해당 연도 중<br />
                                회고를 작성한 날짜의 비율
                            </div>
                        </div>
                        {/* 툴팁 화살표 */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                            <div className="w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Spinner />
                </div>
            ) : error || !heatmapData ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        활동 데이터를 불러올 수 없습니다.
                    </p>
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
                                                            const tooltipText = day.count === 0
                                                                ? `${formatDate(day.date)}: 활동 없음`
                                                                : `${formatDate(day.date)}: ${day.count}개 해결`;
                                                            setTooltip({
                                                                x: rect.left + rect.width / 2,
                                                                y: rect.top - 10,
                                                                text: tooltipText,
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
