/**
 * 관리자 작업 감사 로그 위젯
 */

import { useState } from 'react';
import type { FC } from 'react';
import { useAdminAuditLogs } from '../../../hooks/api/useAdmin';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';
import type { AdminActionType } from '../../../types/api/admin.types';
import { formatKST } from '../../../utils/dateUtils';

const ACTION_TYPES: AdminActionType[] = [
    'STORAGE_CLEANUP',
    'NOTICE_CREATE',
    'NOTICE_UPDATE',
    'NOTICE_DELETE',
    'AI_SERVICE_TOGGLE',
    'AI_LIMITS_UPDATE',
    'AI_REVIEW_POLICY_UPDATE',
    'USER_DELETE',
    'USER_UPDATE',
    'QUOTE_CREATE',
    'QUOTE_DELETE',
    'FEEDBACK_STATUS_UPDATE',
    'FEEDBACK_DELETE',
    'MAINTENANCE_MODE_TOGGLE',
    'PROBLEM_JOB_CREATE',
    'PROBLEM_JOB_CANCEL',
    'PROBLEM_JOB_RETRY',
];

const ACTION_LABELS: Record<AdminActionType, string> = {
    STORAGE_CLEANUP: '저장 공간 정리',
    NOTICE_CREATE: '공지사항 생성',
    NOTICE_UPDATE: '공지사항 수정',
    NOTICE_DELETE: '공지사항 삭제',
    AI_SERVICE_TOGGLE: 'AI 서비스 토글',
    AI_LIMITS_UPDATE: 'AI 제한 업데이트',
    AI_REVIEW_POLICY_UPDATE: 'AI 리뷰 정책 업데이트',
    USER_DELETE: '사용자 삭제',
    USER_UPDATE: '사용자 수정',
    QUOTE_CREATE: '명언 생성',
    QUOTE_DELETE: '명언 삭제',
    FEEDBACK_STATUS_UPDATE: '피드백 상태 변경',
    FEEDBACK_DELETE: '피드백 삭제',
    MAINTENANCE_MODE_TOGGLE: '유지보수 모드 토글',
    PROBLEM_JOB_CREATE: '문제 작업 생성',
    PROBLEM_JOB_CANCEL: '문제 작업 취소',
    PROBLEM_JOB_RETRY: '문제 작업 재시도',
};

const getActionLabel = (action: string): string => {
    return ACTION_LABELS[action as AdminActionType] ?? `기타(${action})`;
};

export const AdminAuditLogWidget: FC = () => {
    const [page, setPage] = useState(1);
    const [selectedDetails, setSelectedDetails] = useState<{ action: string; details: string } | null>(null);
    const [filters, setFilters] = useState<{
        adminId?: string;
        action?: AdminActionType;
        startDate?: string;
        endDate?: string;
    }>({});

    const { data, isLoading, error } = useAdminAuditLogs({
        page,
        size: 20,
        ...filters,
    });

    const handleFilterChange = (key: keyof typeof filters, value: string | undefined) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value || undefined,
        }));
        setPage(1);
    };

    const handleResetFilters = () => {
        setFilters({});
        setPage(1);
    };


    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">
                    {error instanceof Error ? error.message : '감사 로그를 불러올 수 없습니다.'}
                </p>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">관리자 작업 감사 로그</h2>

                {/* 필터 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            관리자 ID
                        </label>
                        <Input
                            type="text"
                            value={filters.adminId || ''}
                            onChange={(e) => handleFilterChange('adminId', e.target.value)}
                            placeholder="관리자 ID 검색"
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            작업 타입
                        </label>
                        <select
                            value={filters.action || ''}
                            onChange={(e) => handleFilterChange('action', e.target.value || undefined)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">전체</option>
                            {ACTION_TYPES.map((action) => (
                                <option key={action} value={action}>
                                    {getActionLabel(action)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            시작 날짜
                        </label>
                        <Input
                            type="datetime-local"
                            value={filters.startDate || ''}
                            onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            종료 날짜
                        </label>
                        <Input
                            type="datetime-local"
                            value={filters.endDate || ''}
                            onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button variant="secondary" onClick={handleResetFilters} className="text-sm">
                        필터 초기화
                    </Button>
                </div>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                관리자 ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                작업 타입
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                상세 정보
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                IP 주소
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                작업 시각
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {data.content.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    감사 로그가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            data.content.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {log.adminId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                            {getActionLabel(log.action)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-md">
                                        <div className="flex items-center gap-2">
                                            <span className="block truncate" title={log.details}>
                                                {log.details}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedDetails({ action: log.action, details: log.details })}
                                            >
                                                보기
                                            </Button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {log.ipAddress}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatKST(log.createdAt, 'full')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 페이징 */}
            {data.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        총 {data.totalElements}개 중 {data.content.length}개 표시
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="text-sm"
                        >
                            이전
                        </Button>
                        <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                            {page} / {data.totalPages}
                        </span>
                        <Button
                            variant="secondary"
                            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                            disabled={page === data.totalPages}
                            className="text-sm"
                        >
                            다음
                        </Button>
                    </div>
                </div>
            )}

            {selectedDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                감사 로그 상세 · {getActionLabel(selectedDetails.action)}
                            </h3>
                            <Button variant="outline" size="sm" onClick={() => setSelectedDetails(null)}>
                                닫기
                            </Button>
                        </div>
                        <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap break-words bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            {selectedDetails.details}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};
