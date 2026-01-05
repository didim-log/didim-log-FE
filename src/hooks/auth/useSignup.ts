/**
 * 회원가입 훅
 */

import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/endpoints/auth.api';
import { useAuthStore } from '../../stores/auth.store';
import { isApiErrorWithResponse } from '../../types/api/common.types';
import type { AuthResponse, SignupRequest } from '../../types/api/auth.types';

interface SignupError extends Error {
    code?: string;
    status?: number;
    fieldErrors?: Record<string, string[]>; // 필드별 에러 메시지 배열
}

interface UseSignupReturn {
    signup: (data: SignupRequest) => void;
    isLoading: boolean;
    error: SignupError | null;
}

export const useSignup = (): UseSignupReturn => {
    const navigate = useNavigate();
    const { setTokens, setUser } = useAuthStore();

    const signupMutation = useMutation({
        mutationFn: authApi.signup,
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

            // 3. 모든 상태 업데이트 완료 후 리다이렉트
            await Promise.all([
                // 필요한 경우 추가 초기화 작업
            ]);

            // 4. 리다이렉트 (동기적 상태 업데이트 완료 후)
            navigate('/dashboard', { replace: true });
        },
        onError: () => {
            // 에러는 mutation.error로 자동 전달됨
        },
    });

    // 에러를 세분화하여 변환
    const getError = (): SignupError | null => {
        const error = signupMutation.error;
        if (!error) return null;

        // axios 에러인 경우
        if (isApiErrorWithResponse(error)) {
            const response = error.response;
            const errorData = response.data;
            const status = response.status;
            const code = errorData?.code || 'UNKNOWN_ERROR';
            const message = errorData?.message || '회원가입 중 오류가 발생했습니다.';

            const signupError: SignupError = new Error(message) as SignupError;
            signupError.code = code;
            signupError.status = status;
            
            // 필드별 에러 메시지는 백엔드에서 제공하지 않으므로 제거
            // 필요시 백엔드 API 응답 구조에 맞춰 추가 가능

            return signupError;
        }

        // 일반 에러인 경우
        return error as SignupError;
    };

    return {
        signup: signupMutation.mutate,
        isLoading: signupMutation.isPending,
        error: getError(),
    };
};

