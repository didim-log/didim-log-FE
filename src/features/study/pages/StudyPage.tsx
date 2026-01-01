/**
 * 학습 페이지
 */

import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProblemDetail } from '../../../hooks/api/useProblem';
import { useSubmitSolution } from '../../../hooks/api/useStudy';
import { useStaticTemplate } from '../../../hooks/api/useRetrospective';
import { CodeEditor } from '../components/CodeEditor';
import { Timer } from '../components/Timer';
import { ResultDisplay } from '../components/ResultDisplay';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { Layout } from '../../../components/layout/Layout';
import { useAuthStore } from '../../../stores/auth.store';
import type { SolutionSubmitResponse } from '../../../types/api/study.types';

const LANGUAGE_OPTIONS = [
    { value: 'text', label: 'Text' },
    { value: 'java', label: 'Java' },
    { value: 'python', label: 'Python' },
    { value: 'cpp', label: 'C++' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'swift', label: 'Swift' },
];

const PRIMARY_LANGUAGE_MAP: Record<string, string> = {
    JAVA: 'java',
    PYTHON: 'python',
    KOTLIN: 'kotlin',
    JAVASCRIPT: 'javascript',
    CPP: 'cpp',
    GO: 'go',
    RUST: 'rust',
    SWIFT: 'swift',
    TEXT: 'text',
};

export const StudyPage: FC = () => {
    const { problemId } = useParams<{ problemId: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { data: problem, isLoading, error } = useProblemDetail(problemId || '');
    const submitSolutionMutation = useSubmitSolution();
    const staticTemplateMutation = useStaticTemplate();

    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('text'); // 초기값은 'text', useEffect에서 업데이트
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [timeTaken, setTimeTaken] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [submitResult, setSubmitResult] = useState<SolutionSubmitResponse | null>(null);

    // 사용자의 주 언어를 스토어에서 가져와서 언어 선택 초기값으로 적용
    useEffect(() => {
        if (!user?.primaryLanguage) {
            return;
        }

        const normalizedLang = user.primaryLanguage.toUpperCase();
        const mappedLanguage = PRIMARY_LANGUAGE_MAP[normalizedLang] || 'text';
        setLanguage((prev) => (prev === 'text' ? mappedLanguage : prev));
    }, [user?.primaryLanguage]);

    useEffect(() => {
        // 페이지 진입 시 타이머 시작
        setIsTimerRunning(true);
    }, []);

    const handleTimeUpdate = (seconds: number) => {
        setTimeTaken(seconds);
    };

    const handleSubmit = async (success: boolean) => {
        if (!problemId) {
            return;
        }

        setIsTimerRunning(false);
        setIsSuccess(success);

        try {
            const result = await submitSolutionMutation.mutateAsync({
                problemId,
                timeTaken,
                isSuccess: success,
            });
            setSubmitResult(result);
            setShowResult(true);
        } catch (error) {
            console.error('Submit failed:', error);
            // 에러 처리
        }
    };

    const handleWriteRetrospective = async () => {
        if (!problemId || !user?.id) {
            return;
        }

        try {
            // 정적 템플릿 가져오기
            const templateResult = await staticTemplateMutation.mutateAsync({
                code,
                problemId,
                isSuccess,
                errorMessage: isSuccess ? null : '제출 실패',
            });

            // 회고 작성 페이지로 이동 (템플릿과 함께)
            navigate('/retrospectives/write', {
                state: {
                    problemId,
                    template: templateResult.template,
                    isSuccess,
                    code,
                },
            });
        } catch (error) {
            console.error('Template fetch failed:', error);
            // 템플릿 없이 회고 작성 페이지로 이동
            navigate('/retrospectives/write', {
                state: {
                    problemId,
                    isSuccess,
                    code,
                },
            });
        }
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
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* 헤더 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {problem.id}. {problem.title}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                                        {problem.category}
                                    </span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm">
                                        {problem.difficulty}
                                    </span>
                                </div>
                            </div>
                            <Timer isRunning={isTimerRunning} onTimeUpdate={handleTimeUpdate} />
                        </div>
                    </div>

                    {/* 코드 에디터 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                프로그래밍 언어
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {LANGUAGE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <CodeEditor value={code} onChange={setCode} language={language} />
                    </div>

                    {/* 제출 버튼 */}
                    <div className="flex justify-end gap-3">
                        <Button
                            onClick={() => handleSubmit(false)}
                            variant="outline"
                            size="lg"
                            isLoading={submitSolutionMutation.isPending}
                        >
                            실패로 제출
                        </Button>
                        <Button
                            onClick={() => handleSubmit(true)}
                            variant="primary"
                            size="lg"
                            isLoading={submitSolutionMutation.isPending}
                        >
                            성공으로 제출
                        </Button>
                    </div>
                </div>

                {/* 결과 모달 */}
                {showResult && submitResult && (
                    <ResultDisplay
                        result={submitResult}
                        isSuccess={isSuccess}
                        onWriteRetrospective={handleWriteRetrospective}
                        onClose={() => setShowResult(false)}
                    />
                )}
            </div>
        </Layout>
    );
};

