/**
 * 회고 에디터 컴포넌트
 */

import { useState } from 'react';
import type { FC } from 'react';
import type { RetrospectiveRequest, ProblemResult } from '../../../types/api/retrospective.types';
import { TagInput } from '../../../components/ui/TagInput';

interface RetrospectiveEditorProps {
    initialContent?: string;
    initialSummary?: string;
    initialResultType?: string;
    initialSolvedCategory?: string;
    onSubmit: (data: RetrospectiveRequest) => void;
    isLoading?: boolean;
    onContentChange?: (content: string) => void;
    recommendedTags?: string[]; // 문제의 카테고리/태그를 추천 태그로 사용
}

export const RetrospectiveEditor: FC<RetrospectiveEditorProps> = ({
    initialContent = '',
    initialSummary = '',
    initialResultType = '',
    initialSolvedCategory = '',
    onSubmit,
    isLoading = false,
    onContentChange,
    recommendedTags = [],
}) => {
    const [content, setContent] = useState(initialContent);
    const [summary, setSummary] = useState(initialSummary);
    const [resultType, setResultType] = useState(initialResultType);
    const [solvedCategories, setSolvedCategories] = useState<string[]>(
        initialSolvedCategory ? initialSolvedCategory.split(',').filter(Boolean) : []
    );
    const [errors, setErrors] = useState<{ content?: string; summary?: string }>({});
    const [hasUserTypedSummary, setHasUserTypedSummary] = useState(false);

    // summary 입력 핸들러: 사용자가 입력했음을 표시
    const handleSummaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSummary(e.target.value);
        if (!hasUserTypedSummary && e.target.value.trim()) {
            setHasUserTypedSummary(true);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!content.trim() || content.trim().length < 10) {
            setErrors({ content: '회고 내용은 10자 이상이어야 합니다.' });
            return;
        }

        if (content.trim().length > 2000) {
            setErrors({ content: '회고 내용은 2000자 이하여야 합니다.' });
            return;
        }

        if (!summary.trim()) {
            setErrors({ summary: '한 줄 요약을 입력해주세요.' });
            return;
        }

        if (summary.length > 200) {
            setErrors({ summary: '한 줄 요약은 200자 이하여야 합니다.' });
            return;
        }

        // solvedCategories 배열을 쉼표로 구분된 문자열로 변환 (API는 단일 문자열을 받음)
        const solvedCategoryString = solvedCategories.length > 0 ? solvedCategories.join(', ') : null;

        onSubmit({
            content: content.trim(),
            summary: summary.trim(),
            resultType: (resultType || null) as ProblemResult | null,
            solvedCategory: solvedCategoryString,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    한 줄 요약 <span className="text-red-500">*</span>
                </label>
                <input
                    id="summary"
                    type="text"
                    value={summary}
                    onChange={handleSummaryChange}
                    placeholder="회고를 한 줄로 요약해주세요 (필수)"
                    maxLength={200}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{summary.length}/200</p>
                {errors.summary && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.summary}</p>}
            </div>

            <div>
                <label htmlFor="resultType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    풀이 결과 (선택)
                </label>
                <select
                    id="resultType"
                    value={resultType}
                    onChange={(e) => setResultType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">선택하지 않음</option>
                    <option value="SUCCESS">성공</option>
                    <option value="FAIL">실패</option>
                    <option value="TIME_OVER">시간 초과</option>
                </select>
            </div>

            <div>
                <TagInput
                    value={solvedCategories}
                    onChange={setSolvedCategories}
                    placeholder="알고리즘을 입력하고 Enter를 누르세요"
                    showRecommendedTags={true}
                    recommendedTags={recommendedTags}
                    label="풀이 전략/알고리즘 (선택, 여러 개 선택 가능)"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    직접 입력하거나 아래 추천 태그를 클릭하여 추가할 수 있습니다.
                </p>
            </div>

            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    회고 내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        onContentChange?.(e.target.value);
                    }}
                    placeholder="회고 내용을 작성해주세요 (10자 이상, 최대 2000자)"
                    rows={20}
                    minLength={10}
                    maxLength={2000}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y min-h-[500px]"
                />
                <p className={`mt-2 text-xs ${content.length > 2000 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {content.length}/2000자 {content.length < 10 && '(최소 10자 필요)'} {content.length > 2000 && '(최대 2000자 초과)'}
                </p>
                {errors.content && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>}
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading || content.trim().length < 10 || content.trim().length > 2000 || !summary.trim()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                    {isLoading ? '저장 중...' : '저장'}
                </button>
            </div>
        </form>
    );
};

