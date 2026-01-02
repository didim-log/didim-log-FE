/**
 * 대시보드 페이지
 */

import { useEffect } from 'react';
import type { FC } from 'react';
import { OnboardingTour } from '../../auth/components/OnboardingTour';
import { useDashboard } from '../../../hooks/api/useDashboard';
import { useNotices } from '../../../hooks/api/useNotice';
import { NoticeBanner } from '../../notice/components/NoticeBanner';
import { NoticeWidget } from '../components/NoticeWidget';
import { TierProgress } from '../components/TierProgress';
import { RecommendedProblems } from '../components/RecommendedProblems';
import { TodaySolvedList } from '../components/TodaySolvedList';
import { StatisticsPreview } from '../components/StatisticsPreview';
import { QuoteCard } from '../components/QuoteCard';
import { Spinner } from '../../../components/ui/Spinner';
import { useOnboardingStore } from '../../../stores/onboarding.store';
import { useAuthStore } from '../../../stores/auth.store';
import { Layout } from '../../../components/layout/Layout';

export const DashboardPage: FC = () => {
    const { data: dashboard, isLoading, error } = useDashboard();
    const { data: noticePage } = useNotices({ page: 1, size: 1 });
    const { isNewUser, hasCompletedOnboarding } = useOnboardingStore();
    const { setUser, user } = useAuthStore();

    // 대시보드 데이터를 받아올 때 primaryLanguage를 전역 상태에 업데이트
    useEffect(() => {
        if (dashboard?.studentProfile?.primaryLanguage !== undefined && user) {
            setUser({
                ...user,
                primaryLanguage: dashboard.studentProfile.primaryLanguage,
            });
        }
    }, [dashboard?.studentProfile?.primaryLanguage, user, setUser]);

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center flex-1">
                    <Spinner />
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex items-center justify-center flex-1">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">오류가 발생했습니다</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {error instanceof Error ? error.message : '대시보드를 불러올 수 없습니다.'}
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!dashboard) {
        return (
            <Layout>
                <div className="flex items-center justify-center flex-1">
                    <p className="text-gray-600 dark:text-gray-400">데이터를 불러올 수 없습니다.</p>
                </div>
            </Layout>
        );
    }

    // 데이터 안전장치: dashboard의 필수 필드가 있는지 확인
    if (!dashboard.studentProfile) {
        return (
            <Layout>
                <div className="flex items-center justify-center flex-1">
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400">대시보드 데이터 형식이 올바르지 않습니다.</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="bg-gray-50 dark:bg-gray-900 py-4 px-4">
                <div className="max-w-7xl mx-auto space-y-4">
                    {/* 온보딩 투어 (신규 유저 + 미완료 시에만) */}
                    {isNewUser && !hasCompletedOnboarding && <OnboardingTour />}

                    {/* 공지사항 얇은 배너 (UI 방해 최소화) */}
                    {noticePage?.content?.[0] && <NoticeBanner notice={noticePage.content[0]} />}

                    {/* 메인 컨텐츠 그리드 - 2:1 비율 레이아웃 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* 좌측 컬럼 (메인 콘텐츠) - lg:col-span-2 */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* 프로필 카드 */}
                            <div id="tier-section">
                                <TierProgress dashboard={dashboard} />
                            </div>

                            {/* 추천 문제 */}
                            <div id="recommend-section">
                                <RecommendedProblems count={4} />
                            </div>
                        </div>

                        {/* 우측 컬럼 (사이드바) - lg:col-span-1 */}
                        <div className="space-y-4">
                            {/* 공지사항 위젯 */}
                            <div id="notice-section">
                                <NoticeWidget />
                            </div>

                            {/* 통계 미리보기 */}
                            <div id="statistics-preview-section">
                                <StatisticsPreview />
                            </div>

                            {/* 오늘 푼 문제 */}
                            <div id="today-solved-section">
                                <TodaySolvedList
                                    problems={dashboard.todaySolvedProblems ?? []}
                                />
                            </div>

                            {/* 명언 카드 */}
                            {dashboard.quote && (
                                <div id="quote-section">
                                    <QuoteCard quote={dashboard.quote} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
