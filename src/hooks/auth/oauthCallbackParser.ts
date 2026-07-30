/**
 * OAuth 콜백 Query String 파서 (순수 함수)
 */

import { toOAuthProvider } from '../../types/auth/oauth.types';
import type { OAuthProvider, OAuthTokens } from '../../types/auth/oauth.types';

export const OAUTH_SIGNUP_UNSUPPORTED_MESSAGE =
    'OAuth 신규 회원가입은 현재 지원하지 않습니다. BOJ 계정으로 회원가입한 뒤 다시 로그인해 주세요.';
export const OAUTH_LOGIN_FAILED_MESSAGE =
    'OAuth 로그인 정보를 확인할 수 없습니다. 로그인 화면에서 다시 시도해 주세요.';

type OAuthCallbackError = {
    kind: 'error';
    reason: string;
};

type OAuthCallbackExchange = {
    kind: 'exchange';
    code: string;
};

type OAuthCallbackLogin = {
    kind: 'login';
    tokens: OAuthTokens;
    provider: OAuthProvider | null;
};

type OAuthCallbackLegacyLogin = {
    kind: 'legacy-login';
    accessToken: string;
    provider: OAuthProvider | null;
};

export type OAuthCallbackParseResult =
    | OAuthCallbackError
    | OAuthCallbackExchange
    | OAuthCallbackLogin
    | OAuthCallbackLegacyLogin;

const getParam = (searchParams: URLSearchParams, key: string): string => {
    return searchParams.get(key) ?? '';
};

const getBooleanParam = (searchParams: URLSearchParams, key: string): boolean => {
    return getParam(searchParams, key) === 'true';
};

const parseProvider = (searchParams: URLSearchParams): OAuthProvider | null => {
    const providerRaw = getParam(searchParams, 'provider');
    if (!providerRaw) {
        return null;
    }
    return toOAuthProvider(providerRaw);
};

const parseAccessToken = (searchParams: URLSearchParams): string => {
    const accessToken = getParam(searchParams, 'accessToken') || getParam(searchParams, 'token');
    return accessToken.trim();
};

const parseOAuthError = (error: string): string => {
    if (error.trim().toLowerCase() === 'oauth_signup_not_supported') {
        return OAUTH_SIGNUP_UNSUPPORTED_MESSAGE;
    }
    return OAUTH_LOGIN_FAILED_MESSAGE;
};

export const parseOAuthCallbackParams = (searchParams: URLSearchParams): OAuthCallbackParseResult => {
    const error = getParam(searchParams, 'error');
    if (error) {
        return { kind: 'error', reason: parseOAuthError(error) };
    }

    const isNewUser = getBooleanParam(searchParams, 'isNewUser');
    if (isNewUser) {
        return { kind: 'error', reason: OAUTH_SIGNUP_UNSUPPORTED_MESSAGE };
    }

    const code = getParam(searchParams, 'code').trim();
    if (code) {
        return { kind: 'exchange', code };
    }

    const accessToken = parseAccessToken(searchParams);
    if (!accessToken) {
        return { kind: 'error', reason: OAUTH_LOGIN_FAILED_MESSAGE };
    }

    const provider = parseProvider(searchParams);
    const refreshToken = getParam(searchParams, 'refreshToken').trim();
    if (!refreshToken) {
        return { kind: 'legacy-login', accessToken, provider };
    }

    return {
        kind: 'login',
        tokens: { accessToken, refreshToken },
        provider,
    };
};
