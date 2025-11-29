import DashboardLayout from '../components/layout/DashboardLayout'
import TierBadge from '../components/dashboard/TierBadge'
import ActivityGraph from '../components/dashboard/ActivityGraph'
import RecommendedProblems from '../components/dashboard/RecommendedProblems'
import { Tier, getNextTier, TIER_LABELS } from '../types/tier'

export default function DashboardPage() {
    const currentTier = Tier.GOLD
    const currentLevel = 13
    const nextTier = getNextTier(currentTier)

    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            내 정보
                        </h2>
                        <div className="flex items-center gap-4">
                            <TierBadge tier={currentTier} level={currentLevel} />
                            <div>
                                <p className="text-sm text-gray-600">
                                    현재 티어
                                </p>
                                {nextTier ? (
                                    <p className="text-lg font-medium text-gray-800">
                                        다음 목표: {TIER_LABELS[nextTier]}
                                    </p>
                                ) : (
                                    <p className="text-lg font-medium text-gray-800">
                                        최고 티어 달성!
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <ActivityGraph />
                </div>

                <div className="lg:col-span-1">
                    <RecommendedProblems />
                </div>
            </div>
        </DashboardLayout>
    )
}

