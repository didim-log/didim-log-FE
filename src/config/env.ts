/**
 * 실행 환경별 환경 변수 접근을 한 곳으로 모읍니다.
 */

const DEFAULT_API_URL = 'http://localhost:8080/api/v1';

const normalizeApiUrl = (apiUrl: string): string => {
    const normalized = apiUrl.trim().replace(/\/+$/, '');
    if (!normalized) {
        return DEFAULT_API_URL;
    }
    if (normalized.endsWith('/api/v1')) {
        return normalized;
    }
    return `${normalized}/api/v1`;
};

export const deriveApiOrigin = (apiUrl: string): string => {
    const normalized = normalizeApiUrl(apiUrl);
    return normalized.replace(/\/api\/v1$/, '');
};

export const API_URL: string = normalizeApiUrl(import.meta.env.VITE_API_URL || DEFAULT_API_URL);
export const API_ORIGIN: string = deriveApiOrigin(API_URL);


