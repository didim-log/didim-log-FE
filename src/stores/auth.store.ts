/**
 * 인증 상태 관리 스토어 (Zustand)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/domain/user.types';
import { setAuthHeader, removeAuthHeader } from '../api/client';

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    _hasHydrated: boolean;
    setToken: (token: string) => void;
    setUser: (user: User) => void;
    logout: () => void;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            _hasHydrated: false,
            setToken: (token: string) => {
                set({ token, isAuthenticated: true });
                setAuthHeader(token);
            },
            setUser: (user: User) => {
                const currentToken = get().token;
                set({ user, isAuthenticated: !!currentToken });
            },
            logout: () => {
                set({ token: null, user: null, isAuthenticated: false });
                removeAuthHeader();
            },
            setHasHydrated: (state: boolean) => {
                set({ _hasHydrated: state });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ token: state.token, user: state.user }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    // persist에서 복원된 토큰과 사용자가 모두 있을 때만 인증 상태로 설정
                    const hasToken = !!state.token;
                    const hasUser = !!state.user;
                    state.isAuthenticated = hasToken && hasUser;
                    
                    if (state.token) {
                        setAuthHeader(state.token);
                    }
                    
                    // 복원 완료 표시
                    state._hasHydrated = true;
                }
            },
        }
    )
);
