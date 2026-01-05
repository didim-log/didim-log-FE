import { useEffect, useState, useMemo, type ComponentPropsWithoutRef } from 'react';
import Joyride, { type Step, type CallBackProps, STATUS, ACTIONS, EVENTS, type TooltipRenderProps } from 'react-joyride';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTourStore } from '../../stores/tour.store';
import { useAuthStore } from '../../stores/auth.store';
import { memberApi } from '../../api/endpoints/member.api';

// 🎨 Custom Tooltip Component
type CustomTooltipProps = TooltipRenderProps & {
  skipProps?: ComponentPropsWithoutRef<'button'>;
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
  const { run, stepIndex, setStepIndex, stopTour, startTour } = useTourStore(); // startTour 추가
  const { user, completeOnboarding } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🛡️ Safety Flags
  const [forceHide, setForceHide] = useState(false); 
  const [isNavigating, setIsNavigating] = useState(false); 
  const [isTargetReady, setIsTargetReady] = useState(false); 

  // 1. Reset & Restart Logic
  useEffect(() => {
    if (run) setForceHide(false);
  }, [run]);

  // 2. Auto-Start Logic (신규 사용자 자동 시작 및 좀비 투어 방지)
  useEffect(() => {
    const isLocalCompleted = localStorage.getItem('didim_onboarding_completed') === 'true';
    
    // 🛡️ [FIX] 로컬에서 완료되었다면 스토어 상태와 상관없이 즉시 종료 처리
    if (isLocalCompleted) {
      if (run) {
        stopTour(); // 이미 실행 중인 상태라면 강제 중지
      }
      return;
    }
    
    const isServerCompleted = user?.isOnboardingFinished;
    
    // 신규 사용자 자동 시작
    if (user && !isServerCompleted && !run && !forceHide) {
        const timeoutId = setTimeout(() => {
            if (location.pathname === '/dashboard') {
                startTour();
            }
        }, 1000);
        
        return () => clearTimeout(timeoutId);
    }
  }, [user?.isOnboardingFinished, run, location.pathname, forceHide, stopTour, startTour, user]);

  // 📝 3. Step Definitions
  const steps: (Step & { scrollOffset?: number; spotlightPadding?: number })[] = useMemo(() => [
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
      data: { route: '/problems/1000' } 
    },
    { 
      target: '.tour-timer-btn', 
      title: '타이머 설정', 
      content: '타이머를 켜고 풀이를 시작해보세요.\n풀이 시간을 기록하면 실전 감각이 좋아집니다.', 
      placement: 'left', 
      disableBeacon: true, 
      spotlightPadding: 5,
      scrollOffset: 300,
      data: { route: '/study/1000' } 
    },
    { 
      target: '.tour-submit-buttons', 
      title: '풀이 결과 기록', 
      content: '풀이가 끝나면 \'성공\' 또는 \'실패\'를 눌러주세요.\n결과를 기록하고 다음 단계로 넘어갈 수 있어요.', 
      placement: 'top', 
      disableBeacon: true, 
      spotlightPadding: 5,
      scrollOffset: 150,
      data: { route: '/study/1000' } 
    },
    { 
      target: '.tour-ai-section', 
      title: '회고 작성 & AI 분석', 
      content:
        '먼저 \'성공\' 또는 \'실패\'를 눌러 회고를 생성해보세요.\n회고 페이지로 이동하면 AI 분석 카드가 나타납니다.\n카드에서 제출한 코드를 리뷰받을 수 있어요.',
      placement: 'top', 
      disableBeacon: true, 
      spotlightPadding: 5,
      scrollOffset: 150,
      data: { route: '/retrospectives/write?onboarding=true' } 
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

  // 🕵️ 4. Target Watcher
  useEffect(() => {
    // [FIX] 완료 여부를 여기서도 체크하여, 완료된 상태라면 절대 DOM 탐색이나 네비게이션을 수행하지 않음
    const isLocalCompleted = localStorage.getItem('didim_onboarding_completed') === 'true';

    if (!run || forceHide || isNavigating || isLocalCompleted) {
      setIsTargetReady(false);
      return;
    }

    const currentStep = steps[stepIndex];
    if (!currentStep) {
      setIsTargetReady(false);
      return;
    }

    const stepRoute = currentStep.data?.route;
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
      attemptCount++;
      
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
  }, [stepIndex, run, forceHide, isNavigating, steps, location.pathname, navigate]);


  // 🎮 5. Event Handler
  const handleCallback = async (data: CallBackProps) => {
    const { status, type, index, action } = data;

    const isFinishedStatus = status === STATUS.FINISHED;
    const isTourEndEvent = type === EVENTS.TOUR_END;
    const isLastStepNext =
      type === EVENTS.STEP_AFTER && action === ACTIONS.NEXT && index === steps.length - 1;

    // ✅ COMPLETION: 완료 시 대시보드로 이동하며 새로고침(하드 로드)
    // - Joyride가 종료를 알리는 방식이 케이스에 따라 달라서(TOUR_END / FINISHED / 마지막 STEP_AFTER),
    //   어떤 경로로 끝나더라도 확실히 완료 처리되도록 보강합니다.
    if (isFinishedStatus || isTourEndEvent || isLastStepNext) {
      // 1. [안전 장치] 즉시 로컬 스토리지 저장 (사용자 이탈 방지)
      localStorage.setItem('didim_onboarding_completed', 'true');
      completeOnboarding(); 
      setForceHide(true);   // UI 숨김
      stopTour();           // 기능 정지
      setStepIndex(0);

      try {
        // 2. 서버에 완료 요청 전송
        await memberApi.completeOnboarding();
      } catch {
        // 온보딩 완료 API 실패 시에도 대시보드로 이동
      } finally {
        // 3. [이동 및 새로고침] 대시보드로 이동하면서 페이지를 새로 로드합니다.
        // - `href`는 "이동 + 하드 로드"라서 새로고침을 따로 할 필요가 없습니다.
        // - `replace`로 히스토리를 덮어써서 뒤로가기로 투어 화면에 돌아오지 않게 합니다.
        window.location.replace('/dashboard');
      }
      return;
    }

    // ✅ SKIPPED: 건너뛰기
    if (status === STATUS.SKIPPED) {
      setForceHide(true);
      stopTour();
      setStepIndex(0);
      return;
    }

    // ✅ NEXT NAVIGATION (기존 로직 유지)
    if (type === EVENTS.STEP_AFTER && action === ACTIONS.NEXT) {
      const nextIndex = index + 1;
      
      if (nextIndex < steps.length) {
        const nextStep = steps[nextIndex];
        const nextRoute = nextStep.data?.route;
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
    
    // ✅ PREVIOUS (기존 로직 유지)
    if (type === EVENTS.STEP_AFTER && action === ACTIONS.PREV) {
       const prevIndex = index - 1;
       if (prevIndex >= 0) {
         setStepIndex(prevIndex);
         const prevStep = steps[prevIndex];
         const prevRoute = prevStep.data?.route;
         
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
  
  // [FIX] 여기서도 한 번 더 안전 장치
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


