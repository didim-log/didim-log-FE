import { useNavigate } from 'react-router-dom'
import { ExternalLink, ChevronRight } from 'lucide-react'
import { Tier, TIER_COLORS, TIER_LABELS, getLevelRangeForLevel } from '../../types/tier'
import { Button } from '../ui/Button'
import Card from '../common/Card'

interface Problem {
    id: string
    title: string
    tier: Tier
    level: number
    category: string
    url: string
}

interface RecommendedProblemsProps {
    problems?: Problem[]
    currentLevel?: number
}

const allMockProblems: Problem[] = [
    {
        id: '1000',
        title: 'A+B',
        tier: Tier.BRONZE,
        level: 1,
        category: 'IMPLEMENTATION',
        url: 'https://www.acmicpc.net/problem/1000',
    },
    {
        id: '1001',
        title: 'A-B',
        tier: Tier.BRONZE,
        level: 2,
        category: 'IMPLEMENTATION',
        url: 'https://www.acmicpc.net/problem/1001',
    },
    {
        id: '1002',
        title: '터렛',
        tier: Tier.SILVER,
        level: 6,
        category: 'GEOMETRY',
        url: 'https://www.acmicpc.net/problem/1002',
    },
    {
        id: '1005',
        title: 'ACM Craft',
        tier: Tier.GOLD,
        level: 13,
        category: 'Graph',
        url: 'https://www.acmicpc.net/problem/1005',
    },
    {
        id: '1006',
        title: '치킨 배달',
        tier: Tier.GOLD,
        level: 14,
        category: 'BFS',
        url: 'https://www.acmicpc.net/problem/1006',
    },
    {
        id: '1007',
        title: '벽 부수고 이동하기',
        tier: Tier.GOLD,
        level: 15,
        category: 'BFS',
        url: 'https://www.acmicpc.net/problem/1007',
    },
    {
        id: '1008',
        title: 'A/B',
        tier: Tier.BRONZE,
        level: 3,
        category: 'IMPLEMENTATION',
        url: 'https://www.acmicpc.net/problem/1008',
    },
    {
        id: '1009',
        title: '분산처리',
        tier: Tier.SILVER,
        level: 7,
        category: 'MATH',
        url: 'https://www.acmicpc.net/problem/1009',
    },
    {
        id: '1010',
        title: '다리 놓기',
        tier: Tier.SILVER,
        level: 8,
        category: 'MATH',
        url: 'https://www.acmicpc.net/problem/1010',
    },
]

function getRecommendedProblemsForLevel(currentLevel: number): Problem[] {
    const levelRange = getLevelRangeForLevel(currentLevel)

    return allMockProblems
        .filter(
            (problem) =>
                problem.level >= levelRange.minLevel &&
                problem.level <= levelRange.maxLevel
        )
        .slice(0, 6) // 6개로 증가하여 Grid 레이아웃에서 더 많이 표시
}

export default function RecommendedProblems({
    problems,
    currentLevel = 13,
}: RecommendedProblemsProps) {
    const navigate = useNavigate()

    const recommendedProblems =
        problems || getRecommendedProblemsForLevel(currentLevel)

    const handleSolve = (problemId: string) => {
        navigate(`/problems/${problemId}`)
    }

    const handleViewAll = () => {
        navigate('/problems')
    }

    return (
        <Card className="tour-recommendations">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    추천 문제
                </h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewAll}
                    className="flex items-center gap-1"
                >
                    더보기
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedProblems.map((problem) => {
                    const tierColors = TIER_COLORS[problem.tier]
                    const tierLabel = TIER_LABELS[problem.tier]

                    return (
                        <div
                            key={problem.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-semibold ${tierColors.bg} ${tierColors.text}`}
                                        >
                                            {tierLabel}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {problem.category}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">
                                        {problem.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        문제 번호: {problem.id}
                                    </p>
                                </div>
                                <a
                                    href={problem.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-4 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition"
                                    title="백준 문제 페이지 열기"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            </div>
                            <Button
                                variant="primary"
                                size="sm"
                                fullWidth
                                onClick={() => handleSolve(problem.id)}
                            >
                                풀러 가기
                            </Button>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}

