/**
 * 회고 카드 컴포넌트
 */

import type { FC } from 'react';
import { Link } from 'react-router-dom';
import type { RetrospectiveResponse } from '../../../types/api/retrospective.types';
import { Trash2 } from 'lucide-react';
import { stripMarkdown, truncateText } from '../../../utils/markdownUtils';
import { formatKST, formatTimeFromSeconds } from '../../../utils/dateUtils';

interface RetrospectiveCardProps {
    retrospective: RetrospectiveResponse;
    onToggleBookmark?: (id: string) => void;
    onDelete?: (id: string) => void;
    isOwner?: boolean;
}

export const RetrospectiveCard: FC<RetrospectiveCardProps> = ({
    retrospective,
    onToggleBookmark,
    onDelete,
    isOwner = false,
}) => {
    const formatDate = (dateString: string) => {
        return formatKST(dateString, 'dateOnly');
    };

    // 제목 생성: "1060번 좋은 수 실패 회고" (괄호 제거)
    const getTitle = () => {
        const problemTitle = retrospective.problemTitle || '문제';
        const resultText = retrospective.solutionResult === 'SUCCESS' ? '성공' : 
                          retrospective.solutionResult === 'FAIL' ? '실패' : 
                          retrospective.solutionResult === 'TIME_OVER' ? '시간 초과' : '';
        const resultPart = resultText ? ` ${resultText}` : '';
        return `${retrospective.problemId}번 ${problemTitle}${resultPart} 회고`;
    };


    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <Link
                        to={`/retrospectives/${retrospective.id}`}
                        className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                        {getTitle()}
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    {retrospective.isBookmarked && (
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    )}
                    {onToggleBookmark && (
                        <button
                            onClick={() => onToggleBookmark(retrospective.id)}
                            className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                            aria-label="북마크 토글"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                />
                            </svg>
                        </button>
                    )}
                    {isOwner && onDelete ? (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (confirm('정말로 이 회고를 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.')) {
                                    onDelete(retrospective.id);
                                }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg"
                            aria-label="회고 삭제"
                            title="회고 삭제"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    ) : null}
                </div>
            </div>

            {/* 한 줄 요약 표시 (summary가 있으면 요약만, 없으면 본문 일부) */}
            {retrospective.summary ? (
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                    {retrospective.summary}
                </p>
            ) : (
                <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                    {truncateText(stripMarkdown(retrospective.content), 150)}
                </p>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2 flex-wrap">
                    {retrospective.solutionResult && (
                        <span
                            className={`px-2 py-1 rounded ${
                                retrospective.solutionResult === 'SUCCESS'
                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                    : retrospective.solutionResult === 'FAIL'
                                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                    : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                            }`}
                        >
                            {retrospective.solutionResult === 'SUCCESS' ? '성공' : retrospective.solutionResult === 'FAIL' ? '실패' : '시간 초과'}
                        </span>
                    )}
                    {retrospective.timeTaken && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                            ⏱️ {formatTimeFromSeconds(retrospective.timeTaken)}
                        </span>
                    )}
                    {retrospective.solvedCategory && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                            {retrospective.solvedCategory}
                        </span>
                    )}
                </div>
                <span>{formatDate(retrospective.createdAt)}</span>
            </div>

        </div>
    );
};
