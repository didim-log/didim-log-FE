/**
 * 오늘 푼 문제 목록 컴포넌트
 */

import type { FC } from 'react';
import { Link } from 'react-router-dom';
import type { TodaySolvedProblemResponse } from '../../../types/api/dashboard.types';
import { formatKST } from '../../../utils/dateUtils';

interface TodaySolvedListProps {
    problems: TodaySolvedProblemResponse[];
}

export const TodaySolvedList: FC<TodaySolvedListProps> = ({ problems }) => {
    const getResultColor = (result: string) => {
        const colors: Record<string, string> = {
            SUCCESS: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30',
            FAIL: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30',
            TIME_OVER: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30',
        };
        return colors[result] || 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
    };

    const getResultText = (result: string) => {
        const texts: Record<string, string> = {
            SUCCESS: '성공',
            FAIL: '실패',
            TIME_OVER: '시간 초과',
        };
        return texts[result] || result;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">오늘 푼 문제</h3>

            {problems.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-3">오늘 푼 문제가 없습니다.</p>
            ) : (
                <div className="space-y-2">
                    {problems.map((problem, index) => (
                        <Link
                            key={index}
                            to={`/problems/${problem.problemId}`}
                            className="flex items-center justify-between p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex items-center gap-2.5">
                                <span className="text-sm text-gray-600 dark:text-gray-400">#{problem.problemId}</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getResultColor(problem.result)}`}>
                                    {getResultText(problem.result)}
                                </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{formatKST(problem.solvedAt, 'timeOnly')}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
