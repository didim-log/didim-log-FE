import type { NavigateFunction } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { OAuthProvider } from '../../types/auth/oauth.types';

vi.mock('../../api/endpoints/auth.api', () => ({
    authApi: {
        exchangeOAuthCode: vi.fn(),
    },
}));

vi.mock('../../stores/auth.store', () => ({
    useAuthStore: vi.fn(),
}));

vi.mock('../../stores/onboarding.store', () => ({
    useOnboardingStore: vi.fn(),
}));

import {
    OAUTH_LOGIN_FAILED_MESSAGE,
    OAUTH_SIGNUP_UNSUPPORTED_MESSAGE,
} from './oauthCallbackParser';
import { processOAuthCallback } from './useOAuthCallback';

const createJwt = (subject = 'oauth-user', role = 'USER'): string => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ sub: subject, role })).toString('base64url');
    return `${header}.${payload}.signature`;
};

const createActions = () => {
    return {
        exchangeOAuthCode: vi.fn(),
        setToken: vi.fn(),
        setTokens: vi.fn(),
        setUser: vi.fn(),
        setIsNewUser: vi.fn(),
        logout: vi.fn(),
        navigate: vi.fn() as unknown as NavigateFunction,
        clearQueryString: vi.fn(),
        consumeRememberedProvider: vi.fn(() => null as OAuthProvider | null),
    };
};

describe('processOAuthCallback', () => {
    it('URL을 먼저 정리하고 code를 교환한 뒤 완전한 인증 상태를 저장한다', async () => {
        const actions = createActions();
        const accessToken = createJwt('oauth-user', 'USER');
        actions.exchangeOAuthCode.mockResolvedValueOnce({
            token: accessToken,
            refreshToken: 'refresh-token',
            message: '로그인에 성공했습니다.',
            rating: 1700,
            tier: 'GOLD',
            tierLevel: 12,
            provider: 'github',
        });

        await processOAuthCallback(
            new URLSearchParams({ code: 'single-use-code' }),
            actions
        );

        expect(actions.clearQueryString).toHaveBeenCalledOnce();
        expect(actions.exchangeOAuthCode).toHaveBeenCalledWith('single-use-code');
        expect(actions.clearQueryString.mock.invocationCallOrder[0])
            .toBeLessThan(actions.exchangeOAuthCode.mock.invocationCallOrder[0]);
        expect(actions.setTokens).toHaveBeenCalledWith(accessToken, 'refresh-token');
        expect(actions.setUser).toHaveBeenCalledWith({
            id: 'oauth-user',
            nickname: '',
            bojId: 'oauth-user',
            email: null,
            role: 'USER',
            rating: 1700,
            tier: 'GOLD',
            tierLevel: 12,
            provider: 'GITHUB',
        });
        expect(actions.setIsNewUser).toHaveBeenCalledWith(false);
        expect(actions.navigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        expect(actions.logout).not.toHaveBeenCalled();
    });

    it('교환 응답이 불완전하면 토큰 일부를 저장하지 않고 로그인으로 이동한다', async () => {
        const actions = createActions();
        actions.exchangeOAuthCode.mockResolvedValueOnce({
            token: createJwt(),
            refreshToken: '',
            message: '로그인에 성공했습니다.',
            rating: 1700,
            tier: 'GOLD',
            tierLevel: 12,
            provider: 'GITHUB',
        });

        await processOAuthCallback(
            new URLSearchParams({ code: 'single-use-code' }),
            actions
        );

        expect(actions.setToken).not.toHaveBeenCalled();
        expect(actions.setTokens).not.toHaveBeenCalled();
        expect(actions.setUser).not.toHaveBeenCalled();
        expect(actions.logout).toHaveBeenCalledOnce();
        expect(actions.navigate).toHaveBeenCalledWith('/login', {
            state: { error: OAUTH_LOGIN_FAILED_MESSAGE },
            replace: true,
        });
    });

    it('교환 API 실패 메시지를 로그인 화면에 전달하고 인증 상태를 비운다', async () => {
        const actions = createActions();
        actions.exchangeOAuthCode.mockRejectedValueOnce({
            response: {
                status: 400,
                data: {
                    status: 400,
                    error: 'Bad Request',
                    code: 'INVALID_OAUTH_EXCHANGE_CODE',
                    message: 'OAuth 로그인 코드가 만료되었거나 이미 사용되었습니다.',
                },
            },
        });

        await processOAuthCallback(
            new URLSearchParams({ code: 'expired-code' }),
            actions
        );

        expect(actions.setToken).not.toHaveBeenCalled();
        expect(actions.setTokens).not.toHaveBeenCalled();
        expect(actions.setUser).not.toHaveBeenCalled();
        expect(actions.logout).toHaveBeenCalledOnce();
        expect(actions.navigate).toHaveBeenCalledWith('/login', {
            state: { error: 'OAuth 로그인 코드가 만료되었거나 이미 사용되었습니다.' },
            replace: true,
        });
    });

    it('레거시 access token만 받으면 refresh 없는 저장 경로를 사용한다', async () => {
        const actions = createActions();
        const accessToken = createJwt('legacy-user', 'ADMIN');

        await processOAuthCallback(
            new URLSearchParams({
                token: accessToken,
                provider: 'naver',
            }),
            actions
        );

        expect(actions.exchangeOAuthCode).not.toHaveBeenCalled();
        expect(actions.setToken).toHaveBeenCalledWith(accessToken);
        expect(actions.setTokens).not.toHaveBeenCalled();
        expect(actions.setUser).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'legacy-user',
                bojId: 'legacy-user',
                role: 'ADMIN',
                provider: 'NAVER',
            })
        );
        expect(actions.navigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });

    it('레거시 callback의 provider가 없으면 로그인 시작 시 저장한 provider를 사용한다', async () => {
        const actions = createActions();
        const accessToken = createJwt('legacy-user', 'USER');
        actions.consumeRememberedProvider.mockReturnValueOnce('GITHUB');

        await processOAuthCallback(
            new URLSearchParams({ token: accessToken }),
            actions
        );

        expect(actions.setToken).toHaveBeenCalledWith(accessToken);
        expect(actions.setUser).toHaveBeenCalledWith(
            expect.objectContaining({ provider: 'GITHUB' })
        );
    });

    it('레거시 callback과 로그인 세션에 provider가 모두 없으면 임의 provider를 저장하지 않는다', async () => {
        const actions = createActions();

        await processOAuthCallback(
            new URLSearchParams({ token: createJwt('legacy-user', 'USER') }),
            actions
        );

        expect(actions.setToken).not.toHaveBeenCalled();
        expect(actions.setTokens).not.toHaveBeenCalled();
        expect(actions.setUser).not.toHaveBeenCalled();
        expect(actions.logout).toHaveBeenCalledOnce();
        expect(actions.navigate).toHaveBeenCalledWith('/login', {
            state: { error: OAUTH_LOGIN_FAILED_MESSAGE },
            replace: true,
        });
    });

    it('신규 OAuth 가입 callback은 410 정책 안내와 함께 로그인으로 이동한다', async () => {
        const actions = createActions();

        await processOAuthCallback(
            new URLSearchParams({
                isNewUser: 'true',
                email: 'oauth@example.com',
                provider: 'google',
                providerId: 'provider-user',
            }),
            actions
        );

        expect(actions.exchangeOAuthCode).not.toHaveBeenCalled();
        expect(actions.setToken).not.toHaveBeenCalled();
        expect(actions.setTokens).not.toHaveBeenCalled();
        expect(actions.logout).toHaveBeenCalledOnce();
        expect(actions.navigate).toHaveBeenCalledWith('/login', {
            state: { error: OAUTH_SIGNUP_UNSUPPORTED_MESSAGE },
            replace: true,
        });
    });
});
