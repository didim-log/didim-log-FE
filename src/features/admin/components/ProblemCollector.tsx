/**
 * 문제 크롤링 제어 컴포넌트
 */

import { useState } from 'react';
import type { FC } from 'react';
import { useCollectMetadata, useCollectDetails, useProblemStats, useUpdateLanguage } from '../../../hooks/api/useAdmin';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';
import { BookOpen, Minus, Maximize, Languages } from 'lucide-react';
import { toast } from 'sonner';

export const ProblemCollector: FC = () => {
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [errors, setErrors] = useState<{ start?: string; end?: string }>({});

    const collectMetadataMutation = useCollectMetadata();
    const collectDetailsMutation = useCollectDetails();
    const updateLanguageMutation = useUpdateLanguage();
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

    const handleUpdateLanguage = async () => {
        const confirmed = window.confirm(
            '모든 문제의 언어 정보를 업데이트하시겠습니까?\n\n' +
            '이 작업은 시간이 오래 걸릴 수 있습니다.\n' +
            '(문제 수에 따라 수 분 ~ 수십 분 소요)'
        );

        if (!confirmed) {
            return;
        }

        try {
            const result = await updateLanguageMutation.mutateAsync();
            toast.success(`언어 정보가 성공적으로 업데이트되었습니다. (${result.updatedCount}개 문제)`);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('언어 정보 업데이트에 실패했습니다.');
            }
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

            {/* 언어 정보 최신화 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Languages className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    문제 언어 정보 최신화
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    DB에 저장된 모든 문제의 언어 정보를 재판별하여 업데이트합니다. 기존 크롤링 데이터는 유지하고 language 필드만 업데이트합니다.
                    <br />
                    <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
                        (소요 시간: 문제 수에 따라 수 분 ~ 수십 분)
                    </span>
                </p>
                {updateLanguageMutation.isPending && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                            언어 정보를 업데이트하는 중입니다. 이 작업은 시간이 오래 걸릴 수 있습니다.
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            페이지를 닫지 마세요.
                        </p>
                    </div>
                )}
                <Button
                    onClick={handleUpdateLanguage}
                    variant="primary"
                    isLoading={updateLanguageMutation.isPending}
                    className="flex items-center gap-2"
                >
                    {updateLanguageMutation.isPending ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            업데이트 중...
                        </>
                    ) : (
                        <>
                            <Languages className="w-4 h-4" />
                            언어 정보 최신화 시작
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

