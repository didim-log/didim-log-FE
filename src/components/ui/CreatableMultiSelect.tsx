/**
 * Multi-select & Custom Input 컴포넌트
 * 여러 개 선택 가능하고, 직접 입력도 가능한 태그 입력 UI
 */

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { ALGORITHM_CATEGORIES, getCategoryLabel } from '../../utils/constants';

interface CreatableMultiSelectProps {
    value?: string[]; // 선택된 값들의 배열
    onChange: (values: string[]) => void;
    placeholder?: string;
    className?: string;
}

export const CreatableMultiSelect: React.FC<CreatableMultiSelectProps> = ({
    value = [],
    onChange,
    placeholder = '알고리즘을 선택하거나 입력하세요',
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [customValue, setCustomValue] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
                setCustomValue('');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // 필터링된 카테고리 목록
    const filteredCategories = ALGORITHM_CATEGORIES.filter((category) => {
        const isSelected = value.includes(category.value);
        const matchesSearch = category.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            category.value.toLowerCase().includes(searchTerm.toLowerCase());
        return !isSelected && matchesSearch;
    });

    // 선택된 항목 제거
    const handleRemove = (itemValue: string) => {
        onChange(value.filter((v) => v !== itemValue));
    };

    // 카테고리 선택
    const handleSelectCategory = (categoryValue: string) => {
        if (!value.includes(categoryValue)) {
            onChange([...value, categoryValue]);
        }
        setSearchTerm('');
        setCustomValue('');
        inputRef.current?.focus();
    };

    // 커스텀 값 추가 (Enter 키 또는 버튼 클릭)
    const handleAddCustom = () => {
        // customValue 또는 searchTerm 중 하나를 사용
        const valueToAdd = (customValue || searchTerm).trim();
        if (valueToAdd && !value.includes(valueToAdd) && valueToAdd.length <= 50) {
            onChange([...value, valueToAdd]);
            setCustomValue('');
            setSearchTerm('');
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const valueToAdd = (customValue || searchTerm).trim();
            if (valueToAdd) {
                e.preventDefault();
                handleAddCustom();
            }
        } else if (e.key === 'Backspace' && !searchTerm && value.length > 0) {
            // 백스페이스로 마지막 태그 제거
            handleRemove(value[value.length - 1]);
        }
    };

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            {/* 선택된 태그들 표시 */}
            <div
                className="w-full min-h-[42px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 flex flex-wrap items-center gap-2 cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                {value.map((item) => (
                    <span
                        key={item}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm"
                    >
                        {getCategoryLabel(item)}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(item);
                            }}
                            className="hover:text-blue-600 dark:hover:text-blue-300"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={isOpen ? searchTerm : ''}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
            </div>

            {/* 드롭다운 메뉴 */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {/* 커스텀 입력 섹션 */}
                    {searchTerm && !ALGORITHM_CATEGORIES.some((cat) => cat.value.toLowerCase() === searchTerm.toLowerCase() || cat.label.toLowerCase() === searchTerm.toLowerCase()) && (
                        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={customValue || searchTerm}
                                    onChange={(e) => {
                                        setCustomValue(e.target.value);
                                        // searchTerm도 동기화하여 메인 입력 필드와 일치시킴
                                        if (!e.target.value) {
                                            setSearchTerm('');
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddCustom();
                                        }
                                    }}
                                    placeholder="직접 입력 (Enter로 추가)"
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleAddCustom();
                                    }}
                                    disabled={!customValue.trim() && !searchTerm.trim()}
                                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    추가
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 카테고리 목록 */}
                    {filteredCategories.length > 0 ? (
                        <div className="p-2">
                            {filteredCategories.map((category) => (
                                <button
                                    key={category.value}
                                    type="button"
                                    onClick={() => handleSelectCategory(category.value)}
                                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    {category.label}
                                </button>
                            ))}
                        </div>
                    ) : searchTerm && (
                        <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                            검색 결과가 없습니다. 위에서 직접 입력할 수 있습니다.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

