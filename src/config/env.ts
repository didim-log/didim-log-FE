/**
 * 실행 환경별 환경 변수 접근을 한 곳으로 모읍니다.
 */

const DEV_API_URL = 'http://localhost:8080/api/v1';
const PROD_API_URL = 'https://didim-log.xyz/api/v1';

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

type DeriveServerRootParams = {
    isProd: boolean;
    runtimeOrigin?: string;
};

export const deriveServerRoot = (apiUrl: string, params: DeriveServerRootParams): string => {
    const origin = deriveApiOrigin(apiUrl);

    if (!params.isProd) {
        return origin;
    }

    const devOrigin = deriveApiOrigin(DEV_API_URL);
    if (origin !== devOrigin) {
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

const resolveApiUrl = (): string => {
    const raw = typeof import.meta.env.VITE_API_URL === 'string' ? import.meta.env.VITE_API_URL : '';
    const fallback = import.meta.env.PROD ? PROD_API_URL : DEV_API_URL;
    const resolved = normalizeApiUrl(raw) || fallback;

    if (!import.meta.env.PROD) {
        return resolved;
    }

    const origin = deriveApiOrigin(resolved);
    const devOrigin = deriveApiOrigin(DEV_API_URL);
    if (origin === devOrigin) {
        throw new Error('운영 환경에서 VITE_API_URL이 localhost로 설정되었습니다.');
    }

    return resolved;
};

export const API_URL: string = resolveApiUrl();
export const API_ORIGIN: string = deriveApiOrigin(API_URL);
export const SERVER_ROOT: string = deriveServerRoot(API_URL, { isProd: import.meta.env.PROD });


