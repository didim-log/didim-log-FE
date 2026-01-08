/**
 * 로그인 훅 (동기적 처리 보장)
 */

import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/endpoints/auth.api';
import { useAuthStore } from '../../stores/auth.store';
import { isApiErrorWithResponse } from '../../types/api/common.types';
import type { AuthResponse } from '../../types/api/auth.types';

export interface LoginError extends Error {
    code?: string;
    status?: number;
    remainingAttempts?: number; // Rate Limit 남은 시도 횟수
    unlockTime?: string; // Rate Limit 잠금 해제 시간 (ISO 8601 형식)
}

export interface LoginRequest {
    bojId: string;
    password: string;
}

export interface LoginHandlers {
    onError?: (error: LoginError) => void;
    onSettled?: () => void;
}

interface UseLoginReturn {
    login: (data: LoginRequest, handlers?: LoginHandlers) => void;
    isLoading: boolean;
}

export const toLoginError = (error: unknown): LoginError => {
    if (isApiErrorWithResponse(error)) {
        const response = error.response;
        const errorData = response.data;
        const status = response.status;
        const code = errorData?.code || 'UNKNOWN_ERROR';
        const message = errorData?.message || '로그인 중 오류가 발생했습니다.';

        const remainingAttempts =
            errorData?.remainingAttempts ??
            (response.headers?.['x-rate-limit-remaining']
                ? parseInt(response.headers['x-rate-limit-remaining'], 10)
                : undefined);
        const unlockTime = errorData?.unlockTime;

        const loginError: LoginError = new Error(message) as LoginError;
        loginError.code = code;
        loginError.status = status;
        loginError.remainingAttempts = remainingAttempts;
        loginError.unlockTime = unlockTime;
        return loginError;
    }

    if (error instanceof Error) {
        return error as LoginError;
    }

    return new Error('로그인 중 오류가 발생했습니다.') as LoginError;
};

export const useLogin = (): UseLoginReturn => {
    const navigate = useNavigate();
    const { setTokens, setUser } = useAuthStore();

    const loginMutation = useMutation({
        mutationFn: authApi.login,
        retry: 0,
        onSuccess: async (data: AuthResponse) => {
            // 1. 토큰 저장 (Access Token + Refresh Token)
            setTokens(data.token, data.refreshToken);

            // 2. 사용자 정보 저장 (토큰에서 추출)
            const { decodeJwt } = await import('../../utils/jwt');
            const payload = decodeJwt(data.token);
            const user = {
                id: payload?.sub || '',
                nickname: '',
                bojId: payload?.sub || '',
                email: null,
                role: (payload?.role as 'USER' | 'ADMIN' | 'GUEST') || 'USER',
                rating: data.rating,
                tier: data.tier,
                tierLevel: data.tierLevel,
                provider: 'BOJ' as const,
            };
            setUser(user);

            // 3. 상태 업데이트 완료를 기다리는 Promise (최대 50회 재시도, 총 500ms)
            await new Promise<void>((resolve) => {
                let retryCount = 0;
                const maxRetries = 50;
                
                const checkState = () => {
                    const state = useAuthStore.getState();
                    if (state.isAuthenticated && state.token) {
                        resolve();
                    } else if (retryCount < maxRetries) {
                        retryCount++;
                        // 짧은 지연 후 다시 확인
                        setTimeout(checkState, 10);
                    } else {
                        // 최대 재시도 횟수 초과 시에도 진행 (상태는 이미 설정됨)
                        resolve();
                    }
                };
                checkState();
            });

            // 4. 리다이렉트
            navigate('/dashboard', { replace: true });
        },
    });

    return {
        login: (data: LoginRequest, handlers?: LoginHandlers) => {
            loginMutation.mutate(data, {
                onError: (error) => {
                    handlers?.onError?.(toLoginError(error));
                },
                onSettled: () => {
                    handlers?.onSettled?.();
                },
            });
        },
        isLoading: loginMutation.isPending,
    };
};
