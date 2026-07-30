import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockPost } = vi.hoisted(() => {
    return {
        mockPost: vi.fn(),
    };
});

vi.mock('../client', () => ({
    apiClient: {
        post: mockPost,
    },
}));

import { authApi } from './auth.api';

describe('authApi OAuth code exchange', () => {
    beforeEach(() => {
        mockPost.mockReset();
    });

    it('단일 사용 code를 OAuth 교환 endpoint의 body로 전달한다', async () => {
        const response = {
            token: 'access-token',
            refreshToken: 'refresh-token',
            message: '로그인에 성공했습니다.',
            rating: 1500,
            tier: 'GOLD',
            tierLevel: 11,
            provider: 'GITHUB',
        };
        mockPost.mockResolvedValueOnce({ data: response });

        const result = await authApi.exchangeOAuthCode({ code: 'single-use-code' });

        expect(mockPost).toHaveBeenCalledOnce();
        expect(mockPost).toHaveBeenCalledWith('/auth/oauth/exchange', {
            code: 'single-use-code',
        });
        expect(result).toEqual(response);
    });

    it('같은 code의 동시 교환 요청은 하나의 HTTP 요청을 공유한다', async () => {
        const response = {
            token: 'access-token',
            refreshToken: 'refresh-token',
            message: '로그인에 성공했습니다.',
            rating: 1500,
            tier: 'GOLD',
            tierLevel: 11,
            provider: 'GITHUB',
        };
        let resolveRequest!: (value: { data: typeof response }) => void;
        mockPost.mockReturnValueOnce(
            new Promise((resolve) => {
                resolveRequest = resolve;
            })
        );

        const first = authApi.exchangeOAuthCode({ code: 'single-use-code' });
        const second = authApi.exchangeOAuthCode({ code: 'single-use-code' });

        expect(mockPost).toHaveBeenCalledOnce();
        resolveRequest({ data: response });

        await expect(Promise.all([first, second])).resolves.toEqual([response, response]);
    });
});
