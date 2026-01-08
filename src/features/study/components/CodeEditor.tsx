/**
 * 코드 에디터 컴포넌트
 * 사용자의 Primary Language를 기본값으로 사용하며, 언어 선택 드롭다운을 제공합니다.
 */

import type { FC } from 'react';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: string;
    onLanguageChange?: (language: string) => void;
    placeholder?: string;
}

export const CodeEditor: FC<CodeEditorProps> = ({
    value,
    onChange,
    placeholder = '코드를 입력하세요...',
}) => {

    return (
        <div className="w-full">
            <div className="mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    코드
                </label>
            </div>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-96 w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
                spellCheck={false}
                style={{ scrollbarWidth: 'thin' }}
            />
        </div>
    );
};
