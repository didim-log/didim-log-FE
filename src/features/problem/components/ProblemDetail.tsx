/**
 * 문제 상세 컴포넌트
 */

import { useMemo, useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, ExternalLink, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { formatTierFromDifficulty, getTierColor } from '../../../utils/tier';
import type { ProblemDetailResponse } from '../../../types/api/problem.types';
import { buildRepresentativeCategoriesFromSource } from '../../../utils/problemCategory';
import { getCategoryLabel } from '../../../utils/constants';

interface ProblemDetailProps {
    problem: ProblemDetailResponse;
    isBlurred: boolean;
}

export const ProblemDetail: FC<ProblemDetailProps> = ({ problem, isBlurred }) => {
    const navigate = useNavigate();
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const representativeCategories = useMemo(
        () => buildRepresentativeCategoriesFromSource(problem, 6),
        [problem]
    );

    const handleCopySampleInput = async (input: string, index: number) => {
        try {
            await navigator.clipboard.writeText(input);
            setCopiedIndex(index);
            toast.success('예제 입력이 복사되었습니다');
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch {
            toast.error('복사에 실패했습니다');
        }
    };

    // 본문이 없는 경우 처리
    const hasContent = problem.descriptionHtml && problem.descriptionHtml.trim().length > 0;

    return (
        <div className={`space-y-6 ${isBlurred ? 'blur-sm select-none pointer-events-none' : ''}`}>
            {/* 🏗️ Header Area - 통합 툴바 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    {/* 왼쪽: 네비게이션 & 제목 */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            {/* 이전 버튼 (아이콘) */}
                            <button
                                onClick={() => navigate(-1)}
                                className="flex-shrink-0 p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="이전 페이지로"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            {/* 문제 번호 & 제목 */}
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                                {problem.id}. {problem.title}
                            </h1>
                        </div>
                        {/* 태그 */}
                        <div className="flex items-center gap-2 flex-wrap ml-11">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm font-medium">
                                {representativeCategories[0]
                                    ? getCategoryLabel(representativeCategories[0])
                                    : problem.category}
                            </span>
                            <span className={`px-2 py-1 rounded text-sm font-medium whitespace-nowrap ${getTierColor(problem.difficulty)}`}>
                                {formatTierFromDifficulty(problem.difficulty, problem.difficultyLevel)}
                            </span>
                            {/* 알고리즘 태그 */}
                            {representativeCategories.length > 1 ? (
                                <>
                                    {representativeCategories.slice(1).map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                                        >
                                            {getCategoryLabel(tag)}
                                        </span>
                                    ))}
                                </>
                            ) : problem.tags.length > 0 ? (
                                <>
                                    {problem.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </>
                            ) : null}
                        </div>
                    </div>

                    {/* 오른쪽: 도구들 */}
                    <div className="flex items-center gap-3 ml-4">
                        {/* 백준에서 보기 버튼 (Ghost 스타일) */}
                        <a
                            href={problem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-300 dark:border-gray-600"
                            title="백준 온라인 저지에서 문제 보기"
                        >
                            <ExternalLink className="w-4 h-4" />
                            백준에서 보기
                        </a>
                    </div>
                </div>
            </div>

            {/* 문제 본문 */}
            {hasContent ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">문제</h2>
                    <div
                        className="prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100"
                        dangerouslySetInnerHTML={{ __html: problem.descriptionHtml! }}
                    />
                    {/* 저작권 안내 (문제 본문 하단) */}
                    <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            문제의 저작권은 원작자에게 있습니다. 정확한 내용은{' '}
                            <a
                                href={problem.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                백준 사이트
                            </a>
                            를 참고하세요.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 border border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                        문제 본문을 불러올 수 없습니다. 아래 링크에서 확인해주세요.
                    </p>
                    <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                        <ExternalLink className="w-5 h-5" />
                        백준 원본 링크에서 보기
                    </a>
                </div>
            )}

            {/* 입력 설명 */}
            {problem.inputDescriptionHtml && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">입력</h2>
                    <div
                        className="prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100"
                        dangerouslySetInnerHTML={{ __html: problem.inputDescriptionHtml }}
                    />
                </div>
            )}

            {/* 출력 설명 */}
            {problem.outputDescriptionHtml && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">출력</h2>
                    <div
                        className="prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100"
                        dangerouslySetInnerHTML={{ __html: problem.outputDescriptionHtml }}
                    />
                </div>
            )}

            {/* 샘플 입출력 */}
            {problem.sampleInputs && problem.sampleInputs.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">예제</h2>
                    <div className="space-y-4">
                        {problem.sampleInputs.map((input, index) => (
                            <div key={index} className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">입력 {index + 1}</p>
                                        <button
                                            onClick={() => handleCopySampleInput(input, index)}
                                            className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                            title="입력 복사"
                                        >
                                            <Copy className={`w-4 h-4 ${copiedIndex === index ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                                        </button>
                                    </div>
                                    <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm text-gray-900 dark:text-gray-100 overflow-x-auto">
                                        {input}
                                    </pre>
                                </div>
                                {problem.sampleOutputs && problem.sampleOutputs[index] && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">출력 {index + 1}</p>
                                        <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm text-gray-900 dark:text-gray-100 overflow-x-auto">
                                            {problem.sampleOutputs[index]}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 크롤링 안내 문구 (맨 아래) */}
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    ⚠️ 본 문제는 백준(BOJ)에서 크롤링 된 데이터로, 이미지나 수식이 올바르게 표시되지 않을 수 있습니다. 정확한 내용은 원본 링크를 참고해주세요.
                </p>
            </div>
        </div>
    );
};
