/**
 * 문제 상세 페이지
 */

import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProblemDetail } from '../../../hooks/api/useProblem';
import { ProblemDetail } from '../components/ProblemDetail';
import { Spinner } from '../../../components/ui/Spinner';
import { Layout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';

export const ProblemDetailPage: FC = () => {
    const { problemId } = useParams<{ problemId: string }>();
    const navigate = useNavigate();
    const { data: problem, isLoading, error } = useProblemDetail(problemId || '');

    const handleGoToStudy = () => {
        navigate(`/study/${problemId}`);
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <Spinner />
                </div>
            </Layout>
        );
    }

    if (error || !problem) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">오류가 발생했습니다</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {error instanceof Error ? error.message : '문제를 불러올 수 없습니다.'}
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-4">
                    {/* 저작권 경고 박스 */}
                    {problem.descriptionHtml && problem.descriptionHtml.trim().length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <svg
                                    className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
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
                                <div className="flex-1">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                                        저작권 안내
                                    </p>
                                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                        문제의 저작권은 원작자에게 있습니다. 정확한 내용은{' '}
                                        <a
                                            href={problem.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline font-medium hover:text-yellow-900 dark:hover:text-yellow-100"
                                        >
                                            백준 사이트
                                        </a>
                                        를 참고하세요.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="tour-problem-detail">
                        <ProblemDetail problem={problem} isBlurred={false} />
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                        {/* 백준에서 보기 버튼 강조 (모바일에서도 보이도록) */}
                        <a
                            href={problem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                            백준에서 보기
                        </a>

                        <Button onClick={handleGoToStudy} variant="primary" size="lg" className="tour-problem-timer tour-problem-start-btn w-full sm:w-auto">
                            문제 풀기 시작 →
                        </Button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};


