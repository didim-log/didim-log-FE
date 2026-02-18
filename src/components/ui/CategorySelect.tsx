/**
 * 카테고리 선택 컴포넌트 (Select 또는 Autocomplete)
 * 공간 절약을 위해 버튼 그룹 대신 Select/Dropdown 또는 Autocomplete 방식 사용
 */

import { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';
import { ALGORITHM_CATEGORIES } from '../../utils/constants';

interface CategorySelectProps {
    value?: string;
    onChange: (value: string | undefined) => void;
    placeholder?: string;
    className?: string;
    variant?: 'select' | 'autocomplete';
    options?: Array<{ value: string; label: string }>;
}

export const CategorySelect: FC<CategorySelectProps> = ({
    value,
    onChange,
    placeholder = '카테고리를 선택하세요',
    className = '',
    variant = 'select',
    options,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const categories = options && options.length > 0 ? options : ALGORITHM_CATEGORIES;
    const filteredCategories = categories.filter((category) =>
        category.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedCategory = value ? categories.find((cat) => cat.value === value) : null;

    if (variant === 'autocomplete') {
        return (
            <div ref={dropdownRef} className={`relative ${className}`}>
                <div className="relative">
                    <input
                        type="text"
                        value={isOpen ? searchTerm : (selectedCategory?.label || '')}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <svg
                            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                        <div className="p-2">
                            <button
                                type="button"
                                onClick={() => {
                                    onChange(undefined);
                                    setIsOpen(false);
                                    setSearchTerm('');
                                }}
                                className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                    !value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                                }`}
                            >
                                선택 안 함
                            </button>
                        </div>
                        {filteredCategories.length > 0 ? (
                            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                                {filteredCategories.map((category) => (
                                    <button
                                        key={category.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(category.value);
                                            setIsOpen(false);
                                            setSearchTerm('');
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                            value === category.value
                                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                : 'text-gray-900 dark:text-white'
                                        }`}
                                    >
                                        {category.label}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                                검색 결과가 없습니다
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Select 방식 (기본)
    return (
        <div className={`relative ${className}`}>
            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
                <option value="">{placeholder}</option>
                        {categories.map((category) => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );
};
