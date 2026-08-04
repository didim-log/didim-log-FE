import { useMemo, useState } from 'react';
import { ArrowRight, Check, Filter, Languages, Network, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DEMO_CATEGORY_OPTIONS, DEMO_PROFILE } from '../data/demo.fixture';
import type { DemoCategoryKey } from '../data/demo.fixture';
import { buildDemoRecommendationTrace } from '../utils/recommendationTrace';

const STEP_ICONS = [SlidersHorizontal, Network, Filter, Languages, Sparkles] as const;

const formatProblemLanguage = (language: 'ko' | 'en') => (language === 'ko' ? '한국어' : '영어');

export function DemoRecommendationFlow() {
    const [category, setCategory] = useState<DemoCategoryKey>('GRAPH');
    const [onlyKorean, setOnlyKorean] = useState(true);
    const trace = useMemo(
        () => buildDemoRecommendationTrace({ category, onlyKorean }),
        [category, onlyKorean],
    );

    return (
        <section
            id="demo-recommendation"
            aria-labelledby="demo-recommendation-title"
            className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950"
        >
            <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
                <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div>
                        <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
                            03 / 알고리즘 추천
                        </p>
                        <h2 id="demo-recommendation-title" className="mt-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                            추천 결과보다 먼저, 선택 과정을 보여줍니다
                        </h2>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                            티어 범위를 정하고 연관 카테고리를 확장한 뒤, 푼 문제와 언어 조건을 차례로 적용합니다.
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">sample profile</p>
                        <p className="mt-1 font-bold text-slate-900 dark:text-white">{DEMO_PROFILE.bojId} · {DEMO_PROFILE.tierLabel}</p>
                    </div>
                </div>

                <div className="mt-10 grid gap-6 xl:grid-cols-[19rem_1fr]">
                    <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900 xl:sticky xl:top-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                            <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            추천 조건
                        </div>

                        <label htmlFor="demo-category" className="mt-6 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            카테고리
                        </label>
                        <select
                            id="demo-category"
                            data-testid="demo-category-select"
                            value={category}
                            onChange={(event) => setCategory(event.target.value as DemoCategoryKey)}
                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-950"
                        >
                            {DEMO_CATEGORY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                            {DEMO_CATEGORY_OPTIONS.find((option) => option.value === category)?.description}
                        </p>

                        <label className="mt-6 flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-3.5 py-3 dark:border-slate-700 dark:bg-slate-950">
                            <span>
                                <span className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                                    <Languages className="h-4 w-4" /> 한국어 문제만
                                </span>
                                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">제목 언어를 마지막에 거릅니다.</span>
                            </span>
                            <input
                                type="checkbox"
                                data-testid="demo-korean-toggle"
                                checked={onlyKorean}
                                onChange={(event) => setOnlyKorean(event.target.checked)}
                                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900"
                            />
                        </label>

                        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 text-center dark:border-slate-700 dark:bg-slate-700">
                            <div className="bg-white px-2 py-3 dark:bg-slate-950">
                                <dt className="font-mono text-[10px] uppercase text-slate-400">tier range</dt>
                                <dd className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{trace.tierRange.min}–{trace.tierRange.max}</dd>
                            </div>
                            <div className="bg-white px-2 py-3 dark:bg-slate-950">
                                <dt className="font-mono text-[10px] uppercase text-slate-400">result</dt>
                                <dd className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{trace.totalCount}개</dd>
                            </div>
                        </dl>
                        <p className="mt-5 text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
                            데모 fixture만 계산하며 서버와 저장소를 사용하지 않습니다.
                        </p>
                    </aside>

                    <div className="min-w-0">
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 dark:border-slate-700">
                            <div className="flex flex-col gap-2 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="font-mono text-xs text-slate-300">recommend --mode RELATED</p>
                                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-400">deterministic / network off</p>
                            </div>
                            <ol className="divide-y divide-slate-800">
                                {trace.steps.map((step, index) => {
                                    const Icon = STEP_ICONS[index] ?? Check;
                                    return (
                                        <li key={step.id} className="grid gap-3 px-5 py-5 sm:grid-cols-[2rem_1fr_auto] sm:items-center">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-blue-400">
                                                <Icon className="h-4 w-4" />
                                            </span>
                                            <div>
                                                <div className="flex flex-wrap items-baseline gap-2">
                                                    <p className="font-mono text-sm font-semibold text-white">{step.label}</p>
                                                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-600">{step.id}</span>
                                                </div>
                                                <p className="mt-1 text-sm leading-5 text-slate-400">{step.description}</p>
                                            </div>
                                            <div className="flex items-center gap-2 pl-11 font-mono text-xs text-slate-500 sm:pl-0">
                                                <span>{step.inputCount}</span>
                                                <ArrowRight className="h-3 w-3" />
                                                <span className="font-semibold text-emerald-400">{step.outputCount}</span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                            <div className="border-t border-slate-800 bg-slate-900/70 px-5 py-4 font-mono text-xs leading-6 text-slate-400">
                                <p><span className="text-sky-400">expanded</span> [{trace.expandedCategories.join(', ')}]</p>
                                <p><span className="text-sky-400">language</span> {trace.language}</p>
                            </div>
                        </div>

                        <div className="mt-8" data-testid="demo-results" aria-live="polite">
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">recommended next</p>
                                    <h3 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">샘플 추천 문제 {trace.totalCount}개</h3>
                                </div>
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">항상 같은 입력에는 같은 결과</span>
                            </div>

                            {trace.problems.length > 0 ? (
                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    {trace.problems.map((problem, index) => (
                                        <article key={problem.id} className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg focus-within:border-blue-400 motion-reduce:transform-none motion-reduce:transition-none dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-700">
                                            <div className="flex items-start justify-between gap-4">
                                                <span className="rounded-md bg-blue-50 px-2 py-1 font-mono text-[10px] font-bold uppercase text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                                    tier {problem.tierLevel}
                                                </span>
                                                <span className="font-mono text-xs text-slate-400">#{String(index + 1).padStart(2, '0')}</span>
                                            </div>
                                            <h4 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">{problem.title}</h4>
                                            <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">BOJ {problem.id} · {formatProblemLanguage(problem.language)}</p>
                                            <div className="mt-5 flex flex-wrap gap-2">
                                                {problem.categories.slice(0, 3).map((item) => (
                                                    <span key={item} className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                                    <p className="font-semibold text-slate-700 dark:text-slate-200">현재 조건에 맞는 샘플 문제가 없습니다.</p>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">카테고리나 언어 조건을 바꿔 보세요.</p>
                                </div>
                            )}

                            <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/60 sm:flex-row sm:items-center">
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">실제 계정으로 내 추천을 확인할까요?</p>
                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">로그인하면 실제 티어와 풀이 기록을 기준으로 추천합니다.</p>
                                </div>
                                <Link
                                    to="/login"
                                    className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus-visible:ring-blue-900"
                                >
                                    실제 로그인 <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
