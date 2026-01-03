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
        content: (
            <div className="text-left">
                <strong>환영합니다! 👋</strong>
                <br />
                디딤로그의 핵심 기능을 빠르게 훑어볼까요?
                <br />
                총 9단계로 진행됩니다.
            </div>
        ),
        placement: 'center',
        disableBeacon: true,
        data: { route: '/dashboard' },
    },
    {
        target: '.tour-recommend-problems',
        content: '먼저 대시보드입니다. 내 실력에 딱 맞는 문제를 추천받을 수 있습니다.',
        placement: 'bottom',
        data: { route: '/dashboard' },
    },
    // --- 2. Problem Detail (Move to ID 1000) ---
    {
        target: 'body',
        content: '문제를 클릭하면 상세 페이지로 이동합니다. 여기서 지문을 읽고 풀이를 고민해보세요.',
        placement: 'center',
        data: { route: '/problems/1000' },
    },
    {
        target: '.tour-timer-btn',
        content: '실전 감각을 위해 타이머를 켜고 푸는 것을 추천합니다!',
        placement: 'top',
        data: { route: '/problems/1000' },
    },
    // --- 3. Retrospective Write (Targeting Problem 1000) ---
    {
        target: 'body',
        content: '문제를 풀었다면, 성장의 핵심인 "회고"를 작성할 차례입니다.',
        placement: 'center',
        data: { route: '/retrospectives/write' },
    },
    {
        target: '.tour-ai-review-btn',
        content: (
            <div className="text-left">
                <strong>✨ AI 인사이트</strong>
                <br />
                이 버튼을 누르면 AI가 내 코드를 분석해
                <br />
                시간 복잡도와 개선점을 알려줍니다.
            </div>
        ),
        placement: 'top',
        data: { route: '/retrospectives/write' },
    },
    // --- 4. Ranking ---
    {
        target: 'body',
        content: '열심히 활동하여 랭킹을 올려보세요. 다른 개발자들과 함께 성장하는 재미가 있습니다.',
        placement: 'center',
        data: { route: '/ranking' },
    },
    // --- 5. My Page ---
    {
        target: '.tour-my-retros',
        content: (
            <div className="text-left">
                <strong>📝 나의 회고 관리</strong>
                <br />
                내가 작성한 오답 노트와 회고들을
                <br />
                여기서 모아보고 관리할 수 있습니다.
            </div>
        ),
        placement: 'top',
        data: { route: '/profile' },
    },
    {
        target: 'body',
        content: (
            <div className="text-left">
                <strong>준비 완료! 🚀</strong>
                <br />
                이제 디딤로그와 함께 알고리즘 실력을
                <br />
                체계적으로 키워보세요.
            </div>
        ),
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

    // Smart Navigation Logic
    const handleCallback = useCallback(
        async (data: CallBackProps) => {
            const { status, type, index, action } = data;
            const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

            if (finishedStatuses.includes(status)) {
                // 1. Immediately stop tour UI to prevent lingering card
                stopTour();

                // 2. Update DB & Local State (async, but UI is already closed)
                try {
                    if (status === STATUS.FINISHED) {
                        await memberApi.completeOnboarding();
                        completeOnboardingInStore();
                        localStorage.setItem('didim_onboarding_completed', 'true');
                        if (user) {
                            setUser({
                                ...user,
                                isOnboardingFinished: true,
                            });
                        }
                    } else if (status === STATUS.SKIPPED) {
                        localStorage.setItem('didim_onboarding_completed', 'true');
                        completeOnboardingInStore();
                    }
                } catch (error: unknown) {
                    if (import.meta.env.DEV) {
                        console.error('Onboarding sync failed', error);
                    }
                    const errorMessage = getErrorMessage(error);
                    toast.error(`온보딩 완료 처리에 실패했습니다: ${errorMessage}`);
                }
                return; // Early return to prevent further processing
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
        [location.pathname, navigate, completeOnboardingInStore, stopTour, setStepIndex, user, setUser]
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
                    width: 400, // Wider tooltip for better readability
                },
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 9999,
                },
                tooltip: {
                    borderRadius: '12px',
                    zIndex: 10001,
                    width: 400, // Ensure tooltip width matches options
                },
                tooltipContent: {
                    textAlign: 'left', // Better text alignment
                    fontSize: '15px',
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

