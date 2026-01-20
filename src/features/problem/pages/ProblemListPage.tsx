/**
 * 문제 목록 페이지
 */

import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useProblemRecommend } from '../../../hooks/api/useProblem';
import { Spinner } from '../../../components/ui/Spinner';
import { Layout } from '../../../components/layout/Layout';
import { Input } from '../../../components/ui/Input';
import { CategorySelect } from '../../../components/ui/CategorySelect';
import { OnlyKoreanToggle } from '../../../components/common/OnlyKoreanToggle';
import { formatTierFromDifficulty, getTierColor } from '../../../utils/tier';
import type { ProblemResponse } from '../../../types/api/problem.types';
import { Search, HelpCircle } from 'lucide-react';
import { getCategoryHierarchyHints } from '../../../constants/algorithmHierarchy';
import { LanguageBadge } from '../../../components/common/LanguageBadge';

export const ProblemListPage: FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // URL 파라미터에서 초기값 가져오기 (10, 20, 30만 허용)
    const initialCountParam = parseInt(searchParams.get('count') || '10', 10);
    const validCounts = [10, 20, 30];
    const initialCount = validCounts.includes(initialCountParam) ? initialCountParam : 10;
    const initialCategory = searchParams.get('category') || '';
    const initialLanguage = searchParams.get('language') || '';
    
    const [count, setCount] = useState(initialCount);
    const [category, setCategory] = useState(initialCategory);
    const [searchQuery, setSearchQuery] = useState('');
    const [onlyKorean, setOnlyKorean] = useState<boolean>(initialLanguage === 'ko');
    const hierarchyHints = getCategoryHierarchyHints(category);
    
    const { data: problems, isLoading, error } = useProblemRecommend({ 
        count, 
        category: category || undefined,
        language: onlyKorean ? 'ko' : undefined,
    });

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
        setSearchParams(params, { replace: true });
    }, [count, category, onlyKorean, setSearchParams]);

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
                                                선택한 카테고리의 하위 세부 유형(예: 그래프 → BFS, DFS)도 함께 검색 결과에 포함됩니다.
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
                                />
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
                                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
                                    <span className="font-medium">카테고리 확장 검색</span>
                                    <span className="text-gray-400">•</span>
                                    <span>
                                        {category.toUpperCase()} 선택 시 {hierarchyHints.slice(0, 8).join(', ')}
                                        {hierarchyHints.length > 8 ? '…' : ''}도 함께 포함됩니다.
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 문제 목록 */}
                    {problems && problems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {problems.map((problem: ProblemResponse) => (
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
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{problem.category}</span>
                                        <span className="text-sm text-blue-600 dark:text-blue-400">보기 →</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-600 dark:text-gray-400">추천할 문제가 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};
