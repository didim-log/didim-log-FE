/**
 * 마크다운 관련 유틸리티 함수
 */

/**
 * 마크다운 문법을 제거하고 순수 텍스트만 반환합니다.
 * 
 * @param markdown 마크다운 문자열
 * @returns 마크다운 문법이 제거된 순수 텍스트
 */
export const stripMarkdown = (markdown: string): string => {
    if (!markdown) return '';

    let text = markdown;

    // 코드 블록 제거 (```...```)
    text = text.replace(/```[\s\S]*?```/g, '');

    // 인라인 코드 제거 (`...`)
    text = text.replace(/`[^`]+`/g, '');

    // 헤더 제거 (# ## ### 등)
    text = text.replace(/^#{1,6}\s+/gm, '');

    // 볼드/이탤릭 제거 (**text**, __text__, *text*, _text_)
    text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
    text = text.replace(/__([^_]+)__/g, '$1');
    text = text.replace(/\*([^*]+)\*/g, '$1');
    text = text.replace(/_([^_]+)_/g, '$1');

    // 링크 제거 ([text](url) 또는 [text][ref])
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    text = text.replace(/\[([^\]]+)\]\[[^\]]+\]/g, '$1');

    // 이미지 제거 (![alt](url))
    text = text.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');

    // 블록쿼트 제거 (> text)
    text = text.replace(/^>\s+/gm, '');

    // 수평선 제거 (---, ***, ___)
    text = text.replace(/^[-*_]{3,}$/gm, '');

    // 리스트 마커 제거 (-, *, +, 1.)
    text = text.replace(/^[\s]*[-*+]\s+/gm, '');
    text = text.replace(/^[\s]*\d+\.\s+/gm, '');

    // HTML 태그 제거
    text = text.replace(/<[^>]+>/g, '');

    // 여러 개의 공백을 하나로 통합
    text = text.replace(/\s+/g, ' ');

    // 줄바꿈을 공백으로 변환
    text = text.replace(/\n+/g, ' ');

    // 앞뒤 공백 제거
    text = text.trim();

    return text;
};

/**
 * 텍스트를 지정된 길이로 자르고 말줄임표를 추가합니다.
 * 
 * @param text 자를 텍스트
 * @param maxLength 최대 길이 (기본값: 150)
 * @returns 잘린 텍스트 (필요시 ... 추가)
 */
export const truncateText = (text: string, maxLength: number = 150): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};



