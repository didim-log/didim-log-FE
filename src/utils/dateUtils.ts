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

/**
 * 초 단위 시간을 "X분 Y초" 형식으로 포맷팅합니다.
 * 
 * @param seconds - 초 단위 시간 (null/undefined 허용)
 * @returns 포맷된 시간 문자열 (예: "5분 30초", "45초", "2분"). null/undefined인 경우 빈 문자열 반환
 * 
 * @example
 * formatTimeFromSeconds(90) // "1분 30초"
 * formatTimeFromSeconds(45) // "45초"
 * formatTimeFromSeconds(120) // "2분"
 * formatTimeFromSeconds(null) // ""
 */
export const formatTimeFromSeconds = (seconds: number | null | undefined): string => {
    if (seconds === null || seconds === undefined) return '';
    if (seconds === 0) return '0분';
    if (seconds < 60) return `${seconds}초`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (remainingSeconds === 0) {
        return `${minutes}분`;
    }
    return `${minutes}분 ${remainingSeconds}초`;
};

/**
 * 초 단위 시간을 "X분 Y초" 또는 "XX초" 형식으로 포맷팅합니다.
 * 사용자 친화적인 한글 형식으로 표시하며, 소수점은 반올림 처리됩니다.
 * 
 * @param seconds - 초 단위 시간 (소수점 포함 가능)
 * @returns 포맷된 시간 문자열 (예: "35초", "1분 5초", "0초"). 유효하지 않은 값인 경우 "0초" 반환
 * 
 * @example
 * formatDuration(34.83) // "35초"
 * formatDuration(65.5) // "1분 6초"
 * formatDuration(0) // "0초"
 * formatDuration(-1) // "0초"
 */
export const formatDuration = (seconds: number): string => {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return '0초';
    }

    const roundedSeconds = Math.round(seconds);

    if (roundedSeconds === 0) {
        return '0초';
    }

    if (roundedSeconds < 60) {
        return `${roundedSeconds}초`;
    }

    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = roundedSeconds % 60;

    if (remainingSeconds === 0) {
        return `${minutes}분`;
    }

    return `${minutes}분 ${remainingSeconds}초`;
};

/**
 * 초 단위 시간을 시계 형식("HH:MM:SS" 또는 "MM:SS")으로 포맷팅합니다.
 * 
 * @param totalSeconds - 초 단위 시간
 * @returns 포맷된 시간 문자열 (예: "01:30:45", "05:30")
 * 
 * @example
 * formatTimeToClock(3665) // "01:01:05"
 * formatTimeToClock(330) // "05:30"
 */
export const formatTimeToClock = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

