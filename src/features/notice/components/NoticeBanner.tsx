/**
 * 대시보드용 얇은 공지 배너
 */

import type { FC } from 'react';
import { Link } from 'react-router-dom';
import type { NoticeResponse } from '../../../types/api/notice.types';

interface NoticeBannerProps {
    notice: NoticeResponse;
}

export const NoticeBanner: FC<NoticeBannerProps> = ({ notice }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-2">
            <div className="flex items-center gap-3">
                <span className="shrink-0 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold">
                    공지
                </span>
                <Link
                    to={`/notices/${notice.id}`}
                    className="flex-1 min-w-0 text-sm text-gray-800 dark:text-gray-200 hover:underline truncate"
                    title={notice.title}
                >
                    {notice.title}
                    {notice.isPinned && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            (고정)
                        </span>
                    )}
                </Link>
                <Link
                    to="/notices"
                    className="shrink-0 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                    더보기
                </Link>
            </div>
        </div>
    );
};














