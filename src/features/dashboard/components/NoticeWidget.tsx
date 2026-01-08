/**
 * 대시보드용 공지사항 위젯 (컴팩트 버전)
 * 최신 공지사항 3개를 한 줄로 표시합니다.
 */

import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { useNotices } from '../../../hooks/api/useNotice';
import { Spinner } from '../../../components/ui/Spinner';
import { formatKST } from '../../../utils/dateUtils';

export const NoticeWidget: FC = () => {
    const { data, isLoading, error } = useNotices({ page: 1, size: 3 });

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center py-2">
                    <Spinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-center py-2">
                    <p className="text-xs text-red-600 dark:text-red-400">
                        공지사항을 불러올 수 없습니다.
                    </p>
                </div>
            </div>
        );
    }

    const notices = data?.content || [];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700 max-h-[180px] flex flex-col">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">공지사항</h3>
                <Link
                    to="/notices"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                    더보기 &gt;
                </Link>
            </div>

            {/* 본문: 컴팩트 리스트 */}
            {notices.length === 0 ? (
                <div className="text-center py-4 flex-1 flex items-center justify-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        등록된 공지사항이 없습니다.
                    </p>
                </div>
            ) : (
                <div className="space-y-1.5 flex-1 overflow-y-auto scrollbar-thin">
                    {notices.map((notice) => {
                        // 날짜 포맷팅 (YYYY-MM-DD)
                        const date = formatKST(notice.createdAt, 'dateOnly');

                        return (
                            <Link
                                key={notice.id}
                                to={`/notices/${notice.id}`}
                                className="block py-1.5 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    {notice.isPinned ? (
                                        <span className="shrink-0 px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-semibold">
                                            필독
                                        </span>
                                    ) : (
                                        <span className="shrink-0 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium">
                                            공지
                                        </span>
                                    )}
                                    <span className="flex-1 min-w-0 text-xs font-medium text-gray-900 dark:text-white truncate">
                                        {notice.title}
                                    </span>
                                    <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                                        {date}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

