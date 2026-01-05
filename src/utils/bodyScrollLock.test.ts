import { afterEach, describe, expect, it } from 'vitest';
import {
    __resetBodyScrollLockForTest,
    lockBodyScroll,
    type BodyScrollLockEnv,
} from './bodyScrollLock';

const createEnv = (params?: Partial<BodyScrollLockEnv>): BodyScrollLockEnv => {
    return {
        bodyStyle: {
            overflow: '',
            paddingRight: '',
            ...params?.bodyStyle,
        },
        clientWidth: 980,
        innerWidth: 1000,
        ...params,
    };
};

afterEach(() => {
    __resetBodyScrollLockForTest();
});

describe('lockBodyScroll', () => {
    it('스크롤을 잠그고(unlock 호출 시) 원래 값으로 복구한다', () => {
        const env = createEnv({ bodyStyle: { overflow: 'auto', paddingRight: '8px' } });

        const unlock = lockBodyScroll(env);

        expect(env.bodyStyle.overflow).toBe('hidden');
        expect(env.bodyStyle.paddingRight).toBe('28px');

        unlock();

        expect(env.bodyStyle.overflow).toBe('auto');
        expect(env.bodyStyle.paddingRight).toBe('8px');
    });

    it('중첩 잠금에서도 마지막 unlock에서만 복구한다', () => {
        const env = createEnv({ bodyStyle: { overflow: '', paddingRight: '' } });

        const unlockFirst = lockBodyScroll(env);
        const unlockSecond = lockBodyScroll(env);

        unlockFirst();
        expect(env.bodyStyle.overflow).toBe('hidden');

        unlockSecond();
        expect(env.bodyStyle.overflow).toBe('');
    });
});


