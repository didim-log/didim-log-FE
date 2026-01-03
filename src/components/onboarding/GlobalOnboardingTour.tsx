/**
 * 전역 온보딩 투어 컴포넌트 (react-joyride 기반)
 * 
 * 서비스 전체 플로우를 안내합니다:
 * 1. Dashboard: 대시보드 소개
 * 2. ProblemDetail: 문제 제출 가이드
 * 3. StudyPage: 문제 풀이 제출 가이드
 * 4. RetrospectiveWrite: 회고 작성 가이드
 */

import { useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { FC } from 'react';
import Joyride, { type Step, type CallBackProps, STATUS, EVENTS } from 'react-joyride';
import { useDashboard } from '../../hooks/api/useDashboard';
import { useAuthStore } from '../../stores/auth.store';
import { useTourStore } from '../../stores/tour.store';
import { memberApi } from '../../api/endpoints/member.api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../types/api/common.types';

// Dashboard 중심 온보딩 스텝 정의 (단순화)
const dashboardSteps: Step[] = [
    {
        target: 'body',
        content: '디딤로그에 오신 것을 환영합니다! 핵심 기능을 빠르게 소개해 드릴게요.',
        placement: 'center',
        disableBeacon: true,
    },
    {
        target: '.tour-profile-card',
        content: '여기서 백준 티어와 연동된 내 정보를 확인할 수 있습니다. 티어 정보는 Solved.ac와 자동으로 동기화됩니다.',
        placement: 'bottom',
    },
    {
        target: '.tour-statistics',
        content: '내가 어떤 알고리즘에 약한지 취약점을 분석해 드립니다. 통계 페이지에서 더 자세한 정보를 확인할 수 있어요.',
        placement: 'left',
    },
    {
        target: '.tour-recommend-problems',
        content: '내 실력에 딱 맞는 문제를 매일 추천해드립니다. 문제를 클릭하면 바로 풀 수 있어요!',
        placement: 'bottom',
    },
];


export const GlobalOnboardingTour: FC = () => {
    const location = useLocation();
    const { data: dashboard } = useDashboard();
    const { user, setUser, completeOnboarding: completeOnboardingInStore } = useAuthStore();
    const { run, stepIndex, stopTour, setStepIndex, startTour } = useTourStore();

    // Dashboard 중심으로 단순화: Dashboard에서만 실행
    const isDashboard = location.pathname === '/dashboard';
    const currentSteps = useMemo<Step[]>(() => {
        if (isDashboard) {
            return dashboardSteps;
        }
        return [];
    }, [isDashboard]);

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

    // 온보딩 시작 조건 확인 (Dashboard 중심, 단순화)
    useEffect(() => {
        // Dashboard가 아니면 실행하지 않음
        if (!isDashboard) {
            if (run) {
                stopTour();
            }
            return;
        }

        // Tour Store에서 강제로 시작된 경우 (Help 버튼 클릭)
        if (run) {
            // 타겟 요소 존재 확인 후 시작
            const timer = setTimeout(() => {
                const allTargetsExist = currentSteps.every((step) => {
                    if (step.target === 'body') {
                        return true;
                    }
                    const targetElement = document.querySelector(step.target as string);
                    if (!targetElement && import.meta.env.DEV) {
                        console.warn(`Onboarding target not found: ${step.target}`);
                    }
                    return !!targetElement;
                });

                // 타겟이 없으면 투어 중지
                if (!allTargetsExist) {
                    stopTour();
                }
            }, 500);
            return () => clearTimeout(timer);
        }

        // 자동 시작: 온보딩이 완료되었으면 실행하지 않음
        // 1. localStorage fallback 체크
        const isLocalCompleted = localStorage.getItem('didim_onboarding_completed') === 'true';
        
        // 2. DB 상태 또는 로컬 스토어 상태 체크
        if (
            isLocalCompleted ||
            dashboard?.studentProfile?.isOnboardingFinished ||
            user?.isOnboardingFinished
        ) {
            return;
        }

        // 대시보드 데이터가 로드되지 않았으면 대기
        if (!dashboard) {
            return;
        }

        // DOM이 완전히 렌더링된 후 시작 (타겟 요소 존재 확인)
        const timer = setTimeout(() => {
            // 모든 타겟 요소가 존재하는지 확인
            const allTargetsExist = currentSteps.every((step) => {
                if (step.target === 'body') {
                    return true;
                }
                const targetElement = document.querySelector(step.target as string);
                if (!targetElement && import.meta.env.DEV) {
                    console.warn(`Onboarding target not found: ${step.target}`);
                }
                return !!targetElement;
            });

            // 모든 타겟이 존재하고 투어가 실행 중이 아니면 시작
            if (allTargetsExist && !run) {
                startTour();
            }
        }, 1000); // DOM 렌더링 대기 시간 (안정성을 위해 증가)
        return () => clearTimeout(timer);
    }, [dashboard, user, isDashboard, currentSteps, run, startTour, stopTour]);


    // 온보딩 완료 API 호출
    const completeOnboarding = useCallback(async () => {
        try {
            // 1. 즉시 로컬 스토어 업데이트 (UI 반응성 향상)
            completeOnboardingInStore();
            
            // 2. localStorage에 플래그 저장 (fallback)
            localStorage.setItem('didim_onboarding_completed', 'true');
            
            // 3. 백엔드 API 호출
            await memberApi.completeOnboarding();
            
            // 4. 사용자 정보도 업데이트 (동기화)
            if (user) {
                setUser({
                    ...user,
                    isOnboardingFinished: true,
                });
            }
        } catch (error: unknown) {
            // API 실패 시에도 로컬 상태는 유지 (사용자 경험 개선)
            const errorMessage = getErrorMessage(error);
            toast.error(`온보딩 완료 처리에 실패했습니다: ${errorMessage}`);
        }
    }, [user, setUser, completeOnboardingInStore]);

    // Joyride 이벤트 핸들러
    const handleJoyrideCallback = useCallback(
        (data: CallBackProps) => {
            const { status, type, index, action } = data;

            // 스텝 변경 시 stepIndex 업데이트
            if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
                if (action === 'next' || action === 'prev') {
                    // action이 'prev'면 -1, 'next'면 +1
                    const newIndex = action === 'prev' ? index - 1 : index + 1;
                    setStepIndex(newIndex);
                }
            }

            // 투어가 완료되거나 건너뛰어진 경우
            if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
                // 1. 먼저 투어 중지
                stopTour();
                
                // 2. 완료된 경우에만 API 호출 및 상태 업데이트
                if (status === STATUS.FINISHED && isDashboard) {
                    // Dashboard 온보딩 완료 처리 (즉시 스토어 업데이트 + API 호출)
                    completeOnboarding();
                } else if (status === STATUS.SKIPPED) {
                    // 건너뛰기 시에도 localStorage에 플래그 저장 (재시작 방지)
                    localStorage.setItem('didim_onboarding_completed', 'true');
                    completeOnboardingInStore();
                }
            }

            // 에러 발생 시 (개발 환경에서만 로그 출력)
            if (status === STATUS.ERROR) {
                if (import.meta.env.DEV) {
                    console.error('Joyride error:', type);
                }
                stopTour();
            }
        },
        [isDashboard, completeOnboarding, completeOnboardingInStore, stopTour, setStepIndex]
    );

    // 투어가 실행되지 않으면 렌더링하지 않음
    if (!run || currentSteps.length === 0) {
        return null;
    }

    return (
        <Joyride
            steps={currentSteps}
            run={run}
            stepIndex={stepIndex}
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

