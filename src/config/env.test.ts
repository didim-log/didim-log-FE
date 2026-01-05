import { describe, expect, it } from 'vitest';
import { deriveApiOrigin, deriveServerRoot } from './env';

describe('deriveApiOrigin', () => {
    it('apiUrl이 /api/v1로 끝나면 오리진을 반환한다', () => {
        expect(deriveApiOrigin('http://localhost:8080/api/v1')).toBe('http://localhost:8080');
    });

    it('뒤에 슬래시가 있어도 정상 처리한다', () => {
        expect(deriveApiOrigin('https://api.didim-log.xyz/api/v1/')).toBe('https://api.didim-log.xyz');
    });

    it('apiUrl이 도메인만 있어도 /api/v1을 보정한다', () => {
        expect(deriveApiOrigin('https://didim-log.xyz')).toBe('https://didim-log.xyz');
    });
});

describe('deriveServerRoot', () => {
    it('prod가 아니면 기본 오리진을 그대로 사용한다', () => {
        expect(deriveServerRoot('http://localhost:8080/api/v1', { isProd: false })).toBe('http://localhost:8080');
    });

    it('prod이고 apiUrl이 localhost 기본값이면 runtimeOrigin을 사용한다', () => {
        expect(
            deriveServerRoot('http://localhost:8080/api/v1', {
                isProd: true,
                runtimeOrigin: 'https://didim-log.xyz',
            })
        ).toBe('https://didim-log.xyz');
    });

    it('prod이고 apiUrl이 정상 도메인이면 해당 오리진을 사용한다', () => {
        expect(deriveServerRoot('https://didim-log.xyz/api/v1', { isProd: true })).toBe('https://didim-log.xyz');
    });
});


