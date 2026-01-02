/**
 * 저장 공간 관리 위젯 (Admin Dashboard)
 */

import { useState } from 'react';
import type { FC } from 'react';
import { useStorageStats, useCleanupStorage } from '../../../hooks/api/useAdmin';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';
import { toast } from 'sonner';
import { Database, Trash2, AlertTriangle } from 'lucide-react';

export const StorageHealthWidget: FC = () => {
    const { data: stats, isLoading, error, refetch } = useStorageStats();
    const cleanupMutation = useCleanupStorage();
    const [daysToKeep, setDaysToKeep] = useState(365);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const formatSize = (kb: number): string => {
        if (kb < 1024) {
            return `~${kb} KB`;
        }
        const mb = (kb / 1024).toFixed(2);
        return `~${mb} MB`;
    };

    const handleCleanup = async () => {
        if (confirmText !== 'DELETE') {
            toast.error('"DELETE"를 정확히 입력해주세요.');
            return;
        }

        try {
            const result = await cleanupMutation.mutateAsync(daysToKeep);
            toast.success(result.message);
            setShowConfirmModal(false);
            setConfirmText('');
            await refetch();
        } catch (error: any) {
            console.error('Storage cleanup failed:', error);
            const errorMessage = error?.response?.data?.message || error?.message || '데이터 정리에 실패했습니다.';
            toast.error(errorMessage);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center py-8">
                    <Spinner />
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <div className="text-center py-8">
                    <p className="text-red-600 dark:text-red-400">
                        {error instanceof Error ? error.message : '저장 공간 통계를 불러올 수 없습니다.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-6">
                    <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">저장 공간 관리</h2>
                </div>

                {/* 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">총 회고 수</p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                            {stats.totalCount.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                        <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">예상 크기</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                            {formatSize(stats.estimatedSizeKb)}
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">가장 오래된 레코드</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {new Date(stats.oldestRecordDate).toLocaleDateString('ko-KR')}
                        </p>
                    </div>
                </div>

                {/* 정리 컨트롤 */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">오래된 데이터 정리</h3>
                    <div className="flex items-end gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                보관할 일수 (기본값: 365일)
                            </label>
                            <Input
                                type="number"
                                min={30}
                                value={daysToKeep}
                                onChange={(e) => setDaysToKeep(Number.parseInt(e.target.value) || 365)}
                                placeholder="365"
                                className="w-full"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {daysToKeep}일 이전의 데이터가 삭제됩니다. (최소 30일)
                            </p>
                        </div>
                        <Button
                            variant="danger"
                            onClick={() => setShowConfirmModal(true)}
                            className="flex items-center gap-2"
                            disabled={daysToKeep < 30}
                        >
                            <Trash2 className="w-4 h-4" />
                            오래된 데이터 정리
                        </Button>
                    </div>
                </div>
            </div>

            {/* 확인 모달 */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">경고</h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-gray-700 dark:text-gray-300">
                                <span className="font-semibold text-red-600 dark:text-red-400">{daysToKeep}일</span> 이전의 회고 데이터가{' '}
                                <span className="font-semibold">영구 삭제</span>됩니다.
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                이 작업은 되돌릴 수 없습니다. 계속하시려면 아래에 <span className="font-mono font-bold">DELETE</span>를 입력해주세요.
                            </p>
                            <Input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="DELETE"
                                className="w-full font-mono"
                            />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="danger"
                                onClick={handleCleanup}
                                disabled={confirmText !== 'DELETE' || cleanupMutation.isPending}
                                isLoading={cleanupMutation.isPending}
                                className="flex-1"
                            >
                                삭제 실행
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setConfirmText('');
                                }}
                                disabled={cleanupMutation.isPending}
                                className="flex-1"
                            >
                                취소
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

