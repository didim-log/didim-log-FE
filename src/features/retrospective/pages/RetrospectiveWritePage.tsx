/**
 * 회고 작성 페이지
 */

import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateRetrospective, useUpdateRetrospective, useStaticTemplate } from '../../../hooks/api/useRetrospective';
import { useProblemDetail } from '../../../hooks/api/useProblem';
import { RetrospectiveEditor } from '../components/RetrospectiveEditor';
import { Spinner } from '../../../components/ui/Spinner';
import { Layout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { formatTierFromDifficulty, getTierColor } from '../../../utils/tier';
import { LanguageBadge } from '../../../components/common/LanguageBadge';
import { toast } from 'sonner';
import { getErrorMessage, isApiError } from '../../../types/api/common.types';
import { useOnboardingStore } from '../../../stores/onboarding.store';
import { Copy, ChevronLeft } from 'lucide-react';
import type { RetrospectiveRequest } from '../../../types/api/retrospective.types';
import { AiReviewCard } from '../../../components/retrospective/AiReviewCard';

export const RetrospectiveWritePage: FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const createMutation = useCreateRetrospective();
    const updateMutation = useUpdateRetrospective();
    const staticTemplateMutation = useStaticTemplate();
    const { completePhase } = useOnboardingStore();

    const isOnboarding = searchParams.get('onboarding') === 'true';

    const [retrospectiveId, setRetrospectiveId] = useState<string | null>(null);
    const [problemId, setProblemId] = useState<string>('');
    const [template, setTemplate] = useState<string>('');
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [content, setContent] = useState<string>('');
    const [summary, setSummary] = useState<string>(''); // 한 줄 요약 상태 추가
    const [code, setCode] = useState<string>('');
    const [logId, setLogId] = useState<string | null>(null);
    const [solveTime, setSolveTime] = useState<string | null>(null);
    const [language, setLanguage] = useState<string>('text'); // 선택한 언어 정보
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
    const [hasLoadedTemplate, setHasLoadedTemplate] = useState(false);

    // 문제 상세 정보 조회
    const { data: problem, isLoading: isProblemLoading } = useProblemDetail(problemId);

    const loadTemplate = useCallback(async (pid: string, code: string, success: boolean) => {
        if (hasLoadedTemplate) {
            return; // 이미 로드했으면 중복 호출 방지
        }

        setIsLoadingTemplate(true);
        try {
            const result = await staticTemplateMutation.mutateAsync({
                code: code,
                problemId: pid,
                isSuccess: success,
                errorMessage: success ? null : '제출 실패',
            });
            setTemplate(result.template);
            setContent(result.template);
            setHasLoadedTemplate(true);
        } catch {
            // Fallback: 최소한의 기본 템플릿 제공
            const fallbackTemplate = `# ${pid}번 문제 회고\n\n## 접근 방법\n\n<!-- 여기에 접근 방법을 작성하세요 -->\n\n## 복잡도 분석\n\n<!-- 여기에 시간/공간 복잡도를 작성하세요 -->\n\n## 제출한 코드\n\n\`\`\`\n${code}\n\`\`\`\n`;
            setContent(fallbackTemplate);
            setHasLoadedTemplate(true);
        } finally {
            setIsLoadingTemplate(false);
        }
    }, [hasLoadedTemplate, staticTemplateMutation]);

    // 온보딩 모드: 자동으로 폼 열기 (AI 버튼이 보이도록)
    useEffect(() => {
        if (isOnboarding && !isSuccess && problemId) {
            // 온보딩 모드이고 문제 ID가 있으면 자동으로 SUCCESS 상태로 설정
            setIsSuccess(true);
        }
    }, [isOnboarding, isSuccess, problemId]);

    useEffect(() => {
        // location.state에서 전달된 데이터 확인
        const state = location.state as {
            retrospectiveId?: string;
            problemId?: string;
            template?: string;
            isSuccess?: boolean;
            code?: string;
            logId?: string | null;
            solveTime?: string | null;
            language?: string;
            initialSummary?: string; // 한 줄 요약 추가
            initialSolvedCategory?: string; // 풀이 전략 태그 추가
            status?: string; // 추가: 명시적 status 전달 (SOLVED/FAIL)
        } | null;

        if (state) {
            const { retrospectiveId: retroId, problemId: pid, template: temp, isSuccess: success, code: codeValue, logId: createdLogId, solveTime: stateSolveTime, language: stateLanguage, initialSummary: stateSummary, status: stateStatus } = state;
            
            // 수정 모드인 경우 retrospectiveId 설정
            if (retroId) {
                setRetrospectiveId(retroId);
            }
            
            // problemId 설정 (최우선)
            if (pid) {
                setProblemId(pid);
            }
            
            // isSuccess 설정: status 우선, 없으면 isSuccess 사용, 둘 다 없으면 false
            const finalIsSuccess = stateStatus === 'SOLVED' || stateStatus === 'SUCCESS' 
                ? true 
                : (success !== undefined ? success : false);
            setIsSuccess(finalIsSuccess);
            setLogId(createdLogId ?? null);
            setCode(codeValue ?? '');
            setSolveTime(stateSolveTime ?? null);
            setLanguage(stateLanguage ?? 'text');
            setSummary(stateSummary ?? ''); // 한 줄 요약 설정
            
            // 템플릿 로드 우선순위:
            // 1. 템플릿이 이미 있으면 즉시 사용
            if (temp) {
                setTemplate(temp);
                setContent(temp);
                setHasLoadedTemplate(true);
            }
            // 2. 템플릿이 없고 code와 isSuccess가 있으면 즉시 API 호출
            else if (pid && codeValue !== undefined && codeValue !== null && codeValue !== '' && success !== undefined) {
                // 즉시 템플릿 로드 (비동기)
                loadTemplate(pid, codeValue, success).catch(() => {
                    // Template load failed, fallback template will be used
                });
            }
            // 3. 문제 ID만 있는 경우 기본 템플릿 제공
            else if (pid) {
                const basicTemplate = `# ${pid}번 문제 회고\n\n## 접근 방법\n\n<!-- 여기에 접근 방법을 작성하세요 -->\n\n## 복잡도 분석\n\n<!-- 여기에 시간/공간 복잡도를 작성하세요 -->\n\n`;
                setContent(basicTemplate);
                setHasLoadedTemplate(true);
            }
        }
    }, [location.state, loadTemplate]);


    const handleCopyMarkdown = async () => {
        if (!content.trim() || !problemId) {
            toast.error('복사할 내용이 없습니다.');
            return;
        }

        // AI Generated 문구 제거 (푸터는 백엔드/AI에서 이미 포함되어 있으므로 추가하지 않음)
        let markdownContent = content.trim();
        
        // AI Generated 관련 문구 제거 (대소문자 무관)
        markdownContent = markdownContent
            .replace(/AI Generated/gi, '')
            .replace(/AI generated/gi, '')
            .replace(/Generated by AI/gi, '')
            .replace(/generated by ai/gi, '')
            .replace(/AI가 생성/gi, '')
            .replace(/자동 생성/gi, '')
            .trim();

        try {
            await navigator.clipboard.writeText(markdownContent);
            toast.success('마크다운이 클립보드에 복사되었습니다!');
        } catch {
            toast.error('클립보드 복사에 실패했습니다. 브라우저 권한을 확인해주세요.');
        }
    };

    const handleSubmit = async (data: RetrospectiveRequest) => {
        if (!problemId) {
            toast.error('문제 ID가 없습니다.');
            return;
        }

        try {
            // 수정 모드인 경우
            if (retrospectiveId) {
                await updateMutation.mutateAsync({ retrospectiveId, data });
                toast.success('회고가 수정되었습니다.');
                navigate(`/retrospectives/${retrospectiveId}`);
            } else {
                // 새로 작성하는 경우
                await createMutation.mutateAsync({ problemId, data });
                toast.success('회고가 저장되었습니다.');
                
                // 온보딩 Phase 완료 처리
                completePhase('retrospective');
                
                navigate('/retrospectives');
            }
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
            
            // 백엔드에서 소유자 검증 실패 시
            if (isApiError(error) && (error.response?.status === 403 || error.response?.status === 400)) {
                toast.error('본인이 작성한 회고만 수정할 수 있습니다.');
            } else {
                toast.error(errorMessage);
            }
        }
    };

    const handleContentChange = (newContent: string) => {
        setContent(newContent);
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* 🎨 Global Header - 표준화된 네비게이션 */}
                    {problemId && (
                        <div className="flex items-center justify-between mb-6">
                            {/* 왼쪽: 네비게이션 & 제목 */}
                            <div className="flex-1 min-w-0">
                                {isProblemLoading ? (
                                    <div className="flex items-center gap-3">
                                        <Spinner />
                                        <span className="text-gray-600 dark:text-gray-400">문제 정보를 불러오는 중...</span>
                                    </div>
                                ) : problem ? (
                                    <div className="flex items-center gap-3">
                                        {/* 이전 버튼 (아이콘만) */}
                                        <button
                                            onClick={() => navigate(-1)}
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
                                                {/* 언어 배지 */}
                                                <LanguageBadge language={language} />
                                                {/* 알고리즘 태그 */}
                                                {problem.tags && problem.tags.length > 0 && (
                                                    <>
                                                        {problem.tags.map((tag, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => navigate(-1)}
                                            className="flex-shrink-0 p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            title="이전 페이지로"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <p className="text-gray-600 dark:text-gray-400">문제 #{problemId} 정보를 불러올 수 없습니다.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 헤더 (액션 버튼) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {retrospectiveId ? '회고 수정' : '회고 작성'}
                            </h2>
                            <div className="flex items-center gap-3">
                                <Button 
                                    onClick={handleCopyMarkdown} 
                                    variant="outline" 
                                    className="flex items-center gap-2"
                                >
                                    <Copy className="w-4 h-4" />
                                    Markdown 복사
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* AI 한 줄 인사이트 (회고 작성 헤더 아래, 한 줄 요약 위) */}
                    <div className="mb-6 tour-ai-section">
                        <AiReviewCard 
                            logId={logId} 
                            code={code}
                            isSuccess={isSuccess}
                            problemId={problemId}
                            problemTitle={problem?.title}
                        />
                    </div>

                    {isLoadingTemplate && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-center py-12">
                                <Spinner />
                                <span className="ml-3 text-gray-600 dark:text-gray-400">템플릿을 불러오는 중...</span>
                            </div>
                        </div>
                    )}

                    {/* 회고 에디터 */}
                    {!isLoadingTemplate && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                            <RetrospectiveEditor
                                key={`${retrospectiveId ?? 'new'}:${problemId}`}
                                initialContent={content || template}
                                initialSummary={summary}
                                initialResultType={(() => {
                                    // location.state에서 status 또는 isSuccess 확인
                                    const state = location.state as { status?: string; isSuccess?: boolean } | null;
                                    if (state?.status === 'SOLVED' || state?.status === 'SUCCESS') {
                                        return 'SUCCESS';
                                    }
                                    if (isSuccess) {
                                        return 'SUCCESS';
                                    }
                                    // 기본값은 'FAIL'이지만, 명시적으로 설정하지 않으면 빈 문자열
                                    return state?.status === 'FAIL' ? 'FAIL' : (isSuccess === false ? 'FAIL' : '');
                                })()}
                                initialSolvedCategory={location.state?.initialSolvedCategory}
                                onSubmit={(data) => {
                                    handleSubmit({
                                        ...data,
                                        solveTime: solveTime || data.solveTime,
                                    });
                                }}
                                isLoading={createMutation.isPending || updateMutation.isPending}
                                onContentChange={handleContentChange}
                                recommendedTags={problem ? (() => {
                                    const tags = problem.tags || [];
                                    const category = problem.category;
                                    // category가 tags에 없으면 추가, 있으면 제외하여 중복 방지
                                    const allTags = category && !tags.includes(category)
                                        ? [...tags, category]
                                        : tags;
                                    // 중복 제거 및 빈 값 필터링
                                    return Array.from(new Set(allTags.filter(Boolean)));
                                })() : []}
                            />
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};
