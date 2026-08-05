import { Check, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const DEMO_STEPS = ['로그인', 'BOJ 인증', '문제 추천', '문제 확인'] as const;

interface DemoModeBarProps {
    step: 1 | 2 | 3 | 4;
    compact?: boolean;
}

export const DemoModeBar = ({ step, compact = false }: DemoModeBarProps) => {
    return (
        <aside
            data-testid="demo-mode-bar"
            aria-label={`데모 진행 단계 ${step}/${DEMO_STEPS.length}`}
            className={`${compact ? 'rounded-lg border' : 'border-b'} border-blue-200 bg-blue-50 text-gray-900 dark:border-blue-900 dark:bg-blue-950/70 dark:text-white`}
        >
            <div className={`mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 ${compact ? '' : 'lg:flex-row lg:items-center lg:justify-between lg:px-8'}`}>
                <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white dark:bg-blue-500">
                        데모 모드
                    </span>
                    <p className="min-w-0 text-sm text-gray-700 dark:text-blue-100">
                        샘플 데이터 · 입력은 저장되지 않습니다.
                    </p>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <ol className={compact ? 'hidden' : 'hidden items-center gap-2 sm:flex'} aria-label="데모 진행 순서">
                        {DEMO_STEPS.map((label, index) => {
                            const currentStep = index + 1;
                            const isComplete = currentStep < step;
                            const isCurrent = currentStep === step;

                            return (
                                <li key={label} className="flex items-center gap-2">
                                    {index > 0 && (
                                        <span
                                            aria-hidden="true"
                                            className={`h-px w-4 ${currentStep <= step ? 'bg-blue-500' : 'bg-blue-200 dark:bg-blue-800'}`}
                                        />
                                    )}
                                    <span
                                        aria-current={isCurrent ? 'step' : undefined}
                                        className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold ${
                                            isComplete || isCurrent
                                                ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-500'
                                                : 'border-blue-200 bg-white text-gray-500 dark:border-blue-800 dark:bg-gray-900 dark:text-gray-400'
                                        }`}
                                    >
                                        {isComplete ? <Check className="h-3.5 w-3.5" /> : currentStep}
                                    </span>
                                    <span className={`text-xs font-medium ${isCurrent ? 'text-blue-700 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {label}
                                    </span>
                                </li>
                            );
                        })}
                    </ol>

                    <span className={`whitespace-nowrap text-xs font-semibold text-blue-700 dark:text-blue-200 ${compact ? '' : 'sm:hidden'}`}>
                        {step}/{DEMO_STEPS.length} · {DEMO_STEPS[step - 1]}
                    </span>

                    <Link
                        to="/login"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:border-blue-500 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-blue-800 dark:bg-gray-900 dark:text-blue-200 dark:hover:bg-blue-900/50"
                    >
                        <LogIn className="h-3.5 w-3.5" />
                        실제 로그인
                    </Link>
                </div>
            </div>
        </aside>
    );
};
