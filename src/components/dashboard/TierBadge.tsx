import { Tier, TIER_LABELS } from '../../types/tier'

interface TierBadgeProps {
    tier: Tier
    level?: number
}

// 레벨을 로마 숫자로 변환 (V, IV, III, II, I)
function getRomanNumeral(level: number): string {
    const tierLevel = ((level - 1) % 5) + 1
    const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V']
    return romanNumerals[6 - tierLevel] || 'V'
}

export default function TierBadge({ tier, level }: TierBadgeProps) {
    const label = TIER_LABELS[tier]
    const romanNumeral = level ? getRomanNumeral(level) : ''
    
    // solved.ac 티어 배지 이미지 URL 사용
    // level이 없으면 티어의 대표 레벨 사용
    const tierLevel = level || (tier === Tier.BRONZE ? 3 : tier === Tier.SILVER ? 8 : tier === Tier.GOLD ? 13 : tier === Tier.PLATINUM ? 18 : tier === Tier.DIAMOND ? 23 : 28)
    const badgeUrl = `/tier-${tierLevel}.svg`

    return (
        <div className="inline-flex items-center gap-2">
            {/* solved.ac 공식 티어 배지 이미지 */}
            <img
                src={badgeUrl}
                alt={`${label} ${romanNumeral}`}
                className="w-6 h-7 flex-shrink-0"
                onError={(e) => {
                    // 이미지 로드 실패 시 solved.ac 공식 URL 사용
                    const target = e.target as HTMLImageElement
                    target.src = `https://static.solved.ac/tier_small/${tierLevel}.svg`
                }}
            />
            <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                {label} {romanNumeral}
            </span>
        </div>
    )
}
