/**
 * AI 리뷰 생성 로그 관리 (ADMIN)
 */

import { useState } from 'react';
import type { FC } from 'react';
import { useAdminLog, useAdminLogs, useCleanupLogs } from '../../../hooks/api/useAdmin';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';
import { toast } from 'sonner';
import { formatKST } from '../../../utils/dateUtils';
import { getErrorMessage } from '../../../types/api/common.types';

export const AdminLogManagement: FC = () => {
    const [page, setPage] = useState(1);
    const [bojId, setBojId] = useState('');
    const [selectedLogId, setSelectedLogId] = useState<string>('');

    const { data, isLoading, error, refetch } = useAdminLogs({ bojId: bojId.trim() || undefined, page, size: 20 });
    const { data: detail, isLoading: isDetailLoading } = useAdminLog(selectedLogId);
    const cleanupLogsMutation = useCleanupLogs();

    const handleSearch = () => {
        setPage(1);
    };

    const handleCleanup = async (olderThanDays: number) => {
        const confirmMessage = getConfirmMessage(olderThanDays);
        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            const result = await cleanupLogsMutation.mutateAsync(olderThanDays);
            toast.success(result.message);
            refetch();
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
            toast.error(errorMessage);
        }
    };

    const getConfirmMessage = (days: number): string => {
        if (days === 3) {
            return '정말 전체 로그를 초기화하시겠습니까? (3일 제외)\n이 작업은 복구할 수 없습니다.';
        }
        return `정말 ${days}일 이상 된 로그를 삭제하시겠습니까?\n이 작업은 복구할 수 없습니다.`;
    };

    if (isLoading) {
        return <Spinner />;
    }

    if (error || !data) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">
                    {error instanceof Error ? error.message : '로그 목록을 불러올 수 없습니다.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 로그 데이터 관리 섹션 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">로그 데이터 관리 (Log Data Management)</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    로그는 60일 후 자동 삭제됩니다.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCleanup(7)}
                        isLoading={cleanupLogsMutation.isPending}
                        disabled={cleanupLogsMutation.isPending}
                    >
                        1주일 이상 된 로그 삭제
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCleanup(30)}
                        isLoading={cleanupLogsMutation.isPending}
                        disabled={cleanupLogsMutation.isPending}
                    >
                        1개월 이상 된 로그 삭제
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCleanup(3)}
                        isLoading={cleanupLogsMutation.isPending}
                        disabled={cleanupLogsMutation.isPending}
                    >
                        전체 초기화 (3일 제외)
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI 리뷰 로그 조회</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                        label="BOJ ID (필터)"
                        type="text"
                        value={bojId}
                        onChange={(e) => setBojId(e.target.value)}
                        placeholder="예: user123"
                    />
                    <div className="flex items-end">
                        <Button onClick={handleSearch} variant="primary" className="w-full">
                            검색
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    생성일
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    BOJ ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    제목
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    상태
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    액션
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {data.content.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {formatKST(log.createdAt, 'full')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {log.bojId || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-md truncate">
                                        {log.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {log.aiReviewStatus || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedLogId(log.id)}
                                        >
                                            상세
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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

            {/* 상세 패널 (간단, 기존 UI 톤 유지) */}
            {selectedLogId && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">로그 상세</h3>
                        <Button variant="outline" size="sm" onClick={() => setSelectedLogId('')}>
                            닫기
                        </Button>
                    </div>
                    {isDetailLoading && (
                        <div className="py-6">
                            <Spinner />
                        </div>
                    )}
                    {!isDetailLoading && detail && (
                        <div className="mt-4 space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">ID</p>
                                <p className="text-sm text-gray-900 dark:text-white break-words">{detail.id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">AI 리뷰</p>
                                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap break-words">
                                    {detail.aiReview || '(없음)'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">코드</p>
                                <pre className="mt-2 p-4 rounded-lg bg-gray-900 text-gray-100 overflow-auto text-xs">
                                    {detail.code}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
