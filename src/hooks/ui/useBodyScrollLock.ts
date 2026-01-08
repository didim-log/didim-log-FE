import { useEffect } from 'react';
import { lockBodyScroll } from '@/utils/bodyScrollLock';

interface UseBodyScrollLockParams {
    locked: boolean;
}

export const useBodyScrollLock = ({ locked }: UseBodyScrollLockParams) => {
    useEffect(() => {
        if (!locked) {
            return undefined;
        }

        return lockBodyScroll();
    }, [locked]);
};
