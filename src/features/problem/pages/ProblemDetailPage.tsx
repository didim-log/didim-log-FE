/**
 * 문제 상세 페이지
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useProblemDetail } from '../../../hooks/api/useProblem';
import { ProblemDetail } from '../components/ProblemDetail';
import { Spinner } from '../../../components/ui/Spinner';
import { Layout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';

export const ProblemDetailPage: React.FC = () => {
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
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <ProblemDetail problem={problem} isBlurred={false} />

                    <div className="mt-6 flex justify-end">
                        <Button onClick={handleGoToStudy} variant="primary" size="lg">
                            문제 풀기 시작 →
                        </Button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

