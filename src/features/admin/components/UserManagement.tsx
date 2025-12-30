/**
 * 사용자 관리 컴포넌트
 */

import { useState } from 'react';
import { useAdminUsers, useDeleteUser, useUpdateUser } from '../../../hooks/api/useAdmin';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';
import type { AdminUserListRequest, AdminUserUpdateDto } from '../../../types/api/admin.types';

export const UserManagement: React.FC = () => {
    const [searchParams, setSearchParams] = useState<AdminUserListRequest>({
        page: 1,
        size: 20,
    });
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const { data, isLoading, error } = useAdminUsers(searchParams);
    const deleteMutation = useDeleteUser();
    const updateMutation = useUpdateUser();

    const handleSearch = () => {
        setSearchParams({
            ...searchParams,
            search: search.trim() || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            page: 1,
        });
    };

    const handleDelete = async (studentId: string) => {
        if (confirm('정말 이 회원을 탈퇴시키시겠습니까?')) {
            try {
                await deleteMutation.mutateAsync(studentId);
            } catch (error) {
                console.error('Delete failed:', error);
            }
        }
    };

    const handlePageChange = (page: number) => {
        setSearchParams({ ...searchParams, page });
    };

    if (isLoading) {
        return <Spinner />;
    }

    if (error || !data) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">
                    {error instanceof Error ? error.message : '회원 목록을 불러올 수 없습니다.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 검색 필터 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">회원 검색</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                        label="검색어"
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="닉네임, BOJ ID, 이메일"
                    />
                    <Input
                        label="시작일"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Input
                        label="종료일"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <div className="flex items-end">
                        <Button onClick={handleSearch} variant="primary" className="w-full">
                            검색
                        </Button>
                    </div>
                </div>
            </div>

            {/* 회원 목록 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    닉네임
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    BOJ ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    이메일
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    티어
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    권한
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    액션
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {data.content.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {user.nickname}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {user.bojId || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {user.email || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {user.currentTier}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {user.role}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <Button
                                            onClick={() => handleDelete(user.id)}
                                            variant="danger"
                                            size="sm"
                                            isLoading={deleteMutation.isPending}
                                        >
                                            삭제
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 페이지네이션 */}
                {data.totalPages > 1 && (
                    <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {data.currentPage} / {data.totalPages} 페이지
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => handlePageChange(data.currentPage - 1)}
                                disabled={!data.hasPrevious}
                                variant="outline"
                                size="sm"
                            >
                                이전
                            </Button>
                            <Button
                                onClick={() => handlePageChange(data.currentPage + 1)}
                                disabled={!data.hasNext}
                                variant="outline"
                                size="sm"
                            >
                                다음
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

