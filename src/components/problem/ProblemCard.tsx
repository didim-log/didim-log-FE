import { useNavigate } from 'react-router-dom'
import { Tier, TIER_COLORS, TIER_LABELS } from '../../types/tier'
import { Button } from '../ui/Button'

interface ProblemCardProps {
    id: string
    title: string
    tier: Tier
    category: string
}

export default function ProblemCard({
    id,
    title,
    tier,
    category,
}: ProblemCardProps) {
    const navigate = useNavigate()
    const tierColors = TIER_COLORS[tier]
    const tierLabel = TIER_LABELS[tier]

    const handleSolve = () => {
        navigate(`/problems/${id}`)
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${tierColors.bg} ${tierColors.text}`}
                        >
                            {tierLabel}
                        </span>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {category}
                        </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-1">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500">문제 번호: {id}</p>
                </div>
            </div>
            <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={handleSolve}
            >
                풀러 가기
            </Button>
        </div>
    )
}
