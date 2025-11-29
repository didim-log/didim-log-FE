export enum Tier {
    BRONZE = 'BRONZE',
    SILVER = 'SILVER',
    GOLD = 'GOLD',
    PLATINUM = 'PLATINUM',
    DIAMOND = 'DIAMOND',
    RUBY = 'RUBY',
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

export function getNextTier(tier: Tier): Tier | null {
    const tierOrder = [
        Tier.BRONZE,
        Tier.SILVER,
        Tier.GOLD,
        Tier.PLATINUM,
        Tier.DIAMOND,
        Tier.RUBY,
    ]
    const currentIndex = tierOrder.indexOf(tier)
    if (currentIndex === -1 || currentIndex === tierOrder.length - 1) {
        return null
    }
    return tierOrder[currentIndex + 1]
}

