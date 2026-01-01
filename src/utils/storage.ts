/**
 * localStorage 유틸리티 함수
 */

const STORAGE_PREFIX = 'didim-log-';

export const storage = {
    get: <T>(key: string): T | null => {
        try {
            const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
            return item ? (JSON.parse(item) as T) : null;
        } catch {
            return null;
        }
    },

    set: <T>(key: string, value: T): void => {
        try {
            localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
        } catch (error) {
            console.error('Storage set error:', error);
        }
    },

    remove: (key: string): void => {
        try {
            localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
        } catch (error) {
            console.error('Storage remove error:', error);
        }
    },

    clear: (): void => {
        try {
            Object.keys(localStorage)
                .filter((key) => key.startsWith(STORAGE_PREFIX))
                .forEach((key) => localStorage.removeItem(key));
        } catch (error) {
            console.error('Storage clear error:', error);
        }
    },
};


