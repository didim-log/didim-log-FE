/**
 * 문제 상세 컴포넌트
 */

import { useState } from 'react';
import type { FC } from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { formatTierFromDifficulty, getTierColor } from '../../../utils/tier';
import type { ProblemDetailResponse } from '../../../types/api/problem.types';

interface ProblemDetailProps {
    problem: ProblemDetailResponse;
    isBlurred: boolean;
}

export const ProblemDetail: FC<ProblemDetailProps> = ({ problem, isBlurred }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopySampleInput = async (input: string, index: number) => {
        try {
            await navigator.clipboard.writeText(input);
            setCopiedIndex(index);
            toast.success('예제 입력이 복사되었습니다');
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (error) {
            console.error('클립보드 복사 실패:', error);
            toast.error('복사에 실패했습니다');
        }
    };

    // 본문이 없는 경우 처리
    const hasContent = problem.descriptionHtml && problem.descriptionHtml.trim().length > 0;

    return (
        <div className={`space-y-6 ${isBlurred ? 'blur-sm select-none pointer-events-none' : ''}`}>
            {/* 문제 헤더 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {problem.id}. {problem.title}
                        </h1>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm font-medium">
                                {problem.category}
                            </span>
                            <span className={`px-2 py-1 rounded text-sm font-medium whitespace-nowrap ${getTierColor(problem.difficulty)}`}>
                                {formatTierFromDifficulty(problem.difficulty, problem.difficultyLevel)}
                            </span>
                        </div>
                    </div>
                    <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        백준에서 보기
                    </a>
                </div>

                {/* 태그 */}
                {problem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {problem.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* 문제 본문 */}
            {hasContent ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">문제</h2>
                    <div
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: problem.descriptionHtml! }}
                    />
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
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: problem.inputDescriptionHtml }}
                    />
                </div>
            )}

            {/* 출력 설명 */}
            {problem.outputDescriptionHtml && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">출력</h2>
                    <div
                        className="prose dark:prose-invert max-w-none"
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

