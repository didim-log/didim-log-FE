import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { PieLabelRenderProps } from 'recharts'
import Card from '../common/Card'

interface ProblemTypeChartProps {
    categoryData?: Record<string, number>
}

// 카테고리별 색상 매핑
const CATEGORY_COLORS: Record<string, string> = {
    수학: '#3B82F6',
    구현: '#10B981',
    DP: '#F59E0B',
    그래프: '#EF4444',
    탐색: '#8B5CF6',
    문자열: '#EC4899',
    기타: '#6B7280',
}

// 기본 색상 팔레트
const DEFAULT_COLORS = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#6B7280', // gray
    '#14B8A6', // teal
    '#F97316', // orange
    '#6366F1', // indigo
]

const RADIAN = Math.PI / 180

interface CustomLabelProps {
    cx: number
    cy: number
    midAngle: number
    innerRadius: number
    outerRadius: number
    percent: number
}

const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
}: CustomLabelProps) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    // 5% 이상인 경우에만 라벨 표시
    if (percent < 0.05) {
        return null
    }

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            className="text-xs font-semibold"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    )
}

const renderCustomLabelSafely = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props
    if (
        typeof cx !== 'number' ||
        typeof cy !== 'number' ||
        typeof midAngle !== 'number' ||
        typeof innerRadius !== 'number' ||
        typeof outerRadius !== 'number' ||
        typeof percent !== 'number'
    ) {
        return null
    }
    return renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent })
}

export default function ProblemTypeChart({ categoryData = {} }: ProblemTypeChartProps) {
    // 카테고리 데이터를 차트 형식으로 변환
    const chartData = Object.entries(categoryData)
        .map(([name, value], index) => ({
            name,
            value,
            color: CATEGORY_COLORS[name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
        }))
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value)

    const total = chartData.reduce((sum, item) => sum + item.value, 0)
    const maxCategory = chartData.length > 0 ? chartData[0] : null

    if (chartData.length === 0) {
        return (
            <Card>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    유형별 풀이 분포
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
                유형별 풀이 분포
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabelSafely}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0]
                                const percent = ((data.value as number) / total) * 100
                                return (
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                                            {data.name}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {data.value}문제 ({percent.toFixed(1)}%)
                                        </p>
                                    </div>
                                )
                            }
                            return null
                        }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => (
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {value}
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
            {maxCategory && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">가장 많이 푼 유형:</span>{' '}
                        <span className="text-blue-600 dark:text-blue-400">{maxCategory.name}</span> (
                        {maxCategory.value}문제, {((maxCategory.value / total) * 100).toFixed(1)}%)
                    </p>
                </div>
            )}
        </Card>
    )
}

