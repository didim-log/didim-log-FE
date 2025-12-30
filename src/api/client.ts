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
 * 응답 인터셉터: 401 에러 시 자동 로그아웃
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const { logout } = useAuthStore.getState();
            logout();
            removeAuthHeader();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

