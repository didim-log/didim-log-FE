/**
 * 공지사항 상세 페이지
 */

import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../../../components/layout/Layout';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { useNotice } from '../../../hooks/api/useNotice';
import { formatKST } from '../../../utils/dateUtils';

export const NoticeDetailPage: FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, isLoading, error } = useNotice(id || '');

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
                        <div className="mt-6">
                            <Button onClick={() => navigate('/notices')} variant="outline">
                                목록으로
                            </Button>
                        </div>
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
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    {data.isPinned && (
                                        <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold">
                                            고정
                                        </span>
                                    )}
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white break-words">
                                        {data.title}
                                    </h1>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatKST(data.createdAt, 'default')}
                                </p>
                            </div>
                            <Button onClick={() => navigate('/notices')} variant="outline" size="sm">
                                목록으로
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="prose dark:prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap break-words font-sans text-sm text-gray-800 dark:text-gray-200">
                                {data.content}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
