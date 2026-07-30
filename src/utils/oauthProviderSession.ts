import type { OAuthProvider } from '../types/auth/oauth.types';
import { toOAuthProvider } from '../types/auth/oauth.types';

const OAUTH_PROVIDER_SESSION_KEY = 'oauth-login-provider';

export const rememberOAuthProvider = (provider: string): void => {
    const normalized = toOAuthProvider(provider);
    if (!normalized) {
        return;
    }

    try {
        sessionStorage.setItem(OAUTH_PROVIDER_SESSION_KEY, normalized);
    } catch {
        // callback의 provider 응답 검증을 계속 사용한다.
    }
};

export const consumeOAuthProvider = (): OAuthProvider | null => {
    try {
        const provider = sessionStorage.getItem(OAUTH_PROVIDER_SESSION_KEY) ?? '';
        sessionStorage.removeItem(OAUTH_PROVIDER_SESSION_KEY);
        return toOAuthProvider(provider);
    } catch {
        return null;
    }
};
