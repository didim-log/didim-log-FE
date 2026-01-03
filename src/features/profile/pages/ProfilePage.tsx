/**
 * 마이페이지
 */

import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { useDashboard } from '../../../hooks/api/useDashboard';
import { useUpdateProfile, useDeleteAccount } from '../../../hooks/api/useStudent';
import { useRetrospectives } from '../../../hooks/api/useRetrospective';
import { useAuthStore } from '../../../stores/auth.store';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Layout } from '../../../components/layout/Layout';
import { MyRetrospectiveCard } from '../components/MyRetrospectiveCard';
import { ProfileCard } from '../components/ProfileCard';
import { ProfileEditForm } from '../components/ProfileEditForm';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import type { UpdateProfileRequest } from '../../../types/api/student.types';

export const ProfilePage: FC = () => {
    const { data: dashboard, isLoading } = useDashboard();
    const { user, logout } = useAuthStore();
    const updateProfileMutation = useUpdateProfile();
    const deleteAccountMutation = useDeleteAccount();

    // 카테고리 필터 상태 (solvedCategory 사용)
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

    // 내 회고 목록 조회 (solvedCategory 필터 적용)
    const { data: retrospectives, isLoading: isRetrospectivesLoading } = useRetrospectives({
        studentId: user?.id,
        solvedCategory: selectedCategory,
        page: 1,
        size: 10,
    });

    // 모든 회고의 solvedCategory를 파싱하여 고유 태그 목록 생성
    const availableCategories = useMemo(() => {
        if (!retrospectives?.content) return [];
        
        const categorySet = new Set<string>();
        retrospectives.content.forEach((retrospective) => {
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
    }, [retrospectives?.content]);

    const [isEditing, setIsEditing] = useState(false);
    const [isDangerZoneOpen, setIsDangerZoneOpen] = useState(false);

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <Spinner />
                </div>
            </Layout>
        );
    }

    if (!dashboard || !user) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-gray-600 dark:text-gray-400">프로필 정보를 불러올 수 없습니다.</p>
                </div>
            </Layout>
        );
    }

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleSubmit = async (updateData: UpdateProfileRequest) => {
        try {
            await updateProfileMutation.mutateAsync(updateData);
            setIsEditing(false);
        } catch (error) {
            // 에러는 ProfileEditForm에서 처리하므로 여기서는 재throw하지 않음
            // ProfileEditForm의 error prop으로 전달됨
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('정말 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }

        try {
            await deleteAccountMutation.mutateAsync();
            logout();
            window.location.href = '/login';
        } catch {
            // Account deletion failed, error is handled by React Query mutation
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* 메인 프로필 카드 */}
                    {!isEditing ? (
                        <ProfileCard
                            dashboard={dashboard}
                            primaryLanguage={user.primaryLanguage}
                            onEdit={handleEdit}
                        />
                    ) : (
                        <ProfileEditForm
                            initialNickname={user.nickname}
                            initialPrimaryLanguage={user.primaryLanguage}
                            bojId={dashboard.studentProfile.bojId}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            isLoading={updateProfileMutation.isPending}
                            error={updateProfileMutation.error}
                        />
                    )}

                    {/* 내 회고 섹션 */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">나의 회고</h2>
                            <Link
                                to="/retrospectives"
                                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm"
                            >
                                전체 보기
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* 카테고리 필터 - 헤더와 같은 줄에 배치 */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                카테고리
                            </label>
                            <select
                                value={selectedCategory || ''}
                                onChange={(e) => setSelectedCategory(e.target.value || undefined)}
                                className="max-w-xs w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">전체 카테고리</option>
                                {availableCategories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {isRetrospectivesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Spinner />
                            </div>
                        ) : retrospectives && retrospectives.content.length > 0 ? (
                            <div className="space-y-4">
                                {retrospectives.content.map((retrospective) => (
                                    <MyRetrospectiveCard
                                        key={retrospective.id}
                                        retrospective={retrospective}
                                    />
                                ))}
                                {retrospectives.totalElements > retrospectives.content.length && (
                                    <div className="text-center pt-4">
                                        <Link to="/retrospectives">
                                            <Button variant="outline">
                                                더 보기 ({retrospectives.totalElements - retrospectives.content.length}개 더)
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">작성한 회고가 없습니다.</p>
                                <Link to="/problems">
                                    <Button 
                                        variant="primary" 
                                        className="inline-flex items-center gap-2"
                                    >
                                        회고 작성을 위한 추천 문제 보기
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* 계정 관리 (Danger Zone) - 아코디언 형태 */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-red-200 dark:border-red-900/30 overflow-hidden">
                        <button
                            onClick={() => setIsDangerZoneOpen(!isDangerZoneOpen)}
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                            <div>
                                <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-1">
                                    계정 관리
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    위험한 작업을 수행할 수 있습니다
                                </p>
                            </div>
                            {isDangerZoneOpen ? (
                                <ChevronUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                            )}
                        </button>

                        {isDangerZoneOpen && (
                            <div className="px-6 pb-6 border-t border-red-200 dark:border-red-900/30 pt-6">
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleDeleteAccount}
                                    variant="danger"
                                    isLoading={deleteAccountMutation.isPending}
                                    className="w-full sm:w-auto"
                                >
                                    계정 삭제
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

