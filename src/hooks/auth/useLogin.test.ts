import { describe, expect, it } from 'vitest';
import { toLoginError } from './useLogin';

describe('toLoginError', () => {
    it('response가 있는 ApiError는 status/code/message 및 Rate Limit 정보를 매핑한다', () => {
        const error = {
            response: {
                status: 429,
                data: {
                    code: 'RATE_LIMIT',
                    message: '요청이 너무 많습니다.',
                    remainingAttempts: 2,
                    unlockTime: '2026-01-05T00:00:00.000Z',
                },
                headers: {},
            },
        };

        const loginError = toLoginError(error);

        expect(loginError.message).toBe('요청이 너무 많습니다.');
        expect(loginError.code).toBe('RATE_LIMIT');
        expect(loginError.status).toBe(429);
        expect(loginError.remainingAttempts).toBe(2);
        expect(loginError.unlockTime).toBe('2026-01-05T00:00:00.000Z');
    });

    it('remainingAttempts가 헤더에 있으면 헤더 값을 우선하지 않고(바디 우선), 없으면 헤더 값을 사용한다', () => {
        const errorWithHeaderOnly = {
            response: {
                status: 401,
                data: {
                    code: 'UNAUTHORIZED',
                    message: '로그인에 실패했습니다.',
                },
                headers: {
                    'x-rate-limit-remaining': '3',
                },
            },
        };

        const loginError = toLoginError(errorWithHeaderOnly);

        expect(loginError.status).toBe(401);
        expect(loginError.code).toBe('UNAUTHORIZED');
        expect(loginError.message).toBe('로그인에 실패했습니다.');
        expect(loginError.remainingAttempts).toBe(3);
    });

    it('일반 Error는 그대로 반환한다', () => {
        const loginError = toLoginError(new Error('boom'));

        expect(loginError.message).toBe('boom');
    });
});

