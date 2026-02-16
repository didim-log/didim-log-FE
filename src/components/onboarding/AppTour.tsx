import { useEffect, useState, useMemo, useCallback, type ComponentPropsWithoutRef } from 'react';
import Joyride, { type Step, type CallBackProps, STATUS, ACTIONS, EVENTS, type TooltipRenderProps } from 'react-joyride';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTourStore } from '../../stores/tour.store';
import { useAuthStore } from '../../stores/auth.store';
import { memberApi } from '../../api/endpoints/member.api';

// 🎨 Custom Tooltip Component
type CustomTooltipProps = TooltipRenderProps & {
  skipProps?: ComponentPropsWithoutRef<'button'>;
};

type TourStep = Step & {
  scrollOffset?: number;
  spotlightPadding?: number;
  data?: {
    route?: string;
    allowMissingProblemId?: boolean;
  };
};

const PROBLEM_ID_TOKEN = ':problemId';

const extractProblemIdFromPath = (pathname: string): string | null => {
  const match = pathname.match(/\/(?:problems|study)\/(\d+)/);
  return match?.[1] ?? null;
};

const extractProblemIdFromRecommendations = (): string | null => {
  const link = document.querySelector('.tour-recommendations a[href^="/problems/"]');
  if (!link) {
    return null;
  }

  const href = link.getAttribute('href');
  if (!href) {
    return null;
  }

  const match = href.match(/^\/problems\/(\d+)/);
  return match?.[1] ?? null;
};

const CustomTooltip = ({
  index,
  step,
  tooltipProps,
  primaryProps,
  backProps,
  skipProps,
  size,
  isLastStep,
}: CustomTooltipProps) => {
  return (
    <div {...tooltipProps} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 p-5 w-[400px] flex flex-col gap-4">
      {step.title && <h3 className="text-lg font-bold text-gray-900 dark:text-white">{step.title}</h3>}
      <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
        {step.content}
      </div>
      <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100">
        <span className="text-xs font-mono text-gray-400">{index + 1} / {size}</span>
        <div className="flex gap-2">
          {skipProps && (
            <button
              {...skipProps}
              className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              스킵하기
            </button>
          )}
          {index > 0 && (
            <button {...backProps} className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg">이전</button>
          )}
          <button {...primaryProps} className="px-4 py-1.5 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-lg">
            {isLastStep ? '완료하기' : '다음'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AppTour = () => {
  const { run, stepIndex, setStepIndex, stopTour, startTour } = useTourStore();
  const { user, completeOnboarding } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [forceHide, setForceHide] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isTargetReady, setIsTargetReady] = useState(false);
  const [onboardingProblemId, setOnboardingProblemId] = useState<string | null>(null);
  const [hasRecommendations, setHasRecommendations] = useState<boolean | null>(null);

  useEffect(() => {
    if (run) setForceHide(false);
  }, [run]);

  useEffect(() => {
    const pathProblemId = extractProblemIdFromPath(location.pathname);
    if (pathProblemId) {
      setOnboardingProblemId(pathProblemId);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!run || location.pathname !== '/dashboard') {
      return;
    }

    let attempt = 0;
    const intervalId = setInterval(() => {
      attempt += 1;

      const recommendedProblemId = extractProblemIdFromRecommendations();
      if (recommendedProblemId) {
        setOnboardingProblemId(recommendedProblemId);
        setHasRecommendations(true);
        clearInterval(intervalId);
        return;
      }

      const hasEmptyState = Boolean(document.querySelector('.tour-recommend-empty'));
      if (hasEmptyState || attempt >= 30) {
        setHasRecommendations(false);
        clearInterval(intervalId);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [run, location.pathname]);

  const getResolvedProblemId = useCallback(() => {
    return (
      onboardingProblemId ??
      extractProblemIdFromPath(location.pathname) ??
      extractProblemIdFromRecommendations()
    );
  }, [onboardingProblemId, location.pathname]);

  const resolveRoute = useCallback((routeTemplate?: string, allowMissingProblemId = false) => {
    if (!routeTemplate) {
      return undefined;
    }

    if (!routeTemplate.includes(PROBLEM_ID_TOKEN)) {
      return routeTemplate;
    }

    const resolvedProblemId = getResolvedProblemId();
    if (!resolvedProblemId) {
      return allowMissingProblemId ? '/problems' : undefined;
    }

    return routeTemplate.replace(PROBLEM_ID_TOKEN, resolvedProblemId);
  }, [getResolvedProblemId]);

  useEffect(() => {
    const isLocalCompleted = localStorage.getItem('didim_onboarding_completed') === 'true';

    if (isLocalCompleted) {
      if (run) {
        stopTour();
      }
      return;
    }

    const isServerCompleted = user?.isOnboardingFinished;

    if (user && !isServerCompleted && !run && !forceHide) {
      const timeoutId = setTimeout(() => {
        if (location.pathname === '/dashboard') {
          startTour();
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [user?.isOnboardingFinished, run, location.pathname, forceHide, stopTour, startTour, user]);

  const fullFlowSteps: TourStep[] = useMemo(() => [
    {
      target: '.tour-recommendations',
      title: '추천 문제로 시작해요',
      content: '지금 내 수준에 맞는 문제를 추천해드려요.\n마음에 드는 문제를 눌러 시작해보세요.',
      placement: 'bottom',
      disableBeacon: true,
      spotlightPadding: 5,
      scrollOffset: 150,
      data: { route: '/dashboard' }
    },
    {
      target: 'body',
      title: '문제 읽기',
      content: '문제 설명을 먼저 읽어보세요.\n어떤 접근이 좋을지 간단히 정리해보세요.',
      placement: 'center',
      disableBeacon: true,
      data: { route: '/problems/:problemId', allowMissingProblemId: true }
    },
    {
      target: '.tour-timer-btn',
      title: '타이머 설정',
      content: '타이머를 켜고 풀이를 시작해보세요.\n풀이 시간을 기록하면 실전 감각이 좋아집니다.',
      placement: 'left',
      disableBeacon: true,
      spotlightPadding: 5,
      scrollOffset: 300,
      data: { route: '/study/:problemId' }
    },
    {
      target: '.tour-submit-buttons',
      title: '풀이 결과 기록',
      content: '풀이가 끝나면 \'성공\' 또는 \'실패\'를 눌러주세요.\n결과를 기록하고 다음 단계로 넘어갈 수 있어요.',
      placement: 'top',
      disableBeacon: true,
      spotlightPadding: 5,
      scrollOffset: 150,
      data: { route: '/study/:problemId' }
    },
    {
      target: '.tour-ai-review-btn',
      title: '회고 작성 & AI 분석',
      content: '회고 페이지 상단에서 AI 리뷰를 요청할 수 있어요.\n제출한 코드 기준으로 빠르게 개선 포인트를 확인해보세요.',
      placement: 'top',
      disableBeacon: true,
      spotlightPadding: 5,
      scrollOffset: 150,
      data: { route: '/retrospectives/write?onboarding=true&problemId=:problemId' }
    },
    {
      target: '.tour-retro-summary-input',
      title: '한 줄 요약 작성',
      content: '풀이 핵심을 한 줄로 정리해보세요.\n나중에 복습할 때 가장 빠르게 맥락을 찾을 수 있어요.',
      placement: 'bottom',
      disableBeacon: true,
      spotlightPadding: 5,
      scrollOffset: 150,
      data: { route: '/retrospectives/write?onboarding=true&problemId=:problemId' }
    },
    {
      target: '.tour-retro-save-btn',
      title: '회고 저장',
      content: '내용을 작성했다면 저장해서 기록을 남겨보세요.\n저장 후 회고 목록에서 다시 확인할 수 있어요.',
      placement: 'top',
      disableBeacon: true,
      spotlightPadding: 5,
      scrollOffset: 150,
      data: { route: '/retrospectives/write?onboarding=true&problemId=:problemId' }
    },
    {
      target: 'body',
      title: '랭킹',
      content: '회고 작성 수로 랭킹이 집계돼요.\n다른 사람들과 함께 동기부여를 받아보세요.',
      placement: 'center',
      disableBeacon: true,
      data: { route: '/ranking' }
    },
    {
      target: '.tour-language-badge',
      title: '내 언어 설정',
      content: '주로 사용하는 언어를 확인하고 설정해보세요.\n맞춤 추천과 기록에 도움이 됩니다.',
      placement: 'top',
      disableBeacon: true,
      spotlightPadding: 5,
      scrollOffset: 300,
      data: { route: '/profile' }
    },
    {
      target: '.tour-my-retros',
      title: '회고 모아보기',
      content: '작성한 회고를 모아보고 복습해보세요.\n꾸준히 기록하면 성장 흐름이 보입니다.',
      placement: 'top',
      disableBeacon: true,
      spotlightPadding: 5,
      scrollOffset: 150,
      data: { route: '/profile' }
    },
  ], []);

  const emptyRecommendationSteps: TourStep[] = useMemo(() => [
    {
      target: '.tour-recommend-empty',
      title: '추천 데이터 준비 중',
      content: '아직 추천을 만들 데이터가 부족해요.\n먼저 문제를 풀면 개인화 추천이 활성화됩니다.',
      placement: 'bottom',
      disableBeacon: true,
      spotlightPadding: 5,
      scrollOffset: 150,
      data: { route: '/dashboard' }
    },
    {
      target: '.tour-problem-list-link',
      title: '문제 목록으로 시작',
      content: '여기서 문제 목록으로 이동해 첫 풀이를 시작해보세요.',
      placement: 'top',
      disableBeacon: true,
      spotlightPadding: 5,
      scrollOffset: 150,
      data: { route: '/dashboard' }
    },
    {
      target: 'body',
      title: '랭킹',
      content: '회고 작성 수로 랭킹이 집계돼요.\n다른 사람들과 함께 동기부여를 받아보세요.',
      placement: 'center',
      disableBeacon: true,
      data: { route: '/ranking' }
    },
    {
      target: '.tour-language-badge',
      title: '내 언어 설정',
      content: '주로 사용하는 언어를 확인하고 설정해보세요.\n맞춤 추천과 기록에 도움이 됩니다.',
      placement: 'top',
      disableBeacon: true,
      spotlightPadding: 5,
      scrollOffset: 300,
      data: { route: '/profile' }
    },
    {
      target: '.tour-my-retros',
      title: '회고 모아보기',
      content: '풀이 후 회고를 쌓으면 이 영역이 채워집니다.\n나중에 다시 와서 성장 흐름을 확인해보세요.',
      placement: 'top',
      disableBeacon: true,
      spotlightPadding: 5,
      scrollOffset: 150,
      data: { route: '/profile' }
    },
  ], []);

  const steps = hasRecommendations === false ? emptyRecommendationSteps : fullFlowSteps;

  useEffect(() => {
    const isLocalCompleted = localStorage.getItem('didim_onboarding_completed') === 'true';

    if (!run || forceHide || isNavigating || isLocalCompleted) {
      setIsTargetReady(false);
      return;
    }

    if (location.pathname === '/dashboard' && hasRecommendations === null && stepIndex === 0) {
      setIsTargetReady(false);
      return;
    }

    const currentStep = steps[stepIndex];
    if (!currentStep) {
      setIsTargetReady(false);
      return;
    }

    const stepRoute = resolveRoute(currentStep.data?.route, currentStep.data?.allowMissingProblemId ?? false);

    if (!stepRoute && currentStep.data?.route?.includes(PROBLEM_ID_TOKEN)) {
      const rankingStepIndex = steps.findIndex((step) => step.data?.route === '/ranking');
      if (rankingStepIndex >= 0 && rankingStepIndex !== stepIndex) {
        setStepIndex(rankingStepIndex);
      }
      setIsTargetReady(false);
      return;
    }

    if (stepRoute) {
      const targetPath = stepRoute.split('?')[0];
      const currentPath = location.pathname;

      if (!currentPath.includes(targetPath)) {
        setIsNavigating(true);
        setIsTargetReady(false);
        navigate(stepRoute);
        setTimeout(() => setIsNavigating(false), 500);
        return;
      }
    }

    let intervalId: ReturnType<typeof setInterval> | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let attemptCount = 0;
    const MAX_ATTEMPTS = 50;

    const checkTarget = () => {
      attemptCount += 1;

      if (stepRoute) {
        const targetPath = stepRoute.split('?')[0];
        const currentPath = location.pathname;
        if (!currentPath.includes(targetPath)) {
          setIsTargetReady(false);
          return false;
        }
      }

      if (currentStep.target === 'body') {
        setIsTargetReady(true);
        return true;
      }

      const element = document.querySelector(currentStep.target as string);
      if (element) {
        setIsTargetReady(true);
        return true;
      }

      setIsTargetReady(false);

      if (attemptCount >= MAX_ATTEMPTS) {
        clearInterval(intervalId);
      }

      return false;
    };

    if (!checkTarget()) {
      intervalId = setInterval(checkTarget, 100);
      timeoutId = setTimeout(() => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    stepIndex,
    run,
    forceHide,
    isNavigating,
    steps,
    location.pathname,
    navigate,
    resolveRoute,
    hasRecommendations,
    setStepIndex,
  ]);

  const handleCallback = async (data: CallBackProps) => {
    const { status, type, index, action } = data;

    const isFinishedStatus = status === STATUS.FINISHED;
    const isTourEndEvent = type === EVENTS.TOUR_END;
    const isLastStepNext =
      type === EVENTS.STEP_AFTER && action === ACTIONS.NEXT && index === steps.length - 1;

    if (isFinishedStatus || isTourEndEvent || isLastStepNext) {
      localStorage.setItem('didim_onboarding_completed', 'true');
      completeOnboarding();
      setForceHide(true);
      stopTour();
      setStepIndex(0);

      try {
        await memberApi.completeOnboarding();
      } catch {
        // 온보딩 완료 API 실패 시에도 대시보드로 이동
      } finally {
        window.location.replace('/dashboard');
      }
      return;
    }

    if (status === STATUS.SKIPPED) {
      setForceHide(true);
      stopTour();
      setStepIndex(0);
      return;
    }

    if (type === EVENTS.STEP_AFTER && action === ACTIONS.NEXT) {
      const nextIndex = index + 1;

      if (nextIndex < steps.length) {
        const nextStep = steps[nextIndex];
        const nextRoute = resolveRoute(nextStep.data?.route, nextStep.data?.allowMissingProblemId ?? false);
        const currentPath = location.pathname;
        const targetPath = nextRoute?.split('?')[0];

        setStepIndex(nextIndex);

        if (targetPath && !currentPath.includes(targetPath)) {
          setIsNavigating(true);
          setIsTargetReady(false);
          navigate(nextRoute);
          setTimeout(() => {
            setIsNavigating(false);
          }, 500);
        } else {
          setIsTargetReady(false);
        }
      }
    }

    if (type === EVENTS.STEP_AFTER && action === ACTIONS.PREV) {
      const prevIndex = index - 1;
      if (prevIndex >= 0) {
        setStepIndex(prevIndex);
        const prevStep = steps[prevIndex];
        const prevRoute = resolveRoute(prevStep.data?.route, prevStep.data?.allowMissingProblemId ?? false);

        if (prevRoute && !location.pathname.includes(prevRoute.split('?')[0])) {
          setIsNavigating(true);
          navigate(prevRoute);
          setTimeout(() => setIsNavigating(false), 500);
        }
      }
    }
  };

  if (forceHide) return null;
  if (isNavigating) return null;
  if (localStorage.getItem('didim_onboarding_completed') === 'true') return null;

  return (
    <Joyride
      steps={steps}
      run={run && isTargetReady}
      stepIndex={stepIndex}
      callback={handleCallback}
      continuous={true}
      tooltipComponent={CustomTooltip}
      showSkipButton={true}
      disableOverlayClose={true}
      disableCloseOnEsc={true}
      hideCloseButton={true}
      spotlightClicks={true}
      floaterProps={{
        disableAnimation: true,
        hideArrow: true,
        disableFlip: true,
        offset: 15,
      }}
      spotlightPadding={5}
      styles={{
        options: { zIndex: 10000, primaryColor: '#3b82f6' },
        overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 },
        spotlight: { borderRadius: 8 }
      }}
    />
  );
};

export { AppTour };
export default AppTour;
