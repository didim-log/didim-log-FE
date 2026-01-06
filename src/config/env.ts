/**
 * 실행 환경별 환경 변수 접근을 한 곳으로 모읍니다.
 */

const normalizeApiUrl = (apiUrl: string): string => {
    const normalized = apiUrl.trim().replace(/\/+$/, '');
    if (!normalized) {
        return '';
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

const isLocalOrigin = (origin: string): boolean => {
    const trimmed = origin.trim();
    if (!trimmed) {
        return false;
    }

    if (trimmed.includes('localhost')) {
        return true;
    }

    if (trimmed.includes('127.0.0.1')) {
        return true;
    }

    return false;
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

    if (!isLocalOrigin(origin)) {
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

const resolveApiUrl = (apiUrl: unknown): string => {
    const value = typeof apiUrl === 'string' ? apiUrl : '';
    const normalized = normalizeApiUrl(value);
    const isProd = import.meta.env.PROD;

    if (!normalized) {
        if (!isProd) {
            console.warn('[env] VITE_API_URL이 비어있습니다. .env.development를 설정해주세요.');
        }
        throw new Error('VITE_API_URL이 설정되지 않았습니다.');
    }

    const origin = deriveApiOrigin(normalized);
    if (isProd && isLocalOrigin(origin)) {
        throw new Error('운영 환경에서 VITE_API_URL이 localhost를 가리키고 있습니다.');
    }

    return normalized;
};

export const API_URL: string = resolveApiUrl(import.meta.env.VITE_API_URL);
export const API_ORIGIN: string = deriveApiOrigin(API_URL);
export const SERVER_ROOT: string = deriveServerRoot(API_URL, { isProd: import.meta.env.PROD });


