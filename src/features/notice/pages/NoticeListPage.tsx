/**
 * 공지사항 목록 페이지
 */

import { useState } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../../components/layout/Layout';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { useNotices } from '../../../hooks/api/useNotice';

export const NoticeListPage: FC = () => {
    const [page, setPage] = useState(1);
    const { data, isLoading, error } = useNotices({ page, size: 10 });

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <Spinner />
                </div>
            </Layout>
        );
    }

    if (error || !data) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">오류가 발생했습니다</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {error instanceof Error ? error.message : '공지사항을 불러올 수 없습니다.'}
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">공지사항</h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            서비스 안내 및 주요 공지를 확인하세요.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {data.content.length === 0 && (
                                <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                                    공지사항이 없습니다.
                                </div>
                            )}
                            {data.content.map((notice) => (
                                <Link
                                    key={notice.id}
                                    to={`/notices/${notice.id}`}
                                    className="block p-5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                {notice.isPinned && (
                                                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold">
                                                        고정
                                                    </span>
                                                )}
                                                <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                                                    {notice.title}
                                                </h2>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(notice.createdAt).toLocaleString('ko-KR')}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                                            보기 →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {data.totalPages > 1 && (
                            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {data.currentPage} / {data.totalPages} 페이지
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setPage(data.currentPage - 1)}
                                        disabled={!data.hasPrevious}
                                        variant="outline"
                                        size="sm"
                                    >
                                        이전
                                    </Button>
                                    <Button
                                        onClick={() => setPage(data.currentPage + 1)}
                                        disabled={!data.hasNext}
                                        variant="outline"
                                        size="sm"
                                    >
                                        다음
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};


