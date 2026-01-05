/**
 * 회고 목록 페이지
 */

import { useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRetrospectives, useToggleBookmark, useDeleteRetrospective } from '../../../hooks/api/useRetrospective';
import { RetrospectiveCard } from '../components/RetrospectiveCard';
import { Spinner } from '../../../components/ui/Spinner';
import { Layout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useAuthStore } from '../../../stores/auth.store';
import type { RetrospectiveListRequest } from '../../../types/api/retrospective.types';
import { toast } from 'sonner';
import { getErrorMessage, isApiError } from '../../../types/api/common.types';
import { Info } from 'lucide-react';

export const RetrospectiveListPage: FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useState<RetrospectiveListRequest>({
        page: 1,
        size: 10,
    });
    const [keyword, setKeyword] = useState('');
    const [solvedCategory, setSolvedCategory] = useState('');
    const [isBookmarked, setIsBookmarked] = useState<boolean | undefined>(undefined);

    const { user } = useAuthStore();
    const { data, isLoading, error, refetch } = useRetrospectives(searchParams);
    const toggleBookmarkMutation = useToggleBookmark();
    const deleteMutation = useDeleteRetrospective();

    // 모든 회고의 solvedCategory를 파싱하여 고유 태그 목록 생성
    const availableCategories = (() => {
        if (!data?.content) return [];

        const categorySet = new Set<string>();
        data.content.forEach((retrospective) => {
            if (retrospective.solvedCategory) {
                // 쉼표로 구분된 태그들을 분리하고 공백 제거
                const tags = retrospective.solvedCategory
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0);
                tags.forEach((tag) => categorySet.add(tag));
            }
        });

        // 알파벳 순으로 정렬
        return Array.from(categorySet).sort();
    })();

    const handleToggleBookmark = (id: string) => {
        toggleBookmarkMutation.mutate(id);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id);
            toast.success('회고가 삭제되었습니다.');
            // queryClient.invalidateQueries가 자동으로 목록을 새로고침하므로 refetch는 선택적
            // 하지만 확실하게 하기 위해 refetch도 호출
            await refetch();
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
            
            // 백엔드에서 소유자 검증 실패 시
            if (isApiError(error) && (error.response?.status === 403 || error.response?.status === 400)) {
                toast.error('본인이 작성한 회고만 삭제할 수 있습니다.');
            } else {
                toast.error(errorMessage);
            }
        }
    };

    const handleSearch = () => {
        setSearchParams({
            ...searchParams,
            keyword: keyword.trim() || undefined,
            solvedCategory: solvedCategory.trim() || undefined,
            isBookmarked,
            page: 1,
        });
    };

    const handlePageChange = (page: number) => {
        setSearchParams({ ...searchParams, page });
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
                            {error instanceof Error ? error.message : '회고 목록을 불러올 수 없습니다.'}
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
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">회고 목록</h1>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs border border-gray-200 dark:border-gray-700">
                                <Info className="w-3.5 h-3.5" />
                                <span>
                                    작성한 회고는 서버 저장 공간 최적화를 위해 <strong>작성일로부터 60일 뒤 자동으로 삭제</strong>
                                    됩니다.
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                        >
                            ← 이전
                        </button>
                    </div>

                    {/* 검색 필터 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Input
                                label="키워드 검색"
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                                placeholder="문제 ID 또는 내용"
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    카테고리
                                </label>
                                <select
                                    value={solvedCategory}
                                    onChange={(e) => setSolvedCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">전체</option>
                                    {availableCategories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                                {availableCategories.length === 0 && data && data.content.length > 0 && (
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        사용 가능한 태그가 없습니다
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    북마크
                                </label>
                                <select
                                    value={isBookmarked === undefined ? 'all' : isBookmarked.toString()}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setIsBookmarked(value === 'all' ? undefined : value === 'true');
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    <option value="all">전체</option>
                                    <option value="true">북마크만</option>
                                    <option value="false">북마크 제외</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleSearch} variant="primary" className="w-full">
                                    검색
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* 회고 목록 */}
                    {data && data.content.length > 0 ? (
                        <div className="space-y-4">
                            {data.content.map((retrospective) => {
                                // 로그인한 사용자라면 삭제 버튼 표시 (실제 소유자 검증은 백엔드에서 수행)
                                const isOwner = !!user;
                                return (
                                    <RetrospectiveCard
                                        key={retrospective.id}
                                        retrospective={retrospective}
                                        onToggleBookmark={handleToggleBookmark}
                                        onDelete={isOwner ? handleDelete : undefined}
                                        isOwner={isOwner}
                                    />
                                );
                            })}

                            {/* 페이지네이션 */}
                            <div className="flex items-center justify-center gap-2">
                                <Button
                                    onClick={() => handlePageChange(data.currentPage - 1)}
                                    disabled={!data.hasPrevious}
                                    variant="outline"
                                >
                                    이전
                                </Button>
                                <span className="text-gray-600 dark:text-gray-400">
                                    {data.currentPage} / {data.totalPages}
                                </span>
                                <Button
                                    onClick={() => handlePageChange(data.currentPage + 1)}
                                    disabled={!data.hasNext}
                                    variant="outline"
                                >
                                    다음
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-600 dark:text-gray-400">회고가 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

