import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../components/layout/DashboardLayout'
import ProblemTypeChart from '../components/statistics/ProblemTypeChart'
import MonthlyActivityChart from '../components/statistics/MonthlyActivityChart'
import Card from '../components/common/Card'
import { Loading } from '../components/common/Loading'
import { getStatistics } from '../apis/statisticsApi'
import { isAuthenticated } from '../utils/auth'

export default function StatisticsPage() {
    // 통계 데이터 조회
    const {
        data: statisticsData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['statistics'],
        queryFn: () => getStatistics(),
        enabled: isAuthenticated(),
        retry: 1,
    })

    // 분석 요약 데이터 계산
    const summaryData = useMemo(() => {
        if (!statisticsData) {
            return {
                totalSolved: 0,
                maxCategory: null as string | null,
                maxCategoryCount: 0,
                maxCategoryPercent: '0.0',
                growthRate: 0,
            }
        }

        const categoryDistribution = statisticsData.categoryDistribution
        const categoryEntries = Object.entries(categoryDistribution)
        const totalSolved = statisticsData.totalSolvedCount

        const maxCategory =
            categoryEntries.length > 0
                ? categoryEntries.reduce((max, [name, count]) =>
                      count > max[1] ? [name, count] : max
                  )
                : null

        const maxCategoryPercent = maxCategory
            ? ((maxCategory[1] / totalSolved) * 100).toFixed(1)
            : '0.0'

        // 월별 데이터에서 최근 2개월 비교
        const monthlyData = statisticsData.monthlyHeatmap
        const monthlyMap = new Map<string, number>()

        monthlyData.forEach((item) => {
            const date = new Date(item.date)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + item.count)
        })

        const sortedMonths = Array.from(monthlyMap.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-2)

        const currentMonth = sortedMonths[sortedMonths.length - 1]
        const previousMonth = sortedMonths[sortedMonths.length - 2]
        const growthRate =
            previousMonth && previousMonth[1] > 0
                ? (((currentMonth?.[1] || 0) - previousMonth[1]) / previousMonth[1]) * 100
                : 0

        return {
            totalSolved,
            maxCategory: maxCategory ? maxCategory[0] : null,
            maxCategoryCount: maxCategory ? maxCategory[1] : 0,
            maxCategoryPercent,
            growthRate: Number(growthRate.toFixed(1)),
        }
    }, [statisticsData])

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loading />
                </div>
            </DashboardLayout>
        )
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="text-center py-8">
                            <p className="text-red-600 dark:text-red-400">
                                통계 데이터를 불러오는데 실패했습니다.
                            </p>
                        </div>
                    </Card>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
                        나의 학습 분석
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        문제 풀이 패턴과 성장 추이를 한눈에 확인하세요
                    </p>
                </div>

                {/* 차트 섹션 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ProblemTypeChart categoryData={statisticsData?.categoryDistribution} />
                    <MonthlyActivityChart monthlyData={statisticsData?.monthlyHeatmap} />
                </div>

                {/* 분석 요약 섹션 */}
                <Card>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                        분석 요약
                    </h2>
                    <div className="space-y-3">
                        {summaryData.maxCategory && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <span className="font-semibold">가장 많이 푼 유형:</span>{' '}
                                    <span className="text-blue-600 dark:text-blue-400">
                                        {summaryData.maxCategory}
                                    </span>{' '}
                                    ({summaryData.maxCategoryCount}문제, {summaryData.maxCategoryPercent}%)
                                </p>
                            </div>
                        )}
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">지난달 대비:</span>{' '}
                                <span
                                    className={
                                        summaryData.growthRate >= 0
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                    }
                                >
                                    {summaryData.growthRate >= 0 ? '+' : ''}
                                    {summaryData.growthRate}%
                                </span>
                                {summaryData.growthRate >= 0 ? ' 증가' : ' 감소'}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">총 풀이 수:</span>{' '}
                                {summaryData.totalSolved}문제
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    )
}

