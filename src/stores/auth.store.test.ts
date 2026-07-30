import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockSetAuthHeader } = vi.hoisted(() => {
    return {
        mockSetAuthHeader: vi.fn(),
    };
});

vi.mock('../api/client', () => ({
    setAuthHeader: mockSetAuthHeader,
    removeAuthHeader: vi.fn(),
}));

let useAuthStore: typeof import('./auth.store').useAuthStore;

beforeAll(async () => {
    const values = new Map<string, string>();
    vi.stubGlobal('localStorage', {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => {
            values.set(key, value);
        },
        removeItem: (key: string) => {
            values.delete(key);
        },
    });
    ({ useAuthStore } = await import('./auth.store'));
});

beforeEach(() => {
    mockSetAuthHeader.mockReset();
    useAuthStore.setState({
        token: 'old-access-token',
        refreshToken: 'stale-refresh-token',
        user: null,
        isAuthenticated: true,
    });
});

describe('auth store access-only session', () => {
    it('setToken은 이전 refresh token을 제거한다', () => {
        useAuthStore.getState().setToken('legacy-access-token');

        expect(useAuthStore.getState().token).toBe('legacy-access-token');
        expect(useAuthStore.getState().refreshToken).toBeNull();
        expect(mockSetAuthHeader).toHaveBeenCalledWith('legacy-access-token');
    });
});
