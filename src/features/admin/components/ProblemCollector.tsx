/**
 * 문제 크롤링 제어 컴포넌트
 */

import { useState, useEffect } from 'react';
import type { FC } from 'react';
import {
    useCollectMetadata,
    useCollectDetails,
    useProblemStats,
    useUpdateLanguage,
    useMetadataCollectStatus,
    useLanguageUpdateStatus,
} from '../../../hooks/api/useAdmin';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';
import { BookOpen, Minus, Maximize, Languages } from 'lucide-react';
import { toast } from 'sonner';

export const ProblemCollector: FC = () => {
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [errors, setErrors] = useState<{ start?: string; end?: string }>({});
    const [metadataJobId, setMetadataJobId] = useState<string | null>(null);
    const [languageJobId, setLanguageJobId] = useState<string | null>(null);

    const collectMetadataMutation = useCollectMetadata();
    const collectDetailsMutation = useCollectDetails();
    const updateLanguageMutation = useUpdateLanguage();
    const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useProblemStats();
    const suggestedStart = stats?.maxProblemId ? String(stats.maxProblemId + 1) : '';

    // 작업 상태 조회
    const metadataStatus = useMetadataCollectStatus(metadataJobId);
    const languageStatus = useLanguageUpdateStatus(languageJobId);

    // 메타데이터 수집 완료 처리
    useEffect(() => {
        if (metadataStatus.data?.status === 'COMPLETED') {
            toast.success(
                `메타데이터 수집 완료: ${metadataStatus.data.successCount}개 성공, ${metadataStatus.data.failCount}개 실패`
            );
            setMetadataJobId(null);
            refetchStats();
            // 최대 ID 업데이트 후 자동으로 다음 시작 ID 설정
            const endNum = metadataStatus.data.endProblemId;
            if (endNum && stats?.maxProblemId && endNum > stats.maxProblemId) {
                setStart((endNum + 1).toString());
            }
            setEnd('');
        } else if (metadataStatus.data?.status === 'FAILED') {
            toast.error(`메타데이터 수집 실패: ${metadataStatus.data.errorMessage || '알 수 없는 오류'}`);
            setMetadataJobId(null);
        }
    }, [metadataStatus.data, refetchStats, stats?.maxProblemId]);

    // 언어 정보 업데이트 완료 처리
    useEffect(() => {
        if (languageStatus.data?.status === 'COMPLETED') {
            toast.success(
                `언어 정보 업데이트 완료: ${languageStatus.data.successCount}개 성공, ${languageStatus.data.failCount}개 실패`
            );
            setLanguageJobId(null);
        } else if (languageStatus.data?.status === 'FAILED') {
            toast.error(`언어 정보 업데이트 실패: ${languageStatus.data.errorMessage || '알 수 없는 오류'}`);
            setLanguageJobId(null);
        }
    }, [languageStatus.data]);

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

        const confirmed = window.confirm(
            `문제 ID ${startNum}부터 ${endNum}까지의 메타데이터를 수집하시겠습니까?\n\n` +
                `총 ${endNum - startNum + 1}개 문제를 수집합니다.\n` +
                `이 작업은 시간이 오래 걸릴 수 있습니다.`
        );

        if (!confirmed) {
            return;
        }

        try {
            const result = await collectMetadataMutation.mutateAsync({ start: startNum, end: endNum });
            setMetadataJobId(result.jobId);
            toast.success('메타데이터 수집 작업이 시작되었습니다.');
            setErrors({});
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`수집 시작 실패: ${error.message}`);
            } else {
                toast.error('수집 시작에 실패했습니다.');
            }
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
            setLanguageJobId(result.jobId);
            toast.success('언어 정보 업데이트 작업이 시작되었습니다.');
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`업데이트 시작 실패: ${error.message}`);
            } else {
                toast.error('언어 정보 업데이트 시작에 실패했습니다.');
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
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={collectMetadataMutation.isPending}
                        disabled={!!metadataJobId}
                    >
                        {collectMetadataMutation.isPending ? '작업 시작 중...' : '메타데이터 수집 시작'}
                    </Button>
                </form>

                {/* 진행 상황 표시 */}
                {metadataJobId && metadataStatus.data && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    진행률: {metadataStatus.data.progressPercentage}%
                                </span>
                                <span className="text-xs text-blue-600 dark:text-blue-400">
                                    {metadataStatus.data.processedCount}/{metadataStatus.data.totalCount}
                                </span>
                            </div>
                            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                                <div
                                    className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${metadataStatus.data.progressPercentage}%` }}
                                />
                            </div>
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                            {metadataStatus.data.startProblemId && metadataStatus.data.endProblemId && (
                                <p>
                                    범위: {metadataStatus.data.startProblemId} ~ {metadataStatus.data.endProblemId}
                                </p>
                            )}
                            <p>
                                성공: {metadataStatus.data.successCount}개 | 실패: {metadataStatus.data.failCount}개
                            </p>
                            {metadataStatus.data.estimatedRemainingSeconds && (
                                <p>
                                    예상 남은 시간: 약{' '}
                                    {Math.floor(metadataStatus.data.estimatedRemainingSeconds / 60)}분
                                </p>
                            )}
                            <p className="mt-2 text-blue-700 dark:text-blue-300 font-medium">
                                이 작업은 시간이 오래 걸릴 수 있습니다. 페이지를 닫지 마세요.
                            </p>
                        </div>
                    </div>
                )}

                {metadataStatus.data?.status === 'COMPLETED' && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                            ✅ 수집 완료: {metadataStatus.data.successCount}개 성공, {metadataStatus.data.failCount}개
                            실패
                        </p>
                    </div>
                )}

                {metadataStatus.data?.status === 'FAILED' && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                            ❌ 수집 실패: {metadataStatus.data.errorMessage || '알 수 없는 오류'}
                        </p>
                    </div>
                )}
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
                    DB에 저장된 모든 문제의 언어 정보를 재판별하여 업데이트합니다. 기존 크롤링 데이터는 유지하고
                    language 필드만 업데이트합니다.
                    <br />
                    <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
                        (소요 시간: 문제 수에 따라 수 분 ~ 수십 분)
                    </span>
                </p>
                <Button
                    onClick={handleUpdateLanguage}
                    variant="primary"
                    isLoading={updateLanguageMutation.isPending}
                    disabled={!!languageJobId}
                    className="flex items-center gap-2"
                >
                    {updateLanguageMutation.isPending ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            작업 시작 중...
                        </>
                    ) : (
                        <>
                            <Languages className="w-4 h-4" />
                            언어 정보 최신화 시작
                        </>
                    )}
                </Button>

                {/* 진행 상황 표시 */}
                {languageJobId && languageStatus.data && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    진행률: {languageStatus.data.progressPercentage}%
                                </span>
                                <span className="text-xs text-blue-600 dark:text-blue-400">
                                    {languageStatus.data.processedCount}/{languageStatus.data.totalCount}
                                </span>
                            </div>
                            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                                <div
                                    className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${languageStatus.data.progressPercentage}%` }}
                                />
                            </div>
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                            <p>
                                성공: {languageStatus.data.successCount}개 | 실패: {languageStatus.data.failCount}개
                            </p>
                            {languageStatus.data.estimatedRemainingSeconds && (
                                <p>
                                    예상 남은 시간: 약{' '}
                                    {Math.floor(languageStatus.data.estimatedRemainingSeconds / 60)}분
                                </p>
                            )}
                            <p className="mt-2 text-blue-700 dark:text-blue-300 font-medium">
                                이 작업은 시간이 오래 걸릴 수 있습니다. 페이지를 닫지 마세요.
                            </p>
                        </div>
                    </div>
                )}

                {languageStatus.data?.status === 'COMPLETED' && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                            ✅ 업데이트 완료: {languageStatus.data.successCount}개 성공, {languageStatus.data.failCount}
                            개 실패
                        </p>
                    </div>
                )}

                {languageStatus.data?.status === 'FAILED' && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                            ❌ 업데이트 실패: {languageStatus.data.errorMessage || '알 수 없는 오류'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

