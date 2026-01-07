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

/**
 * 온보딩 투어 단계 정의
 */
export interface OnboardingTourStep {
    targetId: string;
    title: string;
    description: string;
}

export const ONBOARDING_TOUR_STEPS: OnboardingTourStep[] = [
    {
        targetId: 'tier-section',
        title: '티어 정보',
        description: '현재 티어와 다음 티어까지의 진행 상황을 확인할 수 있습니다.',
    },
    {
        targetId: 'recommend-section',
        title: '추천 문제',
        description: '당신의 티어에 맞는 문제를 추천해드립니다.',
    },
    {
        targetId: 'notice-section',
        title: '공지사항',
        description: '중요한 공지사항을 확인하세요.',
    },
    {
        targetId: 'statistics-preview-section',
        title: '통계 미리보기',
        description: '내 풀이 활동 통계를 한눈에 확인하세요.',
    },
    {
        targetId: 'today-solved-section',
        title: '오늘 푼 문제',
        description: '오늘 풀이한 문제 목록을 확인할 수 있습니다.',
    },
];

interface OnboardingState {
    isNewUser: boolean;
    currentPhase: OnboardingPhase;
    completedPhases: OnboardingPhase[]; // Set 대신 배열 사용 (persist 호환)
    hasCompletedOnboarding: boolean;
    currentStep: number;
    setIsNewUser: (isNewUser: boolean) => void;
    setCurrentPhase: (phase: OnboardingPhase) => void;
    completePhase: (phase: OnboardingPhase) => void;
    resetOnboarding: () => void;
    isPhaseCompleted: (phase: OnboardingPhase) => boolean;
    completeOnboarding: () => void;
    startTour: () => void;
    nextStep: () => void;
    prevStep: () => void;
    skipTour: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set, get) => ({
            isNewUser: false,
            currentPhase: 'dashboard',
            completedPhases: [],
            hasCompletedOnboarding: false,
            currentStep: 0,
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
                hasCompletedOnboarding: false,
                currentStep: 0,
            }),
            isPhaseCompleted: (phase: OnboardingPhase) => {
                return get().completedPhases.includes(phase);
            },
            completeOnboarding: () => set({ hasCompletedOnboarding: true }),
            startTour: () => set({ currentStep: 0 }),
            nextStep: () => set((state) => {
                const maxStep = ONBOARDING_TOUR_STEPS.length - 1;
                if (state.currentStep >= maxStep) {
                    return { hasCompletedOnboarding: true };
                }
                return { currentStep: state.currentStep + 1 };
            }),
            prevStep: () => set((state) => ({
                currentStep: Math.max(0, state.currentStep - 1),
            })),
            skipTour: () => set({ hasCompletedOnboarding: true }),
        }),
        {
            name: 'onboarding-storage',
        }
    )
);
