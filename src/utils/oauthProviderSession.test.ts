import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    consumeOAuthProvider,
    rememberOAuthProvider,
} from './oauthProviderSession';

const values = new Map<string, string>();

beforeEach(() => {
    values.clear();
    vi.stubGlobal('sessionStorage', {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => {
            values.set(key, value);
        },
        removeItem: (key: string) => {
            values.delete(key);
        },
    });
});

describe('OAuth provider session', () => {
    it('로그인 시작 provider를 callback에서 한 번만 소비한다', () => {
        rememberOAuthProvider('github');

        expect(consumeOAuthProvider()).toBe('GITHUB');
        expect(consumeOAuthProvider()).toBeNull();
    });

    it('지원하지 않는 provider는 저장하지 않는다', () => {
        rememberOAuthProvider('unknown');

        expect(consumeOAuthProvider()).toBeNull();
    });
});
