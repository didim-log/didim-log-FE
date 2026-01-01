/**
 * 날짜 및 시간 포맷팅 유틸리티
 * MongoDB는 UTC로 시간을 저장하므로, 프론트엔드에서 한국 시간(KST, UTC+9)으로 변환하여 표시합니다.
 */

/**
 * UTC 시간 문자열을 한국 시간(KST, UTC+9)으로 변환하여 포맷팅합니다.
 * 
 * @param dateString - ISO 8601 형식의 UTC 시간 문자열 (예: "2024-01-15T10:30:00Z")
 * @param options - 포맷 옵션 (기본값: 시간만 표시)
 * @returns 한국 시간으로 변환된 포맷된 문자열
 * 
 * @example
 * formatDateToKST("2024-01-15T10:30:00Z") // "19:30"
 * formatDateToKST("2024-01-15T10:30:00Z", { includeDate: true }) // "2024-01-15 19:30"
 */
export const formatDateToKST = (
    dateString: string,
    options?: {
        includeDate?: boolean;
        includeSeconds?: boolean;
    }
): string => {
    const date = new Date(dateString);
    
    // UTC 시간에 9시간을 더하여 KST로 변환
    const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    
    const formatOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Seoul',
        hour: '2-digit',
        minute: '2-digit',
    };
    
    if (options?.includeSeconds) {
        formatOptions.second = '2-digit';
    }
    
    if (options?.includeDate) {
        formatOptions.year = 'numeric';
        formatOptions.month = '2-digit';
        formatOptions.day = '2-digit';
    }
    
    return new Intl.DateTimeFormat('ko-KR', formatOptions).format(kstDate);
};

/**
 * 날짜를 한국 시간으로 변환하여 상대 시간 문자열을 반환합니다.
 * 예: "방금 전", "5분 전", "2시간 전", "어제", "2024-01-15"
 * 
 * @param dateString - ISO 8601 형식의 UTC 시간 문자열
 * @returns 상대 시간 문자열
 */
export const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = now.getTime() - kstDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSeconds < 60) {
        return '방금 전';
    }
    
    if (diffMinutes < 60) {
        return `${diffMinutes}분 전`;
    }
    
    if (diffHours < 24) {
        return `${diffHours}시간 전`;
    }
    
    if (diffDays === 1) {
        return '어제';
    }
    
    if (diffDays < 7) {
        return `${diffDays}일 전`;
    }
    
    // 7일 이상 지난 경우 날짜로 표시
    return formatDateToKST(dateString, { includeDate: true });
};


