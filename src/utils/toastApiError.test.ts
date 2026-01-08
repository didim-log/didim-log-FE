import { describe, expect, it, vi, beforeEach } from 'vitest';

const toastErrorMock = vi.fn();

vi.mock('sonner', () => ({
    toast: {
        error: toastErrorMock,
    },
}));

const { toastApiError } = await import('./toastApiError');

describe('toastApiError', () => {
    beforeEach(() => {
        toastErrorMock.mockClear();
    });

    it('일반 Error는 message로 toast.error를 호출한다', () => {
        toastApiError(new Error('boom'));
        expect(toastErrorMock).toHaveBeenCalledTimes(1);
        expect(toastErrorMock).toHaveBeenCalledWith('boom');
    });

    it('429 + remainingAttempts/unlockTime이 있으면 description 옵션과 함께 toast.error를 호출한다', () => {
        const error = {
            response: {
                status: 429,
                data: {
                    message: '요청이 너무 많습니다.',
                    remainingAttempts: 2,
                    unlockTime: '2026-01-05T00:00:00.000Z',
                },
                headers: {},
            },
            message: 'fallback',
        };

        toastApiError(error);

        expect(toastErrorMock).toHaveBeenCalledTimes(1);
        expect(toastErrorMock).toHaveBeenCalledWith('요청이 너무 많습니다.', {
            description: '남은 시도 횟수: 2회 · 재시도 가능 시간: 2026-01-05T00:00:00.000Z',
            duration: 5000,
        });
    });

    it('429이지만 부가 정보가 없으면 message만 toast.error를 호출한다', () => {
        const error = {
            response: {
                status: 429,
                data: {
                    message: '요청이 너무 많습니다.',
                },
                headers: {},
            },
            message: 'fallback',
        };

        toastApiError(error);

        expect(toastErrorMock).toHaveBeenCalledTimes(1);
        expect(toastErrorMock).toHaveBeenCalledWith('요청이 너무 많습니다.');
    });
});
