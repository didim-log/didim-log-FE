/**
 * OAuth 콜백 처리 훅
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OAuthProvider } from '../../types/auth/oauth.types';
import { toOAuthProvider } from '../../types/auth/oauth.types';
import { useAuthStore } from '../../stores/auth.store';
import { useOnboardingStore } from '../../stores/onboarding.store';
import { decodeJwt } from '../../utils/jwt';
import { parseOAuthCallbackParams } from './oauthCallbackParser';

interface UseOAuthCallbackReturn {
    handleOAuthCallback: (searchParams: URLSearchParams) => Promise<void>;
}

const clearSensitiveQueryString = (): void => {
    try {
        window.history.replaceState({}, '', window.location.pathname);
    } catch {
        // ignore
    }
};

const parseProviderFromParams = (searchParams: URLSearchParams): OAuthProvider => {
    const providerRaw = searchParams.get('provider') ?? '';
    const provider = toOAuthProvider(providerRaw);
    if (provider) {
        return provider;
    }
    return 'GOOGLE';
};

export const useOAuthCallback = (): UseOAuthCallbackReturn => {
    const navigate = useNavigate();
    const { setTokens, setUser } = useAuthStore();
    const { setIsNewUser } = useOnboardingStore();

    const handleOAuthCallback = useCallback(
        async (searchParams: URLSearchParams) => {
            const parsed = parseOAuthCallbackParams(searchParams);
            clearSensitiveQueryString();

            if (parsed.kind === 'error') {
                navigate('/login', { state: { error: parsed.reason }, replace: true });
                return;
            }

            if (parsed.kind === 'signup') {
                setIsNewUser(true);
                navigate('/signup', { state: parsed.state, replace: true });
                return;
            }

            setTokens(parsed.tokens.accessToken, parsed.tokens.refreshToken);

            const provider = parseProviderFromParams(searchParams);
            const payload = decodeJwt(parsed.tokens.accessToken);
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
                provider,
            };
            setUser(user);

            navigate('/dashboard', { replace: true });
        },
        [navigate, setIsNewUser, setTokens, setUser]
    );

    return { handleOAuthCallback };
};


