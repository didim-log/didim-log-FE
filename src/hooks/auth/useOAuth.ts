/**
 * OAuth 콜백 처리 훅
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { setAuthHeader } from '../../api/client';
import { useOnboardingStore } from '../../stores/onboarding.store';
import { decodeJwt } from '../../utils/jwt';

interface UseOAuthReturn {
    handleOAuthCallback: (searchParams: URLSearchParams) => Promise<void>;
}

export const useOAuth = (): UseOAuthReturn => {
    const navigate = useNavigate();
    const { setToken, setUser } = useAuthStore();
    const { setIsNewUser } = useOnboardingStore();

    const handleOAuthCallback = useCallback(
        async (searchParams: URLSearchParams) => {
            // 토큰/개인정보가 URL에 남지 않도록 즉시 정리(히스토리 replace)
            try {
                window.history.replaceState({}, '', window.location.pathname);
            } catch {
                // ignore
            }

            const error = searchParams.get('error');
            if (error) {
                navigate('/login', { state: { error }, replace: true });
                return;
            }

            const isNewUser = searchParams.get('isNewUser') === 'true';

            if (isNewUser) {
                // 신규 유저: 회원가입 마무리 페이지로 이동
                const email = searchParams.get('email') || '';
                const provider = searchParams.get('provider') || '';
                const providerId = searchParams.get('providerId') || '';

                setIsNewUser(true);

                navigate(
                    '/signup/finalize',
                    {
                        state: { email, provider, providerId },
                        replace: true,
                    }
                );
            } else {
                // 기존 유저: 토큰 저장 및 대시보드로 이동
                const token = searchParams.get('token');
                if (!token) {
                    navigate('/login', { state: { error: '토큰이 없습니다.' }, replace: true });
                    return;
                }

                // 동기적 처리 (useLogin과 동일)
                setToken(token);
                setAuthHeader(token);
                const payload = decodeJwt(token);
                const role = (payload?.role as 'USER' | 'ADMIN' | 'GUEST') || 'USER';
                const user = {
                    id: payload?.sub || '',
                    nickname: '',
                    bojId: null,
                    email: null,
                    role,
                    rating: 0,
                    tier: 'UNRATED',
                    tierLevel: 0,
                    provider: 'GOOGLE' as const,
                };
                setUser(user);

                navigate('/dashboard', { replace: true });
            }
        },
        [navigate, setToken, setUser, setIsNewUser]
    );

    return { handleOAuthCallback };
};


