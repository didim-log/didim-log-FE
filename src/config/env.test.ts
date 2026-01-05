import { describe, expect, it } from 'vitest';
import { deriveApiOrigin } from './env';

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


