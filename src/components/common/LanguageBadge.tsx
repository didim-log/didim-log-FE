/**
 * 프로그래밍 언어 배지 컴포넌트
 * 공식 브랜드 색상을 사용하여 일관된 언어 배지를 표시합니다.
 */

import type { FC } from 'react';
import { getLanguageColor, getLanguageLabel, normalizeLanguage } from '../../constants/languageColors';

interface LanguageBadgeProps {
    language: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean; // false일 경우 언어 이름을 표시하지 않음 (색상만)
}

const SIZE_CLASSES = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
};

/**
 * LanguageBadge 컴포넌트
 * 
 * @param language - 언어 이름 (대소문자 무관, 예: 'java', 'JAVA', 'Java')
 * @param className - 추가 CSS 클래스
 * @param size - 배지 크기 ('sm' | 'md' | 'lg'), 기본값 'md'
 * @param showLabel - 언어 이름 표시 여부, 기본값 true
 * 
 * @example
 * <LanguageBadge language="java" />
 * <LanguageBadge language="python" size="sm" />
 * <LanguageBadge language="kotlin" className="ml-2" />
 */
export const LanguageBadge: FC<LanguageBadgeProps> = ({
    language,
    className = '',
    size = 'md',
    showLabel = true,
}) => {
    if (!language || normalizeLanguage(language) === 'text' || normalizeLanguage(language) === 'default') {
        return null; // text나 default는 표시하지 않음
    }

    const colorConfig = getLanguageColor(language);
    const label = showLabel ? getLanguageLabel(language) : '';
    const sizeClass = SIZE_CLASSES[size];

    const badgeClasses = `
        ${sizeClass}
        ${colorConfig.bg}
        ${colorConfig.text}
        ${colorConfig.darkBg}
        ${colorConfig.darkText}
        rounded
        font-medium
        whitespace-nowrap
        ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
        <span className={badgeClasses}>
            {label}
        </span>
    );
};


