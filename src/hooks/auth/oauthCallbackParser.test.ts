import { describe, expect, it } from 'vitest';
import {
    OAUTH_LOGIN_FAILED_MESSAGE,
    OAUTH_SIGNUP_UNSUPPORTED_MESSAGE,
    parseOAuthCallbackParams,
} from './oauthCallbackParser';

describe('parseOAuthCallbackParams', () => {
    it.each(['oauth_login_failed', 'invalid_provider', 'unknown_error'])(
        '%s error는 일반 로그인 실패 안내로 파싱한다',
        (error) => {
            const params = new URLSearchParams({ error });

            const result = parseOAuthCallbackParams(params);

            expect(result).toEqual({
                kind: 'error',
                reason: OAUTH_LOGIN_FAILED_MESSAGE,
            });
        }
    );

    it('oauth_signup_not_supported는 BOJ 가입 안내로 파싱한다', () => {
        const params = new URLSearchParams({ error: 'oauth_signup_not_supported' });

        const result = parseOAuthCallbackParams(params);

        expect(result).toEqual({
            kind: 'error',
            reason: OAUTH_SIGNUP_UNSUPPORTED_MESSAGE,
        });
    });

    it('error 파라미터는 code보다 우선한다', () => {
        const params = new URLSearchParams({
            error: 'OAUTH_FAILED',
            code: 'single-use-code',
        });

        const result = parseOAuthCallbackParams(params);

        expect(result).toEqual({
            kind: 'error',
            reason: OAUTH_LOGIN_FAILED_MESSAGE,
        });
    });

    it('code 파라미터를 단일 사용 교환 코드로 파싱한다', () => {
        const params = new URLSearchParams({ code: ' single-use-code ' });

        const result = parseOAuthCallbackParams(params);

        expect(result).toEqual({ kind: 'exchange', code: 'single-use-code' });
    });

    it('code는 레거시 token 파라미터보다 우선한다', () => {
        const params = new URLSearchParams({
            code: 'single-use-code',
            token: 'legacy-access-token',
        });

        const result = parseOAuthCallbackParams(params);

        expect(result).toEqual({ kind: 'exchange', code: 'single-use-code' });
    });

    it('isNewUser=true면 지원 중단 안내 error로 파싱한다', () => {
        const params = new URLSearchParams({
            isNewUser: 'true',
            email: 'test@example.com',
            provider: 'google',
            providerId: '123',
            profileImage: 'https://example.com/a.png',
        });

        const result = parseOAuthCallbackParams(params);

        expect(result).toEqual({
            kind: 'error',
            reason: OAUTH_SIGNUP_UNSUPPORTED_MESSAGE,
        });
    });

    it('isNewUser=true는 provider 정보가 없어도 같은 지원 중단 안내를 반환한다', () => {
        const params = new URLSearchParams({ isNewUser: 'true' });

        const result = parseOAuthCallbackParams(params);

        expect(result).toEqual({
            kind: 'error',
            reason: OAUTH_SIGNUP_UNSUPPORTED_MESSAGE,
        });
    });

    it('기존 유저는 accessToken/refreshToken으로 login을 파싱한다', () => {
        const params = new URLSearchParams({
            accessToken: 'a',
            refreshToken: 'r',
            provider: 'github',
        });

        const result = parseOAuthCallbackParams(params);

        expect(result.kind).toBe('login');
        if (result.kind !== 'login') return;
        expect(result.tokens.accessToken).toBe('a');
        expect(result.tokens.refreshToken).toBe('r');
        expect(result.provider).toBe('GITHUB');
    });

    it('레거시 access token만 있어도 refresh token 없는 login으로 파싱한다', () => {
        const params = new URLSearchParams({
            token: 'legacy-access-token',
            provider: 'naver',
        });

        const result = parseOAuthCallbackParams(params);

        expect(result).toEqual({
            kind: 'legacy-login',
            accessToken: 'legacy-access-token',
            provider: 'NAVER',
        });
    });

    it('빈 code와 토큰이 없으면 error로 파싱한다', () => {
        const params = new URLSearchParams({ code: ' ' });

        const result = parseOAuthCallbackParams(params);

        expect(result.kind).toBe('error');
    });
});
