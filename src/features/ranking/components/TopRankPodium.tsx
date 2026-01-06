/**
 * Top 3 랭킹 시상대 컴포넌트
 */

import type { FC } from 'react';
import { Crown } from 'lucide-react';
import { TierBadge } from '../../dashboard/components/TierBadge';
import { formatTierFromDifficulty, resolveSolvedAcTierLevel } from '../../../utils/tier';
import type { LeaderboardResponse } from '../../../types/api/ranking.types';

interface TopRankPodiumProps {
    ranks: LeaderboardResponse[];
}

type RankCardPosition = 'left' | 'center' | 'right';

interface RankCardProps {
    rank: number;
    user: LeaderboardResponse | undefined;
    position: RankCardPosition;
}

const RankCard: FC<RankCardProps> = ({ rank, user, position }) => {
    // 빈 자리 표시
    if (!user) {
        return (
            <div
                className={`flex-1 flex flex-col items-center ${
                    position === 'center' ? 'h-80' : position === 'left' ? 'h-64' : 'h-56'
                } justify-end`}
            >
                <div className="w-full bg-gray-100 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 flex flex-col items-center justify-center opacity-50">
                    <div className="text-4xl mb-3 text-gray-400 dark:text-gray-600">
                        {rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉'}
                    </div>
                    <div className="text-sm font-semibold text-gray-400 dark:text-gray-500">{rank}등</div>
                    <div className="text-xs text-gray-400 dark:text-gray-600 mt-2">아직 없음</div>
                </div>
            </div>
        );
    }

    const heightClasses: Record<RankCardPosition, string> = {
        left: 'h-64', // 2등
        center: 'h-80', // 1등 (가장 높음)
        right: 'h-56', // 3등
    };

    const borderClasses: Record<RankCardPosition, string> = {
        left: 'border-gray-300 dark:border-gray-600',
        center: 'border-yellow-400 dark:border-yellow-500',
        right: 'border-orange-300 dark:border-orange-500',
    };

    const shadowClasses: Record<RankCardPosition, string> = {
        left: 'shadow-gray-200 dark:shadow-gray-800',
        center: 'shadow-yellow-200 dark:shadow-yellow-900/50',
        right: 'shadow-orange-200 dark:shadow-orange-800',
    };

    return (
        <div className={`flex-1 flex flex-col items-center ${heightClasses[position]} justify-end`}>
            <div
                className={`w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 ${borderClasses[position]} ${shadowClasses[position]} p-6 flex flex-col items-center transition-transform hover:scale-105`}
            >
                {/* 순위 배지 */}
                <div className="mb-3">
                    {rank === 1 ? (
                        <div className="flex items-center gap-2 mb-2">
                            <Crown className="w-6 h-6 text-yellow-500" />
                            <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded">
                                🥇 1위
                            </span>
                        </div>
                    ) : (
                        <div className="mb-2">
                            <div className="text-2xl mb-1">{rank === 2 ? '🥈' : '🥉'}</div>
                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                {rank}위
                            </div>
                        </div>
                    )}
                </div>

                {/* 티어 배지 */}
                <div className="mb-4">
                    <TierBadge
                        tierLevel={resolveSolvedAcTierLevel({ tierLevel: user.tierLevel, rating: user.rating })}
                        size="lg"
                    />
                </div>

                {/* 닉네임 */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">
                    {user.nickname}
                </h3>

                {/* 티어 정보 */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {formatTierFromDifficulty(user.tier, user.tierLevel)}
                </p>

                {/* 회고 수 */}
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 w-full text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {user.retrospectiveCount}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">회고 작성</div>
                </div>

                {/* 연속 풀이 일수 */}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    🔥 {user.consecutiveSolveDays}일 연속
                </div>
            </div>
        </div>
    );
};

export const TopRankPodium: FC<TopRankPodiumProps> = ({ ranks }) => {
    // 순위별로 정렬 (1등, 2등, 3등)
    const first = ranks.find((r) => r.rank === 1);
    const second = ranks.find((r) => r.rank === 2);
    const third = ranks.find((r) => r.rank === 3);

    return (
        <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700 mb-8">
            <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    🏆 열정 회고 랭킹 Top 3
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    랭킹은 작성된 회고 수를 기준으로 산정됩니다.
                </p>
            </div>
            <div className="flex items-end justify-center gap-4 max-w-4xl mx-auto">
                {/* 2등 (왼쪽) - 항상 렌더링 */}
                <RankCard rank={2} user={second} position="left" />

                {/* 1등 (중앙, 가장 높음) - 항상 렌더링 */}
                <RankCard rank={1} user={first} position="center" />

                {/* 3등 (오른쪽) - 항상 렌더링 */}
                <RankCard rank={3} user={third} position="right" />
            </div>
        </div>
    );
};

