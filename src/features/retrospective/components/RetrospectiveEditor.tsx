/**
 * 회고 에디터 컴포넌트
 */

import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import type { RetrospectiveRequest } from '../../../types/api/retrospective.types';
import { TagInput } from '../../../components/ui/TagInput';
import { Info } from 'lucide-react';

const MAX_CONTENT_LENGTH = 5000;
const AI_ANALYSIS_LIMIT = 2000;
const RETENTION_DAYS = 180;


interface RetrospectiveEditorProps {
    initialContent?: string;
    initialSummary?: string;
    initialSolvedCategory?: string;
    onSubmit: (data: RetrospectiveRequest) => void;
    isLoading?: boolean;
    onContentChange?: (content: string) => void;
    recommendedTags?: string[]; // 문제의 카테고리/태그를 추천 태그로 사용
}

export const RetrospectiveEditor: FC<RetrospectiveEditorProps> = ({
    initialContent = '',
    initialSummary = '',
    initialSolvedCategory = '',
    onSubmit,
    isLoading = false,
    onContentChange,
    recommendedTags = [],
}) => {
    const [content, setContent] = useState(initialContent);
    const [summary, setSummary] = useState(initialSummary);
    const [solvedCategories, setSolvedCategories] = useState<string[]>(
        initialSolvedCategory ? initialSolvedCategory.split(',').filter(Boolean) : []
    );
    const [errors, setErrors] = useState<{ content?: string; summary?: string }>({});
    const [hasUserTypedSummary, setHasUserTypedSummary] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // initialContent가 변경되면 내부 content state 강제 업데이트 (템플릿 타입 변경 시 등)
    useEffect(() => {
        // 템플릿 타입 변경 등으로 initialContent가 변경되면 강제로 덮어쓰기
        // initialContent와 현재 content가 다를 때만 업데이트
        // 문자열 비교 시 trim()을 사용하지 않아 정확한 비교를 수행
        if (initialContent !== content) {
            // initialContent가 유효한 값이면 업데이트
            if (initialContent !== undefined && initialContent !== null) {
                setContent(initialContent);
                // 부모 컴포넌트에도 변경사항 알림
                onContentChange?.(initialContent);
            }
        }
    }, [initialContent]); // eslint-disable-line react-hooks/exhaustive-deps

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

        if (content.trim().length > MAX_CONTENT_LENGTH) {
            setErrors({ content: `회고 내용은 ${MAX_CONTENT_LENGTH}자 이하여야 합니다.` });
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

        // resultType은 제거되었으므로 null로 전달 (백엔드에서 isSuccess 기반으로 처리)
        onSubmit({
            content: content.trim(),
            summary: summary.trim(),
            resultType: null, // 풀이 결과는 이미 성공/실패로 결정되어 있으므로 null
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
                    ref={textareaRef}
                    id="content"
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        onContentChange?.(e.target.value);
                    }}
                    placeholder={`회고 내용을 작성해주세요 (10자 이상, 최대 ${MAX_CONTENT_LENGTH}자)`}
                    rows={20}
                    minLength={10}
                    maxLength={MAX_CONTENT_LENGTH}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y min-h-[500px]"
                />
                <div className="mt-2 space-y-2">
                    <p
                        className={`text-xs ${
                            content.length > MAX_CONTENT_LENGTH
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        {content.length}/{MAX_CONTENT_LENGTH}자 {content.length < 10 && '(최소 10자 필요)'}{' '}
                        {content.length > MAX_CONTENT_LENGTH && `(최대 ${MAX_CONTENT_LENGTH}자 초과)`}
                    </p>
                    {content.length > AI_ANALYSIS_LIMIT && content.length <= MAX_CONTENT_LENGTH && (
                        <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                                💡 작성 내용은 {MAX_CONTENT_LENGTH}자까지 저장되지만, AI 분석은 앞부분{' '}
                                {AI_ANALYSIS_LIMIT}자까지만 반영됩니다. 핵심 내용은 앞부분에 작성해주세요.
                            </p>
                        </div>
                    )}
                    <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <Info className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            최대 {MAX_CONTENT_LENGTH}자까지 작성할 수 있으며, 작성하신 회고는 {RETENTION_DAYS}일
                            뒤 자동 삭제됩니다. 영구 소장이 필요한 내용은 별도로 백업해주세요.
                        </p>
                    </div>
                </div>
                {errors.content && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>}
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={
                        isLoading ||
                        content.trim().length < 10 ||
                        content.trim().length > MAX_CONTENT_LENGTH ||
                        !summary.trim()
                    }
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                    {isLoading ? '저장 중...' : '저장'}
                </button>
            </div>
        </form>
    );
};
