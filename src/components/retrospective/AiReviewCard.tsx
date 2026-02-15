/**
 * AI 리뷰 카드 컴포넌트
 * 로그의 코드에 대한 AI 한 줄 리뷰를 상단에 표시합니다.
 */

import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { logApi } from '../../api/endpoints/log.api';
import type { AiReviewResponse } from '../../types/api/log.types';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import { useAiUsage } from '../../hooks/api/useAiUsage';
import { isApiError } from '../../types/api/common.types';

interface AiReviewCardProps {
    logId?: string | null;
    code?: string;
    isSuccess?: boolean;
    problemId?: string;
    problemTitle?: string;
    forceVisible?: boolean;
}

/**
 * AI 리뷰 카드 컴포넌트
 * 
 * @param logId - 로그 ID (선택, 있으면 바로 AI 리뷰 조회)
 * @param code - 코드 (선택, logId가 없으면 코드로 로그 생성 후 AI 리뷰 요청)
 * @param isSuccess - 풀이 성공 여부 (선택)
 * @param problemId - 문제 ID (선택, 로그 생성 시 사용)
 * @param problemTitle - 문제 제목 (선택, 로그 생성 시 사용)
 */
export const AiReviewCard: FC<AiReviewCardProps> = ({ 
    logId, 
    code, 
    isSuccess, 
    problemId, 
    problemTitle,
    forceVisible = false,
}) => {
    const [review, setReview] = useState<string | null>(null);
    const [cached, setCached] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [currentLogId, setCurrentLogId] = useState<string | null>(logId || null);
    const [feedbackStatus, setFeedbackStatus] = useState<'LIKE' | 'DISLIKE' | null>(null);
    const [showDislikeModal, setShowDislikeModal] = useState<boolean>(false);
    const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
    
    const { data: aiUsage, refetch: refetchAiUsage } = useAiUsage();

    // logId로 AI 리뷰 조회
    const fetchAiReviewByLogId = async (targetLogId: string) => {
        setLoading(true);
        setError(null);
        
        let pollInterval: ReturnType<typeof setTimeout> | null = null;
        let retryCount = 0;
        const MAX_RETRIES = 20;
        const POLL_INTERVAL = 3000;

        const fetchAiReview = async (): Promise<void> => {
            try {
                const response: AiReviewResponse = await logApi.getAiReview(targetLogId);

                // AI 리뷰가 생성 중인지 확인
                if (
                    !response.cached &&
                    response.review.includes('AI review is being generated')
                ) {
                    setIsGenerating(true);
                    retryCount++;

                    // 최대 재시도 횟수 초과 시 에러 표시
                    if (retryCount >= MAX_RETRIES) {
                        setError('AI 리뷰 생성 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
                        setIsGenerating(false);
                        setLoading(false);
                        if (pollInterval) {
                            clearInterval(pollInterval);
                        }
                        return;
                    }

                    // 3초 후 재시도
                    pollInterval = setTimeout(fetchAiReview, POLL_INTERVAL);
                    return;
                }

                // 리뷰 완료
                setReview(response.review);
                setCached(response.cached);
                setIsGenerating(false);
                setLoading(false);
                
                // AI 사용량 갱신
                refetchAiUsage();
                
                if (pollInterval) {
                    clearInterval(pollInterval);
                }
            } catch (err: unknown) {
                // AI 사용량 제한 관련 에러 처리
                const errorCode = isApiError(err) ? err.response?.data?.code : undefined;
                const errorMessage = isApiError(err) ? err.response?.data?.message : undefined;
                
                if (errorCode === 'AI_USER_LIMIT_EXCEEDED' || errorCode === 'AI_GLOBAL_LIMIT_EXCEEDED' || errorCode === 'AI_SERVICE_DISABLED') {
                    const finalMessage = errorMessage || 'AI 서비스를 사용할 수 없습니다.';
                    setError(finalMessage);
                    toast.error(finalMessage);
                } else {
                    const finalMessage = err instanceof Error
                        ? err.message
                        : 'AI 리뷰를 불러올 수 없습니다.';
                    setError(finalMessage);
                }
                
                setIsGenerating(false);
                setLoading(false);
                
                if (pollInterval) {
                    clearInterval(pollInterval);
                }
            }
        };

        fetchAiReview();
    };

    // logId가 있으면 currentLogId에만 설정 (자동 조회하지 않음)
    useEffect(() => {
        if (!logId) {
            return;
        }
        if (currentLogId) {
            return;
        }
        setCurrentLogId(logId);
    }, [logId, currentLogId]);

    // AI 리뷰 요청 (logId가 있으면 바로 조회, 없으면 로그 생성 후 조회)
    const handleRequestAiReview = async () => {
        setLoading(true);
        setError(null);
        setReview(null);

        try {
            let targetLogId = currentLogId;

            // logId가 없고 code가 있으면 로그 생성
            if (!targetLogId && code) {
                if (code.trim().length < 10) {
                    setError('코드가 너무 짧습니다. 최소 10자 이상의 코드가 필요합니다.');
                    setLoading(false);
                    return;
                }

                const title = problemId && problemTitle 
                    ? `${problemId}. ${problemTitle}` 
                    : '코드 리뷰';
                
                const created = await logApi.createLog({
                    title,
                    content: 'AI 리뷰를 위한 코드 제출',
                    code,
                    isSuccess: isSuccess ?? null,
                });

                targetLogId = created.id;
                setCurrentLogId(targetLogId);
            }

            // logId가 없으면 에러
            if (!targetLogId) {
                setError('로그 ID 또는 코드가 필요합니다.');
                setLoading(false);
                return;
            }

            // AI 리뷰 요청
            await fetchAiReviewByLogId(targetLogId);
            
            // AI 사용량 갱신
            refetchAiUsage();
        } catch (err: unknown) {
            // AI 사용량 제한 관련 에러 처리
            const errorCode = isApiError(err) ? err.response?.data?.code : undefined;
            const errorMessage = isApiError(err) ? err.response?.data?.message : undefined;
            
            if (errorCode === 'AI_USER_LIMIT_EXCEEDED' || errorCode === 'AI_GLOBAL_LIMIT_EXCEEDED' || errorCode === 'AI_SERVICE_DISABLED') {
                setError(errorMessage || 'AI 서비스를 사용할 수 없습니다.');
                toast.error(errorMessage || 'AI 서비스를 사용할 수 없습니다.');
            } else {
                setError(errorMessage || 'AI 리뷰를 요청할 수 없습니다.');
            }
            
            setLoading(false);
        }
    };

    // 좋아요 피드백 처리
    const handleLikeFeedback = async () => {
        if (!currentLogId || submittingFeedback || feedbackStatus !== null) {
            return;
        }

        setSubmittingFeedback(true);
        try {
            await logApi.submitFeedback(currentLogId, { status: 'LIKE' });
            setFeedbackStatus('LIKE');
            toast.success('피드백 감사합니다!');
        } catch {
            toast.error('피드백 제출에 실패했습니다.');
        } finally {
            setSubmittingFeedback(false);
        }
    };

    // 싫어요 클릭 처리
    const handleDislikeClick = () => {
        if (submittingFeedback || feedbackStatus !== null) {
            return;
        }
        setShowDislikeModal(true);
    };

    // 싫어요 피드백 처리
    const handleDislikeFeedback = async (reason: string) => {
        if (!currentLogId || submittingFeedback || feedbackStatus !== null) {
            return;
        }

        setSubmittingFeedback(true);
        setShowDislikeModal(false);
        try {
            await logApi.submitFeedback(currentLogId, { status: 'DISLIKE', reason });
            setFeedbackStatus('DISLIKE');
            toast.success('피드백 감사합니다. 더 나은 서비스를 위해 노력하겠습니다.');
        } catch {
            toast.error('피드백 제출에 실패했습니다.');
        } finally {
            setSubmittingFeedback(false);
        }
    };

    const hasEnoughCode = Boolean(code && code.trim().length >= 10);
    const canRequestReview = Boolean(currentLogId || hasEnoughCode);

    // 리뷰가 없고 (logId/code가 있거나 온보딩 강제 노출인 경우): 버튼 표시
    if (!review && (currentLogId || code || forceVisible)) {
        return (
            <div className="mb-6 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
                        <svg
                            className="h-6 w-6 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 2L2 7L12 12L22 7L12 2Z"
                                fill="currentColor"
                            />
                            <path
                                d="M2 17L12 22L22 17L12 12L2 17Z"
                                fill="currentColor"
                            />
                            <path
                                d="M2 12L12 17L22 12L12 7L2 12Z"
                                fill="currentColor"
                                opacity="0.7"
                            />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                            🤖 AI 인사이트
                        </h3>
                        <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                            코드를 분석하여 한 줄 리뷰를 받아보세요.
                        </p>
                        {aiUsage ? (
                            <>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                        AI 리뷰 사용량: <span className="font-semibold">{aiUsage.usage} / {aiUsage.limit}</span>
                                    </span>
                                    {aiUsage.remaining > 0 && (
                                        <span className="text-xs text-green-600 dark:text-green-400">
                                            (남은 횟수: {aiUsage.remaining})
                                        </span>
                                    )}
                                </div>
                                {aiUsage.usage >= aiUsage.limit && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                        오늘 사용량을 모두 소진했습니다 ({aiUsage.limit}회).
                                    </p>
                                )}
                                {!aiUsage.isServiceEnabled && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                        AI 서비스가 점검 중입니다.
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                💡 AI 리뷰는 일일 제한이 있습니다.
                            </p>
                        )}
                        <Button
                            onClick={handleRequestAiReview}
                            disabled={loading || isGenerating || !canRequestReview || (aiUsage && (aiUsage.usage >= aiUsage.limit || !aiUsage.isServiceEnabled))}
                            variant="primary"
                            size="sm"
                            className="tour-ai-review-btn mt-3"
                            isLoading={loading || isGenerating}
                        >
                            {loading || isGenerating ? 'AI 리뷰 생성 중...' : (canRequestReview ? 'AI 리뷰 받기' : '코드 제출 후 이용 가능')}
                        </Button>
                        {!canRequestReview && (
                            <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                                먼저 코드와 제출 결과를 남기면 AI 리뷰를 받을 수 있어요.
                            </p>
                        )}
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            ⚠️ AI가 생성한 리뷰는 참고용이며, 정확하지 않을 수 있습니다.
                        </p>
                        {error && (
                            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // 로딩 상태
    if (loading || isGenerating) {
        return (
            <div className="mb-6 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                        <svg
                            className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                            🤖 AI 인사이트 분석 중...
                        </h3>
                        <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                            {isGenerating
                                ? '코드를 분석하고 있습니다. 잠시만 기다려주세요.'
                                : 'AI 리뷰를 불러오는 중...'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // 에러 상태
    if (error) {
        return (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-800 dark:bg-red-900/20">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                        <span className="text-xl">⚠️</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">
                            AI 리뷰 로드 실패
                        </h3>
                        <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                            {error}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // 리뷰 없음
    if (!review) {
        return null;
    }

    // 정상 리뷰 표시
    return (
        <div className="mb-6 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 shadow-sm dark:border-blue-800 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
                    <svg
                        className="h-6 w-6 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M12 2L2 7L12 12L22 7L12 2Z"
                            fill="currentColor"
                        />
                        <path
                            d="M2 17L12 22L22 17L12 12L2 17Z"
                            fill="currentColor"
                        />
                        <path
                            d="M2 12L12 17L22 12L12 7L2 12Z"
                            fill="currentColor"
                            opacity="0.7"
                        />
                    </svg>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                            🤖 AI 인사이트
                        </h3>
                        {cached && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                캐시됨
                            </span>
                        )}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                        {review}
                    </p>
                    
                    {/* 피드백 버튼 */}
                    {currentLogId && (
                        <div className="mt-3 flex items-center gap-2">
                            <button
                                onClick={() => handleLikeFeedback()}
                                disabled={submittingFeedback || feedbackStatus !== null}
                                className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                    feedbackStatus === 'LIKE'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                                } ${submittingFeedback || feedbackStatus !== null ? 'cursor-not-allowed opacity-50' : ''}`}
                            >
                                👍 좋아요
                            </button>
                            <button
                                onClick={() => handleDislikeClick()}
                                disabled={submittingFeedback || feedbackStatus !== null}
                                className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                    feedbackStatus === 'DISLIKE'
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                                } ${submittingFeedback || feedbackStatus !== null ? 'cursor-not-allowed opacity-50' : ''}`}
                            >
                                👎 개선 필요
                            </button>
                        </div>
                    )}

                    {/* 싫어요 이유 선택 모달 */}
                    {showDislikeModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    개선이 필요한 이유를 선택해주세요
                                </h3>
                                <div className="space-y-2">
                                    {[
                                        { value: 'INACCURATE', label: '분석이 틀렸어요' },
                                        { value: 'GENERIC', label: '내용이 너무 뻔해요' },
                                        { value: 'NOT_HELPFUL', label: '도움이 안 돼요' },
                                    ].map((reason) => (
                                        <button
                                            key={reason.value}
                                            onClick={() => handleDislikeFeedback(reason.value)}
                                            disabled={submittingFeedback}
                                            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                        >
                                            {reason.label}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowDislikeModal(false)}
                                    className="mt-4 w-full rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    )}

                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        ⚠️ AI가 생성한 리뷰는 참고용이며, 정확하지 않을 수 있습니다.
                    </p>
                </div>
            </div>
        </div>
    );
};
