import { Link, useParams } from 'react-router-dom';
import { Layout } from '../../../components/layout/Layout';
import { ProblemDetail } from '../../problem/components/ProblemDetail';
import { DemoHeader } from '../components/DemoHeader';
import { DemoModeBar } from '../components/DemoModeBar';
import { DEMO_PROBLEM_DETAILS } from '../data/demo.fixture';

export const DemoProblemDetailPage = () => {
    const { problemId } = useParams<{ problemId: string }>();
    const problem = problemId ? DEMO_PROBLEM_DETAILS[problemId] : undefined;

    return (
        <div data-testid="demo-problem-detail-page">
            <Layout
                header={(
                    <>
                        <DemoHeader />
                        <DemoModeBar step={4} />
                    </>
                )}
                footer={null}
                enableTour={false}
            >
                <div className="min-h-screen bg-gray-50 px-4 py-4 dark:bg-gray-900 sm:py-8">
                    <div className="mx-auto max-w-4xl space-y-4">
                        {problem ? (
                            <>
                                <ProblemDetail problem={problem} isBlurred={false} />
                                <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-blue-900 dark:bg-blue-950/50">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">이 문제를 실제로 풀어볼까요?</p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                            로그인하면 풀이 시간과 결과를 기록하고 회고까지 이어갈 수 있습니다.
                                        </p>
                                    </div>
                                    <Link
                                        to="/login"
                                        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus-visible:ring-offset-gray-900"
                                    >
                                        실제 로그인하고 문제 풀기
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-lg border border-gray-200 bg-white p-10 text-center shadow-md dark:border-gray-700 dark:bg-gray-800">
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">샘플 문제를 찾을 수 없습니다</h1>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">추천 대시보드에서 다른 문제를 선택해 주세요.</p>
                                <Link
                                    to="/demo/dashboard"
                                    className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                >
                                    추천 문제로 돌아가기
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </Layout>
        </div>
    );
};
