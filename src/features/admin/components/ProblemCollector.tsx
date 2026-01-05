/**
 * 문제 크롤링 제어 컴포넌트
 */

import { useState } from 'react';
import type { FC } from 'react';
import { useCollectMetadata, useCollectDetails, useProblemStats } from '../../../hooks/api/useAdmin';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';
import { BookOpen, Minus, Maximize } from 'lucide-react';
import { toast } from 'sonner';

export const ProblemCollector: FC = () => {
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [errors, setErrors] = useState<{ start?: string; end?: string }>({});

    const collectMetadataMutation = useCollectMetadata();
    const collectDetailsMutation = useCollectDetails();
    const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useProblemStats();
    const suggestedStart = stats?.maxProblemId ? String(stats.maxProblemId + 1) : '';

    const handleCollectMetadata = async (e: React.FormEvent) => {
        e.preventDefault();
        const resolvedStart = start || suggestedStart;
        if (!resolvedStart || !end) {
            setErrors({
                start: resolvedStart ? undefined : '시작 문제 ID를 입력해주세요.',
                end: end ? undefined : '종료 문제 ID를 입력해주세요.',
            });
            return;
        }

        const startNum = Number(resolvedStart);
        const endNum = Number(end);

        if (isNaN(startNum) || isNaN(endNum) || startNum < 1 || endNum < 1 || startNum > endNum) {
            setErrors({ start: '유효한 범위를 입력해주세요.', end: '유효한 범위를 입력해주세요.' });
            return;
        }

        try {
            await collectMetadataMutation.mutateAsync({ start: startNum, end: endNum });
            toast.success('문제 메타데이터 수집이 완료되었습니다.');
            setErrors({});
            // 통계 갱신
            refetchStats();
            // 최대 ID 업데이트 후 자동으로 다음 시작 ID 설정
            if (stats?.maxProblemId && endNum > stats.maxProblemId) {
                setStart((endNum + 1).toString());
            }
            setEnd('');
        } catch {
            toast.error('수집에 실패했습니다.');
        }
    };

    const handleCollectDetails = async () => {
        if (!confirm('문제 상세 정보 크롤링을 시작하시겠습니까? 시간이 오래 걸릴 수 있습니다.')) {
            return;
        }

        try {
            await collectDetailsMutation.mutateAsync();
            toast.success('문제 상세 정보 크롤링이 완료되었습니다.');
        } catch {
            toast.error('크롤링에 실패했습니다.');
        }
    };

    return (
        <div className="space-y-6">
            {/* 문제 통계 대시보드 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">문제 수집 현황</h2>
                {isStatsLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Spinner />
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">수집된 문제 수</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats?.totalCount.toLocaleString() ?? 0}개
                            </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Minus className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">최소 문제 ID</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats?.minProblemId ? `${stats.minProblemId}번` : '-'}
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                제일 빠른 문제 번호
                            </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Maximize className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">최대 문제 ID</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats?.maxProblemId ? `${stats.maxProblemId}번` : '-'}
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                제일 느린 문제 번호
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* 메타데이터 수집 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">문제 메타데이터 수집</h2>
                <form onSubmit={handleCollectMetadata} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="시작 문제 ID"
                            type="number"
                            value={start}
                            onChange={(e) => {
                                setStart(e.target.value);
                                setErrors((prev) => ({ ...prev, start: undefined }));
                            }}
                            placeholder={suggestedStart || '예: 1000'}
                            min={1}
                            required
                            error={errors.start}
                        />
                        <Input
                            label="종료 문제 ID"
                            type="number"
                            value={end}
                            onChange={(e) => {
                                setEnd(e.target.value);
                                setErrors((prev) => ({ ...prev, end: undefined }));
                            }}
                            placeholder="예: 1100"
                            min={1}
                            required
                            error={errors.end}
                        />
                    </div>
                    <Button type="submit" variant="primary" isLoading={collectMetadataMutation.isPending}>
                        메타데이터 수집 시작
                    </Button>
                </form>
            </div>

            {/* 상세 정보 크롤링 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">문제 상세 정보 크롤링</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    DB에서 descriptionHtml이 null인 문제들의 상세 정보를 백준 사이트에서 크롤링하여 업데이트합니다.
                </p>
                <Button onClick={handleCollectDetails} variant="primary" isLoading={collectDetailsMutation.isPending}>
                    상세 정보 크롤링 시작
                </Button>
            </div>
        </div>
    );
};

