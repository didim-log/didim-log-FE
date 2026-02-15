/**
 * 마이페이지용 회고 카드 컴포넌트
 * 제목, 한 줄 요약, 메타 정보를 명확하게 표시
 */

import type { FC } from 'react';
import { Link } from 'react-router-dom';
import type { RetrospectiveResponse } from '../../../types/api/retrospective.types';
import { formatKST, formatTimeFromSeconds } from '../../../utils/dateUtils';
import { getCategoryLabel } from '../../../utils/constants';
import { stripMarkdown, truncateText } from '../../../utils/markdownUtils';

interface MyRetrospectiveCardProps {
    retrospective: RetrospectiveResponse;
}

export const MyRetrospectiveCard: FC<MyRetrospectiveCardProps> = ({ retrospective }) => {
    // 제목 생성: "1060번 좋은 수 실패 회고" (괄호 제거)
    const getTitle = () => {
        const problemTitle = retrospective.problemTitle || '문제';
        const resultText = retrospective.solutionResult === 'SUCCESS' ? '성공' : 
                          retrospective.solutionResult === 'FAIL' ? '실패' : 
                          retrospective.solutionResult === 'TIME_OVER' ? '시간 초과' : '';
        const resultPart = resultText ? ` ${resultText}` : '';
        return `${retrospective.problemId}번 ${problemTitle}${resultPart} 회고`;
    };

    const getResultBadge = (result: string | null) => {
        if (!result) return null;

        const badgeStyles: Record<string, string> = {
            SUCCESS: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
            FAIL: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
            TIME_OVER: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
        };

        const resultTexts: Record<string, string> = {
            SUCCESS: '성공',
            FAIL: '실패',
            TIME_OVER: '시간 초과',
        };

        return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${badgeStyles[result] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                {resultTexts[result] || result}
            </span>
        );
    };


    return (
        <Link
            to={`/retrospectives/${retrospective.id}`}
            className="block bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
        >
            {/* 제목 및 풀이 시간 */}
            <div className="mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {getTitle()}
                    </h3>
                    {(retrospective.solveTime || retrospective.timeTaken) && (
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs font-medium flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {retrospective.solveTime || formatTimeFromSeconds(retrospective.timeTaken)}
                        </span>
                    )}
                </div>
            </div>

            {/* 한 줄 요약 (summary가 있으면 요약만, 없으면 본문 일부) */}
            {retrospective.summary ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {retrospective.summary}
                </p>
            ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {truncateText(stripMarkdown(retrospective.content), 150)}
                </p>
            )}

            {/* 메타 정보: 성공/실패, 카테고리 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                    {getResultBadge(retrospective.solutionResult)}
                    {retrospective.solvedCategory && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                            {getCategoryLabel(retrospective.solvedCategory)}
                        </span>
                    )}
                    {retrospective.mainCategory && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded text-xs font-medium">
                            {getCategoryLabel(retrospective.mainCategory)}
                        </span>
                    )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatKST(retrospective.createdAt, 'full')}
                </span>
            </div>

        </Link>
    );
};
