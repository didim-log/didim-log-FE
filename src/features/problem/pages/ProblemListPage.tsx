/**
 * 문제 목록 페이지
 */

import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProblemRecommend } from '../../../hooks/api/useProblem';
import { Spinner } from '../../../components/ui/Spinner';
import { Layout } from '../../../components/layout/Layout';
import { Input } from '../../../components/ui/Input';
import { CategorySelect } from '../../../components/ui/CategorySelect';
import { formatTierFromDifficulty, getTierColor } from '../../../utils/tier';
import type { ProblemResponse } from '../../../types/api/problem.types';

export const ProblemListPage: FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // URL 파라미터에서 초기값 가져오기
    const initialCount = parseInt(searchParams.get('count') || '10', 10);
    const initialCategory = searchParams.get('category') || '';
    
    const [count, setCount] = useState(initialCount);
    const [category, setCategory] = useState(initialCategory);
    
    const { data: problems, isLoading, error } = useProblemRecommend({ 
        count, 
        category: category || undefined 
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
        setSearchParams(params, { replace: true });
    }, [count, category, setSearchParams]);


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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">추천 문제</h1>
                        <div className="flex items-end gap-4">
                            <div className="w-32">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    개수
                                </label>
                                <Input
                                    type="number"
                                    value={count}
                                    onChange={(e) => setCount(Number(e.target.value))}
                                    min={1}
                                    max={50}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    카테고리
                                </label>
                                <CategorySelect
                                    value={category || undefined}
                                    onChange={(value) => setCategory(value || '')}
                                    placeholder="카테고리를 선택하세요"
                                    variant="select"
                                />
                            </div>
                        </div>
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
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">#{problem.id}</p>
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

