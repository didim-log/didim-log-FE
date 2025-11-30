import { Tier, TIER_LABELS } from '../../types/tier'

const CATEGORIES = [
    '전체',
    'BFS',
    'DFS',
    'DP',
    'Greedy',
    'Implementation',
    'Graph',
    'String',
    'Math',
    'Sorting',
]

interface ProblemFilterProps {
    selectedTier: Tier | '전체'
    selectedCategory: string
    onTierChange: (tier: Tier | '전체') => void
    onCategoryChange: (category: string) => void
}

export default function ProblemFilter({
    selectedTier,
    selectedCategory,
    onTierChange,
    onCategoryChange,
}: ProblemFilterProps) {
    const tierOptions: (Tier | '전체')[] = [
        '전체',
        Tier.BRONZE,
        Tier.SILVER,
        Tier.GOLD,
        Tier.PLATINUM,
        Tier.DIAMOND,
        Tier.RUBY,
    ]

    return (
        <div className="bg-white rounded-lg shadow-md p-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
                <label
                    htmlFor="tier-filter"
                    className="text-sm font-medium text-gray-700 whitespace-nowrap"
                >
                    난이도:
                </label>
                <select
                    id="tier-filter"
                    value={selectedTier}
                    onChange={(e) =>
                        onTierChange(e.target.value as Tier | '전체')
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                    {tierOptions.map((tier) => (
                        <option key={tier} value={tier}>
                            {tier === '전체' ? '전체' : TIER_LABELS[tier]}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-2">
                <label
                    htmlFor="category-filter"
                    className="text-sm font-medium text-gray-700 whitespace-nowrap"
                >
                    알고리즘:
                </label>
                <select
                    id="category-filter"
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                    {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}

