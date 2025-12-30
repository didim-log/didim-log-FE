import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Card from '../common/Card'
import type { HeatmapDataResponse } from '../../types/api/dtos'

interface MonthlyActivityChartProps {
    monthlyData?: HeatmapDataResponse[]
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    {payload[0].payload.month}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                    {payload[0].value}문제 해결
                </p>
            </div>
        )
    }
    return null
}

export default function MonthlyActivityChart({ monthlyData = [] }: MonthlyActivityChartProps) {
    // Heatmap 데이터를 월별로 집계
    const monthlyMap = new Map<string, number>()
    
    monthlyData.forEach((item) => {
        const date = new Date(item.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + item.count)
    })

    // 최근 6개월 데이터 추출 및 정렬
    const sortedMonths = Array.from(monthlyMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-6)
        .map(([monthKey, count]) => {
            const [, month] = monthKey.split('-')
            const monthNum = parseInt(month, 10)
            return {
                month: `${monthNum}월`,
                count,
                sortKey: monthKey,
            }
        })

    const currentMonth = sortedMonths[sortedMonths.length - 1]
    const previousMonth = sortedMonths[sortedMonths.length - 2]
    const growthRate =
        previousMonth && previousMonth.count > 0
            ? (((currentMonth?.count || 0) - previousMonth.count) / previousMonth.count) * 100
            : 0

    if (sortedMonths.length === 0) {
        return (
            <Card>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    월간 풀이 추이
                </h3>
                <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                    <p>데이터가 없습니다.</p>
                </div>
            </Card>
        )
    }

    return (
        <Card>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                월간 풀이 추이
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sortedMonths} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis
                        dataKey="month"
                        className="text-xs text-gray-600 dark:text-gray-400"
                        tick={{ fill: 'currentColor' }}
                    />
                    <YAxis
                        className="text-xs text-gray-600 dark:text-gray-400"
                        tick={{ fill: 'currentColor' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey="count"
                        fill="#3B82F6"
                        radius={[8, 8, 0, 0]}
                        className="hover:opacity-80 transition-opacity"
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                    />
                </BarChart>
            </ResponsiveContainer>
            {previousMonth && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">지난달 대비:</span>{' '}
                        <span
                            className={
                                growthRate >= 0
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                            }
                        >
                            {growthRate >= 0 ? '+' : ''}
                            {growthRate.toFixed(0)}%
                        </span>
                        {growthRate >= 0 ? ' 증가' : ' 감소'}
                    </p>
                </div>
            )}
        </Card>
    )
}

