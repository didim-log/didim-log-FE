/**
 * 코드 에디터 컴포넌트
 */

import type { FC } from 'react';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: string;
    placeholder?: string;
}

export const CodeEditor: FC<CodeEditorProps> = ({ value, onChange, language = 'text', placeholder = '코드를 입력하세요...' }) => {
    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">코드</label>
                <span className="text-xs text-gray-500 dark:text-gray-400">{language}</span>
            </div>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-96 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
                spellCheck={false}
            />
        </div>
    );
};


