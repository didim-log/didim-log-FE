/**
 * 신규 유저 프로덕트 투어 (Spotlight Onboarding)
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FC } from 'react';
import { Button } from '../../../components/ui/Button';
import { ONBOARDING_TOUR_STEPS, useOnboardingStore } from '../../../stores/onboarding.store';

type Rect = { top: number; left: number; width: number; height: number };

const OVERLAY_Z_INDEX = 100;
const HIGHLIGHT_PADDING = 10;
const TOOLTIP_MARGIN = 16;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const OnboardingTour: FC = () => {
    const {
        isNewUser,
        hasCompletedOnboarding,
        currentStep,
        startTour,
        nextStep,
        prevStep,
        skipTour,
    } = useOnboardingStore();

    const steps = useMemo(() => ONBOARDING_TOUR_STEPS, []);
    const step = steps[currentStep];
    const isOpen = isNewUser && !hasCompletedOnboarding;

    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const [highlightRect, setHighlightRect] = useState<Rect | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

    const recalc = () => {
        if (!step?.targetId) {
            setHighlightRect(null);
            setTooltipPos(null);
            return;
        }

        const target = document.getElementById(step.targetId);
        if (!target) {
            setHighlightRect(null);
            setTooltipPos({ top: 120, left: 24 });
            return;
        }

        const rect = target.getBoundingClientRect();
        const padded: Rect = {
            top: rect.top - HIGHLIGHT_PADDING,
            left: rect.left - HIGHLIGHT_PADDING,
            width: rect.width + HIGHLIGHT_PADDING * 2,
            height: rect.height + HIGHLIGHT_PADDING * 2,
        };
        setHighlightRect(padded);

        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;

        const tooltipW = tooltipRef.current?.offsetWidth ?? 360;
        const tooltipH = tooltipRef.current?.offsetHeight ?? 160;

        const preferredLeft = rect.left;
        const left = clamp(preferredLeft, 16, viewportW - tooltipW - 16);

        const belowTop = rect.bottom + TOOLTIP_MARGIN;
        const canPlaceBelow = belowTop + tooltipH <= viewportH - 16;

        const top = canPlaceBelow
            ? belowTop
            : clamp(rect.top - tooltipH - TOOLTIP_MARGIN, 16, viewportH - tooltipH - 16);

        setTooltipPos({ top, left });
    };

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        // 첫 진입이면 시작 스텝(0)으로 맞춰둠
        startTour();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (step?.targetId) {
            const target = document.getElementById(step.targetId);
            target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        const raf = requestAnimationFrame(() => recalc());
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, currentStep, step?.targetId]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleResize = () => recalc();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                skipTour();
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleResize, true);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleResize, true);
            window.removeEventListener('keydown', handleKeyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, step?.targetId]);

    if (!isOpen) {
        return null;
    }

    if (!step) {
        return null;
    }

    const isFirst = currentStep === 0;
    const isLast = currentStep === steps.length - 1;

    return (
        <div
            className="fixed inset-0"
            style={{ zIndex: OVERLAY_Z_INDEX }}
            aria-live="polite"
            aria-label="온보딩 투어"
        >
            {/* 배경 오버레이 */}
            <div className="absolute inset-0 bg-black/70" />

            {/* Spotlight: box-shadow로 '뚫린' 느낌 */}
            {highlightRect && (
                <div
                    className="absolute rounded-xl border-2 border-indigo-400/80"
                    style={{
                        top: highlightRect.top,
                        left: highlightRect.left,
                        width: highlightRect.width,
                        height: highlightRect.height,
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.70)',
                        background: 'transparent',
                        pointerEvents: 'none',
                    }}
                />
            )}

            {/* Welcome step: 중앙 카드 */}
            {isFirst && (
                <div className="absolute inset-0 flex items-center justify-center px-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 transition-opacity duration-200">
                        <div className="text-xs text-gray-500 mb-2">{currentStep + 1}/{steps.length}</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h2>
                        <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>

                        <div className="mt-6 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={skipTour}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                건너뛰기
                            </button>
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="primary" onClick={nextStep}>
                                    둘러보기
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Target step tooltip */}
            {!isFirst && tooltipPos && (
                <div
                    ref={tooltipRef}
                    className="absolute w-[360px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-xl p-5 transition-all duration-200"
                    style={{ top: tooltipPos.top, left: tooltipPos.left }}
                >
                    <div className="text-xs text-gray-500 mb-2">{currentStep + 1}/{steps.length}</div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>

                    <div className="mt-5 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={skipTour}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            건너뛰기
                        </button>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" onClick={prevStep} disabled={isFirst}>
                                이전
                            </Button>
                            <Button type="button" variant="primary" onClick={nextStep}>
                                {isLast ? '시작하기' : '다음'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
