/**
 * Tag Input 컴포넌트
 * 직접 입력 후 엔터로 태그 추가, 추천 태그 버튼 제공
 */

import { useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import type { FC } from 'react';
import { X, Trash2 } from 'lucide-react';
import { ALGORITHM_CATEGORIES, getCategoryLabel } from '../../utils/constants';

interface TagInputProps {
    value?: string[]; // 선택된 태그들의 배열
    onChange: (values: string[]) => void;
    placeholder?: string;
    className?: string;
    showRecommendedTags?: boolean; // 추천 태그 버튼 표시 여부
    recommendedTags?: string[]; // 문제에서 추천할 태그 목록 (문제의 카테고리/태그)
    label?: string; // 라벨 텍스트 (전체 삭제 버튼과 함께 표시)
}

export const TagInput: FC<TagInputProps> = ({
    value = [],
    onChange,
    placeholder = '알고리즘을 입력하고 Enter를 누르세요',
    className = '',
    showRecommendedTags = true,
    recommendedTags = [],
    label,
}) => {
    const [inputValue, setInputValue] = useState('');
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<HTMLDivElement>(null);

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

    // 전체 태그 삭제
    const handleClearAll = () => {
        onChange([]);
        setInputValue('');
        inputRef.current?.focus();
    };

    // Autocomplete 제안 목록 생성
    const getAutocompleteSuggestions = (): string[] => {
        if (!inputValue.trim()) {
            return [];
        }
        const query = inputValue.toLowerCase().trim();
        return ALGORITHM_CATEGORIES
            .filter((cat) => {
                const isSelected = value.includes(cat.value);
                const matchesQuery = cat.label.toLowerCase().includes(query) || 
                                    cat.value.toLowerCase().includes(query);
                return !isSelected && matchesQuery;
            })
            .slice(0, 5) // 최대 5개만 표시
            .map((cat) => cat.value);
    };

    const autocompleteSuggestions = getAutocompleteSuggestions();

    // Enter 키 처리
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && autocompleteSuggestions.length > 0) {
                // 하이라이트된 제안 선택
                handleAddTag(autocompleteSuggestions[highlightedIndex]);
                setShowAutocomplete(false);
                setHighlightedIndex(-1);
            } else if (inputValue.trim()) {
                // 직접 입력한 값 추가
                handleAddTag(inputValue);
                setShowAutocomplete(false);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (autocompleteSuggestions.length > 0) {
                setShowAutocomplete(true);
                setHighlightedIndex((prev) => 
                    prev < autocompleteSuggestions.length - 1 ? prev + 1 : prev
                );
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Escape') {
            setShowAutocomplete(false);
            setHighlightedIndex(-1);
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            // 백스페이스로 마지막 태그 제거
            handleRemoveTag(value[value.length - 1]);
        }
    };

    // 입력 값 변경 핸들러
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        setHighlightedIndex(-1);
        if (e.target.value.trim()) {
            setShowAutocomplete(true);
        } else {
            setShowAutocomplete(false);
        }
    };

    // 추천 태그 클릭
    const handleRecommendedTagClick = (categoryValue: string) => {
        if (!value.includes(categoryValue)) {
            handleAddTag(categoryValue);
        }
    };

    // 추천 태그 결정: recommendedTags가 있으면 그것을 사용, 없으면 기본 ALGORITHM_CATEGORIES 사용
    const tagsToShow = recommendedTags.length > 0 
        ? recommendedTags 
        : ALGORITHM_CATEGORIES.map(cat => cat.value);
    
    // 선택되지 않은 추천 태그만 필터링
    const availableRecommendedTags = tagsToShow
        .filter((tag) => !value.includes(tag))
        .slice(0, 10); // 상위 10개만 표시
    
    // 태그 라벨 가져오기 (ALGORITHM_CATEGORIES에서 찾거나, 없으면 원본 값 사용)
    const getTagLabel = (tag: string): string => {
        const category = ALGORITHM_CATEGORIES.find(cat => cat.value === tag);
        return category ? category.label : tag;
    };

    return (
        <div className={className}>
            {/* 라벨 및 전체 삭제 버튼 */}
            {label && (
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                    </label>
                    {value.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            aria-label="전체 태그 삭제"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>전체 삭제</span>
                        </button>
                    )}
                </div>
            )}

            {/* 태그 입력 영역 */}
            <div className="relative">
                <div
                    className="w-full min-h-[42px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 flex items-center gap-2 cursor-text"
                    onClick={() => inputRef.current?.focus()}
                >
                    {/* 선택된 태그 컨테이너 (가로 스크롤) */}
                    {value.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-shrink-0" style={{ maxWidth: 'calc(100% - 140px)' }}>
                            {value.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium whitespace-nowrap flex-shrink-0"
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
                        </div>
                    )}
                    
                    {/* 입력 필드 */}
                    <div className="flex-1 min-w-[120px] relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onFocus={() => {
                                if (inputValue.trim() && autocompleteSuggestions.length > 0) {
                                    setShowAutocomplete(true);
                                }
                            }}
                            onBlur={() => {
                                // 약간의 지연을 두어 클릭 이벤트가 먼저 처리되도록 함
                                setTimeout(() => setShowAutocomplete(false), 200);
                            }}
                            placeholder={value.length === 0 ? placeholder : ''}
                            className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                        />
                        
                        {/* Autocomplete 드롭다운 */}
                        {showAutocomplete && autocompleteSuggestions.length > 0 && (
                            <div
                                ref={autocompleteRef}
                                className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                            >
                                {autocompleteSuggestions.map((suggestion, index) => {
                                    const category = ALGORITHM_CATEGORIES.find(cat => cat.value === suggestion);
                                    const label = category?.label || suggestion;
                                    return (
                                        <button
                                            key={suggestion}
                                            type="button"
                                            onClick={() => {
                                                handleAddTag(suggestion);
                                                setShowAutocomplete(false);
                                                setInputValue('');
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                                index === highlightedIndex
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                    : 'text-gray-900 dark:text-white'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 전체 삭제 버튼 (라벨이 없을 때 입력 필드 내부에 표시) */}
                    {!label && value.length > 0 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClearAll();
                            }}
                            className="flex-shrink-0 p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="전체 태그 삭제"
                            title="전체 삭제"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* 추천 태그 버튼 */}
            {showRecommendedTags && availableRecommendedTags.length > 0 && (
                <div className="mt-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">추천 태그:</p>
                    <div className="flex flex-wrap gap-2">
                        {availableRecommendedTags.map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => handleRecommendedTagClick(tag)}
                                className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                            >
                                {getTagLabel(tag)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};
