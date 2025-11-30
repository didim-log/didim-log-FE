export const Tier = {
    BRONZE: 'BRONZE',
    SILVER: 'SILVER',
    GOLD: 'GOLD',
    PLATINUM: 'PLATINUM',
    DIAMOND: 'DIAMOND',
    RUBY: 'RUBY',
} as const

export type Tier = (typeof Tier)[keyof typeof Tier]

export const TIER_LEVEL_RANGES: Record<Tier, { minLevel: number; maxLevel: number }> = {
    [Tier.BRONZE]: { minLevel: 1, maxLevel: 5 },
    [Tier.SILVER]: { minLevel: 6, maxLevel: 10 },
    [Tier.GOLD]: { minLevel: 11, maxLevel: 15 },
    [Tier.PLATINUM]: { minLevel: 16, maxLevel: 20 },
    [Tier.DIAMOND]: { minLevel: 21, maxLevel: 25 },
    [Tier.RUBY]: { minLevel: 26, maxLevel: 30 },
}

export function getTierFromLevel(level: number): Tier {
    if (level <= 0 || level > 30) {
        throw new Error(`레벨은 1~30 사이여야 합니다. level=${level}`)
    }

    for (const [tier, range] of Object.entries(TIER_LEVEL_RANGES)) {
        if (level >= range.minLevel && level <= range.maxLevel) {
            return tier as Tier
        }
    }

    throw new Error(`레벨에 해당하는 티어를 찾을 수 없습니다. level=${level}`)
}

export function getLevelRangeForLevel(currentLevel: number): { minLevel: number; maxLevel: number } {
    const tier = getTierFromLevel(currentLevel)
    return TIER_LEVEL_RANGES[tier]
}

export const TIER_COLORS: Record<Tier, { bg: string; text: string; border: string }> = {
    [Tier.BRONZE]: {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-300',
    },
    [Tier.SILVER]: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-300',
    },
    [Tier.GOLD]: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
    },
    [Tier.PLATINUM]: {
        bg: 'bg-cyan-100',
        text: 'text-cyan-800',
        border: 'border-cyan-300',
    },
    [Tier.DIAMOND]: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-300',
    },
    [Tier.RUBY]: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
    },
}

export const TIER_LABELS: Record<Tier, string> = {
    [Tier.BRONZE]: 'Bronze',
    [Tier.SILVER]: 'Silver',
    [Tier.GOLD]: 'Gold',
    [Tier.PLATINUM]: 'Platinum',
    [Tier.DIAMOND]: 'Diamond',
    [Tier.RUBY]: 'Ruby',
}

export const TIER_ORDER = [
    Tier.BRONZE,
    Tier.SILVER,
    Tier.GOLD,
    Tier.PLATINUM,
    Tier.DIAMOND,
    Tier.RUBY,
]

export function getNextTier(tier: Tier): Tier | null {
    const currentIndex = TIER_ORDER.indexOf(tier)
    if (currentIndex === -1 || currentIndex === TIER_ORDER.length - 1) {
        return null
    }
    return TIER_ORDER[currentIndex + 1]
}

export function getRecommendedTiers(currentTier: Tier): Tier[] {
    const currentIndex = TIER_ORDER.indexOf(currentTier)
    if (currentIndex === -1) {
        return [currentTier]
    }

    const recommendedTiers: Tier[] = [currentTier]

    if (currentIndex + 1 < TIER_ORDER.length) {
        recommendedTiers.push(TIER_ORDER[currentIndex + 1])
    }
    if (currentIndex + 2 < TIER_ORDER.length) {
        recommendedTiers.push(TIER_ORDER[currentIndex + 2])
    }

    return recommendedTiers
}

