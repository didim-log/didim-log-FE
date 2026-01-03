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

                        <Button onClick={handleGoToStudy} variant="primary" size="lg" className="tour-problem-timer tour-timer-btn tour-problem-start-btn w-full sm:w-auto">
                            문제 풀기 시작 →
                        </Button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};


