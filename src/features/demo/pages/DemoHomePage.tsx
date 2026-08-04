import { ArrowDown, ArrowRight, BookOpenCheck, Code2, DatabaseZap, Route } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DemoAuthFlow } from '../components/DemoAuthFlow';
import { DemoRecommendationFlow } from '../components/DemoRecommendationFlow';
import { DemoSignupFlow } from '../components/DemoSignupFlow';

export function DemoHomePage() {
    const handleDemoStart = () => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        document.getElementById('demo-login')?.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
    };

    return (
        <div data-testid="demo-home" className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
            <header className="border-b border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-950/95">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-10">
                    <Link
                        to="/"
                        className="group flex items-center gap-3 text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 dark:text-white dark:focus-visible:ring-blue-900"
                        aria-label="디딤로그 데모 홈"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white transition-transform group-hover:-translate-y-0.5 motion-reduce:transition-none dark:bg-blue-500">
                            <Code2 className="h-4 w-4" />
                        </span>
                        <span className="font-bold tracking-tight">디딤로그</span>
                        <span className="hidden border-l border-slate-200 pl-3 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:text-slate-400 sm:inline">
                            public demo
                        </span>
                    </Link>
                    <nav className="flex items-center gap-2" aria-label="주요 이동">
                        <Link
                            to="/login"
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-300 dark:focus-visible:ring-blue-900"
                        >
                            실제 로그인
                        </Link>
                        <Link
                            to="/signup"
                            className="hidden rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-500 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300 dark:focus-visible:ring-blue-900 sm:inline-flex"
                        >
                            회원가입
                        </Link>
                    </nav>
                </div>
            </header>

            <main>
                <section
                    className="relative overflow-hidden border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.12) 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                >
                    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:px-10 lg:py-20">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                                No login required
                            </div>
                            <h1 className="mt-7 max-w-2xl text-5xl font-black leading-[1.08] tracking-[-0.045em] text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
                                기록으로 이어지는<br />
                                <span className="text-blue-600 dark:text-blue-400">알고리즘 학습</span>
                            </h1>
                            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                                BOJ 인증부터 내 수준에 맞는 문제 추천까지. 로그인 없이 디딤로그의 핵심 흐름을 직접 실행해 보세요.
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={handleDemoStart}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus-visible:ring-blue-900"
                                >
                                    데모 시작
                                    <ArrowDown className="h-4 w-4" />
                                </button>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-blue-500 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-blue-400 dark:hover:text-blue-300 dark:focus-visible:ring-blue-900"
                                >
                                    실제 로그인
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                <DatabaseZap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                데모 데이터 · 입력 내용은 저장되지 않습니다
                            </p>
                        </div>

                        <div className="relative">
                            <div className="absolute -left-5 top-12 hidden h-[calc(100%-6rem)] w-px bg-blue-300 dark:bg-blue-800 sm:block" aria-hidden="true" />
                            <div className="overflow-hidden rounded-2xl border border-slate-300 bg-slate-950 shadow-[0_30px_80px_-38px_rgba(15,23,42,0.75)] dark:border-slate-700">
                                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                                    <span className="font-mono text-xs text-slate-400">recommendation.trace</span>
                                    <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> live sample
                                    </span>
                                </div>
                                <ol className="divide-y divide-slate-800 px-5 sm:px-7">
                                    {[
                                        ['01', 'Identity', 'BOJ 상태 메시지 확인'],
                                        ['02', 'Profile', '티어 · 풀이 기록 확인'],
                                        ['03', 'Filter', 'tier ±2 · RELATED'],
                                        ['04', 'Result', '학습할 문제 3개 선택'],
                                    ].map(([number, label, detail], index) => (
                                        <li key={number} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 py-5">
                                            <span className="font-mono text-xs text-slate-600">{number}</span>
                                            <div>
                                                <p className="font-mono text-sm font-semibold text-slate-100">{label}</p>
                                                <p className="mt-1 text-xs text-slate-500">{detail}</p>
                                            </div>
                                            <span className={`h-2 w-2 rounded-full ${index === 3 ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                                        </li>
                                    ))}
                                </ol>
                                <div className="border-t border-slate-800 bg-slate-900/60 px-5 py-4 font-mono text-xs text-slate-400 sm:px-7">
                                    <span className="text-emerald-400">✓</span> deterministic fixture · network disabled
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <DemoAuthFlow />
                <DemoSignupFlow />
                <DemoRecommendationFlow />
            </main>

            <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto] md:items-end lg:px-10">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                            <BookOpenCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            디딤로그 공개 데모
                        </div>
                        <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
                            화면의 계정, 인증 결과, 추천 문제는 모두 샘플입니다. 실제 서비스를 이용하려면 로그인해 주세요.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-blue-400 dark:focus-visible:ring-blue-900"
                        >
                            <Route className="h-4 w-4" /> 실제 서비스로 이동
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
