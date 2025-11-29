import { Trophy } from 'lucide-react'
import { Tier, TIER_COLORS, TIER_LABELS } from '../../types/tier'

interface TierBadgeProps {
    tier: Tier
    level?: number
}

export default function TierBadge({ tier, level }: TierBadgeProps) {
    const colors = TIER_COLORS[tier]
    const label = TIER_LABELS[tier]
    const displayLevel = level ? ` ${level}` : ''

    return (
        <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${colors.bg} ${colors.text} ${colors.border}`}
        >
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">
                {label}
                {displayLevel}
            </span>
        </div>
    )
}

