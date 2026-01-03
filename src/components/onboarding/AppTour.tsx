/**
 * 전체 서비스 관통형 멀티 페이지 온보딩 투어
 * 
 * 사용자를 여러 페이지로 자동 이동시키며 핵심 사이클을 안내합니다:
 * Dashboard -> Problem Detail -> Write Retrospective -> Ranking -> My Page
 */

import { useEffect, useCallback, useState } from 'react';
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
                총 10단계로 진행됩니다.
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
    // --- 3. Retrospective Write (Auto-Open Mode) ---
    {
        target: 'body',
        content: '문제를 풀었다면 "회고 작성" 페이지로 이동합니다.',
        placement: 'center',
        data: { route: '/retrospectives/write?onboarding=true' },
    },
    {
        target: '.tour-ai-review-btn',
        content: (
            <div className="text-left">
                <strong>✨ AI 코드 분석</strong>
                <br />
                성공/실패 여부를 선택하면 입력창이 열립니다.
                <br />
                그 후 이 버튼을 눌러 AI 피드백을 받아보세요.
            </div>
        ),
        placement: 'top',
        data: { route: '/retrospectives/write?onboarding=true' },
    },
    // --- 4. Ranking ---
    {
        target: 'body',
        content: '열심히 활동하여 랭킹을 올려보세요. 다른 개발자들과 함께 성장하는 재미가 있습니다.',
        placement: 'center',
        disableScrolling: false, // Step 4번만 스크롤 애니메이션 활성화
        data: { route: '/ranking' },
    },
    // --- 5. My Page (Profile) ---
    {
        target: '.tour-language-badge',
        content: (
            <div className="text-left">
                <strong>주 언어 확인</strong>
                <br />
                내가 설정한 주 언어가 맞는지 확인하세요.
                <br />
                문제 추천과 분석의 기준이 됩니다.
            </div>
        ),
        placement: 'bottom', // 상단 배너에 가려지지 않도록 bottom으로 변경
        disableScrolling: true, // 스크롤 애니메이션 없이 바로 표시
        data: { route: '/profile' },
    },
    {
        target: '.tour-my-retros',
        content: (
            <div className="text-left">
                <strong>📝 나의 회고 관리</strong>
                <br />
                내가 작성한 모든 회고 기록을
                <br />
                여기서 모아볼 수 있습니다.
            </div>
        ),
        placement: 'top',
        data: { route: '/profile' },
    },
    {
        target: 'body',
        content: (
            <div className="text-left">
                <strong>모든 준비 완료! 🎉</strong>
                <br />
                이제 '완료하기'를 눌러 디딤로그를 시작하세요.
                <br />
                (투어는 다시 뜨지 않습니다)
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

    // ⚡️ KILL SWITCH: Local state to force-remove the component from DOM
    const [forceHide, setForceHide] = useState(false);

    // 1. Reset Kill Switch when 'run' changes (e.g. User clicks Help button)
    useEffect(() => {
        if (run) {
            setForceHide(false);
        }
    }, [run]);

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

    // ✅ 완료된 사용자의 run 상태 정리 (렌더링 중 상태 업데이트 방지)
    useEffect(() => {
        const isUserCompleted = user?.isOnboardingFinished === true || dashboard?.studentProfile?.isOnboardingFinished === true;
        
        // 백엔드에서 완료된 사용자가 run=true로 남아있으면 강제로 중지
        if (isUserCompleted && run) {
            stopTour();
            setStepIndex(0);
        }
    }, [run, user?.isOnboardingFinished, dashboard?.studentProfile?.isOnboardingFinished, stopTour, setStepIndex]);

    // ✅ Auto-Start Logic (Only runs once on mount, for new users)
    useEffect(() => {
        const isUserCompleted = user?.isOnboardingFinished === true || dashboard?.studentProfile?.isOnboardingFinished === true;
        
        // 백엔드에서 완료된 사용자는 자동 실행하지 않음
        if (isUserCompleted) {
            return;
        }
        
        // If NOT completed and NOT running, start it automatically
        if (!run) {
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

                if (allTargetsExist && !run && !forceHide) {
                    startTour();
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [dashboard, location.pathname, run, startTour, forceHide, user?.isOnboardingFinished, dashboard?.studentProfile?.isOnboardingFinished]);

    // Smart Navigation Logic
    const handleCallback = useCallback(
        async (data: CallBackProps) => {
            const { status, type, index, action } = data;
            const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

            if (finishedStatuses.includes(status)) {
                // ⚡️ IMMEDIATE KILL: Remove UI instantly before async operations
                setForceHide(true);
                
                // Cleanup Global State
                stopTour();
                setStepIndex(0);

                // Async API Call (UI is already closed)
                try {
                    if (status === STATUS.FINISHED) {
                        await memberApi.completeOnboarding();
                        completeOnboardingInStore();
                        if (user) {
                            setUser({
                                ...user,
                                isOnboardingFinished: true,
                            });
                        }
                        // 상태 업데이트 후 새로고침하여 배너가 남아있는 버그 해결
                        window.location.reload();
                    } else if (status === STATUS.SKIPPED) {
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
                    // Clean route checking (ignore query params)
                    if (nextRoute && !location.pathname.includes(nextRoute.split('?')[0])) {
                        navigate(nextRoute);
                    }
                    setStepIndex(nextStepIndex);
                }
            } else if (type === EVENTS.STEP_AFTER && action === ACTIONS.PREV) {
                // 이전 스텝으로 이동
                const prevIndex = index - 1;
                if (prevIndex >= 0) {
                    const prevRoute = steps[prevIndex].data?.route;
                    if (prevRoute && !location.pathname.includes(prevRoute.split('?')[0])) {
                        navigate(prevRoute);
                    }
                    setStepIndex(prevIndex);
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

    // 🛡️ Final Guard: If forced hidden, render NOTHING.
    if (forceHide) {
        return null;
    }

    // 🛡️ Final Guard 2: 백엔드에서 온보딩 완료된 사용자는 아예 렌더링하지 않음
    // isOnboardingFinished가 true면 투어를 보여주지 않음 (Help 버튼으로 재시작하려면 resetOnboarding API 호출 필요)
    const isUserCompleted = user?.isOnboardingFinished === true || dashboard?.studentProfile?.isOnboardingFinished === true;
    
    if (isUserCompleted) {
        return null;
    }

    // ✅ stepIndex 범위 체크: 마지막 단계를 넘어서면 렌더링하지 않음
    if (stepIndex >= steps.length || stepIndex < 0) {
        return null;
    }

    // Navigation Guard: Don't render if we are moving between pages
    const currentStep = steps[stepIndex];
    if (run && currentStep?.data?.route && !location.pathname.includes(currentStep.data.route.split('?')[0])) {
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

    // ✅ Prevent render ONLY if not running (Standard Joyride behavior)
    // Manual start (Help button) will set run=true, so component will render
    if (!run) {
        return null;
    }

    // Enter 키로 다음 단계로 이동하는 핸들러
    useEffect(() => {
        if (!run || forceHide) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            // Enter 키가 눌렸을 때
            if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
                // 입력 필드에 포커스가 있으면 무시 (사용자가 입력 중일 수 있음)
                const activeElement = document.activeElement;
                if (
                    activeElement &&
                    (activeElement.tagName === 'INPUT' ||
                        activeElement.tagName === 'TEXTAREA' ||
                        (activeElement instanceof HTMLElement && activeElement.isContentEditable))
                ) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                // 현재 스텝이 마지막이면 완료 처리
                if (stepIndex === steps.length - 1) {
                    handleCallback({
                        status: STATUS.FINISHED,
                        type: EVENTS.TOUR_END,
                        index: stepIndex,
                        action: ACTIONS.CLOSE,
                        size: steps.length,
                    } as CallBackProps);
                } else {
                    // 다음 스텝으로 이동
                    const nextStepIndex = stepIndex + 1;
                    const nextRoute = steps[nextStepIndex]?.data?.route;
                    if (nextRoute && !location.pathname.includes(nextRoute.split('?')[0])) {
                        navigate(nextRoute);
                    }
                    setStepIndex(nextStepIndex);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [run, forceHide, stepIndex, steps, location.pathname, navigate, setStepIndex, handleCallback]);

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

