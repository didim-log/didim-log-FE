/**
 * Tag Input 컴포넌트
 * 직접 입력 후 엔터로 태그 추가, 추천 태그 버튼 제공
 */

import { useState, useRef, KeyboardEvent } from 'react';
import type { FC } from 'react';
import { X } from 'lucide-react';
import { ALGORITHM_CATEGORIES, getCategoryLabel } from '../../utils/constants';

interface TagInputProps {
    value?: string[]; // 선택된 태그들의 배열
    onChange: (values: string[]) => void;
    placeholder?: string;
    className?: string;
    showRecommendedTags?: boolean; // 추천 태그 버튼 표시 여부
}

export const TagInput: FC<TagInputProps> = ({
    value = [],
    onChange,
    placeholder = '알고리즘을 입력하고 Enter를 누르세요',
    className = '',
    showRecommendedTags = true,
}) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // 태그 추가
    const handleAddTag = (tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !value.includes(trimmed) && trimmed.length <= 50) {
            onChange([...value, trimmed]);
            setInputValue('');
        }
    };

    // 태그 제거
    const handleRemoveTag = (tagToRemove: string) => {
        onChange(value.filter((tag) => tag !== tagToRemove));
    };

    // Enter 키 처리
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue.trim()) {
                handleAddTag(inputValue);
            }
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            // 백스페이스로 마지막 태그 제거
            handleRemoveTag(value[value.length - 1]);
        }
    };

    // 추천 태그 클릭
    const handleRecommendedTagClick = (categoryValue: string) => {
        if (!value.includes(categoryValue)) {
            handleAddTag(categoryValue);
        }
    };

    // 선택되지 않은 추천 태그만 필터링
    const availableRecommendedTags = ALGORITHM_CATEGORIES.filter(
        (category) => !value.includes(category.value)
    ).slice(0, 10); // 상위 10개만 표시

    return (
        <div className={className}>
            {/* 태그 입력 영역 */}
            <div
                className="w-full min-h-[42px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 flex flex-wrap items-center gap-2 cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                {value.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium"
                    >
                        {getCategoryLabel(tag)}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTag(tag);
                            }}
                            className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                            aria-label={`${tag} 태그 제거`}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                />
            </div>

            {/* 추천 태그 버튼 */}
            {showRecommendedTags && availableRecommendedTags.length > 0 && (
                <div className="mt-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">추천 태그:</p>
                    <div className="flex flex-wrap gap-2">
                        {availableRecommendedTags.map((category) => (
                            <button
                                key={category.value}
                                type="button"
                                onClick={() => handleRecommendedTagClick(category.value)}
                                className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


