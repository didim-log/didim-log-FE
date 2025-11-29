import { ExternalLink } from 'lucide-react'
import { Tier, TIER_COLORS, TIER_LABELS } from '../../types/tier'

interface Problem {
    id: string
    title: string
    tier: Tier
    category: string
    url: string
}

interface RecommendedProblemsProps {
    problems?: Problem[]
}

const mockProblems: Problem[] = [
    {
        id: '1000',
        title: 'A+B',
        tier: Tier.BRONZE,
        category: 'IMPLEMENTATION',
        url: 'https://www.acmicpc.net/problem/1000',
    },
    {
        id: '1001',
        title: 'A-B',
        tier: Tier.BRONZE,
        category: 'IMPLEMENTATION',
        url: 'https://www.acmicpc.net/problem/1001',
    },
    {
        id: '1002',
        title: '터렛',
        tier: Tier.SILVER,
        category: 'GEOMETRY',
        url: 'https://www.acmicpc.net/problem/1002',
    },
]

export default function RecommendedProblems({
    problems = mockProblems,
}: RecommendedProblemsProps) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                추천 문제
            </h2>
            <div className="space-y-4">
                {problems.map((problem) => {
                    const tierColors = TIER_COLORS[problem.tier]
                    const tierLabel = TIER_LABELS[problem.tier]

                    return (
                        <div
                            key={problem.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-semibold ${tierColors.bg} ${tierColors.text}`}
                                        >
                                            {tierLabel}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {problem.category}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-800 mb-1">
                                        {problem.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        문제 번호: {problem.id}
                                    </p>
                                </div>
                                <a
                                    href={problem.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

