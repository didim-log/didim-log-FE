/**
 * 랭킹 페이지
 */

import { useState } from 'react';
import type { FC } from 'react';
import { useRanking } from '../../../hooks/api/useRanking';
import { Leaderboard } from '../components/Leaderboard';
import { TopRankPodium } from '../components/TopRankPodium';
import { Spinner } from '../../../components/ui/Spinner';
import { Layout } from '../../../components/layout/Layout';
import { useAuthStore } from '../../../stores/auth.store';
import { TierBadge } from '../../dashboard/components/TierBadge';
import { formatTierFromDifficulty } from '../../../utils/tier';
import type { RankingPeriod } from '../../../types/api/ranking.types';

export const RankingPage: FC = () => {
    const [period, setPeriod] = useState<RankingPeriod>('TOTAL');
    const [limit, setLimit] = useState(100);
    const { user } = useAuthStore();

    const { data: ranking, isLoading, error } = useRanking({ period, limit });

    // 데이터 분리: Top 3와 나머지
    const top3 = (ranking ?? []).slice(0, 3).filter((r) => r.rank <= 3);
    const restRanks = (ranking ?? []).slice(3);
    const myRank = user?.nickname ? (ranking ?? []).find((r) => r.nickname === user.nickname) : null;

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <Spinner />
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">오류가 발생했습니다</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {error instanceof Error ? error.message : '랭킹을 불러올 수 없습니다.'}
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 pb-24">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* 동기 부여 배너 */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl shadow-md p-6 border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center gap-3">
                            <div className="text-3xl">🚀</div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                    꾸준한 회고가 실력 향상의 지름길입니다
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    매일 문제를 풀고 회고를 작성하며 성장해보세요!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Top 3 Podium */}
                    {top3.length > 0 && <TopRankPodium ranks={top3} />}

                    {/* 필터 옵션 */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    기간
                                </label>
                                <select
                                    value={period}
                                    onChange={(e) => setPeriod(e.target.value as RankingPeriod)}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="DAILY">일별</option>
                                    <option value="WEEKLY">주별</option>
                                    <option value="MONTHLY">월별</option>
                                    <option value="TOTAL">전체</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    표시 개수
                                </label>
                                <select
                                    value={limit}
                                    onChange={(e) => setLimit(Number(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={50}>Top 50</option>
                                    <option value={100}>Top 100</option>
                                    <option value={200}>Top 200</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 리더보드 (4위부터) */}
                    {restRanks.length > 0 ? (
                        <Leaderboard data={restRanks} />
                    ) : ranking && ranking.length > 0 ? null : (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">랭킹 데이터가 없습니다.</p>
                        </div>
                    )}
                </div>

                {/* 내 순위 고정 바 */}
                {myRank && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
                        <div className="max-w-6xl mx-auto px-4 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                            #{myRank.rank}
                                        </span>
                                        <span className="text-gray-900 dark:text-white font-semibold">
                                            {myRank.nickname}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <TierBadge tierLevel={myRank.tierLevel} size="sm" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {formatTierFromDifficulty(myRank.tier, myRank.tierLevel)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="text-center">
                                        <div className="font-bold text-gray-900 dark:text-white">
                                            {myRank.retrospectiveCount}
                                        </div>
                                        <div className="text-gray-500 dark:text-gray-400">회고</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-gray-900 dark:text-white">
                                            {myRank.consecutiveSolveDays}
                                        </div>
                                        <div className="text-gray-500 dark:text-gray-400">연속</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

