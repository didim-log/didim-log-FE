/**
 * Axios 인스턴스 생성 및 기본 설정
 */

import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => {
    if (value === null) {
        return false;
    }
    return typeof value === 'object';
};

/**
 * Spring Data Page 기본 직렬화(number/first/last)를
 * 프론트에서 사용하는 Page 타입(currentPage/hasNext/hasPrevious)로 보정합니다.
 *
 * - Backend는 page 요청을 1-based로 받지만(PageRequest.of(page-1,...)),
 *   응답의 `number`는 0-based입니다.
 * - 기존 UI는 `currentPage`를 1-based로 기대하므로(number + 1)로 보정합니다.
 */
const normalizeSpringPage = (data: unknown): unknown => {
    if (!isRecord(data)) {
        return data;
    }

    if (!('content' in data)) {
        return data;
    }

    // 이미 커스텀 PageResponse(currentPage/hasNext/hasPrevious)를 쓰는 경우는 그대로 둡니다.
    if ('currentPage' in data && 'hasNext' in data && 'hasPrevious' in data) {
        return data;
    }

    const hasNumber = typeof data.number === 'number';
    const hasSize = typeof data.size === 'number';
    const hasTotalElements = typeof data.totalElements === 'number';
    const hasTotalPages = typeof data.totalPages === 'number';
    const hasFirst = typeof data.first === 'boolean';
    const hasLast = typeof data.last === 'boolean';

    if (!hasNumber || !hasSize || !hasTotalElements || !hasTotalPages) {
        return data;
    }

    const currentPage = (data.number as number) + 1;
    const hasPrevious = hasFirst ? !((data.first as boolean) ?? true) : currentPage > 1;
    const hasNext = hasLast ? !((data.last as boolean) ?? true) : currentPage < (data.totalPages as number);

    return {
        ...data,
        currentPage,
        hasNext,
        hasPrevious,
    };
};

/**
 * 토큰 헤더 설정 함수 (동기적)
 */
export const setAuthHeader = (token: string): void => {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

/**
 * 토큰 헤더 제거 함수
 */
export const removeAuthHeader = (): void => {
    delete apiClient.defaults.headers.common['Authorization'];
};

/**
 * 요청 인터셉터: 토큰 자동 주입
 */
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * 응답 인터셉터: 401 에러 시 자동 토큰 갱신 및 재시도
 */
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => {
        response.data = normalizeSpringPage(response.data);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Public API는 401 처리에서 제외 (무한 루프 방지)
        const isPublicApi = originalRequest.url?.includes('/api/v1/system/status') || 
                           originalRequest.url?.includes('/api/v1/auth/');

        // 401 에러이고, refresh 엔드포인트가 아닌 경우에만 처리
        if (error.response?.status === 401 && !originalRequest._retry && 
            !originalRequest.url?.includes('/auth/refresh') && !isPublicApi) {
            if (isRefreshing) {
                // 이미 refresh 중이면 대기열에 추가
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const { refreshToken } = useAuthStore.getState();

            if (!refreshToken) {
                // Refresh Token이 없으면 로그아웃
                const { logout } = useAuthStore.getState();
                logout();
                removeAuthHeader();
                processQueue(error);
                isRefreshing = false;
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const { authApi } = await import('./endpoints/auth.api');
                const response = await authApi.refresh({ refreshToken });
                const { setTokens } = useAuthStore.getState();
                setTokens(response.token, response.refreshToken);

                // 원래 요청 재시도
                originalRequest.headers.Authorization = `Bearer ${response.token}`;
                processQueue(null, response.token);
                isRefreshing = false;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh 실패 시 로그아웃
                processQueue(refreshError);
                isRefreshing = false;
                const { logout } = useAuthStore.getState();
                logout();
                removeAuthHeader();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);


