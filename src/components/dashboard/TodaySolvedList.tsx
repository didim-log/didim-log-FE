import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import Card from '../common/Card'
import type { TodaySolvedProblemResponse } from '../../types/api/dtos'
import { useNavigate } from 'react-router-dom'
import { formatTimeToKorea } from '../../utils/dateUtils'

interface TodaySolvedListProps {
    problems: TodaySolvedProblemResponse[]
    count: number
}

const RESULT_CONFIG = {
    SUCCESS: {
        icon: CheckCircle2,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        label: '성공',
    },
    FAIL: {
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        label: '실패',
    },
    TIME_OVER: {
        icon: Clock,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        label: '시간 초과',
    },
} as const

export default function TodaySolvedList({
    problems,
    count,
}: TodaySolvedListProps) {
    const navigate = useNavigate()

    const handleProblemClick = (problemId: string) => {
        navigate(`/problems/${problemId}`)
    }

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    오늘 푼 문제
                </h2>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {count}개
                </span>
            </div>

            {problems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>오늘 아직 풀지 않은 문제가 없습니다.</p>
                    <p className="text-sm mt-2">문제를 풀어보세요!</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {problems.map((problem, index) => {
                        const config =
                            RESULT_CONFIG[
                                problem.result as keyof typeof RESULT_CONFIG
                            ] || RESULT_CONFIG.SUCCESS
                        const Icon = config.icon

                        return (
                            <div
                                key={`${problem.problemId}-${index}`}
                                onClick={() => handleProblemClick(problem.problemId)}
                                className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer ${config.bgColor}`}
                            >
                                <Icon
                                    className={`w-5 h-5 flex-shrink-0 ${config.color}`}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                        문제 {problem.problemId}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatTimeToKorea(problem.solvedAt)}
                                    </p>
                                </div>
                                <span
                                    className={`text-xs font-semibold px-2 py-1 rounded ${config.color} ${config.bgColor}`}
                                >
                                    {config.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}
        </Card>
    )
}











