export interface BodyScrollLockEnv {
    bodyStyle: {
        overflow: string;
        paddingRight: string;
    };
    clientWidth: number;
    innerWidth: number;
}

type BodyScrollStyleSnapshot = {
    overflow: string;
    paddingRight: string;
};

let lockCount = 0;
let snapshot: BodyScrollStyleSnapshot | null = null;

const toNumberPx = (value: string): number => {
    const parsed = Number.parseFloat(value);
    if (Number.isNaN(parsed)) {
        return 0;
    }
    return parsed;
};

const resolveEnv = (env?: BodyScrollLockEnv): BodyScrollLockEnv | null => {
    if (env) {
        return env;
    }

    if (typeof document === 'undefined') {
        return null;
    }

    if (typeof window === 'undefined') {
        return null;
    }

    return {
        bodyStyle: {
            overflow: document.body.style.overflow,
            paddingRight: document.body.style.paddingRight,
        },
        clientWidth: document.documentElement.clientWidth,
        innerWidth: window.innerWidth,
    };
};

const applyLock = (env: BodyScrollLockEnv) => {
    const scrollbarWidth = env.innerWidth - env.clientWidth;

    snapshot = {
        overflow: env.bodyStyle.overflow,
        paddingRight: env.bodyStyle.paddingRight,
    };

    env.bodyStyle.overflow = 'hidden';

    if (scrollbarWidth <= 0) {
        return;
    }

    const currentPaddingRight = toNumberPx(snapshot.paddingRight);
    env.bodyStyle.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
};

const restore = (env: BodyScrollLockEnv) => {
    if (!snapshot) {
        return;
    }

    env.bodyStyle.overflow = snapshot.overflow;
    env.bodyStyle.paddingRight = snapshot.paddingRight;
    snapshot = null;
};

export const lockBodyScroll = (env?: BodyScrollLockEnv): (() => void) => {
    const resolved = resolveEnv(env);
    if (!resolved) {
        return () => undefined;
    }

    lockCount += 1;

    if (lockCount === 1) {
        applyLock(resolved);
    }

    return () => {
        if (lockCount <= 0) {
            return;
        }

        lockCount -= 1;

        if (lockCount > 0) {
            return;
        }

        restore(resolved);
    };
};

/**
 * @internal
 * 테스트에서만 사용합니다.
 */
export const __resetBodyScrollLockForTest = () => {
    lockCount = 0;
    snapshot = null;
};

