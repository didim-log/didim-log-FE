/**
 * 전체 서비스 관통형 멀티 페이지 온보딩 투어
 * 
 * 사용자를 여러 페이지로 자동 이동시키며 핵심 사이클을 안내합니다:
 * Dashboard -> Problem Detail -> Write Retrospective -> Ranking -> My Page
 */

import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { FC } from 'react';
import Joyride, { type Step, type CallBackProps, STATUS, EVENTS, ACTIONS } from 'react-joyride';
import { useDashboard } from '../../hooks/api/useDashboard';
import { useAuthStore } from '../../stores/auth.store';
import { useTourStore } from '../../stores/tour.store';
import { memberApi } from '../../api/endpoints/member.api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../types/api/common.types';

// 전체 서비스 플로우를 관통하는 스텝 정의 (5단계)
const steps: Step[] = [
    // --- 1. Dashboard ---
    {
        target: 'body',
        content: '디딤로그 온보딩을 시작합니다! 서비스의 핵심 흐름을 5단계로 알려드릴게요.',
        placement: 'center',
        disableBeacon: true,
        data: { route: '/dashboard' },
    },
    {
        target: '.tour-recommend-problems',
        content: '먼저 대시보드입니다. 내 실력에 맞는 문제를 추천받아 바로 풀 수 있습니다.',
        placement: 'bottom',
        data: { route: '/dashboard' },
    },
    // --- 2. Problem Detail (Move to ID 1000) ---
    {
        target: 'body',
        content: '문제를 클릭하면 상세 페이지로 이동합니다. 여기서 문제를 읽고 풀이를 고민해보세요.',
        placement: 'center',
        data: { route: '/problems/1000' },
    },
    {
        target: '.tour-timer-btn',
        content: '실전처럼 연습하려면 타이머 기능을 활용하세요!',
        placement: 'top',
        data: { route: '/problems/1000' },
    },
    // --- 3. Retrospective Write ---
    {
        target: 'body',
        content: '문제를 다 풀었다면, 가장 중요한 "회고 작성" 단계입니다.',
        placement: 'center',
        data: { route: '/retrospectives/write' },
    },
    {
        target: '.tour-ai-review-btn',
        content: '내 코드에 대해 AI의 정밀한 피드백을 받아보세요. 실력이 쑥쑥 늘어납니다.',
        placement: 'top',
        data: { route: '/retrospectives/write' },
    },
    // --- 4. Ranking ---
    {
        target: 'body',
        content: '열심히 활동하면 랭킹에 이름을 올릴 수 있습니다. 동기부여를 받아보세요!',
        placement: 'center',
        data: { route: '/ranking' },
    },
    // --- 5. My Page ---
    {
        target: '.tour-heatmap',
        content: '마지막으로 마이페이지입니다. 꾸준함의 증거인 "잔디"를 채워보세요!',
        placement: 'top',
        data: { route: '/profile' },
    },
    {
        target: 'body',
        content: '모든 설명이 끝났습니다. 이제 디딤로그와 함께 성장해보세요!',
        placement: 'center',
        data: { route: '/profile' },
    },
];

export const AppTour: FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { data: dashboard } = useDashboard();
    const { user, setUser, completeOnboarding: completeOnboardingInStore } = useAuthStore();
    const { run, stepIndex, stopTour, setStepIndex, startTour } = useTourStore();

    // 대시보드에서 온보딩 완료 여부 확인
    useEffect(() => {
        if (dashboard?.studentProfile?.isOnboardingFinished !== undefined) {
            if (user && user.isOnboardingFinished !== dashboard.studentProfile.isOnboardingFinished) {
                setUser({
                    ...user,
                    isOnboardingFinished: dashboard.studentProfile.isOnboardingFinished,
                });
            }
        }
    }, [dashboard?.studentProfile?.isOnboardingFinished, user, setUser]);

    // 온보딩 자동 시작 조건 확인
    useEffect(() => {
        // 자동 시작: 온보딩이 완료되었으면 실행하지 않음
        const isLocalCompleted = localStorage.getItem('didim_onboarding_completed') === 'true';
        if (
            isLocalCompleted ||
            dashboard?.studentProfile?.isOnboardingFinished ||
            user?.isOnboardingFinished ||
            run
        ) {
            return;
        }

        // 대시보드 데이터가 로드되지 않았으면 대기
        if (!dashboard || location.pathname !== '/dashboard') {
            return;
        }

        // DOM이 완전히 렌더링된 후 시작
        const timer = setTimeout(() => {
            // 대시보드의 첫 번째 스텝 타겟 요소 확인
            const dashboardSteps = steps.filter((step) => step.data?.route === '/dashboard');
            const allTargetsExist = dashboardSteps.every((step) => {
                if (step.target === 'body') {
                    return true;
                }
                const targetElement = document.querySelector(step.target as string);
                return !!targetElement;
            });

            if (allTargetsExist) {
                startTour();
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [dashboard, user, location.pathname, run, startTour]);

    // 온보딩 완료 API 호출
    const completeOnboarding = useCallback(async () => {
        try {
            completeOnboardingInStore();
            localStorage.setItem('didim_onboarding_completed', 'true');
            await memberApi.completeOnboarding();
            if (user) {
                setUser({
                    ...user,
                    isOnboardingFinished: true,
                });
            }
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
            toast.error(`온보딩 완료 처리에 실패했습니다: ${errorMessage}`);
        }
    }, [user, setUser, completeOnboardingInStore]);

    // Smart Navigation Logic
    const handleCallback = useCallback(
        (data: CallBackProps) => {
            const { status, type, index, action } = data;
            const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

            if (finishedStatuses.includes(status)) {
                // End Tour
                stopTour();
                if (status === STATUS.FINISHED) {
                    completeOnboarding();
                } else if (status === STATUS.SKIPPED) {
                    localStorage.setItem('didim_onboarding_completed', 'true');
                    completeOnboardingInStore();
                }
            } else if (type === EVENTS.STEP_AFTER && action === ACTIONS.NEXT) {
                // Logic for moving to next step
                const nextStepIndex = index + 1;
                if (nextStepIndex < steps.length) {
                    const nextRoute = steps[nextStepIndex].data?.route;
                    if (nextRoute && location.pathname !== nextRoute) {
                        // 페이지 이동 전에 stepIndex 업데이트
                        setStepIndex(nextStepIndex);
                        // 페이지 이동
                        navigate(nextRoute);
                    } else {
                        // 같은 페이지 내에서 다음 스텝
                        setStepIndex(nextStepIndex);
                    }
                }
            } else if (type === EVENTS.STEP_AFTER && action === ACTIONS.PREV) {
                // 이전 스텝으로 이동
                const prevIndex = index - 1;
                if (prevIndex >= 0) {
                    const prevRoute = steps[prevIndex].data?.route;
                    if (prevRoute && location.pathname !== prevRoute) {
                        setStepIndex(prevIndex);
                        navigate(prevRoute);
                    } else {
                        setStepIndex(prevIndex);
                    }
                }
            }

            // 에러 발생 시
            if (status === STATUS.ERROR) {
                if (import.meta.env.DEV) {
                    console.error('Joyride error:', type);
                }
                stopTour();
            }
        },
        [location.pathname, navigate, completeOnboarding, completeOnboardingInStore, stopTour, setStepIndex]
    );

    // Prevent rendering if we are on the wrong page (wait for navigation)
    const currentStep = steps[stepIndex];
    if (run && currentStep?.data?.route && location.pathname !== currentStep.data.route) {
        return null; // Return null to avoid "Target not found" while loading new page
    }

    // 타겟 요소가 존재하는지 확인 (body가 아닌 경우)
    if (run && currentStep && currentStep.target !== 'body') {
        const element = document.querySelector(currentStep.target as string);
        if (!element) {
            // 타겟 요소가 아직 렌더링되지 않았으면 잠시 대기
            return null;
        }
    }

    // 투어가 실행되지 않으면 렌더링하지 않음
    if (!run) {
        return null;
    }

    return (
        <Joyride
            steps={steps}
            run={run}
            stepIndex={stepIndex}
            callback={handleCallback}
            continuous={true}
            showProgress={true}
            showSkipButton={true}
            disableScrolling={false}
            disableOverlayClose={true}
            disableCloseOnEsc={false}
            spotlightClicks={true}
            styles={{
                options: {
                    zIndex: 10000,
                    primaryColor: '#3b82f6',
                },
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 9999,
                },
                tooltip: {
                    borderRadius: '12px',
                    zIndex: 10001,
                },
                tooltipContainer: {
                    zIndex: 10001,
                },
                buttonNext: {
                    backgroundColor: '#3b82f6',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                },
                buttonBack: {
                    color: '#6b7280',
                    marginRight: '8px',
                    cursor: 'pointer',
                },
                buttonSkip: {
                    color: '#6b7280',
                    cursor: 'pointer',
                },
            }}
            locale={{
                back: '이전',
                close: '닫기',
                last: '완료하기',
                next: '다음',
                skip: '건너뛰기',
            }}
        />
    );
};

