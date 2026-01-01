/**
 * 회고 에디터 컴포넌트
 */

import { useState, useEffect } from 'react';
import type { FC } from 'react';
import type { RetrospectiveRequest } from '../../../types/api/retrospective.types';
import { TagInput } from '../../../components/ui/TagInput';

interface RetrospectiveEditorProps {
    initialContent?: string;
    initialSummary?: string;
    initialResultType?: string;
    initialSolvedCategory?: string;
    onSubmit: (data: RetrospectiveRequest) => void;
    isLoading?: boolean;
    onContentChange?: (content: string) => void;
}

export const RetrospectiveEditor: FC<RetrospectiveEditorProps> = ({
    initialContent = '',
    initialSummary = '',
    initialResultType = '',
    initialSolvedCategory = '',
    onSubmit,
    isLoading = false,
    onContentChange,
}) => {
    const [content, setContent] = useState(initialContent);
    const [summary, setSummary] = useState(initialSummary);
    const [resultType, setResultType] = useState(initialResultType);
    const [solvedCategories, setSolvedCategories] = useState<string[]>(
        initialSolvedCategory ? initialSolvedCategory.split(',').filter(Boolean) : []
    );
    const [errors, setErrors] = useState<{ content?: string; summary?: string }>({});

    useEffect(() => {
        setContent(initialContent);
        setSummary(initialSummary);
        setResultType(initialResultType);
        setSolvedCategories(initialSolvedCategory ? initialSolvedCategory.split(',').filter(Boolean) : []);
    }, [initialContent, initialSummary, initialResultType, initialSolvedCategory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!content.trim() || content.trim().length < 10) {
            setErrors({ content: '회고 내용은 10자 이상이어야 합니다.' });
            return;
        }

        if (summary && summary.length > 200) {
            setErrors({ summary: '한 줄 요약은 200자 이하여야 합니다.' });
            return;
        }

        // solvedCategories 배열을 쉼표로 구분된 문자열로 변환 (API는 단일 문자열을 받음)
        const solvedCategoryString = solvedCategories.length > 0 ? solvedCategories.join(', ') : null;

        onSubmit({
            content: content.trim(),
            summary: summary.trim() || null,
            resultType: (resultType || null) as any,
            solvedCategory: solvedCategoryString,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    한 줄 요약 (선택)
                </label>
                <input
                    id="summary"
                    type="text"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="회고를 한 줄로 요약해주세요"
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label htmlFor="solvedCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    풀이 전략/알고리즘 (선택, 여러 개 선택 가능)
                </label>
                <TagInput
                    value={solvedCategories}
                    onChange={setSolvedCategories}
                    placeholder="알고리즘을 입력하고 Enter를 누르세요"
                    showRecommendedTags={true}
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
                    placeholder="회고 내용을 작성해주세요 (10자 이상)"
                    rows={20}
                    minLength={10}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y min-h-[500px]"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {content.length}자 {content.length < 10 && '(최소 10자 필요)'}
                </p>
                {errors.content && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>}
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading || content.trim().length < 10}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                    {isLoading ? '저장 중...' : '저장'}
                </button>
            </div>
        </form>
    );
};

