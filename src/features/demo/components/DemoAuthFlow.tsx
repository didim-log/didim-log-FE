import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Check, KeyRound, ShieldCheck, UserRound } from 'lucide-react';
import { DEMO_PROFILE } from '../data/demo.fixture';

const AUTH_STEPS = [
    {
        label: '입력',
        detail: '샘플 BOJ ID와 데모용 비밀번호를 입력합니다.',
        icon: UserRound,
    },
    {
        label: '검증',
        detail: '형식과 필수값을 브라우저 안에서만 확인합니다.',
        icon: ShieldCheck,
    },
    {
        label: '세션 준비',
        detail: '실제 토큰 없이 로그인 이후 화면을 준비합니다.',
        icon: KeyRound,
    },
] as const;

export function DemoAuthFlow() {
    const [step, setStep] = useState(0);
    const [bojId, setBojId] = useState<string>(DEMO_PROFILE.bojId);
    const [password, setPassword] = useState('demo-only');
    const [error, setError] = useState<string | null>(null);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        if (name === 'bojId') {
            setBojId(value.replace(/[^a-zA-Z0-9_]/g, ''));
        } else {
            setPassword(value);
        }
        setStep(0);
        setError(null);
    };

    const handleStart = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (bojId.length < 3 || password.length < 8) {
            setError('BOJ ID는 3자 이상, 데모 비밀번호는 8자 이상 입력해 주세요.');
            return;
        }

        setError(null);
        setStep(1);
    };

    const handleNext = () => {
        setStep(2);
    };

    return (
        <section
            id="demo-login"
            aria-labelledby="demo-login-title"
            className="border-t border-slate-200 bg-white/90 py-20 dark:border-slate-800 dark:bg-slate-950/90"
        >
            <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-10">
                <div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
                        01 / 로그인
                    </p>
                    <h2 id="demo-login-title" className="mt-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                        자격 증명을 남기지 않고<br className="hidden sm:block" /> 로그인 흐름만 확인합니다
                    </h2>
                    <p className="mt-5 max-w-md text-base leading-7 text-slate-600 dark:text-slate-300">
                        입력, 검증, 세션 준비 순서를 브라우저 상태로만 재현합니다. 인증 서버 요청이나 토큰 발급은 일어나지 않습니다.
                    </p>
                    <div className="mt-7 border-l-2 border-blue-600 pl-4 text-sm text-slate-600 dark:border-blue-400 dark:text-slate-300">
                        <p className="font-semibold text-slate-900 dark:text-white">데모 데이터 · 입력 내용은 저장되지 않습니다</p>
                        <p className="mt-1">API 요청 0건 · 쿠키 0건 · 토큰 0건</p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-950">
                        <div className="flex items-center gap-2" aria-hidden="true">
                            <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                            <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                        </div>
                        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">local demo / auth</span>
                    </div>

                    <div className="grid md:grid-cols-[0.9fr_1.1fr]">
                        <form onSubmit={handleStart} className="border-b border-slate-200 p-5 dark:border-slate-700 md:border-b-0 md:border-r sm:p-7">
                            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100" htmlFor="demo-boj-id">
                                BOJ ID
                            </label>
                            <input
                                id="demo-boj-id"
                                name="bojId"
                                value={bojId}
                                onChange={handleChange}
                                autoComplete="off"
                                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 font-mono text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-950"
                            />

                            <label className="mt-5 block text-sm font-semibold text-slate-800 dark:text-slate-100" htmlFor="demo-password">
                                데모 비밀번호
                            </label>
                            <input
                                id="demo-password"
                                name="password"
                                type="password"
                                value={password}
                                onChange={handleChange}
                                autoComplete="off"
                                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 font-mono text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-950"
                            />

                            {error && (
                                <p role="alert" className="mt-3 text-sm leading-5 text-red-600 dark:text-red-400">
                                    {error}
                                </p>
                            )}

                            {step === 0 ? (
                                <button
                                    type="submit"
                                    data-testid="demo-auth-start"
                                    className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus-visible:ring-blue-900"
                                >
                                    로그인 흐름 실행
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    data-testid="demo-auth-next"
                                    onClick={handleNext}
                                    disabled={step === 2}
                                    className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-default disabled:bg-emerald-600 dark:bg-blue-500 dark:hover:bg-blue-400 dark:disabled:bg-emerald-600"
                                >
                                    {step === 2 ? '세션 준비 확인' : '검증 결과 확인'}
                                </button>
                            )}
                        </form>

                        <div className="p-5 sm:p-7" aria-live="polite">
                            <ol className="space-y-5">
                                {AUTH_STEPS.map((item, index) => {
                                    const Icon = item.icon;
                                    const isComplete = index < step || (step === 2 && index === 2);
                                    const isActive = index === step;

                                    return (
                                        <li key={item.label} className="relative grid grid-cols-[2rem_1fr] gap-3">
                                            {index < AUTH_STEPS.length - 1 && (
                                                <span className="absolute left-[0.94rem] top-8 h-[calc(100%+0.25rem)] w-px bg-slate-300 dark:bg-slate-700" aria-hidden="true" />
                                            )}
                                            <span
                                                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border ${
                                                    isComplete
                                                        ? 'border-emerald-600 bg-emerald-600 text-white'
                                                        : isActive
                                                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300'
                                                          : 'border-slate-300 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500'
                                                }`}
                                            >
                                                {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                            </span>
                                            <div className="pt-0.5">
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className={`text-sm font-bold ${isActive || isComplete ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                                        {item.label}
                                                    </p>
                                                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                                                        {isComplete ? 'done' : isActive ? 'ready' : 'waiting'}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">{item.detail}</p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>

                            <div className="mt-7 rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-300 dark:border-slate-700">
                                <p><span className="text-sky-400">$</span> auth.demo --network=off</p>
                                <p><span className="text-slate-500">›</span> input: memory only</p>
                                <p><span className="text-slate-500">›</span> api calls: 0</p>
                                {step >= 1 && <p className="text-emerald-400">✓ local validation passed</p>}
                                {step === 2 && <p className="text-emerald-400">✓ demo session ready</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
