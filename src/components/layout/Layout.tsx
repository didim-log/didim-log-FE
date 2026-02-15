/**
 * 레이아웃 컴포넌트
 */

import { Profiler, Suspense, lazy, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import type { FC, ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { routeRenderProfilerCallback } from '../../utils/performanceProfiler';
import { useTourStore } from '../../stores/tour.store';
import { useAuthStore } from '../../stores/auth.store';

const AppTour = lazy(() => import('../onboarding/AppTour'));

interface LayoutProps {
    children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const mainRef = useRef<HTMLElement | null>(null);
    const run = useTourStore((state) => state.run);
    const user = useAuthStore((state) => state.user);

    const shouldLoadTour = useMemo(() => {
        if (location.pathname.startsWith('/admin')) {
            return false;
        }
        if (run) {
            return true;
        }
        return Boolean(user && !user.isOnboardingFinished);
    }, [location.pathname, run, user]);

    // 페이지 변경 시 스크롤을 맨 위로 이동
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Header />
            <main ref={mainRef} className="flex-1 w-full">
                <Profiler id={`route:${location.pathname}`} onRender={routeRenderProfilerCallback}>
                    {children}
                </Profiler>
            </main>
            <Footer />
            {/* 전역 멀티 페이지 온보딩 투어 */}
            {shouldLoadTour && (
                <Suspense fallback={null}>
                    <AppTour />
                </Suspense>
            )}
        </div>
    );
};
