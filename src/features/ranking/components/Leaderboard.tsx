/**
 * 리더보드 컴포넌트
 */

import type { FC } from 'react';
import type { LeaderboardResponse } from '../../../types/api/ranking.types';
import { getTierColor } from '../../../utils/tier';

interface LeaderboardProps {
    data: LeaderboardResponse[];
}

export const Leaderboard: FC<LeaderboardProps> = ({ data }) => {

    const getRankBadge = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                순위
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                닉네임
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                티어
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                회고 수
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                연속 풀이
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {data.map((user) => (
                            <tr key={user.nickname} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {getRankBadge(user.rank)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user.nickname}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${getTierColor(user.tier)}`}
                                    >
                                        {user.tier}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">{user.retrospectiveCount}개</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">{user.consecutiveSolveDays}일</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {data.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">랭킹 데이터가 없습니다.</p>
                </div>
            )}
        </div>
    );
};

