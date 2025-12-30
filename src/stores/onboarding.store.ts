/**
 * 온보딩 상태 관리 스토어 (Zustand)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OnboardingTourStep = {
    key: 'WELCOME' | 'TIER' | 'RECOMMEND' | 'HEATMAP' | 'MENU';
    title: string;
    description: string;
    targetId?: string;
};

export const ONBOARDING_TOUR_STEPS: readonly OnboardingTourStep[] = [
    {
        key: 'WELCOME',
        title: '디딤로그에 오신 것을 환영합니다! 🎉',
        description: '핵심 기능만 30초면 끝. 함께 성장해요!',
    },
    {
        key: 'TIER',
        title: '나의 성장 척도',
        description: '티어와 경험치로 성장 흐름을 확인해요.',
        targetId: 'tier-section',
    },
    {
        key: 'RECOMMEND',
        title: '오늘의 추천 문제',
        description: '내 실력에 딱 맞는 문제를 매일 추천해드려요.',
        targetId: 'recommend-section',
    },
    {
        key: 'HEATMAP',
        title: '꾸준함이 실력!',
        description: '잔디를 심으며 성취감을 쌓아가요.',
        targetId: 'heatmap-section',
    },
    {
        key: 'MENU',
        title: '랭킹/내 기록은 여기서',
        description: '내 정보 관리와 랭킹 경쟁을 바로 확인해요.',
        targetId: 'menu-section',
    },
] as const;

interface OnboardingState {
    isNewUser: boolean;
    hasCompletedOnboarding: boolean;
    currentStep: number;
    setIsNewUser: (isNewUser: boolean) => void;
    setHasCompletedOnboarding: (hasCompleted: boolean) => void;
    completeOnboarding: () => void;
    startTour: () => void;
    nextStep: () => void;
    prevStep: () => void;
    skipTour: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            isNewUser: false,
            hasCompletedOnboarding: false,
            currentStep: 0,
            setIsNewUser: (isNewUser: boolean) =>
                set({
                    isNewUser,
                    ...(isNewUser ? { hasCompletedOnboarding: false, currentStep: 0 } : {}),
                }),
            setHasCompletedOnboarding: (hasCompleted: boolean) =>
                set({
                    hasCompletedOnboarding: hasCompleted,
                    ...(hasCompleted ? { currentStep: 0 } : {}),
                }),
            completeOnboarding: () => set({ hasCompletedOnboarding: true, currentStep: 0 }),
            startTour: () => set({ currentStep: 0 }),
            nextStep: () =>
                set((state) => {
                    const next = state.currentStep + 1;
                    if (next >= ONBOARDING_TOUR_STEPS.length) {
                        return { hasCompletedOnboarding: true, currentStep: 0 };
                    }
                    return { currentStep: next };
                }),
            prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
            skipTour: () => set({ hasCompletedOnboarding: true, currentStep: 0 }),
        }),
        {
            name: 'onboarding-storage',
        }
    )
);

