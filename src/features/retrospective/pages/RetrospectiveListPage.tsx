/**
 * 회고 목록 페이지
 */

import { useState } from 'react';
import { useRetrospectives, useToggleBookmark, useDeleteRetrospective } from '../../../hooks/api/useRetrospective';
import { RetrospectiveCard } from '../components/RetrospectiveCard';
import { Spinner } from '../../../components/ui/Spinner';
import { Layout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useAuthStore } from '../../../stores/auth.store';
import type { RetrospectiveListRequest } from '../../../types/api/retrospective.types';
import { toast } from 'sonner';

export const RetrospectiveListPage: React.FC = () => {
    const [searchParams, setSearchParams] = useState<RetrospectiveListRequest>({
        page: 1,
        size: 10,
    });
    const [keyword, setKeyword] = useState('');
    const [category, setCategory] = useState('');
    const [isBookmarked, setIsBookmarked] = useState<boolean | undefined>(undefined);

    const { user } = useAuthStore();
    const { data, isLoading, error } = useRetrospectives(searchParams);
    const toggleBookmarkMutation = useToggleBookmark();
    const deleteMutation = useDeleteRetrospective();

    const handleToggleBookmark = (id: string) => {
        toggleBookmarkMutation.mutate(id);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말로 삭제하시겠습니까?')) {
            return;
        }

        try {
            await deleteMutation.mutateAsync(id);
            toast.success('회고가 삭제되었습니다.');
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('회고 삭제에 실패했습니다.');
        }
    };

    const handleSearch = () => {
        setSearchParams({
            ...searchParams,
            keyword: keyword.trim() || undefined,
            category: category.trim() || undefined,
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
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">회고 목록</h1>
                    </div>

                    {/* 검색 필터 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Input
                                label="키워드 검색"
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="문제 ID 또는 내용"
                            />
                            <Input
                                label="카테고리"
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="예: DFS, DP"
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    북마크
                                </label>
                                <select
                                    value={isBookmarked === undefined ? '' : isBookmarked.toString()}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setIsBookmarked(value === '' ? undefined : value === 'true');
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    <option value="">전체</option>
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
                                const isOwner = user?.id && retrospective.studentId && 
                                                String(user.id) === String(retrospective.studentId);
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

