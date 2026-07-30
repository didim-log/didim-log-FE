/**
 * OAuth 콜백 처리 훅
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NavigateFunction } from 'react-router-dom';
import { authApi } from '../../api/endpoints/auth.api';
import { useAuthStore } from '../../stores/auth.store';
import { useOnboardingStore } from '../../stores/onboarding.store';
import type { OAuthCodeExchangeResponse } from '../../types/api/auth.types';
import { isApiErrorWithResponse } from '../../types/api/common.types';
import type { User } from '../../types/domain/user.types';
import type { OAuthProvider } from '../../types/auth/oauth.types';
import { toOAuthProvider } from '../../types/auth/oauth.types';
import { decodeJwt } from '../../utils/jwt';
import { consumeOAuthProvider } from '../../utils/oauthProviderSession';
import {
    OAUTH_LOGIN_FAILED_MESSAGE,
    parseOAuthCallbackParams,
} from './oauthCallbackParser';

interface UseOAuthCallbackReturn {
    handleOAuthCallback: (searchParams: URLSearchParams) => Promise<void>;
}

interface OAuthCallbackActions {
    exchangeOAuthCode: (code: string) => Promise<OAuthCodeExchangeResponse>;
    setToken: (token: string) => void;
    setTokens: (token: string, refreshToken: string) => void;
    setUser: (user: User) => void;
    setIsNewUser: (isNewUser: boolean) => void;
    logout: () => void;
    navigate: NavigateFunction;
    clearQueryString: () => void;
    consumeRememberedProvider: () => OAuthProvider | null;
}

const clearSensitiveQueryString = (): void => {
    try {
        window.history.replaceState({}, '', window.location.pathname);
    } catch {
        // ignore
    }
};

const parseAuthenticatedRole = (role: unknown): User['role'] | null => {
    if (role === 'USER' || role === 'ADMIN') {
        return role;
    }
    return null;
};

const buildOAuthUser = (
    accessToken: string,
    provider: OAuthProvider,
    profile: Pick<OAuthCodeExchangeResponse, 'rating' | 'tier' | 'tierLevel'>
): User => {
    const payload = decodeJwt(accessToken);
    const subject = payload?.sub?.trim() ?? '';
    const role = parseAuthenticatedRole(payload?.role);
    if (!subject || !role) {
        throw new Error(OAUTH_LOGIN_FAILED_MESSAGE);
    }

    if (
        !Number.isFinite(profile.rating) ||
        typeof profile.tier !== 'string' ||
        !Number.isFinite(profile.tierLevel)
    ) {
        throw new Error(OAUTH_LOGIN_FAILED_MESSAGE);
    }

    return {
        id: subject,
        nickname: '',
        bojId: subject,
        email: null,
        role,
        rating: profile.rating,
        tier: profile.tier,
        tierLevel: profile.tierLevel,
        provider,
    };
};

const buildExchangeSession = (
    response: OAuthCodeExchangeResponse
): { accessToken: string; refreshToken: string; user: User } => {
    const accessToken = response.token?.trim() ?? '';
    const refreshToken = response.refreshToken?.trim() ?? '';
    const provider = toOAuthProvider(response.provider ?? '');
    if (!accessToken || !refreshToken || !provider) {
        throw new Error(OAUTH_LOGIN_FAILED_MESSAGE);
    }

    return {
        accessToken,
        refreshToken,
        user: buildOAuthUser(accessToken, provider, response),
    };
};

const getFailureReason = (error: unknown): string => {
    if (isApiErrorWithResponse(error)) {
        const message = error.response.data?.message?.trim();
        if (message) {
            return message;
        }
    }
    return OAUTH_LOGIN_FAILED_MESSAGE;
};

const failOAuthLogin = (
    reason: string,
    actions: Pick<OAuthCallbackActions, 'logout' | 'navigate'>
): void => {
    actions.logout();
    actions.navigate('/login', { state: { error: reason }, replace: true });
};

export const processOAuthCallback = async (
    searchParams: URLSearchParams,
    actions: OAuthCallbackActions
): Promise<void> => {
    const parsed = parseOAuthCallbackParams(searchParams);
    actions.clearQueryString();
    const rememberedProvider = actions.consumeRememberedProvider();

    if (parsed.kind === 'error') {
        failOAuthLogin(parsed.reason, actions);
        return;
    }

    try {
        if (parsed.kind === 'exchange') {
            const response = await actions.exchangeOAuthCode(parsed.code);
            const session = buildExchangeSession(response);

            actions.setTokens(session.accessToken, session.refreshToken);
            actions.setUser(session.user);
            actions.setIsNewUser(false);
            actions.navigate('/dashboard', { replace: true });
            return;
        }

        const provider = parsed.provider ?? rememberedProvider;
        if (!provider) {
            throw new Error(OAUTH_LOGIN_FAILED_MESSAGE);
        }
        const accessToken =
            parsed.kind === 'legacy-login'
                ? parsed.accessToken
                : parsed.tokens.accessToken;
        const user = buildOAuthUser(accessToken, provider, {
            rating: 0,
            tier: 'UNRATED',
            tierLevel: 0,
        });

        if (parsed.kind === 'legacy-login') {
            actions.setToken(accessToken);
        } else {
            actions.setTokens(accessToken, parsed.tokens.refreshToken);
        }
        actions.setUser(user);
        actions.setIsNewUser(false);
        actions.navigate('/dashboard', { replace: true });
    } catch (error) {
        failOAuthLogin(getFailureReason(error), actions);
    }
};

export const useOAuthCallback = (): UseOAuthCallbackReturn => {
    const navigate = useNavigate();
    const { setToken, setTokens, setUser, logout } = useAuthStore();
    const { setIsNewUser } = useOnboardingStore();

    const handleOAuthCallback = useCallback(
        async (searchParams: URLSearchParams) => {
            await processOAuthCallback(searchParams, {
                exchangeOAuthCode: (code) => authApi.exchangeOAuthCode({ code }),
                setToken,
                setTokens,
                setUser,
                setIsNewUser,
                logout,
                navigate,
                clearQueryString: clearSensitiveQueryString,
                consumeRememberedProvider: consumeOAuthProvider,
            });
        },
        [logout, navigate, setIsNewUser, setToken, setTokens, setUser]
    );

    return { handleOAuthCallback };
};
