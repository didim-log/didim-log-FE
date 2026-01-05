/**
 * Maintenance Mode 페이지
 * 시스템 점검 중일 때 표시되는 페이지
 * Sidebar와 Header 없이 공지사항만 표시
 */

import { useEffect } from 'react';
import type { FC } from 'react';
import { useNotices } from '../hooks/api/useNotice';
import { Loader2 } from 'lucide-react';

export const MaintenancePage: FC = () => {
    const { data: noticesData, isLoading } = useNotices({ page: 1, size: 10 });
    const notices = noticesData?.content || [];

    useEffect(() => {
        // 페이지 접근 시 자동으로 스크롤을 맨 위로 이동
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Header (간단한 로고만) */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">디딤로그</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-6">
                        <svg
                            className="w-10 h-10 text-yellow-600 dark:text-yellow-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        시스템 점검 중입니다
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                        현재 시스템 점검으로 인해 일시적으로 서비스를 이용하실 수 없습니다.
                    </p>
                    <p className="text-base text-gray-500 dark:text-gray-500">
                        점검 완료 후 다시 이용해 주시기 바랍니다.
                    </p>
                </div>

                {/* 공지사항 섹션 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        📢 공지사항
                    </h3>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : notices && notices.length > 0 ? (
                        <div className="space-y-4">
                            {notices.map((notice) => (
                                <div
                                    key={notice.id}
                                    className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0"
                                >
                                    <div className="flex items-start gap-3">
                                        {notice.isPinned && (
                                            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold shrink-0">
                                                고정
                                            </span>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                                                {notice.title}
                                            </h4>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                                                {notice.content}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                {new Date(notice.createdAt).toLocaleDateString('ko-KR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                            공지사항이 없습니다.
                        </p>
                    )}
                </div>

                {/* 안내 문구 */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        문의사항이 있으시면 관리자에게 연락해 주세요.
                    </p>
                </div>
            </main>
        </div>
    );
};

