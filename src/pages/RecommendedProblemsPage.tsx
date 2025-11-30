import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import ProblemCard from '../components/problem/ProblemCard'
import ProblemFilter from '../components/problem/ProblemFilter'
import Button from '../components/common/Button'
import { Tier } from '../types/tier'

interface Problem {
    id: string
    title: string
    tier: Tier
    category: string
}

const mockProblems: Problem[] = [
    { id: '1000', title: 'A+B', tier: Tier.BRONZE, category: 'Implementation' },
    { id: '1001', title: 'A-B', tier: Tier.BRONZE, category: 'Implementation' },
    { id: '1002', title: '터렛', tier: Tier.SILVER, category: 'Math' },
    { id: '1003', title: '피보나치 함수', tier: Tier.BRONZE, category: 'DP' },
    { id: '1004', title: '신나는 함수 실행', tier: Tier.SILVER, category: 'DP' },
    { id: '1005', title: 'ACM Craft', tier: Tier.GOLD, category: 'Graph' },
    { id: '1006', title: '치킨 배달', tier: Tier.GOLD, category: 'BFS' },
    { id: '1007', title: '벽 부수고 이동하기', tier: Tier.PLATINUM, category: 'BFS' },
    { id: '1008', title: 'A/B', tier: Tier.BRONZE, category: 'Math' },
    { id: '1009', title: '분산처리', tier: Tier.SILVER, category: 'Math' },
    { id: '1010', title: '다리 놓기', tier: Tier.SILVER, category: 'Math' },
    { id: '1011', title: 'Fly me to the Alpha Centauri', tier: Tier.GOLD, category: 'Math' },
]

export default function RecommendedProblemsPage() {
    const navigate = useNavigate()
    const [selectedTier, setSelectedTier] = useState<Tier | '전체'>('전체')
    const [selectedCategory, setSelectedCategory] = useState('전체')

    const filteredProblems = useMemo(() => {
        return mockProblems.filter((problem) => {
            const tierMatch =
                selectedTier === '전체' || problem.tier === selectedTier
            const categoryMatch =
                selectedCategory === '전체' ||
                problem.category === selectedCategory
            return tierMatch && categoryMatch
        })
    }, [selectedTier, selectedCategory])

    const handleRefresh = () => {
        toast.success('새로운 추천 문제를 가져왔습니다')
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
                        오늘의 추천 문제
                    </h1>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleRefresh}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        새로고침
                    </Button>
                </div>

                <ProblemFilter
                    selectedTier={selectedTier}
                    selectedCategory={selectedCategory}
                    onTierChange={setSelectedTier}
                    onCategoryChange={setSelectedCategory}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProblems.length > 0 ? (
                        filteredProblems.map((problem) => (
                            <ProblemCard
                                key={problem.id}
                                id={problem.id}
                                title={problem.title}
                                tier={problem.tier}
                                category={problem.category}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 text-lg">
                                선택한 조건에 맞는 문제가 없습니다.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}

