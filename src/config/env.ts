/**
 * 실행 환경별 환경 변수 접근을 한 곳으로 모읍니다.
 */

const DEFAULT_API_URL = 'http://localhost:8080/api/v1';
const DEFAULT_API_ORIGIN = 'http://localhost:8080';

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

type DeriveServerRootParams = {
    isProd: boolean;
    runtimeOrigin?: string;
};

export const deriveServerRoot = (apiUrl: string, params: DeriveServerRootParams): string => {
    const origin = deriveApiOrigin(apiUrl);

    if (!params.isProd) {
        return origin;
    }

    if (origin !== DEFAULT_API_ORIGIN) {
        return origin;
    }

    if (params.runtimeOrigin) {
        return params.runtimeOrigin;
    }

    if (typeof window === 'undefined') {
        return origin;
    }

    return window.location.origin;
};

export const API_URL: string = normalizeApiUrl(import.meta.env.VITE_API_URL || DEFAULT_API_URL);
export const API_ORIGIN: string = deriveApiOrigin(API_URL);
export const SERVER_ROOT: string = deriveServerRoot(API_URL, { isProd: import.meta.env.PROD });


