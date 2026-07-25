/**
 * 학습 페이지
 */

import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProblemDetail } from '../../../hooks/api/useProblem';
import { useSubmitSolution } from '../../../hooks/api/useStudy';
import { logApi } from '../../../api/endpoints/log.api';
import { CodeEditor } from '../components/CodeEditor';
import { Timer } from '../components/Timer';
import { ResultDisplay } from '../components/ResultDisplay';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { Layout } from '../../../components/layout/Layout';
import { useAuthStore } from '../../../stores/auth.store';
import { useOnboardingStore } from '../../../stores/onboarding.store';
import type { SolutionSubmitResponse } from '../../../types/api/study.types';
import { ChevronLeft, ExternalLink, Clock, Pause, Play } from 'lucide-react';
import { formatTierFromDifficulty, getTierColor } from '../../../utils/tier';
import { getLanguageLabel, getLanguageColor } from '../../../constants/languageColors';

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
    const { completePhase } = useOnboardingStore();
    const { data: problem, isLoading, error } = useProblemDetail(problemId || '');
    const submitSolutionMutation = useSubmitSolution();

    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('text'); // 초기값은 'text', useEffect에서 업데이트
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [timeTaken, setTimeTaken] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [submitResult, setSubmitResult] = useState<SolutionSubmitResponse | null>(null);
    const [isSubmittingSuccess, setIsSubmittingSuccess] = useState(false);
    const [isSubmittingFail, setIsSubmittingFail] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false); // 제출 완료 여부
    const [actionError, setActionError] = useState<string | null>(null);

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
        if (seconds > 0) {
            setActionError(null);
        }
    };

    const handleCodeChange = (nextCode: string) => {
        setCode(nextCode);
        setActionError(null);
    };

    const handleToggleTimer = () => {
        setIsTimerRunning((prev) => !prev);
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleSubmit = async (success: boolean) => {
        if (!problemId) {
            return;
        }

        // 이미 제출된 경우 중복 제출 방지
        if (isSubmitted) {
            return;
        }

        // 코드가 비어있으면 제출 불가
        if (!code || code.trim().length === 0) {
            setActionError('코드를 입력해주세요.');
            return;
        }

        // 타이머가 0이면 제출 불가
        if (timeTaken === 0) {
            setActionError(
                '타이머가 0초입니다. 페이지를 새로고침하여 타이머를 시작한 후 다시 시도해주세요.'
            );
            return;
        }

        // 개별 로딩 상태 설정
        if (success) {
            setIsSubmittingSuccess(true);
        } else {
            setIsSubmittingFail(true);
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
            setIsSubmitted(true); // 제출 완료 표시
            setActionError(null);
            
            // 온보딩 Phase 완료 처리
            completePhase('study');
        } catch {
            // 에러 발생 시에도 제출 완료로 표시하여 중복 제출 방지
            setIsSubmitted(true);
        } finally {
            // 로딩 상태 해제
            setIsSubmittingSuccess(false);
            setIsSubmittingFail(false);
        }
    };

    const handleWriteRetrospective = async () => {
        if (!problemId || !user?.id || !problem) {
            return;
        }

        // 타이머가 0이면 회고 작성 불가
        if (timeTaken === 0) {
            setActionError(
                '타이머가 0초입니다. 페이지를 새로고침하여 타이머를 시작한 후 다시 시도해주세요.'
            );
            return;
        }

        let logId: string | null = null;

        try {
            // 0) 로그 생성 (AI 한 줄 리뷰를 위해 선행)
            // 실패해도 회고 작성은 가능해야 하므로, 실패 시 logId 없이 진행합니다.
            try {
                const created = await logApi.createLog({
                    title: `${problemId}. ${problem.title}`,
                    content: 'AI 리뷰를 위한 코드 제출', // @NotBlank 검증을 통과하기 위한 의미 있는 값
                    code,
                    isSuccess,
                });
                
                logId = created.id;
            } catch {
                // Log creation failed, proceed without logId
                logId = null;
            }

            // 풀이 시간 포맷팅 (초 -> "Xm Ys" 형식)
            const formatSolveTime = (seconds: number): string => {
                if (seconds < 60) {
                    return `${seconds}초`;
                }
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                if (remainingSeconds === 0) {
                    return `${minutes}분`;
                }
                return `${minutes}분 ${remainingSeconds}초`;
            };

            // 회고 작성 페이지로 이동
            navigate('/retrospectives/write', {
                state: {
                    problemId,
                    isSuccess,
                    status: isSuccess ? 'SOLVED' : 'FAIL', // 명시적 status 전달
                    code,
                    logId,
                    solveTime: timeTaken > 0 ? formatSolveTime(timeTaken) : null,
                    language, // 선택한 언어 정보 전달
                },
            });
        } catch {
            // 에러 발생 시에도 회고 작성 페이지로 이동
            navigate('/retrospectives/write', {
                state: {
                    problemId,
                    isSuccess,
                    status: isSuccess ? 'SOLVED' : 'FAIL', // 명시적 status 전달
                    code,
                    logId,
                    language, // 선택한 언어 정보 전달
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
                <div className="max-w-6xl mx-auto">
                    {/* 🎨 Global Header - 표준화된 네비게이션 */}
                    <div className="flex items-center justify-between mb-6">
                        {/* 왼쪽: 네비게이션 & 제목 */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                                {/* 이전 버튼 (아이콘만) */}
                                <button
                                    onClick={handleGoBack}
                                    className="flex-shrink-0 p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    title="이전 페이지로"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                {/* 문제 번호 & 제목 */}
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {problem.id}. {problem.title}
                                    </h1>
                                    {/* 태그 */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm font-medium">
                                            {problem.category}
                                        </span>
                                        <span className={`px-2 py-1 rounded text-sm font-medium whitespace-nowrap ${getTierColor(problem.difficulty)}`}>
                                            {formatTierFromDifficulty(problem.difficulty, problem.difficultyLevel)}
                                        </span>
                                        {/* 주 프로그래밍 언어 배지 */}
                                        {language && language !== 'text' && (() => {
                                            const languageColors = getLanguageColor(language);
                                            return (
                                                <span className={`px-2 py-1 rounded text-sm font-medium ${languageColors.bg} ${languageColors.text} ${languageColors.darkBg} ${languageColors.darkText}`}>
                                                    {getLanguageLabel(language)}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 오른쪽: 도구들 */}
                        <div className="flex items-center gap-3 ml-4">
                            {/* 문제 보기 버튼 (Ghost 스타일) */}
                            {problem.url && (
                                <a
                                    href={problem.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-300 dark:border-gray-600"
                                    title="백준 온라인 저지에서 문제 보기"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    문제 보기
                                </a>
                            )}
                            {/* 타이머 (Badge 스타일) */}
                            <div className="tour-timer-btn flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                <Timer 
                                    isRunning={isTimerRunning} 
                                    onTimeUpdate={handleTimeUpdate}
                                />
                                <button 
                                    onClick={handleToggleTimer} 
                                    className="ml-1 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    title={isTimerRunning ? '일시정지' : '재개'}
                                >
                                    {isTimerRunning ? (
                                        <Pause className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                    ) : (
                                        <Play className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 📦 통합 에디터 카드 */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        {/* Header Section - 언어 선택 */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                프로그래밍 언어
                            </label>
                            <select
                                data-testid="study-language-select"
                                aria-label="프로그래밍 언어"
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
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <span>ℹ️</span>
                                <span>올바른 구문 강조(Syntax Highlighting)를 위해 작성한 코드의 언어를 정확히 선택해주세요. (기본값: Text)</span>
                            </p>
                        </div>

                        {/* Body Section - 코드 에디터 */}
                        <div className="p-4">
                            <CodeEditor value={code} onChange={handleCodeChange} language={language} />
                        </div>

                        {/* Footer Section - 액션 버튼 */}
                        <div className="tour-submit-buttons p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-2">
                            {actionError && (
                                <p className="text-xs text-red-600 dark:text-red-400">
                                    {actionError}
                                </p>
                            )}
                            <div className="flex justify-end gap-3">
                                {/* 실패 제출 (Outline/Ghost) */}
                                <Button
                                    onClick={() => handleSubmit(false)}
                                    variant="outline"
                                    size="lg"
                                    isLoading={isSubmittingFail}
                                    disabled={isSubmitted || isSubmittingSuccess || isSubmittingFail}
                                    className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    {isSubmitted ? '제출 완료' : '실패로 제출'}
                                </Button>
                                {/* 성공 제출 (Primary Solid) */}
                                <Button
                                    onClick={() => handleSubmit(true)}
                                    variant="primary"
                                    size="lg"
                                    isLoading={isSubmittingSuccess}
                                    disabled={isSubmitted || isSubmittingSuccess || isSubmittingFail}
                                >
                                    {isSubmitted ? '제출 완료' : '성공으로 제출'}
                                </Button>
                            </div>
                        </div>
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
