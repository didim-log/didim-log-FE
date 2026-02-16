/**
 * 문제 언어를 표시하는 뱃지 컴포넌트
 */

import type { FC } from 'react';

interface LanguageBadgeProps {
    language?: string | null;
    className?: string;
}

const LANGUAGE_MAP: Record<string, { flag: string; label: string }> = {
    ko: { flag: '🇰🇷', label: 'KR' },
    en: { flag: '🇺🇸', label: 'EN' },
    ja: { flag: '🇯🇵', label: 'JP' },
    zh: { flag: '🇨🇳', label: 'CN' },
    other: { flag: '🌐', label: 'ETC' },
};

export const LanguageBadge: FC<LanguageBadgeProps> = ({ language, className = '' }) => {
    // language가 없으면 unknown으로 처리 (오탐 방지)
    const normalizedLanguage = (language || 'other').toLowerCase();
    const languageInfo = LANGUAGE_MAP[normalizedLanguage] || LANGUAGE_MAP.other;

    return (
        <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 ${className}`}
            title={`Language: ${normalizedLanguage}`}
        >
            <span>{languageInfo.flag}</span>
            <span>{languageInfo.label}</span>
        </span>
    );
};
