import { describe, expect, it } from 'vitest';
import { parseOAuthCallbackParams } from './oauthCallbackParser';

describe('parseOAuthCallbackParams', () => {
    it('error 파라미터가 있으면 error로 파싱한다', () => {
        const params = new URLSearchParams({ error: 'OAUTH_FAILED' });

        const result = parseOAuthCallbackParams(params);

        expect(result.kind).toBe('error');
        if (result.kind !== 'error') return;
        expect(result.reason).toBe('OAUTH_FAILED');
    });

    it('isNewUser=true면 signup으로 파싱한다', () => {
        const params = new URLSearchParams({
            isNewUser: 'true',
            email: 'test@example.com',
            provider: 'google',
            providerId: '123',
            profileImage: 'https://example.com/a.png',
        });

        const result = parseOAuthCallbackParams(params);

        expect(result.kind).toBe('signup');
        if (result.kind !== 'signup') return;
        expect(result.state.email).toBe('test@example.com');
        expect(result.state.provider).toBe('GOOGLE');
        expect(result.state.providerId).toBe('123');
        expect(result.state.profileImage).toBe('https://example.com/a.png');
    });

    it('isNewUser=true지만 provider/providerId가 없으면 error로 파싱한다', () => {
        const params = new URLSearchParams({ isNewUser: 'true' });

        const result = parseOAuthCallbackParams(params);

        expect(result.kind).toBe('error');
    });

    it('기존 유저는 accessToken/refreshToken으로 login을 파싱한다', () => {
        const params = new URLSearchParams({ accessToken: 'a', refreshToken: 'r' });

        const result = parseOAuthCallbackParams(params);

        expect(result.kind).toBe('login');
        if (result.kind !== 'login') return;
        expect(result.tokens.accessToken).toBe('a');
        expect(result.tokens.refreshToken).toBe('r');
    });

    it('레거시 token 파라미터도 accessToken으로 허용한다', () => {
        const params = new URLSearchParams({ token: 'a', refreshToken: 'r' });

        const result = parseOAuthCallbackParams(params);

        expect(result.kind).toBe('login');
        if (result.kind !== 'login') return;
        expect(result.tokens.accessToken).toBe('a');
    });
});



