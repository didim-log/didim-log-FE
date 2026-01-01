/**
 * 피드백 관리 컴포넌트
 */

import { useState } from 'react';
import type { FC } from 'react';
import { useAdminFeedbacks, useUpdateFeedbackStatus, useDeleteFeedback } from '../../../hooks/api/useAdmin';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import type { FeedbackStatus } from '../../../types/api/feedback.types';

export const FeedbackManagement: FC = () => {
    const [page, setPage] = useState(1);

    const { data, isLoading, error } = useAdminFeedbacks({ page, size: 20 });
    const updateStatusMutation = useUpdateFeedbackStatus();
    const deleteMutation = useDeleteFeedback();

    const handleStatusChange = async (feedbackId: string, status: FeedbackStatus) => {
        try {
            await updateStatusMutation.mutateAsync({ feedbackId, data: { status } });
        } catch (error) {
            console.error('Status update failed:', error);
        }
    };

    const handleDelete = async (feedbackId: string) => {
        if (confirm('정말 이 피드백을 삭제하시겠습니까?')) {
            try {
                await deleteMutation.mutateAsync(feedbackId);
            } catch (error) {
                console.error('Delete failed:', error);
            }
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR');
    };

    if (isLoading) {
        return <Spinner />;
    }

    if (error || !data) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">
                    {error instanceof Error ? error.message : '피드백 목록을 불러올 수 없습니다.'}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                작성자
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                유형
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                내용
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                상태
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                작성일
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                액션
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {data.content.map((feedback) => (
                            <tr key={feedback.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {feedback.bojId || feedback.writerId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${
                                            feedback.type === 'BUG'
                                                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                        }`}
                                    >
                                        {feedback.type === 'BUG' ? '버그' : '건의'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-md truncate">
                                    {feedback.content}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${
                                            feedback.status === 'COMPLETED'
                                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                        }`}
                                    >
                                        {feedback.status === 'COMPLETED' ? '완료' : '대기'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                    {formatDate(feedback.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                    <Button
                                        onClick={() =>
                                            handleStatusChange(
                                                feedback.id,
                                                feedback.status === 'PENDING' ? 'COMPLETED' : 'PENDING'
                                            )
                                        }
                                        variant="outline"
                                        size="sm"
                                        isLoading={updateStatusMutation.isPending}
                                    >
                                        {feedback.status === 'PENDING' ? '완료 처리' : '대기 처리'}
                                    </Button>
                                    {feedback.status === 'COMPLETED' && (
                                        <Button
                                            onClick={() => handleDelete(feedback.id)}
                                            variant="danger"
                                            size="sm"
                                            isLoading={deleteMutation.isPending}
                                        >
                                            삭제
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            {data.totalPages > 1 && (
                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {data.currentPage} / {data.totalPages} 페이지
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => handlePageChange(data.currentPage - 1)}
                            disabled={!data.hasPrevious}
                            variant="outline"
                            size="sm"
                        >
                            이전
                        </Button>
                        <Button
                            onClick={() => handlePageChange(data.currentPage + 1)}
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
    );
};

