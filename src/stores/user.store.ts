/**
 * 사용자 프로필 상태 관리 스토어 (Zustand)
 * Primary Language 등 사용자 선호 설정 관리
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PrimaryLanguage } from '../types/api/student.types';

interface UserState {
    primaryLanguage: PrimaryLanguage | null;
    setPrimaryLanguage: (language: PrimaryLanguage | null) => void;
    resetPrimaryLanguage: () => void;
}

/**
 * 사용자 선호 설정 스토어
 * primaryLanguage는 사용자의 기본 프로그래밍 언어를 저장하며,
 * 로그인 시 Dashboard API에서 자동으로 동기화됩니다.
 */
export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            primaryLanguage: null,
            setPrimaryLanguage: (language: PrimaryLanguage | null) => {
                set({ primaryLanguage: language });
            },
            resetPrimaryLanguage: () => {
                set({ primaryLanguage: null });
            },
        }),
        {
            name: 'user-preferences',
            partialize: (state) => ({ primaryLanguage: state.primaryLanguage }),
        }
    )
);













