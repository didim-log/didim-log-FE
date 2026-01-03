/**
 * 날짜 및 시간 포맷팅 유틸리티 (dayjs 기반)
 * MongoDB는 UTC로 시간을 저장하므로, 프론트엔드에서 한국 시간(KST, UTC+9)으로 변환하여 표시합니다.
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * UTC 시간 문자열을 한국 시간(KST, UTC+9)으로 변환하여 포맷팅합니다.
 * 
 * @param dateString - ISO 8601 형식의 UTC 시간 문자열 (예: "2024-01-15T10:30:00Z")
 * @param format - 포맷 옵션 ('full', 'dateOnly', 'timeOnly', 'default')
 * @returns 한국 시간으로 변환된 포맷된 문자열
 * 
 * @example
 * formatKST("2024-01-15T10:30:00Z") // "2024년 01월 15일 오후 7:30"
 * formatKST("2024-01-15T10:30:00Z", 'dateOnly') // "2024-01-15"
 * formatKST("2024-01-15T10:30:00Z", 'timeOnly') // "오후 7:30"
 */
export const formatKST = (dateString: string, format: 'full' | 'dateOnly' | 'timeOnly' | 'default' = 'full'): string => {
    if (!dateString) return '';
    
    // UTC로 파싱 후 Asia/Seoul로 변환
    const kstDate = dayjs.utc(dateString).tz('Asia/Seoul');
    
    if (format === 'dateOnly') {
        return kstDate.format('YYYY-MM-DD');
    }
    
    if (format === 'timeOnly') {
        return kstDate.format('A h:mm');
    }
    
    if (format === 'default') {
        return kstDate.format('YYYY-MM-DD HH:mm');
    }
    
    // full 형식 (한국어 형식)
    return kstDate.format('YYYY년 MM월 DD일 A h:mm');
};



