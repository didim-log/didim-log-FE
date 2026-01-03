/**
 * 전체 서비스 관통형 멀티 페이지 온보딩 투어
 * 
 * 사용자를 여러 페이지로 자동 이동시키며 핵심 사이클을 안내합니다:
 * Dashboard -> Problem Detail -> Write Retrospective -> Ranking
 */

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { FC } from 'react';
import Joyride, { type Step, type CallBackProps, STATUS, EVENTS, ACTIONS } from 'react-joyride';
import { useDashboard } from '../../hooks/api/useDashboard';
import { useAuthStore } from '../../stores/auth.store';
import { useTourStore } from '../../stores/tour.store';
import { memberApi } from '../../api/endpoints/member.api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../types/api/common.types';

// 전체 서비스 플로우를 관통하는 스텝 정의
const appTourSteps: Step[] = [
    // --- Dashboard ---
    {
        target: 'body',
        content: '디딤로그 전체 투어를 시작합니다! 핵심 기능을 따라와주세요.',
        placement: 'center',
        disableBeacon: true,
        data: { route: '/dashboard' },
    },
    {
        target: '.tour-profile-card',
        content: '내 티어와 성장 그래프를 확인하는 대시보드입니다. Solved.ac와 자동으로 동기화됩니다.',
        placement: 'bottom',
        data: { route: '/dashboard' },
    },
    {
        target: '.tour-recommend-problems',
        content: '내 실력에 딱 맞는 문제를 매일 추천해드립니다. 문제를 클릭하면 바로 풀 수 있어요!',
        placement: 'bottom',
        data: { route: '/dashboard' },
    },
    // --- Problem Detail (백준 1000번 문제 - A+B) ---
    {
        target: 'body',
        content: '이곳은 문제 상세 페이지입니다. 문제를 풀고 타이머를 잴 수 있습니다.',
        placement: 'center',
        data: { route: '/problems/1000' },
    },
    {
        target: '.tour-problem-timer',
        content: '문제 풀이를 시작할 때 타이머를 켜세요! 시간을 측정하면 더 효과적인 학습이 가능합니다.',
        placement: 'top',
        data: { route: '/problems/1000' },
    },
    // --- Write Retrospective ---
    {
        target: 'body',
        content: '문제를 풀었다면, 가장 중요한 "회고 작성" 단계입니다. 회고를 통해 실력을 키워보세요!',
        placement: 'center',
        data: { route: '/retrospectives/write' },
    },
    {
        target: '.tour-ai-review-btn',
        content: 'AI에게 내 코드에 대한 피드백을 받아보세요. 시간 복잡도 개선이나 버그 수정을 위한 구체적인 제안을 받을 수 있습니다.',
        placement: 'top',
        data: { route: '/retrospectives/write' },
    },
    // --- Ranking ---
    {
        target: 'body',
        content: '마지막으로 랭킹 페이지입니다. 다른 개발자들과 경쟁하며 동기부여를 받아보세요!',
        placement: 'center',
        data: { route: '/ranking' },
    },
    {
        target: 'body',
        content: '투어가 완료되었습니다! 이제 디딤로그의 모든 핵심 기능을 사용할 수 있어요. 즐거운 코딩 되세요! 🚀',
        placement: 'center',
        data: { route: '/ranking' },
    },
];

export const AppTour: FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { data: dashboard } = useDashboard();
    const { user, setUser, completeOnboarding: completeOnboardingInStore } = useAuthStore();
    const { run, stepIndex, stopTour, setStepIndex, startTour } = useTourStore();
    const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 현재 경로에 맞는 스텝만 필터링
    const currentSteps = useMemo<Step[]>(() => {
        return appTourSteps.filter((step) => {
            const stepRoute = (step.data as { route?: string })?.route;
            return stepRoute === location.pathname;
        });
    }, [location.pathname]);

    // 현재 경로에서의 상대 인덱스 계산
    const currentStepIndex = useMemo(() => {
        if (currentSteps.length === 0 || !run) {
            return -1;
        }
        
        // 전체 스텝에서 현재 경로의 첫 번째 스텝 인덱스 찾기
        const firstStepInRoute = appTourSteps.findIndex(
            (step) => (step.data as { route?: string })?.route === location.pathname
        );
        
        if (firstStepInRoute === -1) {
            return -1;
        }
        
        // 현재 경로 내에서의 상대 인덱스 계산
        const relativeIndex = stepIndex - firstStepInRoute;
        
        // 경로 내 유효한 인덱스 범위로 제한
        if (relativeIndex < 0 || relativeIndex >= currentSteps.length) {
            // 경로가 변경되었지만 stepIndex가 아직 업데이트되지 않은 경우
            // 첫 번째 스텝으로 설정
            return 0;
        }
        
        return relativeIndex;
    }, [location.pathname, stepIndex, currentSteps.length, run]);

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
        // 투어가 강제로 시작된 경우 (Help 버튼 클릭 등)
        if (run) {
            // 타겟 요소 존재 확인 후 시작
            const timer = setTimeout(() => {
                const currentStep = currentSteps[currentStepIndex];
                if (!currentStep) {
                    return;
                }

                if (currentStep.target === 'body') {
                    return; // body는 항상 존재
                }

                const targetElement = document.querySelector(currentStep.target as string);
                if (!targetElement && import.meta.env.DEV) {
                    console.warn(`Tour target not found: ${currentStep.target}`);
                }
            }, 500);
            return () => clearTimeout(timer);
        }

        // 자동 시작: 온보딩이 완료되었으면 실행하지 않음
        const isLocalCompleted = localStorage.getItem('didim_onboarding_completed') === 'true';
        if (
            isLocalCompleted ||
            dashboard?.studentProfile?.isOnboardingFinished ||
            user?.isOnboardingFinished
        ) {
            return;
        }

        // 대시보드 데이터가 로드되지 않았으면 대기
        if (!dashboard || location.pathname !== '/dashboard') {
            return;
        }

        // DOM이 완전히 렌더링된 후 시작
        const timer = setTimeout(() => {
            const allTargetsExist = currentSteps.every((step) => {
                if (step.target === 'body') {
                    return true;
                }
                const targetElement = document.querySelector(step.target as string);
                return !!targetElement;
            });

            if (allTargetsExist && !run) {
                startTour();
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [dashboard, user, location.pathname, currentSteps, currentStepIndex, run, startTour]);

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

    // Joyride 이벤트 핸들러 (핵심: 페이지 자동 이동 로직)
    const handleJoyrideCallback = useCallback(
        (data: CallBackProps) => {
            const { status, type, index, action } = data;

            // 스텝 변경 시 stepIndex 업데이트
            if (type === EVENTS.STEP_AFTER) {
                if (action === ACTIONS.NEXT) {
                    // 다음 스텝으로 이동
                    const nextIndex = index + 1;
                    if (nextIndex < appTourSteps.length) {
                        const nextStep = appTourSteps[nextIndex];
                        const nextRoute = (nextStep.data as { route?: string })?.route;
                        const currentRoute = location.pathname;

                        // 다음 스텝이 다른 페이지에 있으면 자동 이동
                        if (nextRoute && nextRoute !== currentRoute) {
                            // 기존 타이머 정리
                            if (navigationTimeoutRef.current) {
                                clearTimeout(navigationTimeoutRef.current);
                            }

                            // 페이지 이동 전에 stepIndex 업데이트
                            setStepIndex(nextIndex);

                            // 페이지 이동 (약간의 딜레이를 두어 부드러운 전환)
                            navigationTimeoutRef.current = setTimeout(() => {
                                navigate(nextRoute);
                            }, 300);
                            return; // 즉시 리턴하여 페이지 이동 대기
                        } else {
                            // 같은 페이지 내에서 다음 스텝
                            setStepIndex(nextIndex);
                        }
                    }
                } else if (action === ACTIONS.PREV) {
                    // 이전 스텝으로 이동
                    const prevIndex = index - 1;
                    if (prevIndex >= 0) {
                        const prevStep = appTourSteps[prevIndex];
                        const prevRoute = (prevStep.data as { route?: string })?.route;
                        const currentRoute = location.pathname;

                        // 이전 스텝이 다른 페이지에 있으면 자동 이동
                        if (prevRoute && prevRoute !== currentRoute) {
                            if (navigationTimeoutRef.current) {
                                clearTimeout(navigationTimeoutRef.current);
                            }

                            setStepIndex(prevIndex);
                            navigationTimeoutRef.current = setTimeout(() => {
                                navigate(prevRoute);
                            }, 300);
                            return;
                        } else {
                            setStepIndex(prevIndex);
                        }
                    }
                }
            }

            // 투어가 완료되거나 건너뛰어진 경우
            if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
                stopTour();
                if (status === STATUS.FINISHED) {
                    completeOnboarding();
                } else if (status === STATUS.SKIPPED) {
                    localStorage.setItem('didim_onboarding_completed', 'true');
                    completeOnboardingInStore();
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

    // 현재 경로에 스텝이 없거나 투어가 실행되지 않으면 렌더링하지 않음
    if (!run || currentSteps.length === 0 || currentStepIndex < 0) {
        return null;
    }

    // 핵심 버그 수정: 현재 경로가 현재 스텝의 목표 경로와 일치하지 않으면 투어를 렌더링하지 않음
    // 이렇게 하면 페이지 이동 중에 투어가 끊기거나 깜빡이는 현상을 방지
    const currentStep = appTourSteps[stepIndex];
    if (currentStep?.data?.route && location.pathname !== currentStep.data.route) {
        // 페이지 이동 중이므로 투어를 숨김
        return null;
    }

    // 타겟 요소가 존재하는지 확인 (body가 아닌 경우)
    const targetElement = currentSteps[currentStepIndex]?.target;
    if (targetElement && targetElement !== 'body') {
        const element = document.querySelector(targetElement as string);
        if (!element) {
            // 타겟 요소가 아직 렌더링되지 않았으면 잠시 대기
            return null;
        }
    }

    return (
        <Joyride
            steps={currentSteps}
            run={run}
            stepIndex={currentStepIndex}
            continuous
            showProgress
            showSkipButton
            callback={handleJoyrideCallback}
            disableScrolling={false}
            disableOverlayClose={true}
            disableCloseOnEsc={false}
            spotlightClicks={true}
            styles={{
                options: {
                    primaryColor: '#2563eb', // blue-600
                    zIndex: 10000,
                },
                overlay: {
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
                    backgroundColor: '#2563eb',
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

