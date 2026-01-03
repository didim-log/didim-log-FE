/**
 * 온보딩 투어 상태 관리 스토어 (Zustand)
 * 
 * 전역 투어 제어를 위한 중앙 집중식 상태 관리
 */

import { create } from 'zustand';

interface TourState {
    run: boolean;
    stepIndex: number;
    startTour: () => void;
    stopTour: () => void;
    setStepIndex: (index: number) => void;
    resetTour: () => void;
    nextStep: () => void; // Helper to increment step index
}

export const useTourStore = create<TourState>((set) => ({
    run: false,
    stepIndex: 0,
    startTour: () => set({ run: true, stepIndex: 0 }), // Always reset to 0 when starting
    stopTour: () => set({ run: false }),
    setStepIndex: (index: number) => set({ stepIndex: index }),
    resetTour: () => set({ run: false, stepIndex: 0 }),
    nextStep: () => set((state) => ({ stepIndex: state.stepIndex + 1 })),
}));

