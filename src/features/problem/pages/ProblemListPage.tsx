/**
 * 문제 목록 페이지
 */

import { useState, useEffect, useMemo } from 'react';
import type { FC, FormEvent } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useProblemCategoryMeta, useProblemRecommend } from '../../../hooks/api/useProblem';
import { Spinner } from '../../../components/ui/Spinner';
import { Layout } from '../../../components/layout/Layout';
import { Input } from '../../../components/ui/Input';
import { CategorySelect } from '../../../components/ui/CategorySelect';
import { OnlyKoreanToggle } from '../../../components/common/OnlyKoreanToggle';
import { formatTierFromDifficulty, getTierColor } from '../../../utils/tier';
import type { ProblemResponse } from '../../../types/api/problem.types';
import { Search, HelpCircle } from 'lucide-react';
import { LanguageBadge } from '../../../components/common/LanguageBadge';
import { buildRepresentativeCategoriesFromSource } from '../../../utils/problemCategory';
import { ALGORITHM_CATEGORIES, getCategoryLabel } from '../../../utils/constants';
import type { CategoryFilterMode, ProblemCategoryMetaResponse } from '../../../types/api/problem.types';

const normalizeCategoryKey = (value: string): string =>
    value.trim().toLowerCase().replace(/['`]/g, '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ');

export const ProblemListPage: FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // URL 파라미터에서 초기값 가져오기 (10, 20, 30만 허용)
    const initialCountParam = parseInt(searchParams.get('count') || '10', 10);
    const validCounts = [10, 20, 30];
    const initialCount = validCounts.includes(initialCountParam) ? initialCountParam : 10;
    const initialCategory = searchParams.get('category') || '';
    const initialLanguage = searchParams.get('language') || '';
    const initialFilterMode = (searchParams.get('filterMode') || 'RELATED').toUpperCase() as CategoryFilterMode;
    
    const [count, setCount] = useState(initialCount);
    const [category, setCategory] = useState(initialCategory);
    const [searchQuery, setSearchQuery] = useState('');
    const [onlyKorean, setOnlyKorean] = useState<boolean>(initialLanguage === 'ko');
    const [filterMode, setFilterMode] = useState<CategoryFilterMode>(
        initialFilterMode === 'EXACT' || initialFilterMode === 'HIERARCHY' || initialFilterMode === 'RELATED'
            ? initialFilterMode
            : 'RELATED'
    );
    const { data: categoryMeta } = useProblemCategoryMeta();

    const categoryMetaByNormalized = useMemo(() => {
        const map = new Map<string, ProblemCategoryMetaResponse>();
        categoryMeta?.forEach((meta) => {
            const keys = [meta.canonical, meta.englishName, meta.koreanName, ...meta.aliases];
            keys.forEach((key) => {
                const normalized = normalizeCategoryKey(key);
                if (!map.has(normalized)) {
                    map.set(normalized, meta);
                }
            });
        });
        return map;
    }, [categoryMeta]);

    const categoryMetaByCanonical = useMemo(() => {
        const map = new Map<string, string>();
        categoryMeta?.forEach((meta) => {
            map.set(meta.canonical, meta.englishName);
        });
        return map;
    }, [categoryMeta]);

    const categoryOptions = useMemo(() => {
        return ALGORITHM_CATEGORIES.map((item) => {
            const meta = categoryMetaByNormalized.get(normalizeCategoryKey(item.value));
            return {
                value: item.value,
                label: meta?.englishName ?? item.label,
            };
        });
    }, [categoryMetaByNormalized]);

    const hierarchyHints = useMemo(() => {
        const selectedMeta = categoryMetaByNormalized.get(normalizeCategoryKey(category));
        if (!selectedMeta) return [];
        if (filterMode === 'EXACT') {
            return [];
        }
        const source = filterMode === 'RELATED' ? selectedMeta.related : selectedMeta.children;
        return source
            .map((canonical) => categoryMetaByCanonical.get(canonical) ?? canonical)
            .slice(0, 8);
    }, [category, filterMode, categoryMetaByCanonical, categoryMetaByNormalized]);

    const categoryExpansionSummary = useMemo(() => {
        if (hierarchyHints.length === 0) {
            return '';
        }
        const selectedMeta = categoryMetaByNormalized.get(normalizeCategoryKey(category));
        const selectedLabel = selectedMeta?.englishName ?? (category || '선택 카테고리');
        const preview = hierarchyHints.slice(0, 3);
        const remains = Math.max(hierarchyHints.length - preview.length, 0);
        const previewText = preview.join(', ');
        return `${selectedLabel} 선택 시 ${previewText}${remains > 0 ? ` 외 ${remains}개` : ''} 포함`;
    }, [category, hierarchyHints, categoryMetaByNormalized]);
    
    const { data: problems, isLoading, error } = useProblemRecommend({ 
        count, 
        category: category || undefined,
        language: onlyKorean ? 'ko' : undefined,
        filterMode,
    });

    const visibleProblems = useMemo(() => problems || [], [problems]);

    // 상태 변경 시 URL 파라미터 업데이트
    useEffect(() => {
        const params = new URLSearchParams();
        if (count !== 10) {
            params.set('count', count.toString());
        }
        if (category) {
            params.set('category', category);
        }
        if (onlyKorean) {
            params.set('language', 'ko');
        }
        if (filterMode !== 'RELATED') {
            params.set('filterMode', filterMode);
        }
        setSearchParams(params, { replace: true });
    }, [count, category, onlyKorean, filterMode, setSearchParams]);

    // 문제 번호 검색 핸들러
    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        const problemId = searchQuery.trim();
        if (!problemId) {
            return;
        }

        // 숫자만 입력되었는지 확인
        const problemIdNum = parseInt(problemId, 10);
        if (isNaN(problemIdNum) || problemIdNum <= 0) {
            return;
        }

        // 문제 상세 페이지로 이동
        navigate(`/problems/${problemIdNum}`);
    };


    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <Spinner />
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">오류가 발생했습니다</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {error instanceof Error ? error.message : '문제 목록을 불러올 수 없습니다.'}
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* 헤더 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">추천 문제</h1>
                            <button
                                onClick={() => navigate(-1)}
                                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                            >
                                ← 이전
                            </button>
                        </div>
                        {/* 문제 번호 검색 */}
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="문제 번호로 검색 (예: 1000)"
                                    className="pl-10 w-full max-w-xs"
                                />
                            </div>
                        </form>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="w-full sm:w-32">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    개수
                                </label>
                                <select
                                    value={count}
                                    onChange={(e) => {
                                        const newCount = Number(e.target.value);
                                        setCount(newCount);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                >
                                    <option value={10}>10개씩 보기</option>
                                    <option value={20}>20개씩 보기</option>
                                    <option value={30}>30개씩 보기</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                                    카테고리
                                    <span className="relative inline-flex items-center group">
                                        <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-2 rounded-lg bg-gray-900/95 dark:bg-gray-700 text-white text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                            <span className="block text-center">
                                                카테고리 검색 모드에 따라 정확/계층/연관 확장 검색이 적용됩니다.
                                            </span>
                                            {hierarchyHints.length > 0 && (
                                                <span className="block text-center mt-1 text-gray-200">
                                                    포함: {hierarchyHints.slice(0, 6).join(', ')}
                                                    {hierarchyHints.length > 6 ? '…' : ''}
                                                </span>
                                            )}
                                            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                                                <span className="block w-2 h-2 bg-gray-900/95 dark:bg-gray-700 rotate-45" />
                                            </span>
                                        </span>
                                    </span>
                                </label>
                                <CategorySelect
                                    value={category || undefined}
                                    onChange={(value) => setCategory(value || '')}
                                    placeholder="카테고리를 선택하세요"
                                    variant="select"
                                    options={categoryOptions}
                                />
                            </div>
                            <div className="w-full sm:w-40">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    검색 방식
                                </label>
                                <select
                                    value={filterMode}
                                    onChange={(e) => setFilterMode(e.target.value as CategoryFilterMode)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                >
                                    <option value="EXACT">정확 일치</option>
                                    <option value="HIERARCHY">계층 확장</option>
                                    <option value="RELATED">연관 확장</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-start sm:justify-end">
                                <OnlyKoreanToggle
                                    value={onlyKorean}
                                    onChange={(value) => setOnlyKorean(value)}
                                />
                            </div>
                        </div>
                        {hierarchyHints.length > 0 && (
                            <div className="mt-3">
                                <div
                                    className="inline-flex max-w-full items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300"
                                    title={categoryExpansionSummary}
                                >
                                    <span className="font-medium">카테고리 확장 검색</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="block min-w-0 truncate whitespace-nowrap">
                                        {categoryExpansionSummary}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 문제 목록 */}
                    {visibleProblems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {visibleProblems.map((problem: ProblemResponse) => {
                                const representative = buildRepresentativeCategoriesFromSource(problem, 3);
                                const primaryCategory = representative[0]
                                    ? getCategoryLabel(representative[0])
                                    : problem.category;
                                const secondaryCategories = representative
                                    .slice(1)
                                    .map((item) => getCategoryLabel(item));

                                return (
                                    <Link
                                        key={problem.id}
                                        to={`/problems/${problem.id}`}
                                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">#{problem.id}</p>
                                                    <LanguageBadge language={problem.language} />
                                                </div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{problem.title}</h3>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getTierColor(problem.difficulty)}`}>
                                                {formatTierFromDifficulty(problem.difficulty, problem.difficultyLevel)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs text-gray-600 dark:text-gray-300">{primaryCategory}</span>
                                                {secondaryCategories.length > 0 && (
                                                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                                        {secondaryCategories.join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-sm text-blue-600 dark:text-blue-400">보기 →</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-600 dark:text-gray-400">
                                {onlyKorean
                                    ? '한국어 strict 필터 기준으로 추천 결과가 없습니다.'
                                    : '추천할 문제가 없습니다.'}
                            </p>
                            {onlyKorean && (
                                <div className="mt-4 flex justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setOnlyKorean(false)}
                                        className="px-3 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                                    >
                                        전체 언어로 다시 보기
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCategory('')}
                                        className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        카테고리 초기화
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};
