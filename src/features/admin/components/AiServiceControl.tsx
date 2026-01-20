/**
 * AI 서비스 제어 위젯
 * AI 서비스의 상태를 모니터링하고 제어할 수 있는 관리자 위젯
 */

import { useState } from 'react';
import type { FC } from 'react';
import { useAiStatus, useUpdateAiStatus, useUpdateAiLimits } from '../../../hooks/api/useAdmin';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { toast } from 'sonner';

export const AiServiceControl: FC = () => {
    const { data: status, isLoading, error, refetch: refetchAiStatus } = useAiStatus();
    const updateStatusMutation = useUpdateAiStatus();
    const updateLimitsMutation = useUpdateAiLimits();

    const [globalLimit, setGlobalLimit] = useState<number>(1000);
    const [userLimit, setUserLimit] = useState<number>(5);
    const [isEditingLimits, setIsEditingLimits] = useState<boolean>(false);

    const handleToggleService = async () => {
        if (!status) {
            return;
        }

        try {
            await updateStatusMutation.mutateAsync({ enabled: !status.isEnabled });
            toast.success(status.isEnabled ? 'AI 서비스가 비활성화되었습니다.' : 'AI 서비스가 활성화되었습니다.');
            // 상태 변경 후 즉시 갱신
            refetchAiStatus();
        } catch {
            toast.error('AI 서비스 상태 변경에 실패했습니다.');
        }
    };

    const handleSaveLimits = async () => {
        if (!status) {
            return;
        }

        try {
            await updateLimitsMutation.mutateAsync({
                globalLimit,
                userLimit,
            });
            setIsEditingLimits(false);
            toast.success('사용량 제한이 업데이트되었습니다.');
            // 제한 변경 후 즉시 갱신
            refetchAiStatus();
        } catch {
            toast.error('사용량 제한 업데이트에 실패했습니다.');
        }
    };

    const handleCancelEdit = () => {
        setIsEditingLimits(false);
    };

    const handleStartEdit = () => {
        if (!status) {
            return;
        }
        setGlobalLimit(status.globalLimit);
        setUserLimit(status.userLimit);
        setIsEditingLimits(true);
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

    if (error || !status) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI 서비스 제어</h2>
                <p className="text-red-600 dark:text-red-400">데이터를 불러올 수 없습니다.</p>
            </div>
        );
    }

    const usagePercentage = (status.todayGlobalUsage / status.globalLimit) * 100;
    const getUsageColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI 서비스 제어</h2>
                <div className="flex items-center gap-3">
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                            status.isEnabled
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                        }`}
                    >
                        {status.isEnabled ? '🟢 운영 중' : '🔴 중지됨'}
                    </span>
                    <button
                        onClick={handleToggleService}
                        disabled={updateStatusMutation.isPending}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            status.isEnabled
                                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/70'
                                : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900/70'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {updateStatusMutation.isPending
                            ? '처리 중...'
                            : status.isEnabled
                              ? '서비스 중지'
                              : '서비스 시작'}
                    </button>
                </div>
            </div>

            {/* 사용량 표시 */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">오늘의 전역 사용량</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {status.todayGlobalUsage.toLocaleString()} / {status.globalLimit.toLocaleString()}
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                        className={`h-full ${getUsageColor(usagePercentage)} transition-all duration-500 flex items-center justify-end pr-2`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    >
                        {usagePercentage > 10 && (
                            <span className="text-xs font-bold text-white">
                                {usagePercentage.toFixed(1)}%
                            </span>
                        )}
                    </div>
                </div>
                {usagePercentage < 10 && (
                    <div className="mt-1 text-right">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {usagePercentage.toFixed(1)}%
                        </span>
                    </div>
                )}
            </div>

            {/* 제한 설정 */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">사용량 제한 설정</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            전역 일일 제한
                        </label>
                        <Input
                            type="number"
                            min="1"
                            value={isEditingLimits ? globalLimit : status.globalLimit}
                            onChange={(e) => {
                                const value = parseInt(e.target.value, 10);
                                if (!isNaN(value) && value > 0) {
                                    setGlobalLimit(value);
                                }
                            }}
                            disabled={!isEditingLimits || updateLimitsMutation.isPending}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            사용자 일일 제한
                        </label>
                        <Input
                            type="number"
                            min="1"
                            value={isEditingLimits ? userLimit : status.userLimit}
                            onChange={(e) => {
                                const value = parseInt(e.target.value, 10);
                                if (!isNaN(value) && value > 0) {
                                    setUserLimit(value);
                                }
                            }}
                            disabled={!isEditingLimits || updateLimitsMutation.isPending}
                            className="w-full"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isEditingLimits ? (
                        <>
                            <Button
                                onClick={handleSaveLimits}
                                disabled={updateLimitsMutation.isPending}
                                variant="primary"
                                size="sm"
                            >
                                {updateLimitsMutation.isPending ? '저장 중...' : '설정 저장'}
                            </Button>
                            <Button
                                onClick={handleCancelEdit}
                                disabled={updateLimitsMutation.isPending}
                                variant="secondary"
                                size="sm"
                            >
                                취소
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={handleStartEdit}
                            variant="secondary"
                            size="sm"
                        >
                            제한 수정
                        </Button>
                    )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    💡 설정 변경 시 서버 재시작 없이 즉시 적용됩니다.
                </p>
            </div>
        </div>
    );
};
