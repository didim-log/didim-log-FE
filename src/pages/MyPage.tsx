import { useNavigate } from 'react-router-dom'
import { Calendar, ExternalLink } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import TierBadge from '../components/dashboard/TierBadge'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { Tier, TIER_LABELS } from '../types/tier'

interface Retrospective {
    id: string
    problemId: string
    problemTitle: string
    content: string
    createdAt: string
    summary: string
}

const mockUser = {
    nickname: '알고리즘 마스터',
    tier: Tier.GOLD,
    level: 13,
    totalSolved: 42,
}

const mockRetrospectives: Retrospective[] = [
    {
        id: '1',
        problemId: '1000',
        problemTitle: 'A+B',
        content: '# A+B 회고\n\n## 💡 접근 방법\n\n두 정수를 더하는 간단한 문제였습니다.',
        createdAt: '2024-11-25T10:30:00',
        summary: '두 정수를 더하는 간단한 문제였습니다. 기본 입출력을 연습할 수 있었습니다.',
    },
    {
        id: '2',
        problemId: '1001',
        problemTitle: 'A-B',
        content: '# A-B 회고\n\n## 💡 접근 방법\n\n뺄셈 연산을 구현했습니다.',
        createdAt: '2024-11-24T14:20:00',
        summary: '뺄셈 연산을 구현했습니다. A+B와 유사한 패턴이었습니다.',
    },
    {
        id: '3',
        problemId: '1002',
        problemTitle: '터렛',
        content: '# 터렛 회고\n\n## 💡 접근 방법\n\n두 원의 교점을 구하는 기하학 문제였습니다.',
        createdAt: '2024-11-23T09:15:00',
        summary: '두 원의 교점을 구하는 기하학 문제였습니다. 수학적 접근이 필요했습니다.',
    },
    {
        id: '4',
        problemId: '1003',
        problemTitle: '피보나치 함수',
        content: '# 피보나치 함수 회고\n\n## 💡 접근 방법\n\n동적 프로그래밍을 활용했습니다.',
        createdAt: '2024-11-22T16:45:00',
        summary: '동적 프로그래밍을 활용했습니다. 메모이제이션으로 시간 복잡도를 줄였습니다.',
    },
]

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
}

export default function MyPage() {
    const navigate = useNavigate()

    const handleRetrospectiveClick = (retrospective: Retrospective) => {
        navigate(`/retrospectives/new/${retrospective.problemId}`)
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-3">
                        <Card>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                                내 정보
                            </h1>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <TierBadge tier={mockUser.tier} level={mockUser.level} />
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                        {mockUser.nickname}
                                    </h2>
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            현재 티어: <span className="font-medium text-gray-800 dark:text-gray-200">{TIER_LABELS[mockUser.tier]}</span>
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            총 푼 문제: <span className="font-medium text-gray-800 dark:text-gray-200">{mockUser.totalSolved}개</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                        내 회고 목록
                    </h2>
                    {mockRetrospectives.length === 0 ? (
                        <Card>
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                작성한 회고가 없습니다.
                            </p>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {mockRetrospectives.map((retrospective) => (
                                <Card
                                    key={retrospective.id}
                                    hoverable
                                    className="cursor-pointer"
                                    onClick={() => handleRetrospectiveClick(retrospective)}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                    {retrospective.problemTitle}
                                                </h3>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                    문제 #{retrospective.problemId}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                {retrospective.summary}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatDate(retrospective.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleRetrospectiveClick(retrospective)
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                보기
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}

