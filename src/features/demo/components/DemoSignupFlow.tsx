import { useState } from 'react';
import { Check, Copy, ScanLine, UserPlus } from 'lucide-react';
import { DEMO_PROFILE } from '../data/demo.fixture';

const SIGNUP_STEPS = [
    {
        label: '인증 문구 확인',
        description: '디딤로그가 만든 일회용 문구를 확인합니다.',
        icon: Copy,
    },
    {
        label: 'BOJ 상태 메시지 인증',
        description: '상태 메시지에 문구가 있는지 확인하는 과정을 재현합니다.',
        icon: ScanLine,
    },
    {
        label: '가입 정보 준비',
        description: '인증된 BOJ ID로 샘플 프로필을 만듭니다.',
        icon: UserPlus,
    },
] as const;

export function DemoSignupFlow() {
    const [step, setStep] = useState(0);

    const handleNext = () => {
        setStep((current) => Math.min(current + 1, SIGNUP_STEPS.length - 1));
    };

    return (
        <section
            id="demo-signup"
            aria-labelledby="demo-signup-title"
            className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900"
        >
            <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
                <div className="grid items-end gap-6 lg:grid-cols-[1fr_auto]">
                    <div>
                        <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
                            02 / BOJ 인증과 가입
                        </p>
                        <h2 id="demo-signup-title" className="mt-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                            상태 메시지 인증을 세 장면으로 봅니다
                        </h2>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                            실제 BOJ 계정을 조회하지 않습니다. 샘플 인증 문구와 성공 상태만 이용해 회원가입의 순서를 보여줍니다.
                        </p>
                    </div>
                    <p className="border-l-2 border-blue-600 pl-3 text-sm font-semibold text-slate-700 dark:border-blue-400 dark:text-slate-200">
                        데모 데이터 · 저장되지 않습니다
                    </p>
                </div>

                <div className="mt-10 grid gap-5 lg:grid-cols-3">
                    {SIGNUP_STEPS.map((item, index) => {
                        const Icon = item.icon;
                        const isComplete = index < step;
                        const isActive = index === step;

                        return (
                            <article
                                key={item.label}
                                className={`relative min-h-64 overflow-hidden rounded-2xl border p-6 transition-colors motion-reduce:transition-none ${
                                    isActive
                                        ? 'border-blue-500 bg-white shadow-[0_18px_40px_-30px_rgba(37,99,235,0.65)] dark:border-blue-400 dark:bg-slate-950'
                                        : 'border-slate-200 bg-slate-100/80 dark:border-slate-700 dark:bg-slate-800/60'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <span
                                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                                            isComplete
                                                ? 'bg-emerald-600 text-white'
                                                : isActive
                                                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                                                  : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                        }`}
                                    >
                                        {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                    </span>
                                    <span className="font-mono text-xs text-slate-400">0{index + 1}</span>
                                </div>
                                <h3 className={`mt-6 text-lg font-bold ${isActive || isComplete ? 'text-slate-950 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {item.label}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.description}</p>

                                {index === 0 && (
                                    <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 font-mono text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">
                                        DIDIM-VERIFY-7H2K
                                    </div>
                                )}
                                {index === 1 && (
                                    <div className="mt-5 flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-3 font-mono text-xs text-slate-300">
                                        <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-blue-400' : isComplete ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                                        statusMessage.match
                                    </div>
                                )}
                                {index === 2 && (
                                    <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-xs">
                                        <dt className="font-mono text-slate-400">bojId</dt>
                                        <dd className="font-semibold text-slate-700 dark:text-slate-200">{DEMO_PROFILE.bojId}</dd>
                                        <dt className="font-mono text-slate-400">tier</dt>
                                        <dd className="font-semibold text-slate-700 dark:text-slate-200">{DEMO_PROFILE.tierLabel}</dd>
                                    </dl>
                                )}
                            </article>
                        );
                    })}
                </div>

                <div className="mt-7 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row sm:items-center">
                    <p className="font-mono text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
                        STEP {step + 1} / {SIGNUP_STEPS.length} · {SIGNUP_STEPS[step].label}
                    </p>
                    <button
                        type="button"
                        data-testid="demo-signup-next"
                        onClick={step === SIGNUP_STEPS.length - 1 ? () => setStep(0) : handleNext}
                        className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 transition hover:border-blue-500 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:hover:border-blue-400 dark:hover:text-blue-300 dark:focus-visible:ring-blue-900"
                    >
                        {step === SIGNUP_STEPS.length - 1 ? '처음부터 다시 보기' : '다음 단계'}
                    </button>
                </div>
            </div>
        </section>
    );
}
