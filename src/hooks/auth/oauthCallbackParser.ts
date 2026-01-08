/**
 * OAuth 콜백 Query String 파서 (순수 함수)
 */

import { toOAuthProvider } from '../../types/auth/oauth.types';
import type { OAuthProvider, OAuthSignupState, OAuthTokens } from '../../types/auth/oauth.types';

type OAuthCallbackError = {
    kind: 'error';
    reason: string;
};

type OAuthCallbackSignup = {
    kind: 'signup';
    state: OAuthSignupState;
};

type OAuthCallbackLogin = {
    kind: 'login';
    tokens: OAuthTokens;
};

export type OAuthCallbackParseResult = OAuthCallbackError | OAuthCallbackSignup | OAuthCallbackLogin;

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

const parseProfileImage = (searchParams: URLSearchParams): string | null => {
    const profileImage = getParam(searchParams, 'profileImage');
    if (!profileImage) {
        return null;
    }
    return profileImage;
};

const parseSignupState = (searchParams: URLSearchParams): OAuthSignupState | null => {
    const provider = parseProvider(searchParams);
    if (!provider) {
        return null;
    }

    const providerId = getParam(searchParams, 'providerId');
    if (!providerId) {
        return null;
    }

    const email = getParam(searchParams, 'email');
    const profileImage = parseProfileImage(searchParams);

    return { email, provider, providerId, profileImage };
};

const parseTokens = (searchParams: URLSearchParams): OAuthTokens | null => {
    const accessToken = getParam(searchParams, 'accessToken') || getParam(searchParams, 'token');
    if (!accessToken) {
        return null;
    }

    const refreshToken = getParam(searchParams, 'refreshToken');
    if (!refreshToken) {
        return null;
    }

    return { accessToken, refreshToken };
};

export const parseOAuthCallbackParams = (searchParams: URLSearchParams): OAuthCallbackParseResult => {
    const error = getParam(searchParams, 'error');
    if (error) {
        return { kind: 'error', reason: error };
    }

    const isNewUser = getBooleanParam(searchParams, 'isNewUser');
    if (isNewUser) {
        const state = parseSignupState(searchParams);
        if (!state) {
            return { kind: 'error', reason: '신규 유저 회원가입 정보가 올바르지 않습니다.' };
        }
        return { kind: 'signup', state };
    }

    const tokens = parseTokens(searchParams);
    if (!tokens) {
        return { kind: 'error', reason: '로그인 토큰이 없습니다.' };
    }

    return { kind: 'login', tokens };
};
