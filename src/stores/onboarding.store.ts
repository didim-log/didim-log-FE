/**
 * 온보딩 상태 관리 스토어 (Zustand)
 * 
 * 전체 서비스 플로우 온보딩을 관리합니다:
 * 1. Dashboard: 대시보드 소개
 * 2. ProblemDetail: 문제 제출 가이드
 * 3. StudyPage: 문제 풀이 제출 가이드
 * 4. RetrospectiveWrite: 회고 작성 가이드
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OnboardingPhase = 
    | 'dashboard'      // 대시보드 소개
    | 'problem-detail' // 문제 상세 페이지
    | 'study'          // 문제 풀이 페이지
    | 'retrospective'  // 회고 작성 페이지
    | 'completed';     // 완료

interface OnboardingState {
    isNewUser: boolean;
    currentPhase: OnboardingPhase;
    completedPhases: OnboardingPhase[]; // Set 대신 배열 사용 (persist 호환)
    setIsNewUser: (isNewUser: boolean) => void;
    setCurrentPhase: (phase: OnboardingPhase) => void;
    completePhase: (phase: OnboardingPhase) => void;
    resetOnboarding: () => void;
    isPhaseCompleted: (phase: OnboardingPhase) => boolean;
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set, get) => ({
            isNewUser: false,
            currentPhase: 'dashboard',
            completedPhases: [],
            setIsNewUser: (isNewUser: boolean) => set({ isNewUser }),
            setCurrentPhase: (phase: OnboardingPhase) => set({ currentPhase: phase }),
            completePhase: (phase: OnboardingPhase) => {
                const { completedPhases } = get();
                // 중복 제거하여 추가
                const newCompleted = completedPhases.includes(phase) 
                    ? completedPhases 
                    : [...completedPhases, phase];
                
                // 다음 단계로 진행
                const nextPhase: OnboardingPhase = 
                    phase === 'dashboard' ? 'problem-detail' :
                    phase === 'problem-detail' ? 'study' :
                    phase === 'study' ? 'retrospective' :
                    phase === 'retrospective' ? 'completed' :
                    'completed';
                
                set({ 
                    completedPhases: newCompleted,
                    currentPhase: nextPhase,
                });
            },
            resetOnboarding: () => set({ 
                currentPhase: 'dashboard',
                completedPhases: [],
            }),
            isPhaseCompleted: (phase: OnboardingPhase) => {
                return get().completedPhases.includes(phase);
            },
        }),
        {
            name: 'onboarding-storage',
        }
    )
);
